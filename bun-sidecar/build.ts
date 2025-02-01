import { execSync } from 'child_process';
import fs from 'fs';

const ext = process.platform === 'win32' ? '.exe' : '';

const rustInfo = execSync('rustc -vV').toString();
const match = /host: (\S+)/g.exec(rustInfo);
if (!match) {
	console.error('Failed to determine platform target triple');
	process.exit(1);
}

const targetTriple = match[1];
fs.renameSync(`swift-kit-bun-sidecar${ext}`, `../src-tauri/binaries/swift-kit-bun-sidecar-${targetTriple}${ext}`);
