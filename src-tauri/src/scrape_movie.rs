use serde::{Deserialize, Serialize};
use tokio::{runtime::Runtime, task};

use super::scrapers::imdb;
use super::scrapers::tmdb_assets::tmdb_assets;
use super::utils::request_client::request_client;

#[derive(Debug, Serialize, Deserialize)]
pub struct MovieData {
    pub scraped_url: String,
    pub title: String,
    pub description: Option<String>,
    pub keywords: Option<String>,
    pub release_date: Option<String>,
    pub year: Option<u16>,
    pub duration: Option<String>,
    pub genre: Option<String>,
    pub actors: Option<String>,
    pub writers: Option<String>,
    pub directors: Option<String>,
    pub cover: Option<String>,
    pub imdb_rating: Option<f32>,
    pub country: Option<String>,
    pub language: Option<String>,
    pub other_images: Option<String>,
    pub trailer: Option<String>,
    pub poster: Option<String>,
}

#[tauri::command(rename_all = "snake_case")]
pub async fn scrape_movie(url: String) -> Result<MovieData, String> {
    task::spawn_blocking(move || {
        Runtime::new().unwrap().block_on(async move {
            let mut movie = MovieData {
                scraped_url: String::new(),
                title: String::new(),
                description: None,
                keywords: None,
                release_date: None,
                year: None,
                duration: None,
                genre: None,
                actors: None,
                writers: None,
                directors: None,
                cover: None,
                imdb_rating: None,
                country: None,
                language: None,
                other_images: None,
                trailer: None,
                poster: None,
            };

            let client = request_client().map_err(|e| e.to_string())?;

            let imdb_data = imdb::scrape(&client, &url)
                .await
                .map_err(|e| e.to_string())?;

            movie.cover = imdb_data.cover;
            let tmdb_data = tmdb_assets(
                &client,
                "movie".to_string(),
                imdb_data.title.clone(),
                imdb_data.year.clone(),
            )
            .await;
            if let Ok(data) = tmdb_data {
                if !data.cover.is_none() && data.cover != Some("".to_string()) {
                    movie.cover = data.cover;
                }

                if !data.poster.is_none() && data.poster != Some("".to_string()) {
                    movie.poster = data.poster;
                }

                if !data.trailer.is_none() && data.trailer != Some("".to_string()) {
                    movie.trailer = data.trailer;
                }
            }

            movie.scraped_url = url;
            movie.title = imdb_data.title;
            movie.description = imdb_data.description;
            movie.keywords = imdb_data.keywords;
            movie.release_date = imdb_data.release_date;
            movie.year = imdb_data.year;
            movie.duration = imdb_data.duration;
            movie.genre = imdb_data.genre;
            movie.actors = imdb_data.actors;
            movie.writers = imdb_data.writers;
            movie.directors = imdb_data.directors;
            movie.imdb_rating = imdb_data.imdb_rating;
            movie.country = imdb_data.country;
            movie.language = imdb_data.language;
            movie.other_images = imdb_data.other_images;

            Ok(movie)
        })
    })
    .await
    .unwrap()
}
