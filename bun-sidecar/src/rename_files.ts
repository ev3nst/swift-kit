import { access, readdir, rename } from 'node:fs/promises';
import { resolve } from 'node:path';
import sanitize from 'sanitize-filename';

import { checkIfFolderExists } from './utils';

export async function rename_files(
	folder_path: string,
	rename_mapping: {
		old: string;
		new: string;
	}[],
	extension_filter?: string,
): Promise<any> {
	const folderAbsolutePath = await checkIfFolderExists(folder_path);
	const raw_files: string[] = await readdir(folderAbsolutePath);
	const files: any[] = [];

	rename_mapping = rename_mapping.map(rm => {
		return {
			old: sanitize(rm.old),
			new: sanitize(rm.new),
		};
	});

	if (
		new Set(rename_mapping.map(fileRecord => fileRecord.new)).size !==
		rename_mapping.length
	) {
		throw new Error(
			`Rename mapping has duplicate records therefore renaming process is stopped.`,
		);
	}

	for (let rmi = 0; rmi < rename_mapping.length; rmi++) {
		try {
			const checkFilePath = resolve(
				folderAbsolutePath,
				rename_mapping[rmi].new,
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

	for (const file of raw_files) {
		if (extension_filter && extension_filter !== '') {
			const normalizedExtension = extension_filter.startsWith('.')
				? extension_filter
				: `.${extension_filter}`;

			if (!file.endsWith(normalizedExtension)) {
				continue;
			}
		}

		const findIndex = rename_mapping.findIndex(rm => rm.old === file);
		if (
			findIndex === -1 ||
			typeof rename_mapping[findIndex].new === 'undefined' ||
			rename_mapping[findIndex].new === null ||
			rename_mapping[findIndex].new === ''
		)
			continue;

		const oldFilePath = resolve(folderAbsolutePath, file);
		const newFilePath = resolve(
			folderAbsolutePath,
			rename_mapping[findIndex].new,
		);

		files.push({
			oldFilePath,
			newFilePath,
		});
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
