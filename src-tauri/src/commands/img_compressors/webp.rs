use std::fs::{metadata, create_dir_all};
use std::path::Path;
use std::process::Command;
use tauri::path::BaseDirectory;
use tauri::Manager;

pub fn compress(
    image_path: &str,
    output_path: Option<String>,
    quality: Option<u8>,
    handle: tauri::AppHandle,
) -> Result<(), String> {
    let quality = quality.unwrap_or(75);

    // Check if the image exists
    if metadata(&image_path).map(|m| m.len() == 0).unwrap_or(true) {
        return Err("Image file is empty or does not exist".to_string());
    }

    // Handle output path
    let output_path = match output_path {
        Some(path) if !path.is_empty() => {
            // If output_path is provided and not empty, make sure it's a valid directory
            let output_dir = Path::new(&path);
            if !output_dir.exists() || !output_dir.is_dir() {
                return Err("Output path is not a valid directory.".to_string());
            }

            // If valid, return the full output path with the original filename
            let file_name = Path::new(image_path).file_name().unwrap_or_default();
            output_dir.join(file_name).to_str().unwrap_or_default().to_string()
        },
        _ => {
            // If output_path is None or an empty string, save in the same folder with _compressed suffix
            let path = Path::new(image_path);
            let file_stem = path
                .file_stem()
                .unwrap_or_default()
                .to_str()
                .unwrap_or_default();
            let new_path = path.with_file_name(format!("{}_compressed.webp", file_stem));
            new_path.to_str().unwrap_or_default().to_string()
        }
    };

    // Ensure the output directory exists
    let output_path = Path::new(&output_path);
    let output_dir = output_path.parent().unwrap_or(Path::new("."));

    // Create the output directory if it doesn't exist
    if !output_dir.exists() {
        create_dir_all(output_dir)
            .map_err(|e| format!("Failed to create output directory: {}", e))?;
    }

    // Build the cwebp command
    let cwebp_binary = handle
        .path()
        .resolve("binaries/cwebp.exe", BaseDirectory::Resource)
        .map_err(|e| format!("Failed to resolve path to cwebp: {}", e))?;

    let mut command = Command::new(cwebp_binary);
    command
        .arg(image_path)
        .arg("-o")
        .arg(&output_path)
        .arg("-q")
        .arg(quality.to_string());

    // Run the command
    let output = command
        .output()
        .map_err(|e| format!("Failed to execute cwebp: {}", e))?;

    // Check if the command was successful
    if !output.status.success() {
        return Err(format!(
            "cwebp failed with error: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    Ok(())
}
