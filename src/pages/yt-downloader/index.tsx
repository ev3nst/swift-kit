import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Download, Folder, Link2 } from 'lucide-react';
import { clsx } from 'clsx';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from '@/components/form';
import { Progress } from '@/components/progress';
import { Button } from '@/components/button';
import { Input } from '@/components/input';

import { MediaItem } from './media-item';

const examplePlaylistData = [
	{
		id: 'dQw4w9WgXcQ',
		url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
		title: 'Rick Astley - Never Gonna Give You Up',
		uploader: 'RickAstleyVEVO',
		uploader_id: 'RickAstleyVEVO',
		playlist: 'Never Gonna Give You Up',
		playlist_id: 'PL9tY0BWXOZFvdH9QHWgl7V5v73zwrtsqg',
		thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
	},
	{
		id: 'JwYX52BP2Sk',
		url: 'https://www.youtube.com/watch?v=JwYX52BP2Sk',
		title: 'Rick Astley - Together Forever',
		uploader: 'RickAstleyVEVO',
		uploader_id: 'RickAstleyVEVO',
		playlist: 'Never Gonna Give You Up',
		playlist_id: 'PL9tY0BWXOZFvdH9QHWgl7V5v73zwrtsqg',
		thumbnail: 'https://i.ytimg.com/vi/JwYX52BP2Sk/hqdefault.jpg',
	},
	{
		id: 'JkK8g6FMEXE',
		url: 'https://www.youtube.com/watch?v=JkK8g6FMEXE',
		title: 'Rick Astley - Whenever You Need Somebody',
		uploader: 'RickAstleyVEVO',
		uploader_id: 'RickAstleyVEVO',
		playlist: 'Never Gonna Give You Up',
		playlist_id: 'PL9tY0BWXOZFvdH9QHWgl7V5v73zwrtsqg',
		thumbnail: 'https://i.ytimg.com/vi/JkK8g6FMEXE/hqdefault.jpg',
	},
];

const YTDownloader = () => {
	const [processLoading, setProcessLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	const form = useForm({
		defaultValues: {
			yt_url: '',
			download_rate: '',
			output_path: '',
		},
	});

	function onSubmit(data) {
		console.log(data);
	}

	return (
		<div>
			<Form {...form}>
				<form
					className="grid gap-5"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<div className="grid gap-6">
						<div className="grid gap-2 text-center">
							<h1 className="text-3xl font-bold mb-5">
								Youtube Downloader
							</h1>
							<p className="text-balance text-muted-foreground">
								Provide necessary information to start
								downloading process. Playlists are also
								supported.
							</p>
						</div>
						<div className="grid gap-5">
							<FormField
								control={form.control}
								name="yt_url"
								render={({ field }) => (
									<FormItem className="grid gap-1">
										<FormLabel className="flex gap-2 items-center">
											URL
											<div className="relative">
												<Link2 className="w-4 h-4 bottom-[-7px] left-0 absolute" />
											</div>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="eg. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="output_path"
								render={({ field }) => (
									<FormItem className="grid gap-1">
										<div className="flex items-center">
											<FormLabel className="flex gap-2 items-center">
												Output Path
												<div className="relative">
													<Folder className="w-4 h-4 bottom-[-7px] left-0 absolute" />
												</div>
											</FormLabel>
										</div>
										<FormControl>
											<Input
												placeholder="Default downloads folder is set if left empty"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="download_rate"
								render={({ field }) => (
									<FormItem className="grid gap-1">
										<div className="flex items-center">
											<FormLabel className="flex gap-2 items-center">
												Download Rate
												<div className="relative">
													<Download className="w-4 h-4 bottom-[-7px] left-0 absolute" />
												</div>
											</FormLabel>
										</div>
										<FormControl>
											<Input
												placeholder="KB/s"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<Button
								type="submit"
								variant="secondary"
								className={clsx(
									'w-full',
									processLoading && 'disabled',
								)}
								disabled={processLoading}
							>
								Start
							</Button>
						</div>
						{errorMessage && (
							<div className="text-center text-sm text-destructive">
								{errorMessage}
							</div>
						)}
					</div>
				</form>
			</Form>
			<div className="mt-5 flex flex-col gap-3">
				<div>Progress:</div>
				<Progress value={60} />
				<Button className="w-[120px]" type="button" variant="secondary">
					View Details
				</Button>
				<div className="flex flex-wrap pb-4 gap-4">
					{examplePlaylistData.map(media => (
						<MediaItem
							key={media.title}
							media={media}
							className="min-w-[150px] w-[150px]"
							aspectRatio="square"
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default YTDownloader;
