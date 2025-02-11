use std::fs;
use std::path::Path;

#[derive(serde::Deserialize)]
pub struct RenameMapping {
    old: String,
    new: String,
}

#[tauri::command(rename_all = "snake_case")]
pub fn rename_files(
    folder_path: String,
    rename_mapping: Vec<RenameMapping>,
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

        if filename.starts_with('.') {
            continue;
        }

        if let Some(ref ext_filter) = extension_filter {
            if !filename.ends_with(ext_filter) {
                continue;
            }
        }

        for mapping in &rename_mapping {
            if filename == mapping.old {
                if mapping.new.is_empty() || mapping.new.contains('/') || mapping.new.contains('\\')
                {
                    return Err(format!("Invalid new filename: {}", mapping.new));
                }

                let new_path = entry.path().with_file_name(&mapping.new);
                fs::rename(entry.path(), new_path).map_err(|e| e.to_string())?;
                break;
            }
        }
    }

    Ok(())
}
