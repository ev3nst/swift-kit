use std::path::Path;
use std::{os::windows::process::CommandExt, process::Command};

pub async fn compress(input_path: &Path, quality: u8, output_path: &Path) -> Result<(), String> {
    let quality_argument = format!("{}-{}", quality, quality);
    let mut pngquant_command = Command::new("pngquant");
    pngquant_command
        .arg("--quality")
        .arg(&quality_argument)
        .arg("--output")
        .arg(output_path)
        .arg("--force")
        .arg(input_path);

    if cfg!(target_os = "windows") {
        pngquant_command.creation_flags(0x08000000);
    }

    let output = pngquant_command
        .output()
        .map_err(|e| format!("Failed to execute sidecar: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "pngquant failed with error:\n\
			Command: pngquant --quality {} --output {} --force {}\n\
			Stderr:\n{}\n\
			Stdout:\n{}",
            &quality_argument,
            output_path.display(),
            input_path.display(),
            String::from_utf8_lossy(&output.stderr),
            String::from_utf8_lossy(&output.stdout)
        ));
    }

    Ok(())
}
