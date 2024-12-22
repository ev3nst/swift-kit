use std::fs::{copy, create_dir_all, metadata};
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
    // Check if the image file exists and is not empty
    if metadata(image_path).map(|m| m.len() == 0).unwrap_or(true) {
        return Err("Image file is empty or does not exist".to_string());
    }

    // Check if the image file exists
    if !Path::new(image_path).exists() {
        return Err(format!("File does not exist: {}", image_path));
    }

    // Determine output path
    let output_path = match output_path {
        Some(path) if !path.is_empty() => path,
        _ => {
            let path = Path::new(image_path);
            let file_stem = path
                .file_stem()
                .unwrap_or_default()
                .to_str()
                .unwrap_or_default();
            let new_path = path.with_file_name(format!("{}_compressed.jpg", file_stem));
            new_path.to_str().unwrap_or(image_path).to_string()
        }
    };

    // Get the parent directory of the output path (or fall back to current directory if empty)
    let output_path = Path::new(&output_path);
    let output_dir = if output_path.is_dir() {
        output_path // If output_path is a directory, use it as the output directory
    } else {
        output_path.parent().unwrap_or(Path::new(".")) // Otherwise, use its parent directory
    };

    // Ensure the output directory exists and is writable
    if !output_dir.exists() {
        create_dir_all(output_dir)
            .map_err(|e| format!("Failed to create output directory: {}", e))?;
    }

    // If output_path is a folder, append the original file name to the path
    let final_output_path = if output_path.is_dir() {
        let path = Path::new(image_path);
        let file_name = path.file_name().unwrap_or_default().to_str().unwrap_or_default();
        output_path.join(file_name)
    } else {
        output_path.to_path_buf()
    };

    // Copy the original image to the final output path
    if let Err(e) = copy(image_path, &final_output_path) {
        return Err(format!("Failed to copy image: {}", e));
    }

    // Get the jpegoptim binary path
    let jpegoptim_binary = handle
        .path()
        .resolve("binaries/jpegoptim.exe", BaseDirectory::Resource)
        .map_err(|e| format!("Failed to resolve path to jpegoptim: {}", e))?;

    // Execute jpegoptim on the copied file
    let quality = quality.unwrap_or(75);
    let output = Command::new(jpegoptim_binary)
        .arg(format!("--max={}", quality))
        .arg(&final_output_path) // Use the copied file
        .output()
        .map_err(|e| format!("Failed to execute jpegoptim: {}", e))?;

    // Check if jpegoptim executed successfully
    if !output.status.success() {
        return Err(format!(
            "jpegoptim failed with error: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    Ok(())
}
