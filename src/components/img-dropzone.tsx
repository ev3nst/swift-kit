import { useRef, useEffect } from 'react';
import { Image } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';

import { Button } from '@/components/button';

import { useDragEvent } from '@/hooks/use-drag-event';

import { formatFileSize } from '@/lib/utils';

export type DroppedFile = {
	path: string;
	preview: string;
	name: string;
	size: number;
	mime: string;
};

type IMGDropzoneProps = {
	id: string;
	images: DroppedFile[];
	handleFilesStateChange: (id: string, filePaths: string[]) => void;
};

const IMGDropzone = ({
	id,
	images,
	handleFilesStateChange,
}: IMGDropzoneProps) => {
	const dropZoneRef = useRef(null);
	const {
		isHovered,
		currentFiles,
		addDropZoneRef,
		handleDragFilesChange,
		removeDropZoneRef,
	} = useDragEvent();

	useEffect(() => {
		addDropZoneRef(id, dropZoneRef);
		return () => {
			removeDropZoneRef(id);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (
			typeof currentFiles[id] !== 'undefined' &&
			currentFiles[id].length > 0
		) {
			handleFilesStateChange(id, currentFiles[id]);
		}
	}, [currentFiles, handleFilesStateChange, id]);

	const handleButtonClick = async () => {
		const files = await open({
			title: 'Select Images',
			multiple: true,
			directory: false,
			filters: [
				{
					name: '',
					extensions: ['jpg', 'png', 'webp', 'ico', 'bmp'],
				},
			],
		});

		if (files && files.length > 0) {
			const existingFiles = currentFiles[id] || [];
			handleDragFilesChange(id, [...existingFiles, ...files]);
		}
	};

	return (
		<div>
			<div
				ref={dropZoneRef}
				className={`border-2 border-dashed rounded-lg w-full h-[150px] relative ${
					isHovered ? 'bg-secondary' : ''
				}`}
			>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center flex flex-col items-center gap-3">
					<Image className="w-6" />
					<Button
						variant="ghost"
						type="button"
						onClick={handleButtonClick}
					>
						Drag & drop images here
					</Button>
				</div>
			</div>

			<div className="flex flex-wrap gap-4 mt-2">
				{images.map((image, index) => (
					<div className="space-y-3" key={`${id}_thumb_${index}`}>
						<div className="overflow-hidden rounded-md">
							<img
								src={image.preview}
								alt={image.name}
								className="h-auto w-[150px] object-cover transition-all hover:scale-105 aspect-square"
							/>
						</div>

						<div className="space-y-2 text-sm">
							<div className="text-xs">{image.name}</div>
							<div className="flex justify-between">
								<p className="text-xs text-muted-foreground">
									{formatFileSize(image.size)}
								</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export { IMGDropzone };
