import { useEffect, useState } from 'react';
import { useMaskito } from '@maskito/react';
import { maskitoDateRangeOptionsGenerator } from '@maskito/kit';

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/select';
import { Input } from '@/components/input';
import { MultiSelect } from '@/components/multi-select';

const dateRangeMaskOptions = maskitoDateRangeOptionsGenerator({
	mode: 'dd/mm/yyyy',
	dateSeparator: '/',
});

export function Filter({ mediaStore }) {
	const [genres, setGenres] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [date, setDate] = useState<string>();
	const maskedInputRef = useMaskito({
		options: dateRangeMaskOptions,
	});

	const { setFilters } = mediaStore();

	useEffect(() => {
		setFilters(prevState => ({
			...prevState,
			search: searchQuery,
		}));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchQuery]);

	return (
		<div className="flex flex-col gap-3 mb-5">
			<div className="flex flex-1 items-center space-x-2">
				<Input
					placeholder="Filter content..."
					value={searchQuery}
					onChange={event => setSearchQuery(event.target.value)}
					className="h-8 w-[150px] lg:w-[250px]"
				/>
				<Select>
					<SelectTrigger className="w-[130px] h-8">
						<SelectValue placeholder="" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value={undefined as unknown as string}>
								Rating (All)
							</SelectItem>
							<SelectItem value="9">Rating: 9+</SelectItem>
							<SelectItem value="8">Rating: 8+</SelectItem>
							<SelectItem value="7">Rating: 7+</SelectItem>
							<SelectItem value="6">Rating: 6+</SelectItem>
							<SelectItem value="5">Rating: 5+</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
			<div className="flex flex-1 items-center space-x-2">
				<Input
					ref={maskedInputRef}
					value={date}
					onChange={event => setDate(event.target.value)}
					placeholder="Year"
					className="h-8 w-[150px]"
				/>
				<MultiSelect
					title="Genre"
					selectedValues={genres}
					options={[
						{ label: 'Action', value: 'action' },
						{ label: 'Adventure', value: 'adventure' },
						{ label: 'Comedy', value: 'comedy' },
					]}
					onChange={newValues => {
						setGenres(newValues);
					}}
				/>
			</div>
		</div>
	);
}
