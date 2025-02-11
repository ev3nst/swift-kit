import { useContext } from 'react';

import {
	DragEventContext,
	DragEventContextType,
} from '@/contexts/drag-events-context';

export const useDragEvent = (): DragEventContextType => {
	const context = useContext(DragEventContext);
	if (!context) {
		throw new Error('useDragEvent must be used within a DragEventProvider');
	}
	return context;
};
