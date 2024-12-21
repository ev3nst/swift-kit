use std::fs;
use std::path::Path;

#[tauri::command(rename_all = "snake_case")]
pub fn fetch_files(folder_path: String) -> Result<Vec<String>, String> {
    // Check if the path exists and is a directory
    let path = Path::new(&folder_path);
    if !path.exists() {
        return Err("The provided folder path does not exist.".to_string());
    }
    if !path.is_dir() {
        return Err("The provided path is not a directory.".to_string());
    }

    // Read the directory and collect file names
    let mut files = Vec::new();
    match fs::read_dir(path) {
        Ok(entries) => {
            for entry in entries {
                if let Ok(entry) = entry {
                    if let Ok(file_name) = entry.file_name().into_string() {
                        files.push(file_name);
                    }
                }
            }
        }
        Err(err) => return Err(format!("Failed to read the directory: {}", err)),
    }

    Ok(files)
}
