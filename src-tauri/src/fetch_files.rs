use serde::Serialize;
use std::fs;
use std::path::Path;

#[derive(Serialize)]
pub struct FileMeta {
    filename: String,
    size: u64,
    birthtime: String,
    mtime: String,
    atime: String,
}

#[tauri::command(rename_all = "snake_case")]
pub fn fetch_files(
    folder_path: String,
    extension_filter: Option<String>,
) -> Result<Vec<FileMeta>, String> {
    let path = Path::new(&folder_path);
    if !path.exists() || !path.is_dir() {
        return Err("Invalid folder path".into());
    }

    let mut files = Vec::new();
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

        let created_metadata = metadata.created();
        let modified_metadata = metadata.modified();
        let accessed_metadata = metadata.accessed();
        let birthtime = match created_metadata {
            Ok(time) => format!("{:?}", time),
            Err(e) => format!("Error: {}", e),
        };
        let mtime = match modified_metadata {
            Ok(time) => format!("{:?}", time),
            Err(e) => format!("Error: {}", e),
        };
        let atime = match accessed_metadata {
            Ok(time) => format!("{:?}", time),
            Err(e) => format!("Error: {}", e),
        };

        files.push(FileMeta {
            filename,
            size: metadata.len(),
            birthtime,
            mtime,
            atime,
        });
    }

    Ok(files)
}
