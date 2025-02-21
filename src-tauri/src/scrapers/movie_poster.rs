use reqwest::Client;
use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};
use std::error::Error as StdError;
use tokio::task;

#[derive(Debug, Serialize, Deserialize)]
pub struct MoviePosterData {
    pub image_link: Option<String>,
}

pub async fn movie_poster(
    client: &Client,
    title: String,
    year: u16,
) -> Result<MoviePosterData, Box<dyn StdError + Send + Sync>> {
    let mut data = MoviePosterData { image_link: None };
    let search_url = format!(
        "https://www.themoviedb.org/search?query={} y:{}",
        title, year
    );

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

        let poster_href = format!("{}/images/backdrops", href);
        let poster_task = task::spawn(fetch_poster_image(client.clone(), poster_href));
        if let Some(image_link) = poster_task.await?? {
            data.image_link = Some(image_link);
        }
    }

    Ok(data)
}

async fn fetch_poster_image(
    client: Client,
    poster_href: String,
) -> Result<Option<String>, Box<dyn StdError + Send + Sync>> {
    let res = client.get(&poster_href).send().await?;
    let body = res.text().await?;
    let document = Html::parse_document(&body);

    let img_selector = Selector::parse(".image_content a").unwrap();
    if let Some(image_link) = document.select(&img_selector).next() {
        Ok(Some(
            image_link.value().attr("href").unwrap_or("").to_string(),
        ))
    } else {
        Ok(None)
    }
}
