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
		extension_filter?: string
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
		extension_filter?: string
	): Promise<void> {
		throw new Error('to be implemented');
	}

	async rename_files(
		folder_path: string,
		rename_mapping: {
			old: string;
			new: string;
		}[],
		extension_filter?: string
	): Promise<void> {
		throw new Error('to be implemented');
	}

	async img_convert(
		img_path: string,
		to: string,
		output_folder?: string
	): Promise<string> {
		throw new Error('to be implemented');
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
		}[]
	) {
		throw new Error('to be implemented');
	}
}

const api = new API();

export default api;
