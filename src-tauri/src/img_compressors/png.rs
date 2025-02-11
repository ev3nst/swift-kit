use std::path::Path;
use tauri_plugin_shell::ShellExt;

pub async fn compress(
    input_path: &Path,
    quality: u8,
    output_path: &Path,
    handle: tauri::AppHandle,
) -> Result<(), String> {
    let quality_argument = format!("{}-{}", quality, quality);
    let pngquant_command = handle
        .shell()
        .sidecar("pngquant")
        .map_err(|e| format!("Failed to create pngquant sidecar: {}", e))?
        .arg("--quality")
        .arg(&quality_argument)
        .arg("--output")
        .arg(output_path)
        .arg("--force")
        .arg(input_path);

    // Run the command
    let output = pngquant_command
        .output()
        .await
        .map_err(|e| format!("Failed to execute sidecar: {}", e))?;

    // Check if the command failed
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
