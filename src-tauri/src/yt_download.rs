use serde::Serialize;
use std::io::{BufReader, Read};
use std::os::windows::process::CommandExt;
use std::path::Path;
use std::process::{Command, Stdio};
use tauri::Emitter;
use tokio::{sync::mpsc, task};

use super::utils::get_default_browser::get_default_browser;

const WINDOWS_CREATE_NO_WINDOW: u32 = 0x08000000;
const BUFFER_SIZE: usize = 1024;
const CHANNEL_BUFFER_SIZE: usize = 32;

#[derive(Serialize)]
pub struct DownloadResponse {
    success: bool,
    message: String,
}

#[derive(Serialize, Clone)]
pub struct ProgressUpdate {
    output: String,
    timestamp: u64,
}

#[tauri::command(rename_all = "snake_case")]
pub async fn yt_download(
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

    let result = task::spawn_blocking(move || -> Result<DownloadResponse, String> {
        let binding = Command::new("ffmpeg");
        let ffmpeg_path = binding.get_program();
        let mut command = Command::new("yt-dlp");

        // Configure command
        command
            .arg("-f")
            .arg("bv*+ba/b")
            .arg("-o")
            .arg(
                output_path
                    .join("%(title)s.%(ext)s")
                    .to_str()
                    .ok_or("Invalid path encoding".to_string())?,
            )
            .arg("--continue")
            .arg("--no-warnings")
            .arg("--ffmpeg-location")
            .arg(ffmpeg_path)
            .arg(&url)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .creation_flags(WINDOWS_CREATE_NO_WINDOW);

        // Add rate limit if specified
        if let Some(rate) = download_rate {
            if rate > 0 {
                command.arg("--limit-rate").arg(format!("{}K", rate));
            }
        }

        // Add browser cookies if available
        if let Ok(browser) = get_default_browser() {
            if browser != "not_found" {
                command.arg("--cookies-from-browser").arg(browser);
            }
        }

        let mut child = command.spawn().map_err(|e| e.to_string())?;

        let stdout = child
            .stdout
            .take()
            .ok_or("Failed to capture stdout".to_string())?;

        let stderr = child
            .stderr
            .take()
            .ok_or("Failed to capture stderr".to_string())?;

        let (tx, _rx) = mpsc::channel(CHANNEL_BUFFER_SIZE);
        let handle_clone_stdout = handle.clone();
        let handle_clone_stderr = handle.clone();

        // Handle stdout
        let tx_stdout = tx.clone();
        task::spawn(async move {
            let mut reader = BufReader::new(stdout);
            let mut buffer = vec![0u8; BUFFER_SIZE];

            while let Ok(read) = reader.read(&mut buffer) {
                if read == 0 {
                    break;
                }
                if let Ok(output) = std::str::from_utf8(&buffer[0..read]) {
                    let progress = ProgressUpdate {
                        output: output.to_string(),
                        timestamp: std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap_or_default()
                            .as_secs(),
                    };

                    if tx_stdout.send(progress.clone()).await.is_ok() {
                        handle_clone_stdout
                            .emit("yt-download-progress", Some(progress))
                            .unwrap_or_default();
                    }
                }
            }
        });

        // Handle stderr
        let tx_stderr = tx;
        task::spawn(async move {
            let mut reader = BufReader::new(stderr);
            let mut buffer = vec![0u8; BUFFER_SIZE];

            while let Ok(read) = reader.read(&mut buffer) {
                if read == 0 {
                    break;
                }
                if let Ok(output) = std::str::from_utf8(&buffer[0..read]) {
                    let progress = ProgressUpdate {
                        output: output.to_string(),
                        timestamp: std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap_or_default()
                            .as_secs(),
                    };

                    if tx_stderr.send(progress.clone()).await.is_ok() {
                        handle_clone_stderr
                            .emit("yt-download-progress", Some(progress))
                            .unwrap_or_default();
                    }
                }
            }
        });

        let output = child.wait_with_output().map_err(|e| e.to_string())?;

        if output.status.success() {
            Ok(DownloadResponse {
                success: true,
                message: "Download completed successfully".to_string(),
            })
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            Err(format!("Download failed: {}", stderr))
        }
    })
    .await
    .map_err(|e| e.to_string())?;

    result
}
