use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

use super::get_video_details::get_video_details;
use super::utils::format_duration::format_duration;
use super::utils::file_types::IAnimeMeta;

#[tauri::command(rename_all = "snake_case")]
pub async fn intro_outro_prediction(
    episodes_folder: String,
    handle: tauri::AppHandle,
) -> Result<Vec<IAnimeMeta>, String> {
    let path = Path::new(&episodes_folder);
    if !path.exists() || !path.is_dir() {
        return Err("Invalid directory path".into());
    }

    let mut video_files: Vec<PathBuf> = vec![];

    // Collect all video files (.mp4, .mkv) from the directory
    for entry in fs::read_dir(path).map_err(|e| format!("Failed to read directory: {}", e))? {
        let entry = entry.map_err(|e| format!("Error reading directory entry: {}", e))?;
        let path = entry.path();
        let extension = path.extension().and_then(|ext| ext.to_str());

        if let Some(ext) = extension {
            if ext == "mp4" || ext == "mkv" {
                video_files.push(path);
            }
        }
    }

    // Sort the files in ascending order based on filename
    video_files.sort_by(|a, b| a.file_name().cmp(&b.file_name()));
    let mut result = vec![];
    for video_path in video_files {
        let video_details =
            get_video_details(video_path.to_string_lossy().to_string(), handle.clone()).await?;

        // Check if there are chapters
        let chapters = get_video_chapters(&video_path)?;
        let (intro_start, intro_end, outro_start, outro_end) =
            detect_intro_outro(video_details.duration_in_seconds, &chapters);

        result.push(IAnimeMeta {
            filename: video_details.filename,
            filesize: video_details.filesize,
            duration: video_details.duration,
            duration_in_seconds: video_details.duration_in_seconds,
            width: video_details.width,
            height: video_details.height,
            frame_rate: video_details.frame_rate,
            audio_tracks: video_details.audio_tracks,
            default_audio: video_details.default_audio,
            subtitle_tracks: video_details.subtitle_tracks,
            default_subtitle: video_details.default_subtitle,
            intro_start: Some(intro_start),
            intro_end: Some(intro_end),
            outro_start: Some(outro_start),
            outro_end: Some(outro_end),
        });
    }

    Ok(result)
}

fn get_video_chapters(video_path: &Path) -> Result<Vec<(f64, f64)>, String> {
    let output = Command::new("ffprobe")
        .arg("-loglevel")
        .arg("error")
        .arg("-print_format")
        .arg("json")
        .arg("-show_chapters")
        .arg(video_path)
        .output()
        .map_err(|e| format!("Failed to run ffprobe: {}", e))?;

    if !output.status.success() {
        return Err("Failed to fetch chapters".into());
    }

    let output_str = String::from_utf8_lossy(&output.stdout);
    let chapters: serde_json::Value = serde_json::from_str(&output_str)
        .map_err(|e| format!("Failed to parse ffprobe output: {}", e))?;

    if let Some(chapter_list) = chapters["chapters"].as_array() {
        let chapter_times = chapter_list
            .iter()
            .filter_map(|chapter| {
                let start_time: f64 = chapter["start_time"].as_str().unwrap().parse().unwrap();
                let end_time: f64 = chapter["end_time"].as_str().unwrap().parse().unwrap();
                Some((start_time, end_time))
            })
            .collect::<Vec<_>>();

        Ok(chapter_times)
    } else {
        Err("No chapters found in ffprobe output".into())
    }
}

fn detect_intro_outro(
    video_duration: f64,
    chapters: &[(f64, f64)],
) -> (String, String, String, String) {
    let mut intro_start = "".to_string();
    let mut intro_end = "".to_string();
    let mut outro_start = "".to_string();
    let mut outro_end = "".to_string();

    let half_duration = video_duration / 2.0;
    for (chapter_start, chapter_end) in chapters.iter() {
        let duration = chapter_end - chapter_start;
        if *chapter_start < half_duration && duration >= 50.0 && duration <= 180.0 {
            intro_start = format_duration(*chapter_start, false);
            intro_end = format_duration(*chapter_end, false);
        }

        if *chapter_start > half_duration && duration >= 50.0 && duration <= 180.0 {
            outro_start = format_duration(*chapter_start, false);
            outro_end = format_duration(*chapter_end, false);
        }
    }

    (intro_start, intro_end, outro_start, outro_end)
}
