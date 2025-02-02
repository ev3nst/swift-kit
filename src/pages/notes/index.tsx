import { useEffect, useState } from 'react';
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

import { buttonVariants } from '@/lib/utils';
import { Note } from '@/lib/db';

import { NotesPagination } from './pagination';

function Notes() {
	const [notes, setNotes] = useState<Pick<Note, 'id' | 'title'>[]>([]);
	const [content, setContent] = useState('');

	const handleChange = newContent => {
		setContent(newContent);
	};

	useEffect(() => {
		(async () => setNotes(await Note.getAll()))();
	}, []);

	return (
		<div className="flex flex-col">
			<div className="mb-4 flex justify-between">
				<div className="flex">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="outline"
								size="icon"
								className=" px-0 me-2"
								onClick={() => console.log('create new')}
							>
								<FilePlus2 className="h-[1rem] w-[1rem]" />
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
								className=" px-0 me-2"
							>
								<FileX className="h-[1rem] w-[1rem]" />
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
									onClick={() => console.log('note remove')}
								>
									Delete
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
				<NotesPagination items={notes} />
			</div>
			<Tiptap value={content} onChange={handleChange} />
		</div>
	);
}

export default Notes;
