use std::future::poll_fn;
use std::task::Context;
use std::{fs, path::Path};
use tauri::{Emitter, Listener};
use tauri_plugin_shell::process::{CommandEvent, TerminatedPayload};
use tauri_plugin_shell::ShellExt;
use tokio::sync::oneshot;

use super::utils::check_stream_exists::check_stream_exists;
use super::utils::file_types::IAnimeMeta;
use super::utils::is_valid_timestamp::is_valid_timestamp;
use super::utils::parse_duration::parse_duration;

#[tauri::command(rename_all = "snake_case")]
pub async fn no_intro_outro(
    handle: tauri::AppHandle,
    folder_path: String,
    video: IAnimeMeta,
    use_cuda: bool,
    overwrite: bool,
) -> Result<(), String> {
    let folder_path = Path::new(&folder_path);
    if !folder_path.exists() || !folder_path.is_dir() {
        return Err("Invalid directory path".into());
    }

    let input_path = folder_path.join(&video.filename);
    let stem = input_path.file_stem().unwrap().to_str().unwrap();
    let ext = input_path.extension().unwrap().to_str().unwrap();
    let output_path = folder_path.join(format!("{}_noio.{}", stem, ext));

    let result = check_stream_exists(
        &input_path,
        video.default_audio as usize,
        video.default_subtitle as usize,
    )
    .await?;

    let mut segments = Vec::new();
    let has_valid_intro =
        is_valid_timestamp(&video.intro_start) && is_valid_timestamp(&video.intro_end);
    let has_valid_outro =
        is_valid_timestamp(&video.outro_start) && is_valid_timestamp(&video.outro_end);

    if has_valid_intro {
        let intro_start = parse_duration(video.intro_start.as_ref().unwrap()).unwrap();
        let intro_end = parse_duration(video.intro_end.as_ref().unwrap()).unwrap();

        if intro_start > 0.0 {
            segments.push((0.0, intro_start));
        }

        if has_valid_outro {
            let outro_start = parse_duration(video.outro_start.as_ref().unwrap()).unwrap();
            let outro_end = parse_duration(video.outro_end.as_ref().unwrap()).unwrap();

            segments.push((intro_end, outro_start));
            if outro_end < video.duration_in_seconds {
                segments.push((outro_end, video.duration_in_seconds));
            }
        } else {
            segments.push((intro_end, video.duration_in_seconds));
        }
    } else if has_valid_outro {
        let outro_start = parse_duration(video.outro_start.as_ref().unwrap()).unwrap();
        let outro_end = parse_duration(video.outro_end.as_ref().unwrap()).unwrap();

        segments.push((0.0, outro_start));
        if outro_end < video.duration_in_seconds {
            segments.push((outro_end, video.duration_in_seconds));
        }
    }

    let mut ffmpeg_args = vec![];
    if use_cuda {
        ffmpeg_args.push("-hwaccel".to_string());
        ffmpeg_args.push("cuda".to_string());
    }

    let mut filter_complex_str = String::new();
    for (i, (start, end)) in segments.iter().enumerate() {
        ffmpeg_args.push("-ss".to_string());
        ffmpeg_args.push(start.to_string());
        ffmpeg_args.push("-to".to_string());
        ffmpeg_args.push(end.to_string());
        ffmpeg_args.push("-i".to_string());
        ffmpeg_args.push(input_path.to_string_lossy().to_string());
        if result.audio_stream_index_exists {
            filter_complex_str.push_str(&format!("[{}:v:0][{}:{}]", i, i, video.default_audio));
        } else {
            filter_complex_str.push_str(&format!("[{}:v:0][{}:{}]", i, i, 0));
        }
    }

    let concat_str = format!("concat=n={}:v=1:a=1 [v][a]", segments.len());
    filter_complex_str.push_str(&concat_str);
    ffmpeg_args.push("-filter_complex".to_string());
    ffmpeg_args.push(filter_complex_str);
    ffmpeg_args.push("-map".to_string());
    ffmpeg_args.push("[v]".to_string());
    ffmpeg_args.push("-map".to_string());
    ffmpeg_args.push("[a]".to_string());
    if result.subtitle_stream_index_exists {
        ffmpeg_args.push("-map".to_string());
        ffmpeg_args.push(format!("0:{}", video.default_subtitle));
    }
    ffmpeg_args.push("-c:v".to_string());
    ffmpeg_args.push("hevc_nvenc".to_string());

    // experimental perf optimization
    ffmpeg_args.push("-preset".to_string());
    ffmpeg_args.push("p5".to_string());
    ffmpeg_args.push("-tune".to_string());
    ffmpeg_args.push("hq".to_string());
    ffmpeg_args.push("-rc".to_string());
    ffmpeg_args.push("vbr".to_string());
    ffmpeg_args.push("-b:v".to_string());
    ffmpeg_args.push("5M".to_string());

    ffmpeg_args.push("-c:a".to_string());
    ffmpeg_args.push("aac".to_string());
    ffmpeg_args.push("-c:s".to_string());
    ffmpeg_args.push("copy".to_string());
    ffmpeg_args.push("-y".to_string());
    ffmpeg_args.push(output_path.to_string_lossy().to_string());

    let (mut rx, child) = handle
        .shell()
        .sidecar("ffmpeg")
        .map_err(|e| format!("Failed to create ffmpeg sidecar: {}", e))?
        .args(ffmpeg_args.clone())
        .spawn()
        .map_err(|e| format!("Failed to execute sidecar: {}", e))?;

    let (cancel_tx, mut cancel_rx) = oneshot::channel();
    let handle_clone = handle.clone();
    tokio::spawn(async move {
        handle_clone.once("cancel_ffmpeg", move |_| {
            let _ = cancel_tx.send(());
        });
    });

    loop {
        tokio::select! {
            event = rx.recv() => {
                match event {
                    Some(CommandEvent::Stdout(line) | CommandEvent::Stderr(line)) => {
                        if let Ok(text) = String::from_utf8(line) {
                            if text.to_lowercase().contains("error")
                                || text.to_lowercase().contains("failed")
                            {
                                handle.emit("no_intro_outro_stderr", text).unwrap();
                            } else {
                                handle.emit("no_intro_outro_stdout", text).unwrap();
                            }
                        }
                    }
                    Some(CommandEvent::Terminated(TerminatedPayload { code, signal })) => {
                        if code.unwrap_or(-1) != 0 {
                            // Clean up on error
                            if output_path.exists() {
                                let _ = fs::remove_file(&output_path);
                            }
                            return Err(format!(
                                "FFmpeg process failed with exit code: {:?}, signal: {:?}",
                                code, signal
                            ));
                        }
                        break;
                    }
                    None => break,
                    _ => {}
                }
            }
            _ = poll_fn(|cx: &mut Context<'_>| Pin::new(&mut cancel_rx).poll(cx)) => {
                // Kill the FFmpeg process
                if let Err(e) = child.kill() {
                    eprintln!("Failed to kill FFmpeg process: {}", e);
                }
                // Clean up the incomplete output file
                if output_path.exists() {
                    let _ = fs::remove_file(&output_path);
                }
                return Ok(());
            }
        }
    }

    if overwrite {
        let _ = fs::rename(output_path, input_path);
    }

    Ok(())
}
