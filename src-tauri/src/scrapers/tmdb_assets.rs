use reqwest::Client;
use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};
use std::error::Error as StdError;

use crate::utils::common_headers::common_headers;

pub async fn tmdb_assets(
    client: &Client,
    content_type: String,
    title: String,
    year: Option<u16>,
) -> Result<TMDBAssetData, Box<dyn StdError + Send + Sync>> {
    let mut data = TMDBAssetData {
        cover: None,
        poster: None,
        trailer: None,
    };

    let search_url = if let Some(year) = year {
        format!(
            "https://www.themoviedb.org/search/{}?query={} y:{}",
            content_type, title, year
        )
    } else {
        format!(
            "https://www.themoviedb.org/search/{}?query={}",
            content_type, title
        )
    };

    let res = client
        .get(&search_url)
        .headers(common_headers())
        .send()
        .await?;
    let body = res.text().await?;
    let document = Html::parse_document(&body);

    let selector = Selector::parse(".white_column a").unwrap();
    if let Some(first_item) = document.select(&selector).next() {
        let mut href = first_item.value().attr("href").unwrap_or("");
        let fallback_href = &format!("https://www.themoviedb.org{}", href);
        if !href.contains("themoviedb") {
            href = fallback_href;
        }

        data = fetch_tmdb_assets(&client, href.to_string()).await.unwrap()
    }

    Ok(data)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TMDBAssetData {
    pub cover: Option<String>,
    pub poster: Option<String>,
    pub trailer: Option<String>,
}

pub async fn fetch_tmdb_assets(
    client: &Client,
    poster_href: String,
) -> Result<TMDBAssetData, Box<dyn StdError + Send + Sync>> {
    let mut data = TMDBAssetData {
        cover: None,
        poster: None,
        trailer: None,
    };
    let res = client
        .get(&poster_href)
        .headers(common_headers())
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

    let selector = Selector::parse("a[data-title='Play Trailer']").unwrap();
    if let Some(video_element) = document.select(&selector).next() {
        if let Some(src) = video_element.attr("data-id") {
            let yt_embed_id = src.to_string();
            data.trailer = Some(format!("https://www.youtube.com/embed/{}", yt_embed_id));
        }
    }

    Ok(data)
}

fn get_original_image_sizes(poster: Option<String>) -> Option<String> {
    match poster {
        Some(url) => Some(url.replace("/w780/", "/original/")),
        None => None,
    }
}
