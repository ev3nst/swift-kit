import { invoke } from '@tauri-apps/api/core';

export type IFileMeta = {
	filename: string;
	size: number;
	birthtime: string;
	mtime: string;
	atime: string;
};

class API {
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
		replace: string,
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

	async intro_outro_prediction(episodesFolder: string) {
		throw new Error('to be implemented');
	}

	async no_intro_outro(
		episodesFolder: string,
		episodesData: {
			filename: string;
			intro_start: string;
			intro_end: string;
			outro_start: string;
			outro_end: string;
		}[],
	) {
		throw new Error('to be implemented');
	}
}

const api = new API();

export default api;
