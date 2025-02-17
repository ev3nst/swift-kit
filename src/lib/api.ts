import { invoke } from '@tauri-apps/api/core';

export type IFileMeta = {
	filename: string;
	size: number;
	birthtime: string;
	mtime: string;
	atime: string;
};

export type IVideoMeta = {
	filename: string;
	filesize: number;
	duration: string;
	duration_in_seconds: number;
	width: number;
	height: number;
	frame_rate: number;
	subtitles: any[];
	defaultSubtitle: string;
	audioTracks: any[];
	defaultAudio: string;
	src?: string;
};

export type IAnimeMeta = {
	intro_start: string;
	intro_end: string;
	outro_start: string;
	outro_end: string;
} & IVideoMeta;

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

	async intro_outro_prediction(
		episodes_folder: string,
	): Promise<IAnimeMeta[]> {
		return invoke('intro_outro_prediction', {
			episodes_folder,
		});
	}

	async no_intro_outro(episodesFolder: string, episodesData: IAnimeMeta[]) {
		throw new Error('to be implemented');
	}
}

const api = new API();

export default api;
