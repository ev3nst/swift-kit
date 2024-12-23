mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::fetch_files::fetch_files,
            commands::rename_files::rename_files,
            commands::compress_image::compress_image,
            commands::convert_image::convert_image,
            commands::yt_url_data::yt_url_data,
            commands::download_yt_videos::download_yt_videos
        ])
        .setup(|_app| Ok(()))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
