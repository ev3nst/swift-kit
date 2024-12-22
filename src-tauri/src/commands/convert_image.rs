use image::{open, ImageFormat};
use std::path::Path;

#[tauri::command(rename_all = "snake_case")]
pub fn convert_image(
    image_path: String,
    output_path: Option<String>,
    convert_to: String,
) -> Result<String, String> {
    // Open the image file
    let img = match open(&image_path) {
        Ok(img) => img,
        Err(e) => return Err(format!("Failed to open image: {}", e)),
    };

    // Parse the target format
    let format = match convert_to.to_lowercase().as_str() {
        "png" => ImageFormat::Png,
        "jpg" | "jpeg" => ImageFormat::Jpeg,
        "webp" => ImageFormat::WebP,
        "bmp" => ImageFormat::Bmp,
        _ => return Err("Unsupported format".to_string()),
    };

    // Determine the output path
    let output_file_path = match output_path {
        Some(path) => {
            // Check if the provided output path is a valid folder
            let output_dir = Path::new(&path);
            if !output_dir.is_dir() {
                return Err("Provided output path is not a valid directory.".to_string());
            }

            // Use the original file name and change extension based on target format
            let original_name = Path::new(&image_path)
                .file_stem()
                .unwrap_or_default()
                .to_str()
                .unwrap_or_default();
            let output_file = output_dir.join(format!("{}.{}", original_name, convert_to));
            output_file
        }
        None => {
            // Use the same directory and replace the extension
            let dir = Path::new(&image_path)
                .parent()
                .unwrap_or_else(|| Path::new(""));
            let original_name = Path::new(&image_path)
                .file_stem()
                .unwrap_or_default()
                .to_str()
                .unwrap_or_default();
            let output_file = dir.join(format!("{}.{}", original_name, convert_to));
            output_file
        }
    };

    // Save the image in the desired format
    if let Err(e) = img.save_with_format(output_file_path.clone(), format) {
        return Err(format!("Failed to save image: {}", e));
    }

    // Return the path to the saved file
    Ok(output_file_path.to_str().unwrap_or_default().to_string())
}
