use std::fs;
use std::path::Path;
use serde::{Deserialize, Serialize};
use tauri_plugin_shell::ShellExt;

#[derive(Serialize)]
pub struct VideoDetails {
    pub filename: String,
    pub filesize: u64,
    pub duration: String,
	pub duration_in_seconds: f64,
    pub width: u32,
    pub height: u32,
    pub frame_rate: f64,
}

#[derive(Deserialize)]
struct FFProbeStream {
    width: Option<u32>,
    height: Option<u32>,
    r_frame_rate: Option<String>,
}

#[derive(Deserialize)]
struct FFProbeFormat {
    duration: Option<String>,
}

#[derive(Deserialize)]
struct FFProbeOutput {
    streams: Vec<FFProbeStream>,
    format: Option<FFProbeFormat>,
}

pub fn format_duration(seconds: f64) -> String {
    let total_seconds = seconds.round() as u64;
    let hours = total_seconds / 3600;
    let minutes = (total_seconds % 3600) / 60;
    let seconds = total_seconds % 60;
    format!("{:02}:{:02}:{:02}", hours, minutes, seconds)
}

#[tauri::command(rename_all = "snake_case")]
pub async fn get_video_details(
    video_path: String,
    handle: tauri::AppHandle,
) -> Result<VideoDetails, String> {
    let input_path = Path::new(&video_path);
    if !input_path.exists() || !input_path.is_file() {
        return Err("Invalid video path".into());
    }

    let extension = input_path
        .extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| ext.to_lowercase());
    if extension != Some("mp4".to_string()) && extension != Some("mkv".to_string()) {
        return Err("Unsupported video format".into());
    }

    let metadata =
        fs::metadata(&input_path).map_err(|e| format!("Failed to get file metadata: {}", e))?;
    let filename = input_path
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();
    let filesize = metadata.len();

    let ffprobe_command = handle
        .shell()
        .sidecar("ffprobe")
        .map_err(|e| format!("Failed to create ffprobe sidecar: {}", e))?
        .arg("-v")
        .arg("error")
        .arg("-select_streams")
        .arg("v:0")
        .arg("-show_entries")
        .arg("stream=width,height,r_frame_rate")
        .arg("-show_entries")
        .arg("format=duration")
        .arg("-of")
        .arg("json")
        .arg(&video_path);

    // Run the command
    let output = ffprobe_command
        .output()
        .await
        .map_err(|e| format!("Failed to execute sidecar: {}", e))?;

    // Check if the command failed
    if !output.status.success() {
        return Err(format!(
			"Ffprobe failed with error:\n\
			Command: ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -show_entries format=duration -of json {}\n\
			Stderr:\n{}\n\
			Stdout:\n{}",
			&video_path,
			String::from_utf8_lossy(&output.stderr),
			String::from_utf8_lossy(&output.stdout)
		));
    }

    let ffprobe_json: FFProbeOutput = serde_json::from_slice(&output.stdout)
        .map_err(|e| format!("Failed to parse ffprobe output: {}", e))?;

    let duration_in_seconds = ffprobe_json
        .format
        .and_then(|f| f.duration)
        .and_then(|d| d.parse::<f64>().ok())
        .unwrap_or(0.0);
	let duration = format_duration(duration_in_seconds);

    let stream = ffprobe_json.streams.get(0).ok_or("No video stream found")?;

    let width = stream.width.unwrap_or(0);
    let height = stream.height.unwrap_or(0);

    let frame_rate = stream
        .r_frame_rate
        .as_ref()
        .and_then(|fr| {
            let parts: Vec<&str> = fr.split('/').collect();
            if parts.len() == 2 {
                let num: f64 = parts[0].parse().ok()?;
                let denom: f64 = parts[1].parse().ok()?;
                Some(num / denom)
            } else {
                None
            }
        })
        .unwrap_or(0.0);

    Ok(VideoDetails {
        filename,
        filesize,
        duration,
		duration_in_seconds,
        width,
        height,
        frame_rate,
    })
}
