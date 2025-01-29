import { create } from 'zustand';

interface NotesStore {
	noteIds: number[];
	currentNote: { id: number | null } | null;
	setNoteIds: (noteIds: number[]) => void;
	setCurrentNote: (currentNote: { id: number } | null) => void;
}

export const useNotesStore = create<NotesStore>(set => ({
	currentNote: {
		id: null,
		content: '',
	},
	noteIds: [],
	setCurrentNote: currentNote => set(() => ({ currentNote })),
	setNoteIds: noteIds => set(() => ({ noteIds })),
}));
