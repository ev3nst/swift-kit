use image::ImageFormat;
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct CropDetails {
    height: u32,
    width: u32,
    x: f32,
    y: f32,
}

#[tauri::command(rename_all = "snake_case")]
pub async fn image_crop(
    img_path: String,
    crop_details: CropDetails,
    output_folder: Option<String>,
    file_name: Option<String>,
) -> Result<String, String> {
    let input_path = Path::new(&img_path);
    if !input_path.exists() || !input_path.is_file() {
        return Err("Invalid image path".into());
    }

    let img = image::open(&input_path).map_err(|e| e.to_string())?;

    // Ensure crop dimensions do not exceed image dimensions
    if crop_details.x + crop_details.width as f32 > img.width() as f32
        || crop_details.y + crop_details.height as f32 > img.height() as f32
    {
        return Err("Crop dimensions exceed image dimensions".into());
    }

    // Perform cropping
    let cropped_img = img.crop_imm(
        crop_details.x as u32,
        crop_details.y as u32,
        crop_details.width,
        crop_details.height,
    );

    let output_folder = if output_folder.as_deref().unwrap_or("").is_empty() {
        input_path
            .parent()
            .unwrap_or_else(|| Path::new("."))
            .to_string_lossy()
            .to_string()
    } else {
        output_folder.unwrap()
    };

    let invalid_chars = ['<', '>', ':', '"', '/', '\\', '|', '?', '*'];
    if let Some(ref name) = file_name {
        if name.is_empty() || name.chars().any(|c| invalid_chars.contains(&c)) {
            return Err("Invalid file name".into());
        }
    }

    let output_file_name = file_name
        .filter(|name| !name.is_empty())
        .unwrap_or_else(|| {
            input_path
                .file_stem()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string()
        });

    let output_path = Path::new(&output_folder).join(format!(
        "{}.{}",
        output_file_name,
        input_path
            .extension()
            .and_then(|s| s.to_str())
            .unwrap_or("png")
    ));

    let mut output_file = File::create(&output_path).map_err(|e| e.to_string())?;
    cropped_img
        .write_to(
            &mut output_file,
            ImageFormat::from_path(&output_path).map_err(|e| e.to_string())?,
        )
        .map_err(|e| e.to_string())?;

    Ok(output_path.to_string_lossy().to_string())
}
