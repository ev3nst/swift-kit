use std::path::Path;
use tauri_plugin_shell::ShellExt;

pub async fn compress(
    input_path: &Path,
    quality: u8,
    output_path: &Path,
    handle: tauri::AppHandle,
) -> Result<(), String> {
    let cwebp_command = handle
        .shell()
        .sidecar("cwebp")
        .map_err(|e| format!("Failed to create cwebp sidecar: {}", e))?
        .arg(input_path)
        .arg("-o")
        .arg(&output_path)
        .arg("-q")
        .arg(quality.to_string());

    // Run the command
    let output = cwebp_command
        .output()
        .await
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
