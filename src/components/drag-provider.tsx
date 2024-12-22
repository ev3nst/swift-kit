import { useState, useEffect, useRef, useCallback } from 'react';

import { listen } from '@tauri-apps/api/event';

import {
	DragEventContext,
	DragEventProviderProps,
	TauriDragEvent,
} from '@/contexts/drag-events-context';

export const DragEventProvider: React.FC<DragEventProviderProps> = ({
	children,
}) => {
	const [isHovered, setIsHovered] = useState<boolean>(false);
	const [currentFiles, setCurrentFiles] = useState<{ [key: string]: string[] }>({});
	const dropZoneRefs = useRef<Map<string, React.RefObject<HTMLDivElement>>>(
		new Map(),
	);

	const getActiveDragId = () => {
		for (const [id, dropZoneRef] of dropZoneRefs.current.entries()) {
			if (dropZoneRef.current) {
				const dropZoneRect =
					dropZoneRef.current.getBoundingClientRect();

				const isVisible =
					dropZoneRect.top >= 0 &&
					dropZoneRect.left >= 0 &&
					dropZoneRect.bottom <= window.innerHeight &&
					dropZoneRect.right <= window.innerWidth;
				if (isVisible) {
					return id;
				}
			}
		}
	};

	const handleDragFilesChange = (id: string, files: string[]): void => {
		setCurrentFiles((prevState) => ({
			...prevState,
			[id]: files,
		  }));
	};

	const checkIfHovered = (x: number, y: number): boolean => {
		// Loop through dropZoneRefs to check if the cursor is over any drop zone
		for (const [, dropZoneRef] of dropZoneRefs.current.entries()) {
			if (dropZoneRef.current) {
				const dropZoneRect =
					dropZoneRef.current.getBoundingClientRect();
				if (
					x >= dropZoneRect.left &&
					x <= dropZoneRect.right &&
					y >= dropZoneRect.top &&
					y <= dropZoneRect.bottom
				) {
					return true;
				}
			}
		}
		return false;
	};

	const setupDragEvents = useCallback(() => {
		const handleDragEnterOrOver = (event: TauriDragEvent) => {
			const { x, y } = event.payload.position;
			// Check if the cursor is over any drop zone
			setIsHovered(checkIfHovered(x, y));
		};

		const handleDragLeave = (event: TauriDragEvent) => {
			const { x, y } = event.payload.position;
			// Check if the cursor has left the bounds of all drop zones
			setIsHovered(checkIfHovered(x, y));
		};

		const handleDragDrop = (event: TauriDragEvent) => {
			const filePaths = event.payload.paths || [];
			handleDragFilesChange(getActiveDragId(), filePaths);
			setIsHovered(false); // Reset hover state after drop
		};

		// Register the event listeners
		listen('tauri://drag-enter', handleDragEnterOrOver);
		listen('tauri://drag-over', handleDragEnterOrOver);
		listen('tauri://drag-leave', handleDragLeave);
		listen('tauri://drag-drop', handleDragDrop);

		// Cleanup listeners when the component unmounts
		return () => {
			// Clean up event listeners here if necessary
		};
	}, []);

	useEffect(() => {
		// Set up the drag events when the app loads
		const cleanup = setupDragEvents();

		return () => {
			cleanup();
		};
	}, [setupDragEvents]);

	const addDropZoneRef = (
		id: string,
		ref: React.RefObject<HTMLDivElement>,
	): void => {
		dropZoneRefs.current.set(id, ref);
	};

	const removeDropZoneRef = (id: string): void => {
		dropZoneRefs.current.delete(id);
	};

	return (
		<DragEventContext.Provider
			value={{
				isHovered,
				currentFiles,
				handleDragFilesChange,
				addDropZoneRef,
				removeDropZoneRef,
			}}
		>
			{children}
		</DragEventContext.Provider>
	);
};
