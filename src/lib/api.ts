import { invoke } from '@tauri-apps/api/core';

export type IFileMeta = {
	filename: string;
	size: number;
	isDirectory: boolean;
	isFile: boolean;
	birthtime: string;
	mtime: string;
	atime: string;
};

class BunApi {
	static sidecarName: string = 'bunsidecar';

	async fetch_files(
		folder_path: string,
		extension_filter?: string,
	): Promise<IFileMeta[]> {
		const response: string = await invoke(BunApi.sidecarName, {
			command: 'fetch_files',
			args: [folder_path, extension_filter],
		});

		console.log(response, 'res');
		return JSON.parse(response) as IFileMeta[];
	}

	async bulk_rename(
		folder_path: string,
		search: string,
		replace: string,
		extension_filter?: string,
	): Promise<void> {
		await invoke(BunApi.sidecarName, {
			command: 'bulk_rename',
			args: [folder_path, search, replace, extension_filter],
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
		await invoke(BunApi.sidecarName, {
			command: 'rename_files',
			args: [
				folder_path,
				JSON.stringify(rename_mapping),
				extension_filter,
			],
		});
	}
}

const bunApi = new BunApi();

export default bunApi;
