import { appendFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function checkIfFolderExists(folder_path: string) {
	const folderAbsolutePath = resolve(folder_path);
	try {
		const stats = await stat(folderAbsolutePath);
		if (!stats.isDirectory()) {
			throw new Error(`${folderAbsolutePath} is not a valid directory.`);
		}
	} catch (error) {
		throw new Error(
			`Failed to access folder: ${folderAbsolutePath}. ${
				error instanceof Error ? error.message : ''
			}`,
		);
	}

	return folderAbsolutePath;
}

const logFilePath = resolve('../debug.log');
export async function logToFile(message: string) {
	try {
		const logMessage = `${new Date().toISOString()} - ${message}\n`;
		await appendFile(logFilePath, logMessage);
	} catch (error) {
		console.error('Error writing to log file:', error);
	}
}
