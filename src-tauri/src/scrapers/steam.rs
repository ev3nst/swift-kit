use reqwest::Client;
use scraper::{Html, Selector};
use std::error::Error;

use crate::utils::{common_headers::common_headers, decode_html_entities::decode_html_entities};

#[derive(Debug)]
pub struct SteamData {
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

pub async fn scrape(client: &Client, url: &str) -> Result<SteamData, Box<dyn Error>> {
    let res = client.get(url).headers(common_headers()).send().await?;
    let body = res.text().await?;
    let document = Html::parse_document(&body);

    // TITLE
    let selector = Selector::parse("#appHubAppName").unwrap();
    let title = document
        .select(&selector)
        .next()
        .map(|el| el.text().collect::<Vec<_>>().concat().trim().to_string())
        .as_deref()
        .map(decode_html_entities)
        .unwrap_or_default();

    // GENRE
    let selector = Selector::parse(".popular_tags_ctn a").unwrap();
    let mut tags = vec![];
    for element in document.select(&selector) {
        let text = element
            .text()
            .map(|el| el.trim().to_string())
            .collect::<String>();
        tags.push(text);
    }
    let genre = Some(tags.join(", "));

    // DESCRIPTION
    let selector = Selector::parse("meta[property='og:description']").unwrap();
    let description: Option<String> = Some(
        document
            .select(&selector)
            .next()
            .unwrap()
            .value()
            .attr("content")
            .as_deref()
            .map(decode_html_entities)
            .unwrap_or_default()
            .to_string(),
    );

    // ABOUT
    let selector = Selector::parse("#game_area_description").unwrap();
    let about: Option<String> = document
        .select(&selector)
        .next()
        .map(|element| element.inner_html().replace("<h2>About This Game</h2>", ""))
        .as_deref()
        .map(decode_html_entities);

    // RELEASE DATE
    let selector = Selector::parse(".date").unwrap();
    let release_date = document
        .select(&selector)
        .next()
        .map(|el| el.text().collect::<String>())
        .unwrap_or_default();

    // YEAR
    let year: Option<u16> = if release_date.contains(",") {
        release_date
            .split(", ")
            .last()
            .and_then(|year| year.parse::<u16>().ok())
    } else {
        None
    };

    // DEVELOPERS
    let selector = Selector::parse("#developers_list a").unwrap();
    let mut developers = vec![];
    for element in document.select(&selector) {
        let text = element
            .text()
            .map(|el| el.trim().to_string())
            .collect::<String>();
        developers.push(text);
    }
    let developers = Some(developers.join(", "));

    // PUBLISHERS
    let dev_row_selector = Selector::parse(".dev_row").unwrap();
    let a_tag_selector = Selector::parse("a").unwrap();
    let mut publishers = vec![];
    if let Some(second_dev_row) = document.select(&dev_row_selector).nth(1) {
        for a_tag in second_dev_row.select(&a_tag_selector) {
            publishers.push(
                a_tag
                    .text()
                    .map(|el| el.trim().to_string())
                    .collect::<String>(),
            );
        }
    }
    let publishers = Some(tags.join(", "));

    // ASSETS
    let url = url.trim_end_matches('/');
    let url_parts: Vec<&str> = url.split('/').collect();
    let app_id: u32 = match url_parts.len() {
        len if len == 6 => url_parts[url_parts.len() - 2].parse().unwrap_or(0),
        len if len == 5 => url_parts[url_parts.len() - 1].parse().unwrap_or(0),
        _ => 0,
    };

    let cover: Option<String> = format!(
        "https://cdn.cloudflare.steamstatic.com/steam/apps/{}/hero_capsule.jpg",
        app_id.to_string()
    )
    .into();
    let poster: Option<String> = format!(
        "https://cdn.cloudflare.steamstatic.com/steam/apps/{}/library_hero.jpg",
        app_id.to_string()
    )
    .into();

    let selector = Selector::parse(".highlight_player_item").unwrap();
    let trailer_id_string = document
        .select(&selector)
        .next()
        .map(|el| el.attr("id").unwrap_or_default())
        .unwrap_or_default();
    let video_id: Option<u32> = trailer_id_string
        .replace("highlight_movie_", "")
        .trim()
        .parse()
        .ok();

    let mut trailer: Option<String> = Some("".to_string());
    if let Some(id) = video_id {
        trailer = format!(
            "https://video.cloudflare.steamstatic.com/store_trailers/{}/movie_max_vp9.webm",
            id
        )
        .into();
    } else {
        Some("");
    }

    let selector = Selector::parse(".highlight_screenshot_link").unwrap();
    let hrefs: Vec<String> = document
        .select(&selector)
        .filter_map(|a| a.value().attr("href").map(|href| href.to_string()))
        .collect();

    let other_images = hrefs.join(", ");

    Ok(SteamData {
        title,
        genre,
        description,
        about,
        release_date: Some(release_date),
        year,
        developers,
        publishers,
        cover,
        poster,
        trailer,
        other_images: Some(other_images),
    })
}
