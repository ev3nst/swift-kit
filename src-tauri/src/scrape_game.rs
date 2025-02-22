use serde::{Deserialize, Serialize};
use tokio::{runtime::Runtime, task};

use super::scrapers::steam;
use super::utils::request_client::request_client;

#[derive(Debug, Serialize, Deserialize)]
pub struct GameData {
    pub scraped_url: String,
    pub title: String,
    pub genre: Option<String>,
    pub description: Option<String>,
    pub about: Option<String>,
    pub release_date: Option<String>,
    pub year: Option<u16>,
    pub developers: Option<String>,
    pub publishers: Option<String>,
    pub cover: Option<String>,
    pub poster: Option<String>,
    pub trailer: Option<String>,
    pub other_images: Option<String>,
}

#[tauri::command(rename_all = "snake_case")]
pub async fn scrape_game(url: String) -> Result<GameData, String> {
    task::spawn_blocking(move || {
        Runtime::new().unwrap().block_on(async move {
            let mut game = GameData {
                scraped_url: String::new(),
                title: String::new(),
                description: None,
                about: None,
                release_date: None,
                year: None,
                genre: None,
                developers: None,
                publishers: None,
                cover: None,
                poster: None,
                trailer: None,
                other_images: None,
            };

            let client = request_client().map_err(|e| e.to_string())?;

            let steam_data = steam::scrape(&client, &url)
                .await
                .map_err(|e| e.to_string())?;

            game.scraped_url = url;
            game.title = steam_data.title;
            game.genre = steam_data.genre;
            game.description = steam_data.description;
            game.about = steam_data.about;
            game.release_date = steam_data.release_date;
            game.year = steam_data.year;
            game.developers = steam_data.developers;
            game.publishers = steam_data.publishers;
            game.cover = steam_data.cover;
            game.poster = steam_data.poster;
            game.trailer = steam_data.trailer;
            game.other_images = steam_data.other_images;

            Ok(game)
        })
    })
    .await
    .unwrap()
}
