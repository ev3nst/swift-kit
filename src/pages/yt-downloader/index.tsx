import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Download, Folder, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { invoke } from '@tauri-apps/api/core';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/form';
import { Progress } from '@/components/progress';
import { Button } from '@/components/button';
import { Input } from '@/components/input';

import { MediaItem } from './media-item';

const formSchema = z.object({
	yt_url: z.string().nonempty({ message: 'URL is required' }),
	download_rate: z.coerce.number().optional().nullable(),
	output_path: z.string().nonempty({ message: 'Output path is required' }),
});

type YTFetchResponse = {
	url: string;
	content_type: string;
	title: string;
	thumbnail?: string;
	uploader?: string;
	videos?: {
		url: string;
		title: string;
		thumbnail: string;
		uploader: string;
	}[];
	yt_dlp_execution?: string;
	json_parse_execution?: string;
};

const YTDownloader = () => {
	const [processLoading, setProcessLoading] = useState(false);
	const [ytData, setYTData] = useState<YTFetchResponse>();
	const [ytDataLoading, setYTDataLoading] = useState(false);

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			yt_url: '',
			download_rate: '',
			output_path: '',
		},
	});

	const { getValues } = form;

	async function getYTURLData() {
		try {
			setYTDataLoading(true);
			const { yt_url } = getValues();
			const data: YTFetchResponse = await invoke('yt_url_data', {
				url: yt_url,
			});
			console.log(data, 'data');
			setYTData(data);
			setYTDataLoading(false);
		} catch (error) {
			console.error(error);
			toast.error(error);
			setProcessLoading(false);
		}
	}

	function onSubmit(data) {
		// yet to be implemented
		try {
			setProcessLoading(true);
			console.log(data, 'data');
			setProcessLoading(true);
		} catch (error) {
			console.error(error);
			toast.error(error);
			setProcessLoading(false);
		}
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

							<p className="text-destructive">
								YT DLP: {ytData?.yt_dlp_execution}
							</p>
							<p className="text-destructive">
								JSON PARSE: {ytData?.json_parse_execution}
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
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="flex gap-4 items-start">
								<FormField
									control={form.control}
									name="output_path"
									render={({ field }) => (
										<FormItem className="grid gap-1 flex-grow">
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
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="download_rate"
									render={({ field }) => (
										<FormItem className="grid gap-1 w-[200px]">
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
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{typeof ytData === 'undefined' ||
							typeof ytData.content_type === 'undefined' ? (
								<Button
									type="button"
									variant="secondary"
									className={clsx(
										'w-full',
										ytDataLoading && 'disabled',
									)}
									disabled={ytDataLoading}
									onClick={getYTURLData}
								>
									Fetch YT Data
								</Button>
							) : (
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
							)}
						</div>
					</div>
				</form>
			</Form>
			<div className="mt-5 flex flex-col gap-3">
				<div>Progress:</div>
				<Progress value={0} />
				<Button className="w-[120px]" type="button" variant="secondary">
					View Details
				</Button>
				<div className="flex flex-wrap pb-4 gap-4">
					{typeof ytData !== 'undefined' &&
						typeof ytData.content_type !== 'undefined' &&
						ytData.content_type === 'playlist' &&
						ytData.videos.map(media => (
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
