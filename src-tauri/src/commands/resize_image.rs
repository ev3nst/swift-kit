use image::{imageops::FilterType, ImageFormat};
use std::path::Path;
use tauri::path::BaseDirectory;
use tauri::Manager;

#[tauri::command(rename_all = "snake_case")]
pub async fn resize_image(
    image_path: String,
    output_path: Option<String>,
    width: Option<u32>,
    height: Option<u32>,
    handle: tauri::AppHandle,
) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || {
        // Open the image file
        let img = image::open(&image_path).map_err(|e| format!("Failed to open image: {}", e))?;

        // Determine the new dimensions
        let original_width = img.width();
        let original_height = img.height();
        let (new_width, new_height) = match (width, height) {
            (Some(w), Some(h)) if h > 0 && w > 0 => (w, h),
            (Some(w), Some(h)) if h == 0 && w > 0 => {
                // Calculate height based on the original aspect ratio
                let aspect_ratio = original_height as f32 / original_width as f32;
                let new_height = (w as f32 * aspect_ratio) as u32;
                println!("Calculated dimensions: {}x{}", w, new_height);
                (w, new_height)
            }
            (Some(w), Some(h)) if w == 0 && h > 0  => {
                // Calculate width based on the original aspect ratio
                let aspect_ratio = original_width as f32 / original_height as f32;
                let new_width = (h as f32 * aspect_ratio) as u32;
                (new_width, h)
            }
            (None, Some(h)) if h > 0 => {
                // Calculate width based on the original aspect ratio
                let aspect_ratio = original_width as f32 / original_height as f32;
                let new_width = (h as f32 * aspect_ratio) as u32;
                (new_width, h)
            }
            (Some(w), None) if w > 0 => {
                // Calculate height based on the original aspect ratio
                let aspect_ratio = original_height as f32 / original_width as f32;
                let new_height = (w as f32 * aspect_ratio) as u32;
                (w, new_height)
            }
            (None, None) => return Err("Either width or height must be provided.".to_string()),
            _ => return Err("Invalid dimensions provided.".to_string()),
        };

        let resized_img = img.resize_exact(new_width, new_height, FilterType::Lanczos3);
        let output_file_path = match output_path {
            Some(ref path) if !path.trim().is_empty() => {
                let output_dir = Path::new(path);
                if !output_dir.exists() || !output_dir.is_dir() {
                    return Err("Output path is not a valid directory.".to_string());
                }
                let image_name = Path::new(&image_path).file_name().unwrap_or_default();
                output_dir.join(image_name)
            }
            _ => {
                let downloads_dir = handle
                    .path()
                    .resolve("".to_string(), BaseDirectory::Download)
                    .map_err(|e| format!("Failed to resolve Downloads directory: {}", e))?;
                let file_stem = Path::new(&image_path)
                    .file_stem()
                    .unwrap_or_default()
                    .to_str()
                    .unwrap_or_default();
                let extension = Path::new(&image_path)
                    .extension()
                    .unwrap_or_default()
                    .to_str()
                    .unwrap_or_default();
                downloads_dir.join(format!("{}_resized.{}", file_stem, extension))
            }
        };

        let output_format = ImageFormat::Png; 
        resized_img
            .save_with_format(&output_file_path, output_format)
            .map_err(|e| format!("Failed to save resized image: {}", e))?;

        Ok(output_file_path.to_str().unwrap_or_default().to_string())
    })
    .await
    .map_err(|e| format!("Task failed to run: {}", e))?
}
