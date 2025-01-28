import { useState } from 'react';
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

export function Filter() {
	const [genres, setGenres] = useState([]);
	const [persons, setPersons] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [date, setDate] = useState<string>();
	const maskedInputRef = useMaskito({
		options: dateRangeMaskOptions,
	});

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
				<Input
					ref={maskedInputRef}
					value={date}
					onChange={event => setDate(event.target.value)}
					placeholder="Date Range"
					className="h-8 w-[185px]"
				/>
			</div>
			<div className="flex flex-1 items-center space-x-2">
				<MultiSelect
					title="Persons"
					selectedValues={persons}
					options={[
						{ label: 'Jason Stathom', value: 'jason-stathom' },
						{ label: 'Brad Pitt', value: 'brad-pitt' },
						{ label: 'Margot Robbie', value: 'margot-robbie' },
					]}
					onChange={newValues => {
						setPersons(newValues);
					}}
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
