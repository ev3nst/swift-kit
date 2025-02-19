use std::future::poll_fn;
use std::path::Path;
use std::task::Context;
use tauri::{Emitter, Listener};
use tauri_plugin_shell::process::{CommandEvent, TerminatedPayload};
use tauri_plugin_shell::ShellExt;
use tokio::sync::oneshot;

#[tauri::command(rename_all = "snake_case")]
pub async fn convert_to_mp4(handle: tauri::AppHandle, video_path: String) -> Result<(), String> {
    let video_path = Path::new(&video_path);
    if !video_path.exists() || !video_path.is_file() {
        return Err("Invalid directory path".into());
    }

    if let Some(video_extension) = video_path.extension() {
        if video_extension != "mkv" {
            return Err("Unsupported video type".into());
        }
    }

    let stem = video_path.file_stem().unwrap().to_str().unwrap();
    let output_path = video_path
        .parent()
        .unwrap()
        .join(format!("{}.{}", stem, "mp4"));
    let input_escaped_path = video_path
        .to_string_lossy()
        .to_string()
        .replace("\\", "/")
        .replace(":/", "\\:/");
    let args = vec![
        "-i".to_string(),
        video_path.to_string_lossy().to_string(),
        "-vf".to_string(),
        format!("subtitles='{}':force_style='Fontname=Geist,Fontsize=65,Outline=1,Shadow=4,BorderStyle=1,PrimaryColour=&HFFFFFF&'", input_escaped_path),
        "-c:v".to_string(),
		"h264_nvenc".to_string(),
        "-pix_fmt".to_string(),
		"yuv420p".to_string(),
        "-c:a".to_string(),
		"aac".to_string(),
        "-y".to_string(),
		output_path.to_string_lossy().to_string()
    ];

    let (mut rx, child) = handle
        .shell()
        .sidecar("ffmpeg")
        .map_err(|e| format!("Failed to create ffmpeg sidecar: {}", e))?
        .args(args.clone())
        .spawn()
        .map_err(|e| format!("Failed to execute sidecar: {}", e))?;

    let (cancel_tx, mut cancel_rx) = oneshot::channel();
    let handle_clone = handle.clone();
    tokio::spawn(async move {
        handle_clone.once("cancel_convert_to_mp4", move |_| {
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
                                handle.emit("convert_to_mp4_stderr", text).unwrap();
                            } else {
                                handle.emit("convert_to_mp4_stdout", text).unwrap();
                            }
                        }
                    }
                    Some(CommandEvent::Terminated(TerminatedPayload { code, signal })) => {
                        if code.unwrap_or(-1) != 0 {
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
                if let Err(e) = child.kill() {
                    eprintln!("Failed to kill ffmpeg process: {}", e);
                }
                return Ok(());
            }
        }
    }

    Ok(())
}
