use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};
use tokio::{runtime::Runtime, task};

use super::utils::request_client::request_client;
use crate::utils::common_headers::common_headers;

#[derive(Debug, Serialize, Deserialize)]
pub struct AnimeSearchResult {
    pub href: String,
    pub title: String,
    pub cover: Option<String>,
}

#[tauri::command(rename_all = "snake_case")]
pub async fn search_anime(query: String) -> Result<Vec<AnimeSearchResult>, String> {
    task::spawn_blocking(move || {
        Runtime::new().unwrap().block_on(async move {
            let mut results = Vec::new();
            let search_url = format!("https://myanimelist.net/anime.php?q={}&cat=anime", query);
            let client = request_client().map_err(|e| e.to_string())?;

            let res = client
                .get(&search_url)
                .headers(common_headers())
                .send()
                .await
                .map_err(|e| e.to_string())?;
            let body = res.text().await.map_err(|e| e.to_string())?;
            let document = Html::parse_document(&body);

            let tr_selector = Selector::parse("tr").unwrap();
            let img_selector = Selector::parse("a[href*='/anime/'] > img").unwrap();
            let title_selector = Selector::parse("a[href*='/anime/'][id^='sinfo']").unwrap();
            let hover_selector = Selector::parse("div[id^='sinfo'] a[href*='/anime/']").unwrap();

            for row in document.select(&tr_selector) {
                if let Some(link_el) = row.select(&title_selector).next() {
                    let href = link_el.value().attr("href").unwrap_or_default().to_string();

                    let title = if let Some(hover_el) = row.select(&hover_selector).next() {
                        hover_el.text().collect::<String>().trim().to_string()
                    } else {
                        link_el.text().collect::<String>().trim().to_string()
                    };

                    let cover_raw = row
                        .select(&img_selector)
                        .next()
                        .and_then(|img| {
                            img.value()
                                .attr("data-src")
                                .or_else(|| img.value().attr("src"))
                        })
                        .map(String::from)
                        .unwrap()
                        .to_string()
                        .replace("/r/50x70", "")
                        .replace("webp", "jpg");
                    let cover = cover_raw
                        .split('?')
                        .next()
                        .unwrap_or(&cover_raw)
                        .to_string();

                    results.push(AnimeSearchResult {
                        href,
                        title,
                        cover: Some(cover),
                    });
                }
            }

            Ok(results)
        })
    })
    .await
    .unwrap()
}
