use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};
use tauri::Url;
use tokio::{runtime::Runtime, task};

use super::utils::request_client::request_client;
use crate::utils::common_headers::common_headers;

#[derive(Debug, Serialize, Deserialize)]
pub struct GameSearchResult {
    pub href: String,
    pub title: String,
    pub cover: Option<String>,
}

#[tauri::command(rename_all = "snake_case")]
pub async fn search_game(query: String) -> Result<Vec<GameSearchResult>, String> {
    task::spawn_blocking(move || {
        Runtime::new().unwrap().block_on(async move {
            let mut results = Vec::new();
            let search_url = format!("https://store.steampowered.com/search/?term={}&category1=998&os=win&supportedlang=english&ndl=1", query);
            let client = request_client().map_err(|e| e.to_string())?;

            let res = client
                .get(&search_url)
                .headers(common_headers())
                .send()
                .await
                .map_err(|e| e.to_string())?;
            let body = res.text().await.map_err(|e| e.to_string())?;
            let document = Html::parse_document(&body);
			let selector = Selector::parse("#search_results a").unwrap();
			let title_selector = Selector::parse(".title").unwrap();
			let cover_selector = Selector::parse("img").unwrap();
            for row in document.select(&selector) {
				let href_raw = row.value().attr("href").unwrap_or_default().to_string();
				let href = href_raw.split('?').next().unwrap_or(&href_raw).to_string();
				let title = if let Some(title_el) = row.select(&title_selector).next() {
					title_el.text().collect::<String>().trim().to_string()
				} else {
					String::new()
				};

				if !title.is_empty() && !title.chars().all(char::is_whitespace) && Url::parse(&href).is_ok() {
					let cover_raw = if let Some(cover_el) = row.select(&cover_selector).next() {
						cover_el.attr("src").unwrap_or_default().to_string()
					} else {
						String::new()
					};
					let cover = cover_raw.split('?')
						.next()
						.unwrap_or(&cover_raw)
						.to_string();

					results.push(GameSearchResult {
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
