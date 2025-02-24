import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
	CalendarIcon,
	CalendarMinus2,
	CircleUserRoundIcon,
	ExternalLink,
	FileImageIcon,
	FilmIcon,
	ImageIcon,
	ImagesIcon,
	LoaderCircleIcon,
	PenToolIcon,
	SearchIcon,
	StarHalfIcon,
	StarIcon,
	TimerIcon,
	VenetianMaskIcon,
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
import { MovieModel } from '@/lib/models/movie';

const createMovieSchema = z.object({
	scraped_url: z.string().optional(),
	title: z.string().min(1, {
		message: 'Title is required.',
	}),
	franchise: z.string().optional(),
	description: z.string().optional(),
	keywords: z.string().optional(),
	release_date: z.string().min(4, {
		message: 'Release date is required.',
	}),
	year: z
		.number()
		.min(4, {
			message: 'Year is required.',
		})
		.optional(),
	duration: z.string().optional(),
	genre: z.string().optional(),
	actors: z.string().optional(),
	writers: z.string().optional(),
	directors: z.string().optional(),
	cover: z.string().optional(),
	imdb_rating: z.number().optional(),
	country: z.string().optional(),
	language: z.string().optional(),
	other_images: z.string().optional(),
	personal_rating: z.number().optional(),
	trailer: z.string().optional(),
	poster: z.string().optional(),
});

export function CreateMovie({ closeDialog }) {
	const [searchMovieData, setSearchMovieData] = useState<MediaQueryR[]>([]);
	const [overrideCache, setOverrideCache] = useState(false);
	const [approved, setApproved] = useState(false);
	const [processLoading, setProcessLoading] = useState(false);
	const [fetchLoading, setFetchLoading] = useState(false);

	const form = useForm<z.infer<typeof createMovieSchema>>({
		resolver: zodResolver(createMovieSchema),
		defaultValues: {
			title: '',
		},
	});

	const { setValue, getValues, watch } = form;

	let otherImagesData: string[] = [];
	const otherImages = getValues('other_images');
	if (otherImages) {
		otherImagesData = otherImages.split(', ');
	}

	const title = watch('title');
	const year = getValues('year');
	const coverImage = getValues('cover');
	const posterImage = getValues('poster');

	async function fetchWithTitle() {
		if (title !== null && title.length > 0) {
			setFetchLoading(true);
			try {
				if (!overrideCache) {
					const cache = await MediaCache.get('movie', title);
					if (cache) {
						setSearchMovieData(cache.result_json);
						setFetchLoading(false);
						return;
					}
				}

				const results = await api.search_movie(title);
				if (
					typeof results !== 'undefined' &&
					Array.isArray(results) &&
					results.length > 0
				) {
					await MediaCache.save(
						'movie',
						title,
						JSON.stringify(results),
					);
					setSearchMovieData(results);
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

	async function onTitleSelect(movieQueryR: MediaQueryR) {
		if (!fetchLoading) {
			setFetchLoading(true);
			try {
				const fetchedData = await api.scrape_movie(movieQueryR.href);
				const fetchedKeys = Object.keys(fetchedData);
				setValue('scraped_url', movieQueryR.href);
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

				setSearchMovieData([]);
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
			const newMovie = new MovieModel(data as any);
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
					New Movie Record <FilmIcon className="w-4" />
				</DialogTitle>
				<DialogDescription>
					Search icon next to title will fetch possible records from
					IMDB and auto-fill the inputs for you.
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
												placeholder="Movie Name"
												autoComplete="off"
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

						{searchMovieData.length > 0 && (
							<div className="flex flex-col gap-3">
								<p>
									You may select one of the given options to
									auto-fill the form.
								</p>
								{searchMovieData.map(movieData => (
									<div
										key={`search_movie_${movieData.href}`}
										className="flex items-center gap-5"
									>
										<img
											className="h-5"
											src="/imdb-logo.jpg"
										/>
										<img
											className="aspect-square object-cover h-10"
											src={movieData.cover}
										/>
										<h6
											onClick={() =>
												onTitleSelect(movieData)
											}
											className={
												fetchLoading
													? 'text-gray-400'
													: 'hover:underline cursor-pointer'
											}
										>
											{movieData.title}
										</h6>
										<div
											className="hover:text-sky-600 cursor-pointer"
											onClick={() =>
												api.open_external_url(
													movieData.href,
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
							name="franchise"
							render={({ field }) => (
								<FormItem className="grid gap-1 flex-grow">
									<FormLabel className="text-sky-600">
										<div>Franchise</div>
									</FormLabel>
									<FormControl>
										<Input
											placeholder="eg. Marvel, LOTR"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="grid grid-cols-3 gap-5 items-baseline">
							<FormField
								control={form.control}
								name="release_date"
								render={({ field }) => (
									<FormItem className="grid gap-1">
										<FormLabel className="flex gap-2 items-center text-sky-600">
											<div>Release Date</div>
											<div className="relative">
												<CalendarIcon className="w-4 h-4 bottom-[-8px] left-0 absolute" />
											</div>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="dd/mm/YYYY"
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
									<FormItem className="grid gap-1">
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
									<FormItem className="grid gap-1">
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
						<div className="flex gap-4 items-end">
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
								name="keywords"
								render={({ field }) => (
									<FormItem className="grid gap-1 flex-grow">
										<FormLabel className="text-sky-600">
											<div>Keywords</div>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Space, Survival ..."
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
							name="description"
							render={({ field }) => (
								<FormItem className="grid gap-1">
									<FormLabel className="text-sky-600">
										Description
									</FormLabel>
									<FormControl>
										<Textarea
											rows={3}
											placeholder="Short description of the movie."
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
															const poster_link = `https://www.themoviedb.org/search?query=${encodeURIComponent(
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
						<div className="flex gap-5 items-baseline">
							<FormField
								control={form.control}
								name="country"
								render={({ field }) => (
									<FormItem className="grid gap-1 flex-grow">
										<FormLabel className="flex gap-2 items-center text-sky-600">
											Country
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
								name="language"
								render={({ field }) => (
									<FormItem className="grid gap-1 flex-grow">
										<FormLabel className="flex gap-2 items-center text-sky-600">
											Language
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
								name="imdb_rating"
								render={({ field }) => (
									<FormItem className="grid gap-1 w-[120px]">
										<FormLabel className="flex gap-2 items-center text-sky-600">
											IMDB Rating
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
									<FormItem className="grid gap-1 w-[120px]">
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
							name="directors"
							render={({ field }) => (
								<FormItem className="grid gap-1">
									<FormLabel className="flex gap-2 items-center text-sky-600">
										Director(s)
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
							name="writers"
							render={({ field }) => (
								<FormItem className="grid gap-1">
									<FormLabel className="flex gap-2 items-center text-sky-600">
										Writer(s)
										<div className="relative">
											<PenToolIcon className="w-4 h-4 bottom-[-8px] left-0 absolute" />
										</div>
									</FormLabel>
									<FormControl>
										<Input
											placeholder="John Doe, Michael Smith ..."
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="actors"
							render={({ field }) => (
								<FormItem className="grid gap-1">
									<FormLabel className="flex gap-2 items-center text-sky-600">
										Actor(s)
										<div className="relative">
											<VenetianMaskIcon className="w-4 h-4 bottom-[-8px] left-0 absolute" />
										</div>
									</FormLabel>
									<FormControl>
										<Input
											placeholder="Emily Doe, Jane Smith ..."
											{...field}
										/>
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
						<FormField
							control={form.control}
							name="other_images"
							render={({ field }) => (
								<FormItem className="grid gap-1">
									<FormLabel className="flex gap-2 items-center text-sky-600">
										Other Images
										<div className="relative">
											<ImagesIcon className="w-4 h-4 bottom-[-8px] left-0 absolute" />
										</div>
									</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{otherImagesData && (
							<div className="grid grid-cols-3 gap-2">
								{otherImagesData.map(oid => (
									<img
										key={`other_images_${oid}`}
										onClick={() =>
											api.open_external_url(oid)
										}
										className="max-h-[120px] cursor-pointer hover:brightness-125 rounded-sm"
										src={oid}
									/>
								))}
							</div>
						)}
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
