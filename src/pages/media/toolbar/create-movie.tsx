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

const createMovieSchema = z.object({
	title: z.string().min(1, {
		message: 'Title is required.',
	}),
	year: z.string().min(4, {
		message: 'Year is required.',
	}),
	release_date: z.string().min(4, {
		message: 'Release date is required.',
	}),
	genre: z.string().min(1, {
		message: 'Genre is required.',
	}),
	description: z.string().nullable(),
	plot: z.string().nullable(),
	cover: z.string().nullable(),
	poster: z.string().nullable(),
	duration: z.string().nullable(),
	country: z.string().nullable(),
	imdb_rating: z.any().nullable(),
	personal_rating: z.any().nullable(),
	director: z.string().nullable(),
	writers: z.string().nullable(),
	actors: z.string().nullable(),
	other_images: z.string().nullable(),
	trailer: z.any().nullable(),
	scraped_url: z.string().nullable(),
});

type MovieData = {
	title: string;
	href: string;
	cover: string;
};

export function CreateMovie({ closeDialog }) {
	const [searchMovieData, setSearchMovieData] = useState<MovieData[]>([]);
	const [overrideCache, setOverrideCache] = useState(false);
	const [fetchLoading, setFetchLoading] = useState(false);

	const form = useForm({
		resolver: zodResolver(createMovieSchema),
		defaultValues: {
			title: '',
			year: '',
			release_date: '',
			genre: '',
			description: '',
			plot: '',
			cover: '',
			poster: '',
			duration: '',
			country: '',
			imdb_rating: '',
			personal_rating: '',
			director: '',
			writers: '',
			actors: '',
			other_images: '',
			trailer: '',
			scraped_url: '',
		},
	});

	const { setValue, getValues } = form;

	let otherImagesData = [];
	const otherImages = getValues('other_images');
	if (otherImages) {
		otherImagesData = JSON.parse(otherImages);
	}

	const title = getValues('title');
	const year = getValues('year');
	const coverImage = getValues('cover');
	const posterImage = getValues('poster');

	function onSubmit(data: z.infer<typeof createMovieSchema>) {
		console.log('onSubmit:', data);
		console.log('closeDialog:', closeDialog);
	}

	async function fetchWithTitle() {
		if (title !== null && title.length > 0) {
			setFetchLoading(true);
			console.log('fetchWithTitle:', { title, overrideCache });
			const resp = []; // fetch data from IMDB
			setSearchMovieData(resp);
			setFetchLoading(false);
		}
	}

	async function onTitleSelect(movieData) {
		if (!fetchLoading) {
			setFetchLoading(true);
			console.log('onTitleSelect:', { movieData, overrideCache });
			const fetchedData = {}; // fetch data from IMDB
			const fetchedKeys = Object.keys(fetchedData);
			for (let fki = 0; fki < fetchedKeys.length; fki += 1) {
				const key = fetchedKeys[fki];

				if (
					typeof fetchedData[key] !== 'undefined' &&
					fetchedData[key] !== null
				) {
					setValue(key as any, fetchedData[key]);
				}
			}

			setFetchLoading(false);
			setSearchMovieData([]);
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
												placeholder="Movie Name"
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
											onClick={() => {
												console.log(
													'openExternal:',
													movieData.href,
												);
											}}
										>
											<ExternalLink className="w-5" />
										</div>
									</div>
								))}
							</div>
						)}
						<div className="grid grid-cols-3 gap-5 items-baseline">
							<FormField
								control={form.control}
								name="release_date"
								render={({ field }) => (
									<FormItem className="grid gap-1">
										<FormLabel className="flex gap-2 items-center text-sky-600">
											<div>
												Release Date
												<span className="ms-1 text-destructive">
													*
												</span>
											</div>
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
											<div>
												Year
												<span className="ms-1 text-destructive">
													*
												</span>
											</div>
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
											<Input
												placeholder="Duration in minutes"
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
							name="genre"
							render={({ field }) => (
								<FormItem className="grid gap-1">
									<FormLabel className="text-sky-600">
										<div>
											Genre
											<span className="ms-1 text-destructive">
												*
											</span>
										</div>
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
						<FormField
							control={form.control}
							name="plot"
							render={({ field }) => (
								<FormItem className="grid gap-1">
									<FormLabel className="text-sky-600">
										Plot
									</FormLabel>
									<FormControl>
										<Textarea
											rows={5}
											placeholder="Synopsis or plot of the movie."
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
											console.log(
												'openExternal:',
												coverImage,
											)
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
															console.log(
																'openExternal:',
																`https://www.themoviedb.org/search?query=${encodeURIComponent(
																	`${title}${
																		year
																			? ` y:${year}`
																			: ''
																	}`,
																)}`,
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
											console.log(
												'openExternal:',
												posterImage,
											)
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
								name="country"
								render={({ field }) => (
									<FormItem className="grid gap-1">
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
								name="imdb_rating"
								render={({ field }) => (
									<FormItem className="grid gap-1">
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
							name="director"
							render={({ field }) => (
								<FormItem className="grid gap-1">
									<FormLabel className="flex gap-2 items-center text-sky-600">
										Director
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
										Writers
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
										Actors
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
												onClick={() =>
													console.log(
														'openExternal:',
														`https://www.youtube.com/results?search_query=${encodeURIComponent(
															`${title} ${
																year ? year : ''
															} trailer`,
														)}`,
													)
												}
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
											console.log('openExternal:', oid)
										}
										className="max-h-[120px] cursor-pointer hover:brightness-125 rounded-sm"
										src={oid}
									/>
								))}
							</div>
						)}
					</div>
					<Button variant="secondary" type="submit">
						Submit
					</Button>
				</form>
			</Form>
		</>
	);
}
