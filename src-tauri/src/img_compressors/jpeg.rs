use std::fs;
use std::path::{Path, PathBuf};
use std::{os::windows::process::CommandExt, process::Command};

pub async fn compress(input_path: &Path, quality: u8, output_path: &Path) -> Result<(), String> {
    let is_overwriting = input_path.parent() == Some(output_path);

    // Handle overwriting case
    let temp_path: Option<PathBuf> = if is_overwriting {
        let temp_path = input_path.with_extension("temp");
        fs::copy(input_path, &temp_path)
            .map_err(|e| format!("Failed to copy file to temp: {}", e))?;
        Some(temp_path)
    } else {
        None
    };

    // If we are overwriting, use the temporary file for optimization
    let file_to_compress = temp_path.as_ref().map_or(input_path, |v| v);

    let mut jpegoptim_command = Command::new("jpegoptim");
    jpegoptim_command
        .creation_flags(0x08000000)
        .arg(format!("--max={}", quality))
        .arg("--dest")
        .arg(output_path.parent().unwrap_or(Path::new(".")))
        .arg("--overwrite")
        .arg(file_to_compress);

    let output = jpegoptim_command
        .output()
        .map_err(|e| format!("Failed to execute jpegoptim: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "jpegoptim failed with error:\n\
            Command: jpegoptim --max={} --dest {} {}\n\
            Stderr:\n{}\n\
            Stdout:\n{}",
            quality,
            output_path.parent().unwrap_or(Path::new(".")).display(),
            input_path.display(),
            String::from_utf8_lossy(&output.stderr),
            String::from_utf8_lossy(&output.stdout)
        ));
    }

    // Handle renaming the .temp file back to original if overwriting
    if let Some(temp_path) = temp_path {
        fs::rename(&temp_path, input_path)
            .map_err(|e| format!("Failed to rename temp file: {}", e))?;
    }

    Ok(())
}
