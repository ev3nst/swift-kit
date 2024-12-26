use serde::Serialize;
use std::io::Read;
use std::os::windows::process::CommandExt;
use std::path::Path;
use std::process::{Command, Stdio};
use tauri::path::BaseDirectory;
use tauri::{Emitter, Manager};
use tokio::task;

use super::get_default_browser;

#[derive(Serialize)]
pub struct DownloadResponse {
    success: bool,
    message: String,
}

#[tauri::command(rename_all = "snake_case")]
pub async fn download_yt_videos(
    url: String,
    output_path: String,
    download_rate: Option<u32>,
    handle: tauri::AppHandle,
) -> Result<DownloadResponse, String> {
    let output_path = Path::new(&output_path);
    if !output_path.is_dir() {
        return Err(format!("Invalid output path: {}", output_path.display()));
    }
    let output_path = output_path.to_path_buf();
    let url = url.clone();
    let handle = handle.clone();

    let yt_dlp_path = handle
        .path()
        .resolve("binaries/yt-dlp.exe", BaseDirectory::Resource)
        .map_err(|e| format!("Failed to resolve path to yt-dlp: {}", e))?;

    let ffmpeg_path = handle
        .path()
        .resolve("binaries/ffmpeg.exe", BaseDirectory::Resource)
        .map_err(|e| format!("Failed to resolve path to ffmpeg: {}", e))?;

    let result = task::spawn_blocking(move || {
        let mut command = Command::new(yt_dlp_path);
        let default_browser =
            get_default_browser::get_default_browser().unwrap_or_else(|_| "chrome".to_string());
        command
            .arg("-f")
            .arg("bestaudio[ext=m4a]+bestvideo[ext=mp4]")
            .arg("-o")
            .arg(output_path.join("%(title)s.%(ext)s").to_str().unwrap())
            .arg("--continue")
            .arg("--no-warnings")
            .arg("--cookies-from-browser")
            .arg(default_browser)
            .arg("--ffmpeg-location")
            .arg(ffmpeg_path)
            .arg(url)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .creation_flags(0x08000000);

        if let Some(rate) = download_rate {
            if rate > 0 {
                command.arg("--limit-rate").arg(format!("{}K", rate));
            }
        }

        let mut child = command.spawn().map_err(|e| e.to_string())?;
        let mut stdout = child.stdout.take().unwrap();
        let mut stderr = child.stderr.take().ok_or("Failed to capture stderr")?;

        let handle_clone = handle.clone();

        // Spawn a task to read stdout
        let handle_clone_stdout = handle_clone.clone();
        task::spawn(async move {
            let mut buf = [0u8; 100];
            while let Ok(read) = stdout.read(&mut buf) {
                if read == 0 {
                    break;
                }
                let output = std::str::from_utf8(&buf[0..read]).unwrap();
                handle_clone_stdout
                    .emit("download-progress", Some(output.to_string()))
                    .unwrap();
            }
        });

        // Spawn a task to read stderr
        task::spawn(async move {
            let mut buf = [0u8; 100];
            while let Ok(read) = stderr.read(&mut buf) {
                if read == 0 {
                    break;
                }
                let output = std::str::from_utf8(&buf[0..read]).unwrap();
                handle_clone
                    .emit("download-progress", Some(output.to_string()))
                    .unwrap();
            }
        });

        let output = child.wait_with_output().map_err(|e| e.to_string())?;
        if output.status.success() {
            Ok(DownloadResponse {
                success: true,
                message: "Download completed successfully".to_string(),
            })
        } else {
            let stderr = String::from_utf8(output.stderr).map_err(|e| e.to_string())?;
            Err(stderr)
        }
    })
    .await;

    result.map_err(|e| e.to_string())?
}
