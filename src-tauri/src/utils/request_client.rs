use reqwest::{Client, Error};

pub fn request_client() -> Result<Client, Error> {
    let client = Client::builder()
	.user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
	.build();

    client
}
