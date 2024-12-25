import { useRef, useEffect } from 'react';
import { Image } from 'lucide-react';

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
	const { isHovered, currentFiles, addDropZoneRef, removeDropZoneRef } =
		useDragEvent();

	useEffect(() => {
		// Register this drop zone's reference when it mounts
		addDropZoneRef(id, dropZoneRef);

		// Clean up the reference when the component unmounts
		return () => {
			removeDropZoneRef(id);
		};
	}, [id, addDropZoneRef, removeDropZoneRef]);

	useEffect(() => {
		handleFilesStateChange(id, currentFiles[id]);
	}, [currentFiles, handleFilesStateChange, id]);

	return (
		<>
			<div
				ref={dropZoneRef}
				className={`border-2 border-dashed w-full h-[150px] relative ${isHovered ? 'bg-secondary' : ''}`}
			>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center flex flex-col items-center gap-3">
					<Image className="w-6" />
					<p>Drag & drop images here</p>
				</div>
			</div>

			<div className="flex flex-wrap gap-4">
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
		</>
	);
};

export { IMGDropzone };
