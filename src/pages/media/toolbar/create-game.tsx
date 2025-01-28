import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
	CalendarIcon,
	CircleUserRoundIcon,
	ExternalLink,
	FileImageIcon,
	Gamepad2Icon,
	ImageIcon,
	ImagesIcon,
	LoaderCircleIcon,
	PenToolIcon,
	SearchIcon,
	StarIcon,
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

const createGameSchema = z.object({
	title: z.string().min(1, {
		message: 'Title is required.',
	}),
	release_date: z.string().min(4, {
		message: 'Release date is required.',
	}),
	genre: z.string().min(1, {
		message: 'Genre is required.',
	}),
	description: z.string().nullable(),
	cover: z.string().nullable(),
	poster: z.string().nullable(),
	personal_rating: z.any().nullable(),
	publisher: z.string().nullable(),
	developer: z.string().nullable(),
	other_images: z.string().nullable(),
	trailer: z.any().nullable(),
	scraped_url: z.string().nullable(),
});

type GameData = {
	title: string;
	href: string;
	cover: string;
};

export function CreateGame({ closeDialog }) {
	const [searchGameData, setSearchGameData] = useState<GameData[]>([]);
	const [overrideCache, setOverrideCache] = useState(false);
	const [fetchLoading, setFetchLoading] = useState(false);

	const form = useForm({
		resolver: zodResolver(createGameSchema),
		defaultValues: {
			title: '',
			release_date: '',
			genre: '',
			description: '',
			cover: '',
			poster: '',
			personal_rating: '',
			publisher: '',
			developer: '',
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
	const releaseDate = getValues('release_date');
	const coverImage = getValues('cover');
	const posterImage = getValues('poster');

	function onSubmit(data: z.infer<typeof createGameSchema>) {
		console.log('onSubmit:', data);
		console.log('closeDialog:', closeDialog);
	}

	async function fetchWithTitle() {
		if (title !== null && title.length > 0) {
			setFetchLoading(true);
			console.log('fetchWithTitle:', { title, overrideCache });
			const resp = []; // fetch data from STEAM
			setSearchGameData(resp);
			setFetchLoading(false);
		}
	}

	async function onTitleSelect(gameData) {
		if (!fetchLoading) {
			setFetchLoading(true);
			console.log('onTitleSelect:', { gameData, overrideCache });
			const fetchedData = {}; // fetch data from STEAM
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
			setSearchGameData([]);
		}
	}

	return (
		<>
			<DialogHeader>
				<DialogTitle className="flex gap-2 items-center">
					New Game Record <Gamepad2Icon className="w-4" />
				</DialogTitle>
				<DialogDescription>
					Search icon next to title will fetch possible records from
					Steam and auto-fill the inputs for you.
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
												placeholder="Game Name"
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

						{searchGameData.length > 0 && (
							<div className="flex flex-col gap-3">
								<p>
									You may select one of the given options to
									auto-fill the form.
								</p>
								{searchGameData.map(gameData => (
									<div
										key={`search_game_${gameData.href}`}
										className="flex items-center gap-5"
									>
										<img
											className="h-5"
											src="/steam-logo.jpg"
										/>
										<img
											className="aspect-square object-cover h-10"
											src={gameData.cover}
										/>
										<h6
											onClick={() =>
												onTitleSelect(gameData)
											}
											className={
												fetchLoading
													? 'text-gray-400'
													: 'hover:underline cursor-pointer'
											}
										>
											{gameData.title}
										</h6>
										<div
											className="hover:text-sky-600 cursor-pointer"
											onClick={() => {
												console.log(
													'openExternal:',
													gameData.href,
												);
											}}
										>
											<ExternalLink className="w-5" />
										</div>
									</div>
								))}
							</div>
						)}
						<div className="grid grid-cols-2 gap-5 items-baseline">
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
											placeholder="Short description of the game."
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
																'openExternal: poster',
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
							<FormField
								control={form.control}
								name="publisher"
								render={({ field }) => (
									<FormItem className="grid gap-1">
										<FormLabel className="flex gap-2 items-center text-sky-600">
											Publisher
											<div className="relative">
												<CircleUserRoundIcon className="w-4 h-4 bottom-[-8px] left-0 absolute" />
											</div>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Activition, Ubisoft ..."
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="developer"
								render={({ field }) => (
									<FormItem className="grid gap-1">
										<FormLabel className="flex gap-2 items-center text-sky-600">
											Developer
											<div className="relative">
												<PenToolIcon className="w-4 h-4 bottom-[-8px] left-0 absolute" />
											</div>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="CD Projekt Red, Rockstar Games ..."
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
																releaseDate
																	? releaseDate
																	: ''
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
