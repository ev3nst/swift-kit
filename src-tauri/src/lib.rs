mod bulk_rename;
mod fetch_files;
mod finder;
mod get_available_disks;
mod get_video_details;
mod highlight_file;
mod image_compress;
mod image_convert;
mod image_resize;
mod img_compressors;
mod intro_outro_prediction;
mod migrations;
mod rename_files;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations("sqlite:swiftkit.db", migrations::get_migrations())
                .build(),
        )
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            fetch_files::fetch_files,
            bulk_rename::bulk_rename,
            rename_files::rename_files,
            image_convert::image_convert,
            image_compress::image_compress,
            image_resize::image_resize,
            get_video_details::get_video_details,
            intro_outro_prediction::intro_outro_prediction,
            get_available_disks::get_available_disks,
            finder::finder,
            highlight_file::highlight_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
