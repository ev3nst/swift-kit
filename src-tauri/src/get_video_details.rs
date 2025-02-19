use serde::Deserialize;
use std::fs;
use std::path::Path;
use std::{os::windows::process::CommandExt, process::Command};

use super::utils::file_types::IVideoMeta;
use super::utils::file_types::VideoTrackDetail;
use super::utils::format_duration::format_duration;

#[derive(Debug, Deserialize)]
struct FFProbeStream {
    width: Option<u32>,
    height: Option<u32>,
    r_frame_rate: Option<String>,
    codec_type: Option<String>,
    tags: Option<std::collections::HashMap<String, String>>,
    disposition: Option<std::collections::HashMap<String, i32>>,
}

#[derive(Debug, Deserialize)]
struct FFProbeFormat {
    duration: Option<String>,
}

#[derive(Debug, Deserialize)]
struct FFProbeOutput {
    streams: Vec<FFProbeStream>,
    format: Option<FFProbeFormat>,
}

#[tauri::command(rename_all = "snake_case")]
pub async fn get_video_details(video_path: String) -> Result<IVideoMeta, String> {
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

    let mut ffprobe_command = Command::new("ffprobe");
    ffprobe_command
        .arg("-v")
        .arg("error")
        .arg("-show_entries")
        .arg("format=duration")
        .arg("-show_entries")
        .arg("stream=codec_type,r_frame_rate,width,height")
        .arg("-show_entries")
        .arg("stream_tags")
        .arg("-show_entries")
        .arg("stream_disposition")
        .arg("-of")
        .arg("json")
        .arg(&video_path);

    if cfg!(target_os = "windows") {
        ffprobe_command.creation_flags(0x08000000);
    }

    let output = ffprobe_command
        .output()
        .map_err(|e| format!("Failed to execute sidecar: {}", e))?;

    // Check if the command failed
    if !output.status.success() {
        return Err(format!(
            "Ffprobe failed with error:\nCommand: ffprobe -v error -show_entries stream=codec_type,tags -show_entries format=duration -of json {}\nStderr:\n{}\nStdout:\n{}",
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
    let duration = format_duration(duration_in_seconds, false);

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

    let mut audio_tracks = Vec::new();
    let mut default_audio: Option<i32> = None;
    let mut subtitle_tracks = Vec::new();
    let mut default_subtitle: Option<i32> = None;

    for (index, stream) in ffprobe_json.streams.iter().enumerate() {
        if let Some(codec_type) = &stream.codec_type {
            if codec_type == "audio" {
                let name = stream
                    .tags
                    .as_ref()
                    .and_then(|tags| tags.get("language"))
                    .cloned()
                    .unwrap_or_else(|| "Unknown".to_string());
                audio_tracks.push(VideoTrackDetail {
                    name,
                    value: index as i32,
                });

                if let Some(disposition) = &stream.disposition {
                    if disposition.get("default") == Some(&1) {
                        default_audio = Some(index as i32);
                    }
                }
            }
            if codec_type == "subtitle" {
                let name = stream
                    .tags
                    .as_ref()
                    .and_then(|tags| tags.get("title"))
                    .cloned()
                    .unwrap_or_else(|| "Unknown".to_string());
                subtitle_tracks.push(VideoTrackDetail {
                    name,
                    value: index as i32,
                });

                if let Some(disposition) = &stream.disposition {
                    if disposition.get("default") == Some(&1) {
                        default_subtitle = Some(index as i32);
                    }
                }
            }
        }
    }

    if default_audio.is_none() && audio_tracks.len() > 0 {
        default_audio = Some(audio_tracks[0].value.try_into().unwrap());
    }

    if default_subtitle.is_none() && subtitle_tracks.len() > 0 {
        default_subtitle = Some(subtitle_tracks[0].value.try_into().unwrap());
    }

    Ok(IVideoMeta {
        filename,
        filesize,
        duration,
        duration_in_seconds,
        width,
        height,
        frame_rate,
        audio_tracks,
        default_audio: default_audio.unwrap_or(0),
        subtitle_tracks,
        default_subtitle: default_subtitle.unwrap_or(0),
    })
}
