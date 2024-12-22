use crate::commands::img_compressors::{jpeg, png, webp};
use std::path::{Path, PathBuf};

#[tauri::command(rename_all = "snake_case")]
pub async fn compress_image(
    image_path: String,
    output_path: Option<String>,
    quality: Option<u8>,
    handle: tauri::AppHandle,
) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        if let Some(ref path) = output_path {
            // If the path is not empty, check if it's a valid directory
            if !path.trim().is_empty() {
                let output_path_check = Path::new(path);
                if !output_path_check.exists() || !output_path_check.is_dir() {
                    return Err("Output path is not a valid directory.".to_string());
                }
            }
        }

        let path = PathBuf::from(&image_path);
        let extension = path
            .extension()
            .and_then(|ext| ext.to_str())
            .map(|ext| ext.to_lowercase())
            .ok_or_else(|| "Unable to determine file extension".to_string())?;

        match extension.as_str() {
            "png" => png::compress(&image_path, output_path, quality, handle),
            "jpg" | "jpeg" => jpeg::compress(&image_path, output_path, quality, handle),
            "webp" => webp::compress(&image_path, output_path, quality, handle),
            _ => Err("Unsupported file format".to_string()),
        }
    })
    .await
    .map_err(|e| format!("Task failed to run: {}", e))?
}
