use image::{GenericImageView, ImageFormat};
use std::fs::File;
use std::path::Path;

#[tauri::command(rename_all = "snake_case")]
pub async fn image_resize(
    img_path: String,
    width: Option<String>,
    height: Option<String>,
    output_folder: Option<String>,
    file_name: Option<String>,
) -> Result<String, String> {
    let input_path = Path::new(&img_path);
    if !input_path.exists() || !input_path.is_file() {
        return Err("Invalid image path".into());
    }

    let width = width
        .filter(|w| !w.is_empty() && w != "0")
        .map(|w| w.parse::<u32>());
    let height = height
        .filter(|h| !h.is_empty() && h != "0")
        .map(|h| h.parse::<u32>());

    if width.is_none() && height.is_none() {
        return Err("At least one of width or height must be provided".into());
    }

    let img = image::open(&input_path).map_err(|e| e.to_string())?;
    let (orig_width, orig_height) = img.dimensions();

    let (new_width, new_height) = match (width, height) {
        (Some(Ok(w)), Some(Ok(h))) => (w, h),
        (Some(Ok(w)), None) => (
            w,
            ((orig_height as f64 * w as f64) / orig_width as f64).round() as u32,
        ),
        (None, Some(Ok(h))) => (
            ((orig_width as f64 * h as f64) / orig_height as f64).round() as u32,
            h,
        ),
        (Some(Err(_)), _) | (_, Some(Err(_))) => return Err("Invalid width or height".into()),
        _ => return Err("Invalid width or height".into()),
    };

    let resized_img =
        img.resize_exact(new_width, new_height, image::imageops::FilterType::Lanczos3);

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
            .unwrap_or("")
    ));

    let mut output_file = File::create(&output_path).map_err(|e| e.to_string())?;
    resized_img
        .write_to(
            &mut output_file,
            ImageFormat::from_path(&output_path).map_err(|e| e.to_string())?,
        )
        .map_err(|e| e.to_string())?;

    Ok(output_path.to_string_lossy().to_string())
}
