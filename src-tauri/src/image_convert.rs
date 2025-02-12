use image::{GenericImageView, ImageFormat};
use std::fs::File;
use std::path::Path;
use trash::delete;

#[tauri::command(rename_all = "snake_case")]
pub async fn image_convert(
    img_path: String,
    to: String,
    output_folder: Option<String>,
) -> Result<String, String> {
    let input_path = Path::new(&img_path);
    if !input_path.exists() || !input_path.is_file() {
        return Err("Invalid image path".into());
    }

    let output_format = match to.to_lowercase().as_str() {
        "png" => ImageFormat::Png,
        "jpg" | "jpeg" => ImageFormat::Jpeg,
        "webp" => ImageFormat::WebP,
        "ico" => ImageFormat::Ico,
        "bmp" => ImageFormat::Bmp,
        _ => return Err("Unsupported output format".into()),
    };

    let output_folder = if output_folder.as_deref().unwrap_or("").is_empty() {
        input_path
            .parent()
            .unwrap_or_else(|| Path::new("."))
            .to_string_lossy()
            .to_string()
    } else {
        output_folder.unwrap()
    };

    let output_path = Path::new(&output_folder).join(
        input_path
            .file_stem()
            .ok_or("Invalid file name")?
            .to_string_lossy()
            .to_string()
            + "."
            + to.to_lowercase().as_str(),
    );

    let mut img = image::open(&input_path).map_err(|e| e.to_string())?;
    let mut temp_file_path = None;

    if output_format == ImageFormat::Ico {
        if input_path
            .extension()
            .and_then(|s| s.to_str())
            .unwrap_or("")
            != "png"
        {
            img = img.to_rgba8().into();
        }
        let (width, height) = img.dimensions();
        if width != height {
            return Err("Image must be square for ICO format".into());
        }
        if width > 256 || height > 256 {
            temp_file_path = Some(input_path.with_file_name(format!(
                    "{}.tmp.{}",
                    input_path.file_stem().ok_or("Invalid file name")?.to_string_lossy(),
                    input_path.extension().and_then(|s| s.to_str()).unwrap_or("")
                )));
            img = img.resize_exact(256, 256, image::imageops::FilterType::Lanczos3);
            img.save(temp_file_path.as_ref().unwrap())
                .map_err(|e| e.to_string())?;
            img = image::open(temp_file_path.as_ref().unwrap()).map_err(|e| e.to_string())?;
        }
    }

    let mut output_file = File::create(&output_path).map_err(|e| e.to_string())?;
    img.write_to(&mut output_file, output_format)
        .map_err(|e| e.to_string())?;

    if let Some(temp_path) = temp_file_path {
        delete(&temp_path).map_err(|e| e.to_string())?;
    }

    Ok(output_path.to_string_lossy().to_string())
}
