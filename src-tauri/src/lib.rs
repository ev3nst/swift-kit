use std::sync::{Arc, Mutex};

mod abort_download;
mod always_on_top;
mod bulk_rename;
mod convert_to_mp4;
mod download_file;
mod fetch_files;
mod finder;
mod generate_video_thumbnails;
mod get_available_disks;
mod get_video_details;
mod highlight_file;
mod image_compress;
mod image_convert;
mod image_crop;
mod image_resize;
mod img_compressors;
mod interpolate;
mod intro_outro_prediction;
mod migrations;
mod no_intro_outro;
mod open_external_url;
mod rename_files;
mod scrape_anime;
mod scrape_game;
mod scrape_movie;
mod scrapers;
mod search_anime;
mod search_game;
mod search_movie;
mod trash_folder;
mod utils;
mod yt_download;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_window_state = Arc::new(Mutex::new(always_on_top::AppWindowState {
        is_pinned: false,
    }));
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
        .manage(app_window_state.clone())
        .manage(Arc::new(generate_video_thumbnails::FfmpegState {
            process: Mutex::new(None),
            output_folder: Mutex::new(None),
        }))
        .manage(Arc::new(
            Mutex::new(download_file::DownloadState::default()),
        ))
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
            highlight_file::highlight_file,
            always_on_top::always_on_top,
            generate_video_thumbnails::generate_video_thumbnails,
            generate_video_thumbnails::stop_video_thumbnail_generation,
            trash_folder::trash_folder,
            no_intro_outro::no_intro_outro,
            interpolate::interpolate,
            convert_to_mp4::convert_to_mp4,
            search_movie::search_movie,
            scrape_movie::scrape_movie,
            search_anime::search_anime,
            scrape_anime::scrape_anime,
            scrape_game::scrape_game,
            search_game::search_game,
            open_external_url::open_external_url,
            image_crop::image_crop,
            download_file::download_file,
            abort_download::abort_download,
            yt_download::yt_download,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
