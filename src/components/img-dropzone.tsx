import { useRef, useEffect } from 'react';
import { Image } from 'lucide-react';

import { useDragEvent } from '@/hooks/use-drag-event';

export type DroppedFile = {
	path: string;
	preview: string;
	name: string;
	size: number;
	mime: string;
};

const IMGDropzone = ({ handleFilesStateChange, id }) => {
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
		<div
			ref={dropZoneRef}
			className={`border-2 border-dashed w-full h-[150px] relative ${isHovered ? 'bg-secondary' : ''}`}
		>
			<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center flex flex-col items-center gap-3">
				<Image className="w-6" />
				<p>Drag & drop images here, or click to select</p>
			</div>
		</div>
	);
};

export { IMGDropzone };
