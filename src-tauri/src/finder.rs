use rayon::prelude::*;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

use super::get_available_disks::get_linux_mounts;
use super::get_available_disks::get_windows_drives;

#[tauri::command(rename_all = "snake_case")]
pub async fn finder(search_term: String, disk: Option<String>) -> Result<Vec<String>, String> {
    if search_term.len() < 3 {
        return Err("Search term must be at least 3 characters long".to_string());
    }

    let available_disks = if cfg!(target_os = "windows") {
        get_windows_drives().map_err(|e| format!("Failed to get available disks: {}", e))?
    } else if cfg!(target_os = "linux") {
        get_linux_mounts().map_err(|e| format!("Failed to get available disks: {}", e))?
    } else {
        return Err("Unsupported OS".to_string());
    };

    // Determine the search path based on user input or default to all disks
    let search_path = match disk {
        Some(ref d) if d == "*" => available_disks
            .iter()
            .map(|d| Path::new(d))
            .collect::<Vec<_>>(),
        Some(ref d) => {
            // Validate that the disk exists in the list of available disks
            if available_disks.contains(d) {
                vec![Path::new(d)]
            } else {
                return Err(format!(
                    "Invalid disk: {}. Available disks: {:?}",
                    d, available_disks
                ));
            }
        }
        None => {
            // If no disk is specified, search all available disks
            available_disks
                .iter()
                .map(|d| Path::new(d))
                .collect::<Vec<_>>()
        }
    };

    // Perform the search on each disk
    let mut results = Vec::new();
    for disk_path in search_path {
        let walker = WalkDir::new(disk_path)
            .into_iter()
            .filter_map(Result::ok)
            .filter(|entry| entry.file_type().is_file())
            .collect::<Vec<_>>();

        let found_paths: Vec<PathBuf> = walker
            .par_iter()
            .filter(|entry| entry.file_name().to_string_lossy().contains(&search_term))
            .map(|entry| entry.path().to_path_buf())
            .collect();

        results.extend(
            found_paths
                .into_iter()
                .map(|p| p.to_string_lossy().into_owned()),
        );
    }

    Ok(results)
}
