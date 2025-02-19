import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FileIcon, PauseIcon, SearchIcon } from 'lucide-react';
import { toast } from 'sonner';

import { emit, listen } from '@tauri-apps/api/event';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/select';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { Loading } from '@/components/loading';
import { ScrollToTop } from '@/components/scroll-to-top';

import api from '@/lib/api';

const finderSchema = z.object({
	search_term: z.string().min(3, {
		message: 'Search term needs to be at least 3 characters long.',
	}),
	disk: z.string().optional(),
});

const Finder = () => {
	const [processLoading, setProcessLoading] = useState(false);
	const [disks, setDisks] = useState<string[]>([]);
	const [results, setResults] = useState<string[]>([]);
	const [resultFilter, setResultFilter] = useState<string>('');
	const form = useForm<z.infer<typeof finderSchema>>({
		resolver: zodResolver(finderSchema),
		defaultValues: {
			search_term: '',
			disk: '*',
		},
	});

	const search_term = form.watch('search_term');
	useEffect(() => {
		(async () => setDisks(await api.get_available_disks()))();
	}, []);

	useEffect(() => {
		const unlisten = listen<string>('search-result', event => {
			setResults(prevResults => [...prevResults, event.payload]);
		});

		return () => {
			unlisten.then(f => f());
		};
	}, []);

	const onStopRequest = async () => {
		await emit('cancel_search');
	};

	async function onSubmit(data: z.infer<typeof finderSchema>) {
		setProcessLoading(true);
		setResults([]);
		try {
			const start = Date.now();
			await api.finder(data.search_term, data.disk);
			const end = Date.now();
			const durationInSeconds = (end - start) / 1000;
			toast.success(`Search finished in ${durationInSeconds} seconds.`);
		} catch (error) {
			try {
				toast.error(String(error));
			} catch (_e) {}
			console.error(error);
		} finally {
			setProcessLoading(false);
		}
	}

	const resultsFiltered = results.filter(rs =>
		resultFilter.length > 0
			? rs.toLocaleLowerCase().includes(resultFilter)
				? rs
				: undefined
			: rs,
	);

	return (
		<Form {...form}>
			<form
				className="grid gap-5 w-full"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<div className="flex items-start gap-3 w-full max-w-full">
					<FormField
						control={form.control}
						name="search_term"
						render={({ field }) => (
							<FormItem className="grid gap-1 flex-grow relative">
								<div className="flex items-center">
									<FormLabel className="flex gap-2 items-center">
										File Name (Search Term)
										<div className="relative">
											<FileIcon className="w-3.5 h-3.5 bottom-[-8px] left-0 absolute" />
										</div>
									</FormLabel>
								</div>
								<FormControl>
									<Input
										disabled={processLoading}
										placeholder="eg. my-file.txt"
										{...field}
									/>
								</FormControl>
								<FormMessage className="absolute text-xs bottom-[-16px]" />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="disk"
						render={({ field }) => (
							<FormItem className="grid gap-1 w-[150px]">
								<FormLabel>Disk</FormLabel>
								<Select
									disabled={processLoading}
									onValueChange={field.onChange}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="All (*)" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="*">
											All (*)
										</SelectItem>
										{disks.map((d, di) => (
											<SelectItem
												key={`finder_disk_${di}`}
												value={d}
											>
												{d}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormItem>
						)}
					/>
					{processLoading && (
						<Button
							type="button"
							variant="secondary"
							size="icon"
							className="self-end"
							onClick={onStopRequest}
						>
							<PauseIcon />
						</Button>
					)}
					<Button
						type="submit"
						variant="info"
						size="icon"
						className={
							processLoading ? 'self-end disabled' : 'self-end'
						}
						disabled={processLoading}
					>
						{processLoading ? (
							<Loading timeoutMs={250} className="mb-0" />
						) : (
							<SearchIcon />
						)}
					</Button>
				</div>

				{results.length > 0 && (
					<div className="h-full w-full">
						<Input
							type="text"
							placeholder="Filter"
							value={resultFilter}
							spellCheck={false}
							onChange={e => {
								setResultFilter(
									e.target.value.toLocaleLowerCase(),
								);
							}}
						/>
						<div className="flex flex-col max-h-full w-full overflow-y-scroll gap-0 mt-5">
							<div className="flex gap-4 items-center font-bold mb-2 text-sm">
								<span className="text-blue-500">
									Results: ({results.length})
								</span>
								<span>
									{resultFilter.length > 0
										? `Filtered: ${resultsFiltered.length}`
										: ''}
								</span>
							</div>
							<div className="h-full w-full">
								{resultsFiltered.map((r, ri) => (
									<div
										key={`finder_result_${ri}`}
										className="flex flex-wrap text-xs p-2 border-t hover:cursor-pointer hover:bg-secondary"
										onClick={async () => {
											await api.highlight_file(r);
										}}
									>
										{r
											.split(
												new RegExp(`(${search_term})`),
											)
											.map((rst, rsti) => (
												<div
													key={`finder_results_${ri}_${rsti}`}
													className={
														rst.includes(
															search_term,
														)
															? 'text-green-300 text-wrap flex flex-wrap break-all'
															: 'text-wrap flex flex-wrap break-all'
													}
												>
													{rst}
												</div>
											))}
									</div>
								))}
							</div>
						</div>
						<ScrollToTop />
					</div>
				)}
			</form>
		</Form>
	);
};

export default Finder;
