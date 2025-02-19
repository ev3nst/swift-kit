use std::path::Path;
use std::{os::windows::process::CommandExt, process::Command};

pub async fn compress(input_path: &Path, quality: u8, output_path: &Path) -> Result<(), String> {
    let mut cwebp_command = Command::new("cwebp");
    cwebp_command
        .arg(input_path)
        .arg("-o")
        .arg(&output_path)
        .arg("-q")
        .arg(quality.to_string());

    if cfg!(target_os = "windows") {
        cwebp_command.creation_flags(0x08000000);
    }

    let output = cwebp_command
        .output()
        .map_err(|e| format!("Failed to execute sidecar: {}", e))?;

    // Check if command failed
    if !output.status.success() {
        return Err(format!(
            "cwebp failed with error:\n\
			Command: cwebp -q {} -o {} -overwrite {}\n\
			Stderr:\n{}\n\
			Stdout:\n{}",
            quality,
            output_path.display(),
            input_path.display(),
            String::from_utf8_lossy(&output.stderr),
            String::from_utf8_lossy(&output.stdout)
        ));
    }

    Ok(())
}
