use reqwest::Client;
use serde::{Deserialize, Serialize};
use tokio::{runtime::Runtime, task};

use super::scrapers::anime_images;
use super::scrapers::mal;

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
    pub personal_rating: Option<f32>,
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
                personal_rating: None,
                trailer: None,
            };

			let client = Client::builder()
				.user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
				.build()
				.map_err(|e| e.to_string())?;
		
            let mal_data = mal::scrape(&client, &url)
                .await
                .map_err(|e| e.to_string())?;
            anime.cover = mal_data.cover;

            let tmdb_data =
                anime_images::anime_images(&client, mal_data.title.clone(), mal_data.year.clone())
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
