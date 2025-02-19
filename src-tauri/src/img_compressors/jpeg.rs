use std::path::Path;
use std::{os::windows::process::CommandExt, process::Command};

pub async fn compress(input_path: &Path, quality: u8, output_path: &Path) -> Result<(), String> {
    let mut jpegoptim_command = Command::new("jpegoptim");
    jpegoptim_command
        .arg(format!("--max={}", quality))
        .arg("--dest")
        .arg(output_path.parent().unwrap_or(Path::new(".")))
        .arg("--overwrite")
        .arg(input_path);

    if cfg!(target_os = "windows") {
        jpegoptim_command.creation_flags(0x08000000);
    }

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

    Ok(())
}
