use std::path::Path;
use std::{os::windows::process::CommandExt, process::Command};

#[derive(Debug)]
pub struct StreamIndexExistence {
    pub audio_stream_index_exists: bool,
    pub subtitle_stream_index_exists: bool,
}

pub async fn check_stream_exists(
    input_path: &Path,
    audio_index: usize,
    subtitle_index: usize,
) -> Result<StreamIndexExistence, String> {
    let mut ffprobe_command = Command::new("ffprobe");
    ffprobe_command
        .arg("-v")
        .arg("quiet")
        .arg("-print_format")
        .arg("json")
        .arg("-show_streams")
        .arg(input_path);

    if cfg!(target_os = "windows") {
        ffprobe_command.creation_flags(0x08000000);
    }

    let output = ffprobe_command
        .output()
        .map_err(|e| format!("Failed to execute ffprobe: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "ffprobe failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let json_output: serde_json::Value = serde_json::from_slice(&output.stdout)
        .map_err(|e| format!("Failed to parse ffprobe output: {}", e))?;

    let streams = json_output
        .get("streams")
        .and_then(|s| s.as_array())
        .ok_or_else(|| "No streams found in media file".to_string())?;

    let mut audio_stream_index_exists = false;
    let mut subtitle_stream_index_exists = false;
    for (index, stream) in streams.iter().enumerate() {
        let codec_type = stream
            .get("codec_type")
            .and_then(|ct| ct.as_str())
            .unwrap_or("");

        match codec_type {
            "audio" => {
                if index == audio_index {
                    audio_stream_index_exists = true;
                }
            }
            "subtitle" => {
                if index == subtitle_index {
                    subtitle_stream_index_exists = true;
                }
            }
            _ => continue,
        }
    }

    Ok(StreamIndexExistence {
        audio_stream_index_exists,
        subtitle_stream_index_exists,
    })
}
