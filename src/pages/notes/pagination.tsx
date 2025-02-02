import { useState } from 'react';
import {
	ChevronLeftIcon,
	ChevronsLeftIcon,
	ChevronRightIcon,
	ChevronsRightIcon,
} from 'lucide-react';

import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
} from '@/components/pagination';

type NotesPaginationProps = {
	items: {
		id: number;
		title: string;
	}[];
};

import { Note } from '@/lib/db';

export function NotesPagination({ items }: NotesPaginationProps): JSX.Element {
	const itemsPerPage = 1;
	const totalPages = Math.ceil(items.length / itemsPerPage);
	const [currentPage, setCurrentPage] = useState<number>(1);

	if (items.length === 0) {
		return <></>;
	}

	const handlePrevious = (): void => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	const handleNext = async () => {
		console.log(await Note.getAll());
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
			<p className="text-sm text-muted-foreground">
				Total: {items.length}
			</p>
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
