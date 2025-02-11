import { useState } from 'react';
import { open, type OpenDialogOptions } from '@tauri-apps/plugin-dialog';

import { Button } from '@/components/button';
import { formatFileSize, getFileDetailsFromPath } from '@/lib/utils';

export type FileMeta = {
	path: string;
	name: string;
	size: number;
	mime: string;
	preview?: string;
	width?: number;
	height?: number;
};

const NativeFileInput = ({
	onFileChange,
	dialogTitle,
	extensionFilter,
}: {
	onFileChange: (file: FileMeta) => boolean;
	dialogTitle?: string;
	extensionFilter?: string[];
}) => {
	const [currentFile, setCurrentFile] = useState<FileMeta>();

	const handleButtonClick = async () => {
		const openFileDialogConfig: OpenDialogOptions = {
			title: dialogTitle ?? 'Select File',
			multiple: false,
			directory: false,
		};

		if (extensionFilter) {
			openFileDialogConfig.filters = [
				{
					name: '',
					extensions: extensionFilter,
				},
			];
		}

		const file = await open(openFileDialogConfig);
		if (typeof file !== 'undefined' && file !== null) {
			const fileDetails = await getFileDetailsFromPath(file);
			const isAccepted = onFileChange(fileDetails);
			if (isAccepted) {
				setCurrentFile(fileDetails);
			}
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<Button
				className="items-center"
				variant="info-outline"
				type="button"
				onClick={handleButtonClick}
			>
				Select File
				{currentFile && (
					<div className="flex gap-2 text-foreground text-xs items-end">
						(<span>{currentFile.name}</span>
						<span>{formatFileSize(currentFile.size)}</span>)
					</div>
				)}
			</Button>
		</div>
	);
};

export { NativeFileInput };
