use reqwest::Client;
use scraper::{Html, Selector};
use std::error::Error;

#[derive(Debug)]
pub struct YoutubeTrailerData {
    pub trailer_url: Option<String>,
}

pub async fn yt_trailer(
    client: &Client,
    title: String,
    year: Option<&u16>,
) -> Result<YoutubeTrailerData, Box<dyn Error>> {
    let mut data = YoutubeTrailerData { trailer_url: None };
    let search_url = if let Some(year) = year {
        format!(
            "https://www.youtube.com/results?search_query={}+{}+trailer",
            title, year
        )
    } else {
        format!(
            "https://www.youtube.com/results?search_query={}+trailer",
            title
        )
    };

    let res = client
        .get(&search_url)
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
    let selector = Selector::parse(r#"a#video-title"#).unwrap();

    for element in document.select(&selector) {
        if let Some(video_url) = element.value().attr("href") {
            let video_id = video_url.strip_prefix("/watch?v=").unwrap_or_default();
            if !video_id.is_empty() {
                data.trailer_url = format!("https://www.youtube.com/embed/{}", video_id).into();
            }
        }
    }

    Ok(data)
}
