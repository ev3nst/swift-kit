/* eslint-disable no-case-declarations */
import { fetch_files } from './fetch_files';
import { bulk_rename } from './bulk_rename';
import { rename_files } from './rename_files';
import { img_convertion_resolve } from './img_convertion_resolve';

const command = process.argv[2];

switch (command) {
	case 'fetch_files':
		const result = await fetch_files(
			process.argv[3],
			process.argv[4] ?? '',
		);
		process.stdout.write(JSON.stringify(result));
		break;
	case 'bulk_rename':
		await bulk_rename(
			process.argv[3],
			process.argv[4],
			process.argv[5],
			process.argv[6] ?? '',
		);
		process.stdout.write('true');
		break;
	case 'rename_files':
		await rename_files(
			process.argv[3],
			JSON.parse(process.argv[4]),
			process.argv[5] ?? '',
		);
		process.stdout.write('true');
		break;
	case 'img_convert':
		const resolved = await img_convertion_resolve(
			process.argv[3],
			process.argv[4],
			process.argv[5] ?? '',
		);
		process.stdout.write(JSON.stringify(resolved));
		break;
	default:
		console.error(`unknown command ${command}`);
		process.exit(1);
}
