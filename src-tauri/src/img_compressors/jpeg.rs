use std::path::Path;
use tauri_plugin_shell::ShellExt;

pub async fn compress(
    input_path: &Path,
    quality: u8,
    output_path: &Path,
    handle: tauri::AppHandle,
) -> Result<(), String> {
    let jpegoptim_command = handle
        .shell()
        .sidecar("jpegoptim")
        .map_err(|e| format!("Failed to create jpegoptim sidecar: {}", e))?
        .arg(format!("--max={}", quality))
        .arg("--dest")
        .arg(output_path.parent().unwrap_or(Path::new(".")))
        .arg("--overwrite")
        .arg(input_path);

    // Run the command
    let output = jpegoptim_command
        .output()
        .await
        .map_err(|e| format!("Failed to execute sidecar: {}", e))?;

    // Check if the command failed
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
