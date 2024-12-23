use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::os::windows::process::CommandExt;
use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::path::BaseDirectory;
use tauri::Manager;

use super::get_default_browser;

#[derive(Serialize, Deserialize, Clone)]
pub struct YTFetchResponse {
    url: String,
    content_type: String,
    title: String,
    duration: Option<String>,
    thumbnail: Option<String>,
    uploader: Option<String>,
    videos: Option<Vec<VideoEntry>>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct VideoEntry {
    webpage_url: Option<String>,
    title: String,
    playlist_title: Option<String>,
    thumbnail: Option<String>,
    uploader: Option<String>,
    duration_string: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
struct CacheEntry {
    response: YTFetchResponse,
    timestamp: u64,
}

type Cache = Arc<Mutex<HashMap<String, CacheEntry>>>;

lazy_static! {
    static ref CACHE: Cache = Arc::new(Mutex::new(HashMap::new()));
}

const CACHE_EXPIRATION: u64 = 24 * 60 * 60; // 24 hours in seconds

fn current_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}

#[tauri::command(rename_all = "snake_case")]
pub fn yt_url_data(
    url: String,
    drop_cache: bool,
    handle: tauri::AppHandle,
) -> Result<YTFetchResponse, String> {
    if drop_cache {
        let mut cache = CACHE.lock().unwrap();
        cache.clear();
    }

    {
        let mut cache = CACHE.lock().unwrap();
        // Remove expired cache entries
        cache.retain(|_, entry| current_timestamp() - entry.timestamp < CACHE_EXPIRATION);

        if let Some(cached_entry) = cache.get(&url) {
            return Ok(cached_entry.response.clone());
        }
    }

    let yt_dlp_path = handle
        .path()
        .resolve("binaries/yt-dlp.exe", BaseDirectory::Resource)
        .map_err(|e| format!("Failed to resolve path to yt-dlp: {}", e))?;
    let default_browser =
        get_default_browser::get_default_browser().unwrap_or_else(|_| "chrome".to_string());
    let output = Command::new(yt_dlp_path)
        .arg("-j")
        .arg("--clean-info-json")
        .arg("--no-get-comments")
		.arg("--no-warnings")
        .arg("--cookies-from-browser")
        .arg(default_browser)
		.arg("--extractor-args")
		.arg("youtube:player_skip=webpage;player_client=android,ios,web")
        .arg(url.clone())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .creation_flags(0x08000000)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        let stdout = String::from_utf8(output.stdout).map_err(|e| e.to_string())?;
        let mut videos = Vec::new();
        let mut playlist_title = String::new();

        for line in stdout.lines() {
            if line.trim().is_empty() {
                continue;
            }

            let Ok(json) = serde_json::from_str::<VideoEntry>(line) else {
                continue;
            };

            if let Some(title) = json.playlist_title {
                playlist_title = title;
            }
            videos.push(VideoEntry {
                webpage_url: json.webpage_url,
                playlist_title: None,
                title: json.title,
                thumbnail: json.thumbnail,
                uploader: json.uploader,
                duration_string: json.duration_string,
            });
        }

        let response = if !videos.is_empty() {
            // It's a playlist
            YTFetchResponse {
                url: url.clone(),
                content_type: "playlist".to_string(),
                title: playlist_title,
                duration: None,
                thumbnail: None,
                uploader: None,
                videos: Some(videos),
            }
        } else {
            let json = serde_json::from_str::<VideoEntry>(&stdout).map_err(|e| e.to_string())?;
            YTFetchResponse {
                url: url.clone(),
                content_type: "video".to_string(),
                title: json.title,
                thumbnail: json.thumbnail,
                uploader: json.uploader,
                duration: json.duration_string,
                videos: None,
            }
        };

        let mut cache = CACHE.lock().unwrap();
        cache.insert(
            url.clone(),
            CacheEntry {
                response: response.clone(),
                timestamp: current_timestamp(),
            },
        );

        Ok(response)
    } else {
        let stderr = String::from_utf8(output.stderr).map_err(|e| e.to_string())?;
        Err(stderr)
    }
}
