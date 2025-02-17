use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::path::BaseDirectory;
use tauri::{AppHandle, Manager, State};
use tauri_plugin_shell::process::{CommandChild, CommandEvent};
use tauri_plugin_shell::ShellExt;
use trash::delete;

use super::utils::format_duration::format_duration;

#[derive(Debug, Serialize, Deserialize)]
pub struct VideoThumbnailResult {
    video_path: String,
    thumbnail_folder: String,
    vtt_file_path: String,
}

pub struct FfmpegState {
    pub process: Mutex<Option<CommandChild>>,
    pub output_folder: Mutex<Option<PathBuf>>,
}

#[tauri::command(rename_all = "snake_case")]
pub async fn generate_video_thumbnails<'a>(
    video_path: String,
    handle: AppHandle,
    state: State<'a, Arc<FfmpegState>>,
) -> Result<VideoThumbnailResult, String> {
    let video_path_absolute = Path::new(&video_path);
    if !video_path_absolute.exists() || !video_path_absolute.is_file() {
        return Err("Invalid file path".into());
    }

    let start = SystemTime::now();
    let unique_folder = start
        .duration_since(UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_millis()
        .to_string();

    let base_dir = handle
        .path()
        .resolve("".to_string(), BaseDirectory::AppConfig)
        .map_err(|e| format!("Failed to resolve App Config directory: {}", e))?;
    let thumbnails_dir = base_dir.join(&unique_folder);
    fs::create_dir_all(&thumbnails_dir).map_err(|e| e.to_string())?;

    // Store folder path in state
    {
        let mut output_folder = state.output_folder.lock().unwrap();
        *output_folder = Some(thumbnails_dir.clone());
    }

    let ffmpeg_command = handle
        .shell()
        .sidecar("ffmpeg")
        .map_err(|e| format!("Failed to create ffmpeg sidecar: {}", e))?
        .arg("-accurate_seek")
        .arg("-i")
        .arg(&video_path_absolute)
        .arg("-vf")
        .arg("fps=1/5,scale=320:-1")
        .arg("-fps_mode")
        .arg("passthrough")
        .arg("-q:v")
        .arg("2")
        .arg("-f")
        .arg("image2")
        .arg(
            thumbnails_dir
                .join("thumb%04d.jpg")
                .to_string_lossy()
                .to_string(),
        );

    let (mut rx, child) = ffmpeg_command
        .spawn()
        .map_err(|e| format!("Failed to start ffmpeg process: {}", e))?;

    // Store process in state
    {
        let mut process_lock = state.process.lock().unwrap();
        *process_lock = Some(child);
    }

    // Wait for FFmpeg to finish and collect output
    let mut output = String::new();
    while let Some(event) = rx.recv().await {
        match event {
            CommandEvent::Stdout(line) => {
                if let Ok(str_line) = String::from_utf8(line) {
                    output.push_str(&str_line);
                    output.push('\n');
                }
            }
            CommandEvent::Stderr(line) => {
                if let Ok(str_line) = String::from_utf8(line) {
                    output.push_str(&str_line);
                    output.push('\n');
                }
            }
            CommandEvent::Error(err) => {
                return Err(format!("FFmpeg process error: {}", err));
            }
            CommandEvent::Terminated(status) => {
                if status.code != Some(0) {
                    return Err(format!("FFmpeg process failed with output: {}", output));
                }
                break;
            }
            _ => {
                return Err("Unexpected error".to_string());
            }
        }
    }

    // Generate VTT file AFTER FFmpeg finishes
    let vtt_file_path = thumbnails_dir.join("thumbnails.vtt");
    let mut vtt_file = File::create(&vtt_file_path).map_err(|e| e.to_string())?;

    writeln!(vtt_file, "WEBVTT\n").map_err(|e| e.to_string())?;
    let mut thumbnail_count = 0;
    for entry in fs::read_dir(&thumbnails_dir).unwrap() {
        let entry = entry.unwrap();
        if entry.path().extension().and_then(|s| s.to_str()) == Some("jpg") {
            thumbnail_count += 1;
            let start_seconds = (thumbnail_count - 1) as f64 * 5.0;
            let end_seconds = start_seconds + 5.0;
            writeln!(
                vtt_file,
                "{}\n{} --> {}\nhttps://asset.localhost/{}\n",
                thumbnail_count,
                format_duration(start_seconds, true),
                format_duration(end_seconds, true),
                entry.path().to_string_lossy().replace("\\", "/")
            )
            .map_err(|e| e.to_string())?;
        }
    }

    Ok(VideoThumbnailResult {
        video_path: video_path_absolute.to_string_lossy().to_string(),
        thumbnail_folder: unique_folder,
        vtt_file_path: vtt_file_path.to_string_lossy().to_string(),
    })
}

#[tauri::command(rename_all = "snake_case")]
pub async fn stop_video_thumbnail_generation<'a>(
    state: State<'a, Arc<FfmpegState>>,
) -> Result<(), String> {
    let mut process_lock = state.process.lock().unwrap();
    if let Some(child) = process_lock.take() {
        match child.kill() {
            Ok(_) => println!("FFmpeg process killed"),
            Err(e) => return Err(format!("Failed to kill process: {}", e)),
        }
    }

    // Remove generated folder
    let mut output_folder = state.output_folder.lock().unwrap();
    if let Some(folder) = output_folder.take() {
        delete(&folder).map_err(|e| e.to_string())?;
    }

    Ok(())
}
