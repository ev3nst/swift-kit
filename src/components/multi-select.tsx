import { type LucideIcon, Check, PlusCircle } from 'lucide-react';

import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from '@/components/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/popover';
import { Separator } from '@/components/separator';

import { cn } from '@/lib/utils';

interface MultiSelectOpt {
	label: string;
	value: string;
	icon?: LucideIcon;
}

interface MultiSelectProps {
	title?: string;
	options: MultiSelectOpt[];
	selectedValues: MultiSelectOpt[];
	onChange: (selectedValues: any) => void;
}

function MultiSelect({
	title,
	options,
	selectedValues,
	onChange,
}: MultiSelectProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="h-8 border-dashed"
				>
					<PlusCircle />
					{title}
					{selectedValues?.length > 0 && (
						<>
							<Separator
								orientation="vertical"
								className="mx-2 h-4"
							/>
							<Badge
								variant="secondary"
								className="rounded-sm px-1 font-normal lg:hidden"
							>
								{selectedValues.length}
							</Badge>
							<div className="hidden space-x-1 lg:flex">
								{selectedValues.length > 2 ? (
									<Badge
										variant="secondary"
										className="rounded-sm px-1 font-normal"
									>
										{selectedValues.length} selected
									</Badge>
								) : (
									options
										.filter(
											option =>
												selectedValues.filter(
													sv =>
														sv.value ===
														option.value,
												).length > 0,
										)
										.map(option => (
											<Badge
												variant="secondary"
												key={option.value}
												className="rounded-sm px-1 font-normal"
											>
												{option.label}
											</Badge>
										))
								)}
							</div>
						</>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0" align="start">
				<Command>
					<CommandInput placeholder={title} />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup>
							{options.map(option => {
								const isSelected =
									selectedValues.filter(
										sv => sv.value === option.value,
									).length > 0;

								return (
									<CommandItem
										key={option.value}
										onSelect={() => {
											let filterValues: any = [];
											if (isSelected) {
												const findIndex =
													selectedValues.findIndex(
														sv =>
															sv.value ===
															option.value,
													);
												filterValues = [
													...selectedValues,
												];
												filterValues.splice(
													findIndex,
													1,
												);
											} else {
												filterValues = [
													...selectedValues,
												];
												filterValues.push(option);
											}

											onChange(filterValues);
										}}
									>
										<div
											className={cn(
												'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
												isSelected
													? 'bg-primary text-primary-foreground'
													: 'opacity-50 [&_svg]:invisible',
											)}
										>
											<Check />
										</div>
										{option.icon && (
											<option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
										)}
										<span>{option.label}</span>
									</CommandItem>
								);
							})}
						</CommandGroup>
						{selectedValues.length > 0 && (
							<>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem
										onSelect={() => onChange([])}
										className="justify-center text-center"
									>
										Clear filters
									</CommandItem>
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

export { MultiSelect };
