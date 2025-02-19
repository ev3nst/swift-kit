use std::future::poll_fn;
use std::task::Context;
use std::{fs, path::Path};
use tauri::{Emitter, Listener};
use tauri_plugin_shell::process::{CommandEvent, TerminatedPayload};
use tauri_plugin_shell::ShellExt;
use tokio::sync::oneshot;

#[tauri::command(rename_all = "snake_case")]
pub async fn interpolate(
    handle: tauri::AppHandle,
    video2x_path: String,
    video_path: String,
    encoder: String,
    rife_model: String,
    multiplier: u8,
    overwrite: bool,
) -> Result<(), String> {
    let video_path = Path::new(&video_path);
    if !video_path.exists() || !video_path.is_file() {
        return Err("Invalid directory path".into());
    }

    if let Some(video_extension) = video_path.extension() {
        if video_extension != "mp4" && video_extension != "mkv" {
            return Err("Unsupported video type".into());
        }
    }

    let video2x_path = Path::new(&video2x_path);
    if !video2x_path.exists() || !video2x_path.is_dir() {
        return Err("Invalid video2x installation path".into());
    }

    let video2x_binary_path = video2x_path.join("video2x.exe");
    if !video2x_binary_path.exists() || !video2x_binary_path.is_file() {
        return Err("Invalid video2x path, binary was not found.".into());
    }

    let stem = video_path.file_stem().unwrap().to_str().unwrap();
    let ext = video_path.extension().unwrap().to_str().unwrap();
    let output_path = video_path
        .parent()
        .unwrap()
        .join(format!("{}_rife.{}", stem, ext));
    let mut args = vec![
        "-i".to_string(),
        video_path.to_string_lossy().to_string(),
        "-o".to_string(),
        output_path.to_string_lossy().to_string(),
        "-c".to_string(),
    ];

    if encoder == "h264_nvenc" || encoder == "hevc_nvenc" || encoder == "libx264" {
        args.push(encoder.to_string());
        if encoder == "h264_nvenc" {
            args.push("--pix-fmt".to_string());
            args.push("yuv420p".to_string());
        } else if encoder == "hevc_nvenc" {
            args.push("--pix-fmt".to_string());
            args.push("p010le".to_string());
        }
    } else {
        return Err("Unsupported encoder type".into());
    }

    args.push("-m".to_string());
    args.push(multiplier.to_string());
    args.push("-t".to_string());
    args.push("100".to_string());
    args.push("-p".to_string());
    args.push("rife".to_string());
    args.push("--rife-model".to_string());

    if rife_model == "rife-anime"
        || rife_model == "rife-v4.26"
        || rife_model == "rife-v4.25-lite"
        || rife_model == "rife-v4.6"
    {
        args.push(rife_model.to_string())
    } else {
        return Err("Unsupported RIFE model".into());
    }

    args.push("-e".to_string());
    args.push("preset=fast".to_string());

    let (mut rx, child) = handle
        .shell()
        .command(video2x_binary_path)
        .args(args.clone())
        .spawn()
        .map_err(|e| format!("Failed to execute sidecar: {}", e))?;

    let (cancel_tx, mut cancel_rx) = oneshot::channel();
    let handle_clone = handle.clone();
    tokio::spawn(async move {
        handle_clone.once("cancel_interpolation", move |_| {
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
                                handle.emit("interpolation_stderr", text).unwrap();
                            } else {
                                handle.emit("interpolation_stdout", text).unwrap();
                            }
                        }
                    }
                    Some(CommandEvent::Terminated(TerminatedPayload { code, signal })) => {
                        handle.emit("interpolation_stdout", format!("code: {:?} signal {:?}", code, signal)).unwrap();
                    }
                    None => break,
                    _ => {}
                }
            }
            _ = poll_fn(|cx: &mut Context<'_>| Pin::new(&mut cancel_rx).poll(cx)) => {
                if let Err(e) = child.kill() {
                    eprintln!("Failed to kill video2x process: {}", e);
                }
                return Ok(());
            }
        }
    }

    if overwrite {
        let _ = fs::rename(output_path, video_path);
    }

    Ok(())
}
