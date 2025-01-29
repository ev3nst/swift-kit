import { useEffect, useCallback } from 'react';
import { FilePlus2, FileX } from 'lucide-react';

import { Button } from '@/components/button';
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/pagination';
import { Tiptap } from '@/components/tiptap';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tooltip';

import { useNotesStore } from '@/store/notes';

function getAdjacentNumber(arr: number[], number: number, direction) {
	let result: number;

	arr.forEach(num => {
		if (
			direction === 'previous' &&
			num < number &&
			(result === null || num > result)
		) {
			result = num;
		} else if (
			direction === 'next' &&
			num > number &&
			(result === null || num < result)
		) {
			result = num;
		}
	});

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	return result as number;
}

function ShowPagination({
	noteIds,
	currentPage,
}: {
	noteIds: any[];
	currentPage: number;
}) {
	const { setCurrentNote } = useNotesStore();
	const noteIndexes = Object.keys(noteIds) as any;
	const previousPage = getAdjacentNumber(
		noteIndexes,
		currentPage,
		'previous',
	);
	const nextPage = getAdjacentNumber(noteIndexes, currentPage, 'next');
	const numbersToShow: any[] = [noteIndexes[0]];
	const currentPageIndex = noteIndexes.findIndex(fi => fi === currentPage);
	let minIndex = currentPageIndex - 1;
	let maxIndex = currentPageIndex + 1;
	if (minIndex < 1) {
		maxIndex += Math.abs(minIndex - 1);
	}

	if (maxIndex > noteIndexes.length - 3) {
		minIndex -= maxIndex - noteIndexes.length + 2;
		if (noteIndexes.length > 5) {
			numbersToShow.push('...');
		}
	} else if (currentPageIndex > 1 && noteIndexes.length > 5) {
		numbersToShow.push('...');
	}

	for (let ni = 1; ni < noteIndexes.length; ni++) {
		if (currentPageIndex === ni) {
			numbersToShow.push(noteIndexes[ni]);
		}

		if (ni >= minIndex && ni < currentPageIndex) {
			numbersToShow.push(noteIndexes[ni]);
		}

		if (
			ni > currentPageIndex &&
			ni >= minIndex &&
			ni <= maxIndex &&
			ni !== currentPageIndex
		) {
			numbersToShow.push(noteIndexes[ni]);
		}
	}

	if (currentPageIndex - 2 < 0 && noteIndexes.length > 5) {
		numbersToShow.push('...');
	} else if (
		currentPageIndex < noteIndexes.length - 3 &&
		noteIndexes.length > 5
	) {
		numbersToShow.push('...');
	}

	if (!numbersToShow.includes(noteIndexes[noteIndexes.length - 1])) {
		numbersToShow.push(noteIndexes[noteIndexes.length - 1]);
	}

	return (
		<Pagination>
			<PaginationContent>
				<PaginationItem className="disabled">
					<PaginationPrevious
						size="sm"
						className={!previousPage ? 'disabled' : ''}
					/>
				</PaginationItem>

				{numbersToShow.map((ns, nsi) => (
					<PaginationItem key={`notes_pagination_${nsi}`}>
						{ns === '...' ? (
							<PaginationEllipsis />
						) : (
							<PaginationLink
								isActive={Number(ns) === currentPage}
								onClick={async () => {
									setCurrentNote(noteIds[ns]);
								}}
							>
								{Number(ns) + 1}
							</PaginationLink>
						)}
					</PaginationItem>
				))}

				<PaginationItem>
					<PaginationNext
						size="sm"
						className={!nextPage ? 'disabled' : ''}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}

function Notes() {
	const { currentNote, noteIds, setCurrentNote, setNoteIds } =
		useNotesStore();

	const fetchNoteIds = useCallback(() => {
		const fetchedNotesData: any[] = [];
		const fetchedNotesIds = fetchedNotesData.map(nd => nd.id);
		setNoteIds(fetchedNotesIds);
		if (fetchedNotesIds.length > 0) {
			setCurrentNote(fetchedNotesIds[0]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		fetchNoteIds();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function onNewNoteAdd() {
		const newNote = null;
		fetchNoteIds();
		setCurrentNote(newNote);
	}

	function onNoteRemove() {
		console.log('onNoteRemove');
	}

	const currentPage = Object.values(noteIds).findIndex(
		(niv: number) => niv === currentNote?.id,
	);

	return (
		<div className="flex overflow-y-auto">
			<div className="w-full flex flex-col">
				<div className="mb-4 flex justify-between w-full">
					<div className="flex">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="icon"
									className=" px-0 me-2"
									onClick={() => onNewNoteAdd()}
								>
									<FilePlus2 className="h-[1rem] w-[1rem]" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Create New</p>
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="icon"
									className=" px-0 me-2"
									onClick={() => onNoteRemove()}
								>
									<FileX className="h-[1rem] w-[1rem]" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Delete Current</p>
							</TooltipContent>
						</Tooltip>
					</div>

					{noteIds.length > 0 && (
						<ShowPagination
							noteIds={noteIds}
							currentPage={currentPage}
						/>
					)}
				</div>

				<Tiptap />
			</div>
		</div>
	);
}

export default Notes;
