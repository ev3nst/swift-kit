use std::fs;
use std::path::Path;

#[tauri::command(rename_all = "snake_case")]
pub fn bulk_rename(
    folder_path: String,
    search: String,
    replace: String,
    extension_filter: Option<String>,
) -> Result<(), String> {
    let path = Path::new(&folder_path);
    if !path.exists() || !path.is_dir() {
        return Err("Invalid folder path".into());
    }

    for entry in fs::read_dir(path).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let metadata = entry.metadata().map_err(|e| e.to_string())?;
        if !metadata.is_file() {
            continue;
        }

        let filename = entry
            .file_name()
            .into_string()
            .map_err(|e| e.to_string_lossy().into_owned())?;
        if let Some(ref ext_filter) = extension_filter {
            if !filename.ends_with(ext_filter) {
                continue;
            }
        }

        if filename.contains(&search) {
            let new_filename = filename.replace(&search, &replace);
            let new_path = entry.path().with_file_name(new_filename);
            fs::rename(entry.path(), new_path).map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}