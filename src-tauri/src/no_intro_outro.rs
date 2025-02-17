use std::{fs, path::Path};
use tauri::Emitter;
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;

use super::utils::check_stream_exists::check_stream_exists;
use super::utils::is_valid_timestamp::is_valid_timestamp;
use super::utils::parse_duration::parse_duration;
use super::utils::file_types::IAnimeMeta;

#[tauri::command(rename_all = "snake_case")]
pub async fn no_intro_outro(
    handle: tauri::AppHandle,
    folder_path: String,
    video: IAnimeMeta,
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
        handle.clone(),
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

    let mut ffmpeg_args = vec!["-hwaccel".to_string(), "cuda".to_string()];
    let mut filter_complex_str = String::new();
    for (i, (start, end)) in segments.iter().enumerate() {
        ffmpeg_args.push("-ss".to_string());
        ffmpeg_args.push(start.to_string());
        ffmpeg_args.push("-to".to_string());
        ffmpeg_args.push(end.to_string());
        ffmpeg_args.push("-i".to_string());
        ffmpeg_args.push(input_path.to_string_lossy().to_string());
        filter_complex_str.push_str(&format!("[{}:v:0][{}:{}]", i, i, video.default_audio));
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
    ffmpeg_args.push("-c:a".to_string());
    ffmpeg_args.push("aac".to_string());
    ffmpeg_args.push("-c:s".to_string());
    ffmpeg_args.push("copy".to_string());
    ffmpeg_args.push("-y".to_string());
    ffmpeg_args.push(output_path.to_string_lossy().to_string());

    let (mut rx, mut _child) = handle
        .shell()
        .sidecar("ffmpeg")
        .map_err(|e| format!("Failed to create ffmpeg sidecar: {}", e))?
        .args(ffmpeg_args.clone())
        .spawn()
        .map_err(|e| format!("Failed to execute sidecar: {}", e))?;

    // Handle the command output events
	while let Some(event) = rx.recv().await {
		match event {
			CommandEvent::Stdout(line) | CommandEvent::Stderr(line) => {
				if let Ok(text) = String::from_utf8(line) {
					handle.emit("no_intro_outro_stdout", text).unwrap();
				}
			}
			_ => {}
		}
	}

    if overwrite {
        let _ = fs::rename(output_path, input_path);
    }

    Ok(())
}
