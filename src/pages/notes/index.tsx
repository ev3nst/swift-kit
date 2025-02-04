import { useEffect, useRef, useState } from 'react';
import { FilePlus2, FileX } from 'lucide-react';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tooltip';
import { Button } from '@/components/button';
import { Tiptap } from '@/components/tiptap';
import { Input } from '@/components/input';

import { Note } from '@/lib/models/note';
import { buttonVariants, cn } from '@/lib/utils';

function Notes() {
	const updateTimeoutRef = useRef<NodeJS.Timeout>();
	const [notes, setNotes] = useState<Pick<Note, 'id' | 'title'>[]>([]);
	const [note, setNote] = useState<
		Pick<Note, 'id' | 'title' | 'content' | 'created_at' | 'updated_at'>
	>({} as any);

	useEffect(() => {
		(async () => setNotes(await Note.getAll()))();
	}, []);

	useEffect(() => {
		if (typeof note.id === 'undefined' && notes.length > 0) {
			(async () => {
				const initialNote = await Note.get(notes[0].id);
				setNote(initialNote);
			})();
		}
	}, [note.id, notes]);

	function debounceUpdateNote(note) {
		if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
		updateTimeoutRef.current = setTimeout(async () => {
			await (note as Note).update();
		}, 500);
	}

	const handleEditorChange = newContent => {
		note.content = newContent;
		setNote(note);
		debounceUpdateNote(note);
	};

	return (
		<div className="grid grid-cols-4 gap-4">
			<div className="min-w-[250px] col-span-1 flex flex-col gap-2">
				{notes
					.sort((n, n2) => n.id - n2.id)
					.map(item => (
						<button
							key={`notes_${item.id}`}
							className={cn(
								'flex items-center gap-2 rounded-lg border h-11 px-3 text-sm transition-all hover:bg-accent',
								item.id === note?.id && 'bg-muted',
							)}
							onClick={async () => {
								const fetchNote = await Note.get(item.id);
								setNote(fetchNote);
							}}
						>
							<div className="flex w-full flex-col gap-1">
								<div className="flex items-center">
									<div className="flex items-center gap-2">
										<div
											className={cn(
												'ml-auto text-sm',
												item.id === note?.id
													? 'text-foreground'
													: 'text-muted-foreground',
											)}
										>
											{item.id === note.id
												? note.title
												: item.title}
										</div>
									</div>
								</div>
							</div>
						</button>
					))}
			</div>
			<div className="col-span-3">
				<div className="flex gap-3 mb-4">
					<Input
						key={`note_title_${note.id}`}
						className="h-11 flex-grow"
						type="text"
						name="title"
						placeholder="Title for the note"
						value={note.title}
						spellCheck={false}
						disabled={!note.id}
						onChange={e => {
							const findIndex = notes.findIndex(
								ns => ns.id === note.id,
							);
							notes[findIndex].title = e.currentTarget.value;
							setNote({
								...note,
								title: e.currentTarget.value,
								// @ts-ignore
								update: note.update,
							});
							note.title = e.currentTarget.value;
							debounceUpdateNote(note);
						}}
					/>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="outline"
								size="icon"
								className="h-11 px-5"
								onClick={async () => {
									const newNote = await Note.insert({
										title:
											'New note - ' + (notes.length + 1),
										content: 'Content...',
									});
									setNotes(await Note.getAll());
									setNote(newNote);
								}}
							>
								<FilePlus2 className="h-8 w-8" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Create New</p>
						</TooltipContent>
					</Tooltip>

					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								variant="outline"
								size="icon"
								className={`h-11 px-5 ${
									!note?.id ? 'disabled' : ''
								}`}
								disabled={!note?.id}
							>
								<FileX className="h-8 w-8" />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									Are you absolutely sure?
								</AlertDialogTitle>
								<AlertDialogDescription>
									This action cannot be undone. This will
									permanently delete current active note.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									className={buttonVariants({
										variant: 'destructive',
									})}
									onClick={async () => {
										await (note as Note).delete();
										const notesList = await Note.getAll();
										setNotes(notesList);
										if (notesList.length > 0) {
											setNote(
												await Note.get(notesList[0].id),
											);
										} else {
											setNote({
												title: '',
												content: '',
											} as any);
										}
									}}
								>
									Delete
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
				{note.id && (
					<Tiptap
						key={`note_tiptap_${note.id}`}
						value={note.content}
						onChange={handleEditorChange}
					/>
				)}
			</div>
		</div>
	);
}

export default Notes;
