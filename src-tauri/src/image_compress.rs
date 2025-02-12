use std::path::Path;

use super::img_compressors::jpeg;
use super::img_compressors::png;
use super::img_compressors::webp;

#[tauri::command(rename_all = "snake_case")]
pub async fn image_compress(
    img_path: String,
    quality: Option<u8>,
    output_folder: Option<String>,
    handle: tauri::AppHandle,
) -> Result<(), String> {
    let input_path = Path::new(&img_path);
    if !input_path.exists() || !input_path.is_file() {
        return Err("Invalid image path".into());
    }
    let output_folder = if output_folder.as_deref().unwrap_or("").is_empty() {
        input_path.parent().unwrap_or_else(|| Path::new("."))
    } else {
        Path::new(output_folder.as_deref().unwrap())
    };

    // Ensure the output directory exists and is writable
    if !output_folder.exists() {
        return Err("Output path could not be resolved.".to_string());
    }

    // Create the output file path
    let output_path = Path::new(&output_folder).join(
        input_path
            .file_stem()
            .ok_or("Invalid file name")?
            .to_string_lossy()
            .to_string()
            + "."
            + input_path
                .extension()
                .and_then(|s| s.to_str())
                .unwrap_or(""),
    );

    let quality = quality.unwrap_or(75);

    let extension = input_path
        .extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| ext.to_lowercase())
        .ok_or_else(|| "Unable to determine file extension".to_string())?;

    match extension.as_str() {
        "png" => png::compress(input_path, quality, &output_path, handle).await,
        "jpg" | "jpeg" => jpeg::compress(input_path, quality, &output_path, handle).await,
        "webp" => webp::compress(input_path, quality, &output_path, handle).await,
        _ => Err("Unsupported file format".to_string()),
    }
}
