import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Download, Folder, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/form';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { PageHeader } from '@/components/page-header';
import { MediaItem } from '@/pages/media-item';

function isValidUrl(url) {
	try {
		new URL(url);
		return true;
	} catch (_e) {
		return false;
	}
}

const formSchema = z.object({
	yt_url: z
		.string()
		.nonempty({ message: 'URL is required' })
		.url({ message: 'Must be a valid URL.' }),
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
};

const pageTitle = 'Youtube Downloader';
const pageDescription =
	'Provide necessary information to start downloading process. Playlists are also supported.';
const YTDownloader = () => {
	const [processLoading, setProcessLoading] = useState(false);
	const [ytData, setYTData] = useState<YTFetchResponse>();
	const [ytDataLoading, setYTDataLoading] = useState(false);
	const [downloadProgress, setDownloadProgress] = useState<string>('');

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			yt_url: '',
			download_rate: '',
			output_path: '',
		},
	});

	useEffect(() => {
		const unlisten = listen<string>('download-progress', event => {
			setDownloadProgress(event.payload);
		});

		return () => {
			unlisten.then(f => f());
		};
	}, []);

	const { getValues, watch } = form;
	const { output_path } = getValues();
	const yt_url = watch('yt_url');

	async function getYTURLData() {
		try {
			setYTDataLoading(true);
			const data: YTFetchResponse = await invoke('yt_url_data', {
				url: yt_url,
				drop_cache: false,
			});
			setYTData(data);
			setYTDataLoading(false);
		} catch (error) {
			console.error(error);
			toast.error(error);
			setYTDataLoading(false);
		}
	}

	async function onSubmit(data) {
		try {
			setProcessLoading(true);
			await invoke('download_yt_videos', {
				url: data.yt_url,
				output_path: data.output_path,
				download_rate: data.download_rate,
			});
			toast.success('Download completed successfully');
			setProcessLoading(false);
		} catch (error) {
			console.error(error);
			toast.error(error);
			setProcessLoading(false);
		}
	}
	return (
		<Form {...form}>
			<form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
				<div className="grid gap-6">
					<PageHeader
						title={pageTitle}
						description={pageDescription}
					/>
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

						<div className="flex gap-4">
							{typeof output_path !== 'undefined' &&
								output_path !== '' &&
								typeof yt_url !== 'undefined' &&
								yt_url !== '' && (
									<Button
										type="submit"
										variant="secondary"
										className={clsx(
											'flex-grow',
											(processLoading ||
												!isValidUrl(yt_url)) &&
												'disabled',
										)}
										disabled={
											processLoading ||
											!isValidUrl(yt_url)
										}
									>
										Start
									</Button>
								)}
							<Button
								type="button"
								variant="secondary"
								className={clsx(
									'w-[200px]',
									(ytDataLoading || !isValidUrl(yt_url)) &&
										'disabled',
								)}
								disabled={ytDataLoading || !isValidUrl(yt_url)}
								onClick={getYTURLData}
							>
								Fetch YT Data
							</Button>
						</div>
					</div>
				</div>
			</form>
			<div className="mt-5 flex flex-col gap-3">
				{downloadProgress && (
					<div>
						<h2 className="text-md font-bold">Download Progress</h2>
						<div className="rounded-md text-sm text-green-500">
							{downloadProgress}
						</div>
					</div>
				)}
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
		</Form>
	);
};

export default YTDownloader;
