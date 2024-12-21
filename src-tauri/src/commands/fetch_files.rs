use std::fs;
use std::path::{Path, PathBuf};

#[tauri::command(rename_all = "snake_case")]
pub fn fetch_files(
    folder_path: String,
    extension_filter: Option<String>,
) -> Result<Vec<String>, String> {
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
                    let file_name = entry.file_name();
                    if let Some(file_str) = file_name.to_str() {
                        // Check if extension filter is provided
                        if let Some(ext_filter) = &extension_filter {
                            // Only add file if it ends with the provided extension
                            if file_str.ends_with(&format!(".{}", ext_filter)) {
                                files.push(file_str.to_string());
                            }
                        } else {
                            // If no filter, just add the file name
                            files.push(file_str.to_string());
                        }
                    }
                }
            }
        }
        Err(err) => return Err(format!("Failed to read the directory: {}", err)),
    }

    Ok(files)
}
