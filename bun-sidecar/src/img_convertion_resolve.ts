import { exists } from 'node:fs/promises';
import { resolve, extname, dirname, basename } from 'node:path';
import { lookup } from 'mime-types';

import { checkIfFolderExists } from './utils';

const isValidImage = (imgPath: string): boolean => {
	const mimeType = lookup(imgPath);
	return typeof mimeType === 'string' && mimeType.startsWith('image/');
};

export async function img_convertion_resolve(
	img_path: string,
	to: string,
	output_folder?: string,
): Promise<{
	img_path: string;
	output_path: string;
}> {
	const sanitizedImgPath = resolve(img_path);
	if ((await exists(sanitizedImgPath)) === false) {
		throw new Error('The image file does not exist.');
	}

	if (!isValidImage(sanitizedImgPath)) {
		throw new Error('Provided file is not a valid image.');
	}

	const supportedFormats = ['jpeg', 'png', 'webp'];
	const ext = extname(img_path).toLowerCase().slice(1);
	if (
		supportedFormats.indexOf(to) === -1 ||
		(ext === 'svg' && to !== 'png')
	) {
		throw new Error(`Intented format ${to} is not supported.`);
	}

	// 3. Handle output folder logic
	let outputDir = output_folder;

	if (
		typeof outputDir !== 'string' ||
		!outputDir ||
		outputDir.trim().length === 0
	) {
		outputDir = dirname(sanitizedImgPath);
	}

	const sanitizedOutputDir = await checkIfFolderExists(outputDir);
	const outputFileName = `${basename(
		sanitizedImgPath,
		extname(sanitizedImgPath),
	)}.${to}`;
	const outputPath = resolve(sanitizedOutputDir, outputFileName);

	if (await exists(outputPath)) {
		throw new Error(
			`File with the name '${outputFileName}' already exists in the output folder. Choose a different output folder or file name.`,
		);
	}

	try {
		return {
			img_path: sanitizedImgPath,
			output_path: outputPath,
		};
	} catch (err) {
		if (err instanceof Error) {
			throw new Error(`Image conversion failed: ${err.message}`);
		} else {
			throw new Error('Image conversion failed due to an unknown error.');
		}
	}
}
