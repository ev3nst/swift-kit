use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};
use tokio::{runtime::Runtime, task};

use super::utils::common_headers::common_headers;
use super::utils::request_client::request_client;

#[derive(Debug, Serialize, Deserialize)]
pub struct MovieSearchResult {
    pub href: String,
    pub title: String,
    pub cover: Option<String>,
}

#[tauri::command(rename_all = "snake_case")]
pub async fn search_movie(query: String) -> Result<Vec<MovieSearchResult>, String> {
    task::spawn_blocking(move || {
        Runtime::new().unwrap().block_on(async move {
            let mut results = Vec::new();
            let search_url = format!("https://www.imdb.com/find/?q={}", query);
            let client = request_client().map_err(|e| e.to_string())?;

            let res = client
                .get(&search_url)
                .headers(common_headers())
                .send()
                .await
                .map_err(|e| e.to_string())?;
            let body = res.text().await.map_err(|e| e.to_string())?;
            let document = Html::parse_document(&body);

            let selector =
                Selector::parse("section[data-testid='find-results-section-title'] li").unwrap();

            for element in document.select(&selector) {
                if let Some(anchor) = element.select(&Selector::parse("a").unwrap()).next() {
                    let title = anchor
                        .text()
                        .collect::<Vec<_>>()
                        .join(" ")
                        .trim()
                        .to_string();
                    let href = anchor.value().attr("href").unwrap_or_default();
                    let full_href = format!("https://www.imdb.com{}", href);
                    let cleaned_href = full_href.split('?').next().unwrap_or(&full_href);

                    let cover = element
                        .select(&Selector::parse("img").unwrap())
                        .next()
                        .and_then(|img| img.value().attr("src").map(|s| s.to_string()));
                    results.push(MovieSearchResult {
                        href: cleaned_href.to_string(),
                        title,
                        cover,
                    });
                }
            }

            Ok(results)
        })
    })
    .await
    .unwrap()
}
