use reqwest::Client;
use scraper::{Html, Selector};
use serde::{Deserialize, Deserializer, Serialize};
use std::error::Error;

use crate::utils::{common_headers::common_headers, decode_html_entities::decode_html_entities};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IMDBData {
    #[serde(rename = "name")]
    pub title: String,

    #[serde(rename = "description")]
    pub description: Option<String>,

    #[serde(rename = "keywords")]
    pub keywords: Option<String>,

    #[serde(rename = "datePublished")]
    pub release_date: Option<String>,
    pub year: Option<u16>,

    #[serde(rename = "duration", deserialize_with = "deserialize_duration")]
    pub duration: Option<String>,

    #[serde(rename = "genre", deserialize_with = "deserialize_genre")]
    pub genre: Option<String>,

    #[serde(rename = "actor", deserialize_with = "deserialize_persons")]
    pub actors: Option<String>,

    #[serde(rename = "creator", deserialize_with = "deserialize_persons")]
    pub writers: Option<String>,

    #[serde(rename = "director", deserialize_with = "deserialize_persons")]
    pub directors: Option<String>,

    #[serde(rename = "image")]
    pub cover: Option<String>,

    #[serde(
        rename = "aggregateRating",
        deserialize_with = "deserialize_imdb_rating"
    )]
    pub imdb_rating: Option<f32>,
    pub country: Option<String>,
    pub language: Option<String>,
    pub other_images: Option<String>,
}

pub async fn scrape(client: &Client, url: &str) -> Result<IMDBData, Box<dyn Error>> {
    let res = client.get(url).headers(common_headers()).send().await?;
    let body = res.text().await?;
    let document = Html::parse_document(&body);
    let selector = Selector::parse("script[type='application/ld+json']").unwrap();
    let json_data = document
        .select(&selector)
        .next()
        .ok_or("No ld+json script found")?
        .text()
        .collect::<Vec<_>>()
        .join("");
    let mut imdb_data = match serde_json::from_str::<IMDBData>(&json_data) {
        Ok(data) => data,
        Err(e) => {
            eprintln!("Error parsing JSON: {}", e);
            return Err("Error parsing JSON".into());
        }
    };

    if let Some(date) = &imdb_data.release_date {
        imdb_data.year = date.split('-').next().and_then(|y| y.parse().ok());
    }

    // Country
    let country_selector = Selector::parse("li[data-testid='title-details-origin'] a").unwrap();
    if let Some(country) = document.select(&country_selector).next() {
        imdb_data.country = Some(country.text().collect::<Vec<_>>().concat());
    }

    // Language
    let language_selector = Selector::parse(
        "li[data-testid='title-details-languages'] .ipc-metadata-list-item__content-container",
    )
    .unwrap();
    if let Some(language) = document.select(&language_selector).next() {
        imdb_data.language = Some(language.text().next().unwrap_or_default().to_string());
    }

    // Other images
    let other_images_selector = Selector::parse("section[data-testid='Photos'] img").unwrap();
    let images = document
        .select(&other_images_selector)
        .filter_map(|img| img.value().attr("src"))
        .map(|url| parse_url(url))
        .collect::<Vec<String>>()
        .join(", ");

    if !images.is_empty() {
        imdb_data.other_images = Some(images);
    }

    imdb_data.title = decode_html_entities(&imdb_data.title);
    imdb_data.description = imdb_data.description.as_deref().map(decode_html_entities);
    imdb_data.keywords = imdb_data.keywords.as_deref().map(decode_html_entities);

    Ok(imdb_data)
}

fn parse_url(url: &str) -> String {
    if let Some(start) = url.find("@.") {
        if let Some(end) = url[start + 2..].find('.') {
            let extension = &url[start + 2 + end..];
            return format!("{}@{}", &url[..start], extension);
        }
    }
    url.to_string()
}

fn deserialize_genre<'de, D>(deserializer: D) -> Result<Option<String>, D::Error>
where
    D: Deserializer<'de>,
{
    let genre: Option<Vec<String>> = Option::deserialize(deserializer)?;
    Ok(genre.map(|g| g.join(", ")))
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct IMDBPerson {
    #[serde(rename = "@type")]
    pub type_field: String,
    pub name: Option<String>,
}

fn deserialize_persons<'de, D>(deserializer: D) -> Result<Option<String>, D::Error>
where
    D: Deserializer<'de>,
{
    let persons_array: Option<Vec<IMDBPerson>> = Option::deserialize(deserializer)?;
    Ok(persons_array.map(|persons| {
        persons
            .into_iter()
            .filter(|c| c.type_field == "Person")
            .filter_map(|c| c.name)
            .collect::<Vec<String>>()
            .join(", ")
    }))
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct IMDBRating {
    #[serde(rename = "ratingCount")]
    pub rating_count: Option<u32>,
    #[serde(rename = "bestRating")]
    pub best_rating: Option<u32>,
    #[serde(rename = "worstRating")]
    pub worst_rating: Option<u32>,
    #[serde(rename = "ratingValue")]
    pub rating_value: Option<f32>,
}

fn deserialize_imdb_rating<'de, D>(deserializer: D) -> Result<Option<f32>, D::Error>
where
    D: Deserializer<'de>,
{
    let rating: Option<IMDBRating> = Option::deserialize(deserializer)?;
    Ok(rating.and_then(|r| r.rating_value))
}

fn deserialize_duration<'de, D>(deserializer: D) -> Result<Option<String>, D::Error>
where
    D: Deserializer<'de>,
{
    let duration: Option<String> = Option::deserialize(deserializer)?;
    Ok(duration.map(|d| {
        let mut hours = 0;
        let mut minutes = 0;

        if let Some(h_pos) = d.find("H") {
            if let Some(h_start) = d.find("PT") {
                if let Ok(h) = d[h_start + 2..h_pos].parse::<u32>() {
                    hours = h;
                }
            }
        }

        if let Some(m_pos) = d.find("M") {
            if let Some(m_start) = d.find("H") {
                if let Ok(m) = d[m_start + 1..m_pos].parse::<u32>() {
                    minutes = m;
                }
            }
        }

        // If there's no hours, we'll default to 0
        if hours == 0 && minutes == 0 {
            "00:00".to_string()
        } else {
            format!("{:02}h {:02}m", hours, minutes)
        }
    }))
}
