use serde::Serialize;
use serde_json::Value;
use std::process::Command;
use std::time::Instant;
use tauri::path::BaseDirectory;
use tauri::Manager;

#[derive(Serialize, Debug)]
struct Video {
    url: String,
    title: String,
    thumbnail: String,
    uploader: String,
    duration: Option<String>,
}

#[derive(Serialize)]
pub struct YTFetchResponse {
    url: String,
    content_type: String,
    title: String,
    duration: Option<String>,
    thumbnail: Option<String>,
    uploader: Option<String>,
    videos: Option<Vec<Video>>,
    yt_dlp_execution: String,
    json_parse_execution: String,
}

#[tauri::command(rename_all = "snake_case")]
pub fn yt_url_data(url: String, handle: tauri::AppHandle) -> Result<YTFetchResponse, String> {
    let yt_dlp_path = handle
        .path()
        .resolve("binaries/yt-dlp.exe", BaseDirectory::Resource)
        .map_err(|e| format!("Failed to resolve path to yt-dlp: {}", e))?;

    // Measure time for yt-dlp execution
    let start_yt_dlp = Instant::now();

    // Execute the yt-dlp command
    let output = Command::new(yt_dlp_path)
        .arg("-j")
        .arg("--clean-info-json")
        .arg("--no-get-comments")
        .arg(url.clone())
        .output()
        .map_err(|e| e.to_string())?;

    let yt_dlp_execution = start_yt_dlp.elapsed();
    let yt_dlp_execution_str = format!("{:?}", yt_dlp_execution);
    println!("yt-dlp execution time: {:?}", yt_dlp_execution);

    if output.status.success() {
        let stdout = String::from_utf8(output.stdout).map_err(|e| e.to_string())?;

        // Measure time for JSON parsing
        let start_parsing = Instant::now();

        let mut videos = Vec::new();
        let mut playlist_title = String::new();

        for line in stdout.lines() {
            if line.trim().is_empty() {
                continue;
            }

            let json: Value = serde_json::from_str(line).map_err(|e| e.to_string())?;

            if json.is_object() {
                if let Some(title) = json.get("playlist_title") {
                    playlist_title = title.as_str().unwrap_or_default().to_string();
                }
                videos.push(Video {
                    url: json["webpage_url"].as_str().unwrap_or_default().to_string(),
                    title: json["title"].as_str().unwrap_or_default().to_string(),
                    thumbnail: json["thumbnail"].as_str().unwrap_or_default().to_string(),
                    uploader: json["uploader"].as_str().unwrap_or_default().to_string(),
                    duration: json["duration"].as_str().map(|d| d.to_string()),
                });
            }
        }

        let json_parse_execution = start_parsing.elapsed();
        let json_parse_execution_str = format!("{:?}", json_parse_execution);
        println!("JSON parsing time: {:?}", json_parse_execution);

        let response = if !videos.is_empty() {
            // It's a playlist
            YTFetchResponse {
                url,
                content_type: "playlist".to_string(),
                title: playlist_title,
                duration: None,
                thumbnail: None,
                uploader: None,
                videos: Some(videos),
                yt_dlp_execution: yt_dlp_execution_str,
                json_parse_execution: json_parse_execution_str,
            }
        } else {
            // It's a single video
            let json: Value = serde_json::from_str(&stdout).map_err(|e| e.to_string())?;
            YTFetchResponse {
                url,
                content_type: "video".to_string(),
                title: json["title"].as_str().unwrap_or_default().to_string(),
                thumbnail: Some(json["thumbnail"].as_str().unwrap_or_default().to_string()),
                uploader: Some(json["uploader"].as_str().unwrap_or_default().to_string()),
                duration: json["duration"].as_str().map(|d| d.to_string()),
                videos: None,
                yt_dlp_execution: yt_dlp_execution_str,
                json_parse_execution: json_parse_execution_str,
            }
        };

        Ok(response)
    } else {
        let stderr = String::from_utf8(output.stderr).map_err(|e| e.to_string())?;
        Err(stderr)
    }
}
