use reqwest::Client;
use scraper::{Html, Selector};
use std::error::Error as StdError;

use super::fetch_tmdb_images::{fetch_tmdb_images, TMDBImageData};

pub async fn movie_poster(
    client: &Client,
    title: String,
    year: Option<u16>,
) -> Result<TMDBImageData, Box<dyn StdError + Send + Sync>> {
    let mut data = TMDBImageData {
        cover: None,
        poster: None,
    };
    let search_url = if let Some(year) = year {
        format!(
            "https://www.themoviedb.org/search?query={} y:{}",
            title, year
        )
    } else {
        format!("https://www.themoviedb.org/search?query={}", title)
    };

    let res = client.get(&search_url).send().await?;
    let body = res.text().await?;
    let document = Html::parse_document(&body);

    let selector = Selector::parse(".white_column a").unwrap();
    if let Some(first_item) = document.select(&selector).next() {
        let mut href = first_item.value().attr("href").unwrap_or("");
        let fallback_href = &format!("https://www.themoviedb.org{}", href);
        if !href.contains("themoviedb") {
            href = fallback_href;
        }

        data = fetch_tmdb_images(&client, href.to_string()).await.unwrap()
    }

    Ok(data)
}
