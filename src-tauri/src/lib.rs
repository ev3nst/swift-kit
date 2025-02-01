use tauri_plugin_shell::ShellExt;
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
async fn bunsidecar(
    app: tauri::AppHandle,
    command: String,
    args: Vec<String>,
) -> Result<String, String> {
    // Create the sidecar command
    let mut sidecar_command = app
        .shell()
        .sidecar("swift-kit-bun-sidecar")
        .map_err(|e| format!("Failed to create sidecar: {}", e))?
        .arg(command);

    for arg in args {
        sidecar_command = sidecar_command.arg(arg);
    }

    // Run the command
    let output = sidecar_command.output().await
        .map_err(|e| format!("Failed to execute sidecar: {}", e))?;

    // Check if command failed
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Sidecar error: {}", stderr));
    }

    // Convert stdout to string
    String::from_utf8(output.stdout)
        .map_err(|e| format!("Invalid UTF-8 output: {}", e))
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![bunsidecar])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
