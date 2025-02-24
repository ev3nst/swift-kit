import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
	CalendarMinus2,
	CircleUserRoundIcon,
	ExternalLink,
	FileImageIcon,
	ImageIcon,
	LoaderCircleIcon,
	SearchIcon,
	SparklesIcon,
	StarHalfIcon,
	StarIcon,
	TimerIcon,
	VideoIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import {
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/dialog';
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormDescription,
	FormMessage,
} from '@/components/form';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { Textarea } from '@/components/textarea';
import { Checkbox } from '@/components/checkbox';
import { Loading } from '@/components/loading';

import { MediaCache } from '@/lib/models/media-cache';
import api, { MediaQueryR } from '@/lib/api';
import { AnimeModel } from '@/lib/models/anime';

const createAnimeSchema = z.object({
	scraped_url: z.string().optional(),
	franchise: z.string().optional(),
	title: z.string().min(1, {
		message: 'Title is required.',
	}),
	original_title: z.string().optional(),
	year: z
		.number()
		.min(4, {
			message: 'Year is required.',
		})
		.optional(),
	genre: z.string().optional(),
	description: z.string().optional(),
	episodes: z.number().optional(),
	cover: z.string().optional(),
	poster: z.string().optional(),
	trailer: z.string().optional(),
	duration: z.string().optional(),
	studios: z.string().optional(),
	mal_rating: z.number().optional(),
	personal_rating: z.number().optional(),
});

export function CreateAnime({ closeDialog }) {
	const [searchAnimeData, setSearchAnimeData] = useState<MediaQueryR[]>([]);
	const [overrideCache, setOverrideCache] = useState(false);
	const [approved, setApproved] = useState(false);
	const [fetchLoading, setFetchLoading] = useState(false);
	const [processLoading, setProcessLoading] = useState(false);

	const form = useForm<z.infer<typeof createAnimeSchema>>({
		resolver: zodResolver(createAnimeSchema),
		defaultValues: {
			title: '',
		},
	});

	const { setValue, getValues, watch } = form;

	const title = watch('title');
	const year = getValues('year');
	const coverImage = getValues('cover');
	const posterImage = getValues('poster');

	async function fetchWithTitle() {
		if (title !== null && title.length > 0) {
			setFetchLoading(true);

			try {
				if (!overrideCache) {
					const cache = await MediaCache.get('anime', title);
					if (cache) {
						setSearchAnimeData(cache.result_json);
						setFetchLoading(false);
						return;
					}
				}

				const results = await api.search_anime(title);
				if (
					typeof results !== 'undefined' &&
					Array.isArray(results) &&
					results.length > 0
				) {
					await MediaCache.save(
						'anime',
						title,
						JSON.stringify(results),
					);
					setSearchAnimeData(results);
				}
			} catch (error) {
				try {
					toast.error(String(error));
				} catch (_e) {}
			} finally {
				setFetchLoading(false);
			}
		}
	}

	async function onTitleSelect(animeQueryR: MediaQueryR) {
		if (!fetchLoading) {
			setFetchLoading(true);
			try {
				const fetchedData = await api.scrape_anime(animeQueryR.href);
				const fetchedKeys = Object.keys(fetchedData);
				setValue('scraped_url', animeQueryR.href);
				for (let fki = 0; fki < fetchedKeys.length; fki += 1) {
					const key = fetchedKeys[fki];

					if (
						typeof fetchedData[key] !== 'undefined' &&
						fetchedData[key] !== null &&
						fetchedData[key] !== ''
					) {
						setValue(key as any, fetchedData[key]);
					}
				}

				setSearchAnimeData([]);
			} catch (error) {
				try {
					toast.error(String(error));
				} catch (_e) {}
			} finally {
				setFetchLoading(false);
			}
		}
	}

	async function onSubmit(data: any) {
		setProcessLoading(true);
		try {
			data.scraped_url = data.scraped_url!.replace(/\/$/, '');
			data.approved = approved ? 1 : 0;
			const newMovie = new AnimeModel(data as any);
			await newMovie.save();
			closeDialog();
		} catch (error) {
			try {
				toast.error(String(error));
			} catch (_e) {}
		} finally {
			setProcessLoading(false);
		}
	}

	return (
		<>
			<DialogHeader>
				<DialogTitle className="flex gap-2 items-center">
					New Anime Record <SparklesIcon className="w-4" />
				</DialogTitle>
				<DialogDescription>
					Search icon next to title will fetch possible records from
					MAL and auto-fill the inputs for you.
				</DialogDescription>
			</DialogHeader>
			<Form {...form}>
				<form
					className="mx-0.5 mt-3"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<div className="flex flex-col gap-5">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem className="grid gap-1">
									<FormLabel className="flex justify-between">
										<div className="flex items-center text-sky-600">
											Title
											<span className="ms-1 text-destructive">
												*
											</span>
											{fetchLoading && (
												<LoaderCircleIcon className="ms-2 h-4 w-4 animate-spin" />
											)}
										</div>
										<div className="flex items-center space-x-2">
											<label
												htmlFor="overrideCache"
												className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-primary"
											>
												Override Cache
											</label>
											<Checkbox
												id="overrideCache"
												checked={overrideCache}
												onCheckedChange={checkedValue => {
													setOverrideCache(
														checkedValue as any,
													);
												}}
											/>
										</div>
									</FormLabel>
									<FormControl>
										<div className="flex items-center justify-between gap-2">
											<Input
												autoFocus
												autoComplete="off"
												placeholder="Anime Name"
												onKeyDown={e => {
													if (e.key === 'Enter') {
														e.preventDefault();
														fetchWithTitle();
													}
												}}
												disabled={fetchLoading}
												{...field}
											/>

											<Button
												variant="outline"
												type="button"
												onClick={() => fetchWithTitle()}
											>
												<SearchIcon className="w-4" />
											</Button>
										</div>
									</FormControl>
									<FormDescription>
										Fetching resource will show you options
										to auto-fill.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{searchAnimeData.length > 0 && (
							<div className="flex flex-col gap-3">
								<p>
									You may select one of the given options to
									auto-fill the form.
								</p>
								{searchAnimeData.map(animeData => (
									<div
										key={`search_anime_${animeData.href}`}
										className="flex items-center gap-5"
									>
										<img
											className="h-5"
											src="/mal-logo.png"
										/>
										<img
											className="aspect-square object-cover h-10"
											src={animeData.cover}
										/>
										<h6
											onClick={() =>
												onTitleSelect(animeData)
											}
											className={
												fetchLoading
													? 'text-gray-400'
													: 'hover:underline cursor-pointer'
											}
										>
											{animeData.title}
										</h6>
										<div
											className="hover:text-sky-600 cursor-pointer"
											onClick={() =>
												api.open_external_url(
													animeData.href,
												)
											}
										>
											<ExternalLink className="w-5" />
										</div>
									</div>
								))}
							</div>
						)}

						<FormField
							control={form.control}
							name="original_title"
							render={({ field }) => (
								<FormItem className="grid gap-1">
									<FormLabel className="text-sky-600">
										<div>Original Title</div>
									</FormLabel>
									<FormControl>
										<Input
											placeholder="Original Anime Name"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="franchise"
							render={({ field }) => (
								<FormItem className="grid gap-1">
									<FormLabel className="text-sky-600">
										<div>Franchise</div>
									</FormLabel>
									<FormControl>
										<Input
											placeholder="Base name to group seasons"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex gap-5 items-baseline">
							<FormField
								control={form.control}
								name="genre"
								render={({ field }) => (
									<FormItem className="grid gap-1 flex-grow">
										<FormLabel className="text-sky-600">
											<div>Genre</div>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Action, Adventure, Horror, Comedy ..."
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="year"
								render={({ field }) => (
									<FormItem className="grid gap-1 w-[150px]">
										<FormLabel className="flex gap-2 items-center text-sky-600">
											<div>Year</div>
											<div className="relative">
												<CalendarMinus2 className="w-4 h-4 bottom-[-8px] left-0 absolute" />
											</div>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="----"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="duration"
								render={({ field }) => (
									<FormItem className="grid gap-1 w-[150px]">
										<FormLabel className="flex gap-2 items-center text-sky-600">
											Duration
											<div className="relative">
												<TimerIcon className="w-4 h-4 bottom-[-7px] left-0 absolute" />
											</div>
										</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem className="grid gap-1">
									<FormLabel className="text-sky-600">
										Description
									</FormLabel>
									<FormControl>
										<Textarea
											rows={3}
											placeholder="Short description of the anime."
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="grid grid-cols-2 gap-5 items-baseline">
							<div>
								<FormField
									control={form.control}
									name="cover"
									render={({ field }) => (
										<FormItem className="grid gap-1">
											<FormLabel className="flex gap-2 items-center text-sky-600">
												Cover
												<div className="relative">
													<FileImageIcon className="w-4 h-4 bottom-[-8px] left-0 absolute" />
												</div>
											</FormLabel>
											<FormControl>
												<Input
													placeholder="URL of the image"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								{coverImage && (
									<img
										onClick={() =>
											api.open_external_url(coverImage)
										}
										className="max-h-[100px] cursor-pointer hover:brightness-125 mt-2"
										src={coverImage}
									/>
								)}
							</div>
							<div>
								<FormField
									control={form.control}
									name="poster"
									render={({ field }) => (
										<FormItem className="grid gap-1">
											<FormLabel className="flex justify-between items-center relative">
												<div className="flex gap-2 items-center text-sky-600">
													Poster
													<div className="relative">
														<ImageIcon className="w-4 h-4 bottom-[-8px] left-0 absolute" />
													</div>
												</div>
												{title && (
													<div
														className="flex items-center gap-3 cursor-pointer hover:underline absolute right-0 text-primary"
														onClick={() => {
															const poster_link = `https://www.theanimedb.org/search?query=${encodeURIComponent(
																`${title}${
																	year
																		? ` y:${year}`
																		: ''
																}`,
															)}`;
															api.open_external_url(
																poster_link,
															);
														}}
													>
														Find posters here
														<ExternalLink className="w-4" />
													</div>
												)}
											</FormLabel>
											<FormControl>
												<Input
													placeholder="URL of the image"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								{posterImage && (
									<img
										onClick={() =>
											api.open_external_url(posterImage)
										}
										className="max-h-[100px] cursor-pointer hover:brightness-125 mt-2"
										src={posterImage}
									/>
								)}
							</div>
						</div>
						<div className="grid grid-cols-3 gap-5 items-baseline">
							<FormField
								control={form.control}
								name="episodes"
								render={({ field }) => (
									<FormItem className="grid gap-1">
										<FormLabel className="flex gap-2 items-center text-sky-600">
											Episodes (Number)
											<div className="relative">
												<StarHalfIcon className="w-4 h-4 bottom-[-8px] left-0 absolute" />
											</div>
										</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="mal_rating"
								render={({ field }) => (
									<FormItem className="grid gap-1">
										<FormLabel className="flex gap-2 items-center text-sky-600">
											MAL Rating
											<div className="relative">
												<StarHalfIcon className="w-4 h-4 bottom-[-8px] left-0 absolute" />
											</div>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="*.*"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="personal_rating"
								render={({ field }) => (
									<FormItem className="grid gap-1">
										<FormLabel className="flex gap-2 items-center text-sky-600">
											Personal Rating
											<div className="relative">
												<StarIcon className="w-4 h-4 bottom-[-8px] left-0 absolute" />
											</div>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="*.*"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<FormField
							control={form.control}
							name="studios"
							render={({ field }) => (
								<FormItem className="grid gap-1">
									<FormLabel className="flex gap-2 items-center text-sky-600">
										Studios
										<div className="relative">
											<CircleUserRoundIcon className="w-4 h-4 bottom-[-8px] left-0 absolute" />
										</div>
									</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="trailer"
							render={({ field }) => (
								<FormItem className="grid gap-1">
									<FormLabel className="flex justify-between items-center relative">
										<div className="flex gap-2 items-center text-sky-600">
											Trailer Video (Iframe URL)
											<div className="relative">
												<VideoIcon className="w-4 h-4 bottom-[-8px] left-0 absolute" />
											</div>
										</div>
										{title && (
											<div
												className="flex items-center gap-3 cursor-pointer hover:underline absolute right-0 text-primary"
												onClick={() => {
													const yt_link = `https://www.youtube.com/results?search_query=${encodeURIComponent(
														`${title} ${
															year ? year : ''
														} trailer`,
													)}`;
													api.open_external_url(
														yt_link,
													);
												}}
											>
												Find trailers here
												<ExternalLink className="w-4" />
											</div>
										)}
									</FormLabel>

									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="flex items-center justify-between gap-5 mt-3">
						<Button
							className={
								processLoading ? 'w-full disabled' : 'w-full'
							}
							disabled={processLoading}
							variant="secondary"
							type="submit"
						>
							Submit
							{processLoading && (
								<Loading timeoutMs={250} className="mb-0" />
							)}
						</Button>
						<div>
							<div className="flex gap-3 w-[200px]">
								<label
									htmlFor="approved"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-primary"
								>
									Approved
								</label>
								<Checkbox
									id="approved"
									checked={approved}
									onCheckedChange={checkedValue => {
										setApproved(checkedValue as any);
									}}
								/>
							</div>
							<p className="text-xs">
								Marks the data as valid for personal tracking.
							</p>
						</div>
					</div>
				</form>
			</Form>
		</>
	);
}
