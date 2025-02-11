import { createContext, ReactNode } from 'react';

export interface TauriDragEvent {
	payload: {
		position: {
			x: number;
			y: number;
		};
		paths?: string[];
	};
}

export interface DragEventContextType {
	isHovered: boolean;
	currentFiles: { [key: string]: string[] };
	handleDragFilesChange: (key: string, files: string[]) => void;
	addDropZoneRef: (id: string, ref: React.RefObject<HTMLDivElement>) => void;
	removeDropZoneRef: (id: string) => void;
}

export const DragEventContext = createContext<DragEventContextType | undefined>(
	undefined,
);

export interface DragEventProviderProps {
	children: ReactNode;
}
