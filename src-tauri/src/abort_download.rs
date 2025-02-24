use std::sync::{Arc, Mutex};
use tauri::State;

use crate::download_file::DownloadState;

#[tauri::command(rename_all = "snake_case")]
pub async fn abort_download(state: State<'_, Arc<Mutex<DownloadState>>>) -> Result<(), String> {
    let mut download_state = state.lock().map_err(|e| e.to_string())?;
    download_state.abort = true;
    Ok(())
}
