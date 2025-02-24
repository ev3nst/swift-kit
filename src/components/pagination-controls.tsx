import React from 'react';
import { ChevronFirst, ChevronLast } from 'lucide-react';

import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
	PaginationEllipsis,
} from '@/components/pagination';
import { Button } from '@/components/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/select';

interface PaginationControlsProps {
	currentPage: number;
	totalItems: number;
	perPage: number;
	onPageChange: (page: number) => void;
	onPerPageChange: (perPage: number) => void;
	perPageOptions?: number[];
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
	currentPage,
	totalItems,
	perPage,
	onPageChange,
	onPerPageChange,
	perPageOptions = [10, 20, 30, 50],
}) => {
	const totalPages = Math.ceil(totalItems / perPage);
	const startItem = (currentPage - 1) * perPage + 1;
	const endItem = Math.min(currentPage * perPage, totalItems);

	// Calculate which page numbers to show
	const getPageNumbers = () => {
		const pageNumbers: number[] = [];
		const maxVisible = 3; // Show 3 page numbers at a time

		let startPage = Math.max(currentPage - Math.floor(maxVisible / 2), 1);
		const endPage = Math.min(startPage + maxVisible - 1, totalPages);

		// Adjust start page if end page is maxed out
		startPage = Math.max(endPage - maxVisible + 1, 1);

		for (let i = startPage; i <= endPage; i++) {
			pageNumbers.push(i);
		}

		return pageNumbers;
	};

	const pageNumbers = getPageNumbers();

	return (
		<div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4">
			<div className="flex flex-col sm:flex-row items-center gap-4">
				<div className="flex items-center gap-2">
					<span className="text-sm font-medium">Per Page:</span>
					<Select
						value={perPage.toString()}
						onValueChange={value => onPerPageChange(Number(value))}
					>
						<SelectTrigger className="w-20">
							<SelectValue placeholder={perPage.toString()} />
						</SelectTrigger>
						<SelectContent>
							{perPageOptions.map(option => (
								<SelectItem
									key={option}
									value={option.toString()}
								>
									{option}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="text-sm text-gray-500">
					Viewing {totalItems > 0 ? startItem : 0}-{endItem} of{' '}
					{totalItems} items
				</div>
			</div>

			<Pagination>
				<PaginationContent>
					<PaginationItem>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onPageChange(1)}
							disabled={currentPage === 1}
							aria-label="Go to first page"
						>
							<ChevronFirst className="h-4 w-4" />
						</Button>
					</PaginationItem>

					<PaginationItem>
						<PaginationPrevious
							onClick={() => onPageChange(currentPage - 1)}
							disabled={currentPage === 1}
						/>
					</PaginationItem>

					{pageNumbers[0] > 1 && (
						<PaginationItem>
							<PaginationEllipsis />
						</PaginationItem>
					)}

					{pageNumbers.map(page => (
						<PaginationItem key={page}>
							<PaginationLink
								isActive={page === currentPage}
								onClick={() => onPageChange(page)}
							>
								{page}
							</PaginationLink>
						</PaginationItem>
					))}

					{pageNumbers[pageNumbers.length - 1] < totalPages && (
						<PaginationItem>
							<PaginationEllipsis />
						</PaginationItem>
					)}

					<PaginationItem>
						<PaginationNext
							onClick={() => onPageChange(currentPage + 1)}
							disabled={currentPage >= totalPages}
						/>
					</PaginationItem>

					<PaginationItem>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onPageChange(totalPages)}
							disabled={currentPage >= totalPages}
							aria-label="Go to last page"
						>
							<ChevronLast className="h-4 w-4" />
						</Button>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
};
