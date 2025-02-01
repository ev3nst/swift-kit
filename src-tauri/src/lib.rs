use tauri_plugin_shell::ShellExt;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
async fn ping(app: tauri::AppHandle, message: String) -> String {
    let sidecar_command = app.shell().sidecar("swift-kit-bun-sidecar").unwrap().arg("ping").arg(message);
    let output = sidecar_command.output().await.unwrap();
    let response = String::from_utf8(output.stdout).unwrap();
    response
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![ping])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
