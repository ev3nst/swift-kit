import { invoke } from '@tauri-apps/api/core';

import { Setting } from '@/lib/models/setting';

export type IFileMeta = {
	filename: string;
	filesize: number;
	birthtime: string;
	mtime: string;
	atime: string;
};

export type VideoMetaTrack = {
	name: string;
	value: number;
};

export type IVideoMeta = {
	filename: string;
	filesize: number;
	duration: string;
	duration_in_seconds: number;
	width: number;
	height: number;
	frame_rate: number;
	subtitle_tracks: VideoMetaTrack[];
	default_subtitle?: number;
	audio_tracks: VideoMetaTrack[];
	default_audio?: number;
	src?: string;
};

export type IVideoIO = {
	intro_start: string;
	intro_end: string;
	outro_start: string;
	outro_end: string;
} & IVideoMeta;

export type IMovieQueryR = {
	title: string;
	href: string;
	cover: string;
};

export type IMovieMeta = {
	scraped_url: string;
	title: string;
	description: string | null;
	keywords: string | null;
	release_date: string | null;
	year: number | null;
	duration: string | null;
	genre: string | null;
	actors: string | null;
	writers: string | null;
	directors: string | null;
	cover: string | null;
	imdb_rating: number | null;
	country: string | null;
	language: string | null;
	other_images: string | null;
	personal_rating: number | null;
	trailer: string | null;
	poster: string | null;
};

export type IAnimeMeta = {
	scraped_url: string;
	franchise: string | null;
	original_title: string;
	title: string;
	description: string | null;
	genre: string | null;
	year: number | null;
	episodes: number | null;
	cover: string | null;
	duration: string | null;
	studios: string | null;
	mal_rating: number | null;
	personal_rating: number | null;
	poster: string | null;
	trailer: string | null;
};

class API {
	async always_on_top(only_state: boolean): Promise<boolean> {
		return invoke('always_on_top', {
			only_state,
		});
	}

	async fetch_files(
		folder_path: string,
		extension_filter?: string,
	): Promise<IFileMeta[]> {
		return invoke('fetch_files', {
			folder_path,
			extension_filter,
		});
	}

	async bulk_rename(
		folder_path: string,
		search: string,
		replace?: string,
		extension_filter?: string,
	): Promise<void> {
		await invoke('bulk_rename', {
			folder_path,
			search,
			replace,
			extension_filter,
		});
	}

	async rename_files(
		folder_path: string,
		rename_mapping: {
			old: string;
			new: string;
		}[],
		extension_filter?: string,
	): Promise<void> {
		await invoke('rename_files', {
			folder_path,
			rename_mapping,
			extension_filter,
		});
	}

	async get_available_disks(): Promise<string[]> {
		return invoke('get_available_disks');
	}

	async finder(search_term: string, disk?: string): Promise<string[]> {
		return invoke('finder', {
			search_term,
			disk,
		});
	}

	async highlight_file(file_path: string): Promise<string[]> {
		return invoke('highlight_file', {
			file_path,
		});
	}

	async image_convert(
		img_path: string,
		to: string,
		output_folder?: string,
	): Promise<string> {
		return invoke('image_convert', {
			img_path,
			to,
			output_folder,
		});
	}

	async image_compress(
		img_path: string,
		quality: number,
		output_folder?: string,
	): Promise<string> {
		return invoke('image_compress', {
			img_path,
			quality,
			output_folder,
		});
	}

	async image_resize(
		img_path: string,
		width?: number,
		height?: number,
		output_folder?: string,
		file_name?: string,
	): Promise<string> {
		return invoke('image_resize', {
			img_path,
			width: String(width),
			height: String(height),
			output_folder,
			file_name,
		});
	}

	async get_video_details(video_path: string): Promise<IVideoMeta> {
		return invoke('get_video_details', {
			video_path,
		});
	}

	async generate_video_thumbnails(video_path: string): Promise<{
		video_path: string;
		thumbnail_folder: string;
		vtt_file_path: string;
	}> {
		return invoke('generate_video_thumbnails', { video_path });
	}

	async stop_video_thumbnail_generation(): Promise<void> {
		return invoke('stop_video_thumbnail_generation');
	}

	async trash_folder(folder_path: string) {
		return invoke('trash_folder', { folder_path });
	}

	async intro_outro_prediction(episodes_folder: string): Promise<IVideoIO[]> {
		return invoke('intro_outro_prediction', {
			episodes_folder,
		});
	}

	async no_intro_outro(
		folder_path: string,
		video: IVideoIO,
		use_cuda: boolean = true,
		overwrite: boolean = false,
	) {
		return invoke('no_intro_outro', {
			folder_path,
			video: {
				...video,
				default_subtitle: Number(video.default_subtitle),
				default_audio: Number(video.default_audio),
			},
			use_cuda,
			overwrite,
		});
	}

	async interpolate(
		video_path: string,
		encoder: string = 'h264_nvenc',
		rife_model: string = 'rife-v4.6',
		multiplier: number = 2,
		overwrite: boolean = false,
	) {
		const video2xPath = await Setting.get('video2x_binary_path');
		if (
			video2xPath &&
			video2xPath.value !== null &&
			video2xPath.value !== ''
		) {
			return invoke('interpolate', {
				video2x_path: video2xPath.value,
				video_path,
				encoder,
				rife_model,
				multiplier,
				overwrite,
			});
		}
	}

	async convert_to_mp4(video_path: string) {
		return invoke('convert_to_mp4', {
			video_path,
		});
	}

	async search_movie(query: string): Promise<IMovieQueryR[]> {
		return invoke('search_movie', {
			query,
		});
	}

	async scrape_movie(url: string): Promise<IMovieMeta> {
		return invoke('scrape_movie', {
			url,
		});
	}

	async scrape_anime(url: string): Promise<IAnimeMeta> {
		return invoke('scrape_anime', {
			url,
		});
	}
}

const api = new API();

export default api;
