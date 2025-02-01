import { access, readdir, rename } from 'node:fs/promises';
import { resolve } from 'node:path';
import sanitize from 'sanitize-filename';

import { checkIfFolderExists } from './utils';

export async function bulk_rename(
	folder_path: string,
	search: string,
	replace: string,
	extension_filter?: string,
): Promise<any> {
	const folderAbsolutePath = await checkIfFolderExists(folder_path);
	const raw_files: string[] = await readdir(folderAbsolutePath);
	const files: any[] = [];

	for (const file of raw_files) {
		if (extension_filter && extension_filter !== '') {
			const normalizedExtension = extension_filter.startsWith('.')
				? extension_filter
				: `.${extension_filter}`;

			if (!file.endsWith(normalizedExtension)) {
				continue;
			}
		}

		if (file.indexOf(search) === -1) continue;

		const oldFilePath = resolve(folderAbsolutePath, file);
		const newFileName = sanitize(file.replace(search, replace));
		const newFilePath = resolve(folderAbsolutePath, newFileName);

		files.push({
			oldFilePath,
			newFilePath,
		});
	}

	if (
		new Set(files.map(fileRecord => fileRecord.newFilePath)).size !==
		files.length
	) {
		throw new Error(
			`Renaming would result in duplicates therefore process has been stopped.`,
		);
	}

	for (let rmi = 0; rmi < files.length; rmi++) {
		try {
			const checkFilePath = resolve(
				folderAbsolutePath,
				files[rmi].newFilePath,
			);

			if (!checkFilePath.startsWith(folderAbsolutePath)) {
				throw new Error(
					`Security Error: Attempt to escape target directory blocked.`,
				);
			}
			await access(checkFilePath);
			throw new Error(
				`Error: Target file already exists. Rename aborted. ${checkFilePath}`,
			);
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
		}
	}

	const renamePromises = files.map(async file => {
		try {
			await rename(file.oldFilePath, file.newFilePath);
		} catch (err) {
			throw new Error(
				`Error renaming ${file.oldFilePath} to ${file.newFilePath}: ${
					(err as Error).message
				}`,
			);
		}
	});

	await Promise.all(renamePromises);
}
