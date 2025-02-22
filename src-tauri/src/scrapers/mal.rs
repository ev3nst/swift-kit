use reqwest::Client;
use scraper::{ElementRef, Html, Selector};
use std::error::Error;

use crate::utils::common_headers::common_headers;

#[derive(Debug)]
pub struct MALData {
    pub original_title: String,
    pub title: String,
    pub description: Option<String>,
    pub genre: Option<String>,
    pub year: Option<u16>,
    pub episodes: Option<u16>,
    pub cover: Option<String>,
    pub duration: Option<String>,
    pub studios: Option<String>,
    pub mal_rating: Option<f32>,
    pub trailer: Option<String>,
}

pub async fn scrape(client: &Client, url: &str) -> Result<MALData, Box<dyn Error>> {
    let res = client.get(url).headers(common_headers()).send().await?;
    let body = res.text().await?;
    let document = Html::parse_document(&body);

    let description = document
        .select(&Selector::parse(".js-scrollfix-bottom-rel [itemprop='description']").unwrap())
        .next()
        .map(|el| el.text().collect::<String>());

    let cover = document
        .select(&Selector::parse("img[itemprop='image']").unwrap())
        .next()
        .and_then(|el| el.value().attr("data-src").map(|s| s.to_string()))
        .unwrap_or_default()
        .replace(".jpg", "l.jpg");

    let title =
        get_from_border(&document, "English:").unwrap_or_else(|| "Unknown Title".to_string());

    let original_title = document
        .select(&Selector::parse(".title-name").unwrap())
        .next()
        .map(|el| el.text().collect::<String>())
        .unwrap_or_default()
        .replace("[Written by MAL Rewrite]", "");

    let episodes: Option<u16> =
        get_from_border(&document, "Episodes:").and_then(|s| s.parse().ok());
    let year: Option<u16> = get_from_border(&document, "Premiered:")
        .and_then(|s| s.split_whitespace().last()?.parse().ok());

    let studios = Some(
        get_from_border(&document, "Studios:").unwrap_or_else(|| "Unknown Studio".to_string()),
    );
    let duration = get_from_border(&document, "Duration:");
    let genre = Some(
        get_from_border(&document, "Genres:")
            .unwrap_or_else(|| get_from_border(&document, "Genre:").unwrap_or_default())
            .replace(" , ", ", "),
    );

    let trailer_raw = document
        .select(&Selector::parse("a.iframe.js-fancybox-video.video-unit.promotion").unwrap())
        .next()
        .and_then(|el| el.value().attr("href").map(|s| s.to_string()));
    let trailer: Option<String> = trailer_raw
        .as_ref()
        .and_then(|url| url.split('?').next().map(|s| s.to_string()));

    let mal_rating: Option<f32> = get_from_border(&document, "Score:")
        .map(|s| s.split_whitespace().next().unwrap_or_default().to_string())
        .and_then(|s| s.parse().ok());

    Ok(MALData {
        title,
        original_title,
        description,
        cover: Some(cover),
        episodes,
        studios,
        duration,
        genre,
        mal_rating,
        year,
        trailer,
    })
}

fn get_from_border(document: &Html, label: &str) -> Option<String> {
    let selector = Selector::parse("div.spaceit_pad").unwrap();
    let div = document
        .select(&selector)
        .find(|div| div.text().any(|t| t.contains(label)))?;

    let mut visible_texts = Vec::new();

    for node in div.descendants() {
        if let Some(text) = node.value().as_text() {
            let mut hidden = false;
            let mut current = node;
            while let Some(parent) = current.parent() {
                if let Some(element) = ElementRef::wrap(parent) {
                    if let Some(style) = element.value().attr("style") {
                        if style.contains("display: none") {
                            hidden = true;
                            break;
                        }
                    }
                }
                current = parent;
            }
            if !hidden {
                let trimmed = text.trim();
                if !trimmed.is_empty() {
                    visible_texts.push(trimmed);
                }
            }
        }
    }

    let combined = visible_texts.join(" ");
    let result = combined.replace(label, "").trim().to_string();
    if result.is_empty() {
        None
    } else {
        Some(result)
    }
}
