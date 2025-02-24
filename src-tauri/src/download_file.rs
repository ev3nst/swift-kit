use reqwest::Client;
use serde::Serialize;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tauri::path::BaseDirectory;
use tauri::{AppHandle, Emitter, Manager, State};
use tokio::fs::{self, File};
use tokio::io::AsyncWriteExt;

#[derive(Default)]
pub struct DownloadState {
    pub abort: bool,
}

#[derive(Serialize, Clone)]
struct DownloadProgress {
    bytes_downloaded: u64,
    total_size: u64,
    progress: f64,
    eta: String,
}

fn format_eta(eta_secs: u64) -> String {
    let hours = eta_secs / 3600;
    let minutes = (eta_secs % 3600) / 60;
    let seconds = eta_secs % 60;
    format!("{:02}:{:02}:{:02}", hours, minutes, seconds)
}

fn is_within_app_config(destination: &Path, app_config_path: &Path) -> bool {
    destination.starts_with(app_config_path)
}

async fn create_dirs_limited(path: &Path, max_depth: usize) -> Result<(), String> {
    let mut current = PathBuf::new();
    let mut depth = 0;

    for component in path.components() {
        current.push(component);
        if !current.exists() {
            fs::create_dir(&current).await.map_err(|e| e.to_string())?;
            depth += 1;
            if depth > max_depth {
                return Err("Exceeded max directory depth".to_string());
            }
        }
    }
    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
pub async fn download_file(
    url: String,
    destination: String,
    rate_limit_kb: Option<u64>,
    handle: AppHandle,
    state: State<'_, Arc<Mutex<DownloadState>>>,
) -> Result<String, String> {
    let app_config_path = handle
        .path()
        .resolve("".to_string(), BaseDirectory::AppConfig)
        .map_err(|e| format!("Failed to resolve App Config directory: {}", e))?;

    let dest_path = Path::new(&destination);
    if !is_within_app_config(dest_path, &app_config_path) {
        return Err("Invalid destination path".to_string());
    }

    // Create a temporary file path
    let temp_path = format!("{}.temp", destination);
    let temp_path = Path::new(&temp_path);

    // Ensure parent directories exist
    if let Some(parent) = temp_path.parent() {
        create_dirs_limited(parent, 3).await?;
    }

    let client = Client::new();
    let mut response = client.get(&url).send().await.map_err(|e| e.to_string())?;
    let total_size = response
        .content_length()
        .ok_or("Failed to get content length")?;

    // Create and write to temporary file
    let mut file = File::create(temp_path).await.map_err(|e| e.to_string())?;
    let mut bytes_downloaded = 0u64;
    let start_time = Instant::now();
    let rate_limit_bytes = rate_limit_kb.unwrap_or(50000) * 1024;
    let mut bucket = 0u64;
    let mut last_refill = Instant::now();

    while let Some(chunk) = response.chunk().await.map_err(|e| e.to_string())? {
        if state.lock().map_err(|e| e.to_string())?.abort {
            // Clean up temp file if download is aborted
            let _ = fs::remove_file(temp_path).await;
            return Err("Download aborted".into());
        }

        let chunk_len = chunk.len() as u64;
        bytes_downloaded += chunk_len;
        file.write_all(&chunk).await.map_err(|e| e.to_string())?;

        let progress = (bytes_downloaded as f64 / total_size as f64) * 100.0;
        let elapsed = start_time.elapsed().as_secs_f64();
        let speed = if elapsed > 0.0 {
            bytes_downloaded as f64 / elapsed
        } else {
            0.0
        };

        let eta_secs = if speed > 0.0 {
            let remaining_bytes = total_size.saturating_sub(bytes_downloaded);
            let eta = (remaining_bytes as f64 / speed).ceil();
            if eta.is_finite() && eta <= u64::MAX as f64 {
                eta as u64
            } else {
                0
            }
        } else {
            0
        };
        let eta = format_eta(eta_secs);

        handle
            .emit(
                "download-progress",
                DownloadProgress {
                    bytes_downloaded,
                    total_size,
                    progress,
                    eta,
                },
            )
            .map_err(|e| e.to_string())?;

        bucket += chunk_len;
        let now = Instant::now();
        let time_since_last_refill = now.duration_since(last_refill).as_secs_f64();

        if time_since_last_refill > 0.0 {
            let max_bytes = (rate_limit_bytes as f64 * time_since_last_refill) as u64;
            if bucket > max_bytes {
                let sleep_secs = (bucket - max_bytes) as f64 / rate_limit_bytes as f64;
                if sleep_secs.is_finite() && sleep_secs > 0.0 && sleep_secs < 3600.0 {
                    tokio::time::sleep(Duration::from_secs_f64(sleep_secs)).await;
                }
                bucket = 0;
                last_refill = now;
            }
        }
    }

    // Ensure all data is written and close the file handle
    file.flush().await.map_err(|e| e.to_string())?;
    drop(file);

    // Wait a bit to ensure file handle is fully released
    tokio::time::sleep(Duration::from_millis(100)).await;

    // Rename temp file to final destination
    fs::rename(temp_path, &destination)
        .await
        .map_err(|e| format!("Failed to rename temp file: {}", e))?;

    Ok(destination)
}
