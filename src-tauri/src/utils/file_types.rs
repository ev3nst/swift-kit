use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct FileMeta {
    pub filename: String,
    pub filesize: u64,
    pub birthtime: String,
    pub mtime: String,
    pub atime: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VideoTrackDetail {
	pub name: String,
	pub value: i32,
}

#[derive(Serialize)]
pub struct VideoDetails {
	pub filename: String,
	pub filesize: u64,
	pub duration: String,
	pub duration_in_seconds: f64,
	pub width: u32,
	pub height: u32,
	pub frame_rate: f64,
	pub subtitle_tracks: Vec<VideoTrackDetail>,
	pub default_subtitle: i32,
	pub audio_tracks: Vec<VideoTrackDetail>,
	pub default_audio: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IAnimeMeta {
	pub filename: String,
	pub filesize: u64,
	pub duration: String,
	pub duration_in_seconds: f64,
	pub width: u32,
	pub height: u32,
	pub frame_rate: f64,
	pub subtitle_tracks: Vec<VideoTrackDetail>,
	pub default_subtitle: i32,
	pub audio_tracks: Vec<VideoTrackDetail>,
	pub default_audio: i32,
	pub intro_start: Option<String>,
	pub intro_end: Option<String>,
	pub outro_start: Option<String>,
	pub outro_end: Option<String>,
}
