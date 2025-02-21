use reqwest::Client;
use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};
use std::error::Error as StdError;

#[derive(Debug, Serialize, Deserialize)]
pub struct TMDBImageData {
    pub cover: Option<String>,
    pub poster: Option<String>,
}

pub async fn fetch_tmdb_images(
    client: &Client,
    poster_href: String,
) -> Result<TMDBImageData, Box<dyn StdError + Send + Sync>> {
    let mut data = TMDBImageData {
        cover: None,
        poster: None,
    };
    let res = client
        .get(&poster_href)
        .header(
            "Accept",
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        )
        .header("Accept-Language", "en-US,en;q=0.5")
        .header("Connection", "keep-alive")
        .send()
        .await?;
    let body = res.text().await?;
    let document = Html::parse_document(&body);

    let selector = Selector::parse("meta[property='og:image']").unwrap();
    let mut images = vec![];
    for element in document.select(&selector) {
        images.push(element.value().attr("content").unwrap_or(""));
    }

    data.cover = Some(images.get(1).cloned().unwrap_or_default().to_string());
    data.cover = get_original_image_sizes(data.cover);
    data.poster = Some(images.get(1).cloned().unwrap_or_default().to_string());
    data.poster = get_original_image_sizes(data.poster);
    Ok(data)
}

fn get_original_image_sizes(poster: Option<String>) -> Option<String> {
    match poster {
        Some(url) => Some(url.replace("/w780/", "/original/")),
        None => None,
    }
}
