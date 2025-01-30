import { useState } from 'react';
import {
	FilePlus2,
	FileX,
	ChevronLeftIcon,
	ChevronsLeftIcon,
	ChevronRightIcon,
	ChevronsRightIcon,
} from 'lucide-react';

import { Tiptap } from '@/components/tiptap';
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
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
} from '@/components/pagination';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tooltip';
import { Button } from '@/components/button';

import { buttonVariants } from '@/lib/utils';

type NotesPaginationProps = {
	totalItems: number;
};

export function NotesPagination({
	totalItems,
}: NotesPaginationProps): JSX.Element {
	const itemsPerPage = 1; // Fixed number of items per page
	const totalPages = Math.ceil(totalItems / itemsPerPage);
	const [currentPage, setCurrentPage] = useState<number>(1);

	const handlePrevious = (): void => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	const handleNext = (): void => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1);
		}
	};

	const handleFirst = (): void => {
		setCurrentPage(1);
	};

	const handleLast = (): void => {
		setCurrentPage(totalPages);
	};

	const renderPageLinks = (): JSX.Element[] => {
		const pageLinks: JSX.Element[] = [];

		if (currentPage + 1 > totalPages - 1) {
			pageLinks.push(
				<PaginationItem key={currentPage - 2}>
					<PaginationLink
						href="#"
						onClick={() => setCurrentPage(currentPage - 2)}
					>
						{currentPage - 2}
					</PaginationLink>
				</PaginationItem>,
			);
		}

		if (currentPage > 2) {
			pageLinks.push(
				<PaginationItem key={currentPage - 1}>
					<PaginationLink
						href="#"
						onClick={() => setCurrentPage(currentPage - 1)}
					>
						{currentPage - 1}
					</PaginationLink>
				</PaginationItem>,
			);
		}

		pageLinks.push(
			<PaginationItem key={currentPage}>
				<PaginationLink href="#" isActive>
					{currentPage}
				</PaginationLink>
			</PaginationItem>,
		);

		if (currentPage < totalPages - 1) {
			pageLinks.push(
				<PaginationItem key={currentPage + 1}>
					<PaginationLink
						href="#"
						onClick={() => setCurrentPage(currentPage + 1)}
					>
						{currentPage + 1}
					</PaginationLink>
				</PaginationItem>,
			);
		}

		if (currentPage + 1 < totalPages - 1 && currentPage < 3) {
			pageLinks.push(
				<PaginationItem key={currentPage + 2}>
					<PaginationLink
						href="#"
						onClick={() => setCurrentPage(currentPage + 2)}
					>
						{currentPage + 2}
					</PaginationLink>
				</PaginationItem>,
			);
		}

		return pageLinks;
	};

	return (
		<div className="flex gap-2 items-center">
			<p className="text-sm text-muted-foreground">Total: 12</p>
			<Pagination>
				<PaginationContent>
					<PaginationItem>
						<PaginationLink
							href="#"
							onClick={handleFirst}
							className={currentPage === 1 ? 'disabled' : ''}
						>
							<ChevronsLeftIcon />
						</PaginationLink>
					</PaginationItem>

					<PaginationItem>
						<PaginationLink
							href="#"
							onClick={handlePrevious}
							className={currentPage === 1 ? 'disabled' : ''}
						>
							<ChevronLeftIcon />
						</PaginationLink>
					</PaginationItem>

					{renderPageLinks()}

					<PaginationItem>
						<PaginationLink
							href="#"
							onClick={handleNext}
							className={
								currentPage === totalPages ? 'disabled' : ''
							}
						>
							<ChevronRightIcon />
						</PaginationLink>
					</PaginationItem>

					<PaginationItem>
						<PaginationLink
							href="#"
							onClick={handleLast}
							className={
								currentPage === totalPages ? 'disabled' : ''
							}
						>
							<ChevronsRightIcon />
						</PaginationLink>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}

function Notes() {
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
									<AlertDialogCancel>
										Cancel
									</AlertDialogCancel>
									<AlertDialogAction
										className={buttonVariants({
											variant: 'destructive',
										})}
										onClick={() =>
											console.log('note remove')
										}
									>
										Delete
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
					<NotesPagination totalItems={12} />
				</div>
				<Tiptap />
			</div>
		</div>
	);
}

export default Notes;
