import { stat, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { checkIfFolderExists } from './utils';

export async function fetch_files(
	folder_path: string,
	extension_filter?: string,
): Promise<any[]> {
	const folderAbsolutePath = await checkIfFolderExists(folder_path);
	const raw_files: string[] = await readdir(folderAbsolutePath);
	const files: any[] = [];

	// Return all files with metadata if no filter is provided
	for (const file of raw_files) {
		if (extension_filter && extension_filter !== '') {
			const normalizedExtension = extension_filter.startsWith('.')
				? extension_filter
				: `.${extension_filter}`;

			if (!file.endsWith(normalizedExtension)) {
				continue;
			}
		}

		const filePath = resolve(folderAbsolutePath, file);
		if (!filePath.startsWith(folderAbsolutePath)) {
			throw new Error(
				`Security Error: Attempt to escape target directory blocked.`,
			);
		}

		const fileStats = await stat(filePath);
		files.push({
			filename: file,
			size: fileStats.size,
			isDirectory: fileStats.isDirectory(),
			isFile: fileStats.isFile(),
			birthtime: fileStats.birthtime,
			mtime: fileStats.mtime,
			atime: fileStats.atime,
		});
	}

	return files;
}
