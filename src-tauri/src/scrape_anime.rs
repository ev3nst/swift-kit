use serde::{Deserialize, Serialize};
use tokio::{runtime::Runtime, task};

use super::scrapers::mal;
use super::scrapers::tmdb_assets::tmdb_assets;
use super::utils::request_client::request_client;

#[derive(Debug, Serialize, Deserialize)]
pub struct AnimeData {
    pub scraped_url: String,
    pub original_title: String,
    pub title: String,
    pub description: Option<String>,
    pub genre: Option<String>,
    pub year: Option<u16>,
    pub episodes: Option<u16>,
    pub cover: Option<String>,
    pub poster: Option<String>,
    pub duration: Option<String>,
    pub studios: Option<String>,
    pub mal_rating: Option<f32>,
    pub trailer: Option<String>,
}

#[tauri::command(rename_all = "snake_case")]
pub async fn scrape_anime(url: String) -> Result<AnimeData, String> {
    task::spawn_blocking(move || {
        Runtime::new().unwrap().block_on(async move {
            let mut anime = AnimeData {
                scraped_url: String::new(),
                original_title: String::new(),
                title: String::new(),
                description: None,
                genre: None,
                year: None,
                episodes: None,
                cover: None,
                poster: None,
                duration: None,
                studios: None,
                mal_rating: None,
                trailer: None,
            };

            let client = request_client().map_err(|e| e.to_string())?;

            let mal_data = mal::scrape(&client, &url)
                .await
                .map_err(|e| e.to_string())?;
            anime.cover = mal_data.cover;

            let tmdb_data = tmdb_assets(
                &client,
                "tv".to_string(),
                mal_data.title.clone(),
                mal_data.year.clone(),
            )
            .await;
            if let Ok(data) = tmdb_data {
                if !data.cover.is_none() && data.cover != Some("".to_string()) {
                    anime.cover = data.cover;
                }

                if !data.poster.is_none() && data.poster != Some("".to_string()) {
                    anime.poster = data.poster;
                }
            }

            anime.scraped_url = url;
            anime.title = mal_data.title;
            anime.original_title = mal_data.original_title;
            anime.description = mal_data.description;
            anime.genre = mal_data.genre;
            anime.year = mal_data.year;
            anime.episodes = mal_data.episodes;
            anime.duration = mal_data.duration;
            anime.studios = mal_data.studios;
            anime.mal_rating = mal_data.mal_rating;
            anime.trailer = mal_data.trailer;

            Ok(anime)
        })
    })
    .await
    .unwrap()
}
