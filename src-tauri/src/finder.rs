use std::path::Path;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Listener};
use walkdir::WalkDir;

use super::get_available_disks::get_available_disks;

#[tauri::command(rename_all = "snake_case")]
pub async fn finder(
    handle: AppHandle,
    search_term: String,
    disk: Option<String>,
) -> Result<(), String> {
    if search_term.len() < 3 {
        return Err("Search term must be at least 3 characters long".to_string());
    }

    let available_disks = get_available_disks()
        .await
        .map_err(|e| format!("Failed to get available disks: {}", e))?;

    let search_path = match disk {
        Some(ref d) if d == "*" => available_disks
            .iter()
            .map(|d| Path::new(d))
            .collect::<Vec<_>>(),
        Some(ref d) => {
            if available_disks.contains(d) {
                vec![Path::new(d)]
            } else {
                return Err(format!(
                    "Invalid disk: {}. Available disks: {:?}",
                    d, available_disks
                ));
            }
        }
        None => available_disks
            .iter()
            .map(|d| Path::new(d))
            .collect::<Vec<_>>(),
    };

    let should_cancel = Arc::new(AtomicBool::new(false));
    let should_cancel_clone = should_cancel.clone();

    handle.once("cancel_search", move |_| {
        should_cancel_clone.store(true, Ordering::SeqCst);
    });

    for disk_path in &search_path {
        if should_cancel.load(Ordering::SeqCst) {
            break;
        }

        let walker = WalkDir::new(disk_path)
            .follow_links(false)
            .into_iter()
            .filter_map(Result::ok)
            .filter(|entry| entry.file_type().is_file());

        for entry in walker {
            if should_cancel.load(Ordering::SeqCst) {
                break;
            }

            if entry.file_name().to_string_lossy().contains(&search_term) {
                let path = entry.path().to_string_lossy().into_owned();
                handle
                    .emit("search-result", path)
                    .map_err(|e| format!("Failed to emit result: {}", e))?;
            }
        }
    }

    Ok(())
}
