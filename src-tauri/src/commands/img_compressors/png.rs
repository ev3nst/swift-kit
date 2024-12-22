use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use tauri::path::BaseDirectory;
use tauri::Manager;
use trash::delete;

pub fn compress(
    image_path: &str,
    output_path: Option<String>,
    quality: Option<u8>,
    handle: tauri::AppHandle,
) -> Result<(), String> {
    let pngquant_path = handle
        .path()
        .resolve("binaries/pngquant.exe", BaseDirectory::Resource)
        .map_err(|e| format!("Failed to resolve path to pngquant: {}", e))?;

    let quality_range = quality.unwrap_or(80);
    let quality_argument = format!("{}-{}", quality_range, quality_range);

    let final_output_path = match output_path {
        Some(ref path) if !path.is_empty() => {
            let output_dir = Path::new(path);
            if output_dir.is_dir() {
                let image_name = Path::new(image_path).file_name().unwrap_or_default();
                output_dir.join(image_name)
            } else {
                PathBuf::from(path)
            }
        }
        _ => {
            let mut path = Path::new(image_path).to_path_buf();
            let file_stem = path
                .file_stem()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string();
            path.set_file_name(format!("{}_compressed.png", file_stem));
            path
        }
    };

    if final_output_path.exists() {
        if let Err(e) = delete(&final_output_path) {
            return Err(format!("Failed to move existing file to trash: {}", e));
        }
    }

    let pngquant_input = PathBuf::from(image_path);
    let status = Command::new(pngquant_path)
        .arg("--quality")
        .arg(quality_argument)
        .arg("--output")
        .arg(&final_output_path)
        .arg(pngquant_input)
        .stderr(Stdio::inherit())
        .stdout(Stdio::inherit())
        .output();

    match status {
        Ok(output) if output.status.success() => Ok(()),
        Ok(output) => Err(format!(
            "Pngquant failed: {}",
            String::from_utf8_lossy(&output.stderr)
        )),
        Err(e) => Err(format!("Failed to run pngquant: {}", e)),
    }
}
