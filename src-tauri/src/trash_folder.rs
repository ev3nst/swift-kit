use std::path::Path;
use trash::delete;
use tauri::{AppHandle, Manager};
use tauri::path::BaseDirectory;

#[tauri::command(rename_all = "snake_case")]
pub async fn trash_folder(folder_path: String, handle: AppHandle) -> Result<String, String> {
    let allowed_folder = handle
        .path()
        .resolve("".to_string(), BaseDirectory::AppConfig)
        .map_err(|e| format!("Failed to resolve App Config directory: {}", e))?;

    let input_path = Path::new(&folder_path);
    if !input_path.exists() || !input_path.is_dir() {
        return Err("Invalid folder path".into());
    }

    if !input_path.starts_with(&allowed_folder) {
        return Err("Folder is outside the allowed directory".into());
    }

    delete(&input_path).map_err(|e| e.to_string())?;
    Ok("Delete complete.".to_string())
}
