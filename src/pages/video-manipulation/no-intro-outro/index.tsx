import { useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { FolderIcon } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { emit, listen } from '@tauri-apps/api/event';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from '@/components/form';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tooltip';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Checkbox } from '@/components/checkbox';
import { ScrollToTop } from '@/components/scroll-to-top';
import { Progress } from '@/components/progress';
import { Loading } from '@/components/loading';

import api, { type IAnimeMeta } from '@/lib/api';
import { calculateQueueETA } from '@/lib/utils';
import { emitter } from '@/lib/event';

import { VideoItem } from './video-item';

const animeVideoObj = z.object({
	filename: z.string(),
	width: z.number(),
	height: z.number(),
	filesize: z.number(),
	duration: z.string(),
	duration_in_seconds: z.number(),
	frame_rate: z.number(),
	intro_start: z.string(),
	intro_end: z.string(),
	outro_start: z.string(),
	outro_end: z.string(),
	subtitle_tracks: z.array(
		z.object({
			name: z.string(),
			value: z.any(),
		}),
	),
	default_subtitle: z.any().optional(),
	audio_tracks: z.array(
		z.object({
			name: z.string(),
			value: z.any(),
		}),
	),
	default_audio: z.any().optional(),
});

const noIntroOutroSchema = z.object({
	input_path: z.string(),
	output_path: z.string().optional(),
	use_cuda: z.boolean().default(true).optional(),
	overwrite: z.boolean().default(false).optional(),
	convert_to_mp4: z.boolean().default(false).optional(),
	videos: z.array(animeVideoObj).min(1, 'No video is provided'),
});

const NoIntroOutro = () => {
	const shouldStopRef = useRef(false);
	const [processLoading, setProcessLoading] = useState(false);
	const [fetchedVideos, setFetchedVideos] = useState<IAnimeMeta[]>([]);
	const [fetchLoading, setFetchLoading] = useState(false);
	const [ffmpegStdout, setFfmpegStdout] = useState<string>('');
	const [currentProcessETA, setCurrentProcessETA] = useState<string>('');
	const [processingVideo, setProcessingVideo] = useState<
		IAnimeMeta | undefined
	>(undefined);
	const [progress, setProgress] = useState(0);

	const form = useForm<z.infer<typeof noIntroOutroSchema>>({
		resolver: zodResolver(noIntroOutroSchema),
		defaultValues: {
			input_path: '',
			output_path: '',
			use_cuda: true,
			overwrite: false,
			convert_to_mp4: false,
			videos: [],
		},
	});

	useEffect(() => {
		const unlisten_stdout = listen<string>('noio_stdout', event => {
			setFfmpegStdout(event.payload);
		});

		const unlisten_stderr = listen<string>('noio_stderr', event => {
			console.error(event.payload);
			toast.error(event.payload);
		});

		return () => {
			unlisten_stdout.then(f => f());
			unlisten_stderr.then(f => f());
			emit('cancel_noio')
				.then(() =>
					console.log('Cancellation request sent to backend.'),
				)
				.catch(error =>
					console.error(
						'Failed to send cancellation request:',
						error,
					),
				);
		};
	}, []);

	useEffect(() => {
		if (processingVideo) {
			setCurrentProcessETA(
				calculateQueueETA(processingVideo, fetchedVideos, ffmpegStdout),
			);
		}
	}, [fetchedVideos, processingVideo, ffmpegStdout]);

	const { control, handleSubmit, getValues, setValue, watch } = form;
	const { fields } = useFieldArray({ control, name: 'videos' });

	const input_path = getValues('input_path');
	const videos = watch('videos');

	const handleFetch = async () => {
		const { input_path } = getValues();
		setFetchLoading(true);
		try {
			const result = (await api.intro_outro_prediction(input_path)) ?? [];
			for (let ri = 0; ri < result.length; ri++) {
				for (let ria = 0; ria < result[ri].audio_tracks.length; ria++) {
					if (result[ri].audio_tracks[ria].name === 'jpn') {
						result[ri].audio_tracks[ria].name = 'Japanese';
					}

					if (result[ri].audio_tracks[ria].name === 'eng') {
						result[ri].audio_tracks[ria].name = 'English';
					}
				}
			}

			setFetchedVideos(result);
			const videosToSet = [...result];
			for (let vts = 0; vts < videosToSet.length; vts++) {
				if (videosToSet[vts].audio_tracks.length > 1) {
					const findJp = videosToSet[vts].audio_tracks.filter(f => {
						const fLoc = f.name.toLocaleLowerCase();
						return fLoc.includes('jpn') || fLoc.includes('japan');
					});
					videosToSet[vts].default_audio =
						findJp[0].value ?? videosToSet[vts].default_audio;
				}

				if (videosToSet[vts].subtitle_tracks.length > 1) {
					let findJp = videosToSet[vts].subtitle_tracks.filter(f => {
						const fLoc = f.name.toLocaleLowerCase();
						return fLoc.includes('eng');
					});
					if (findJp.length > 1) {
						const findFullDialog = findJp.filter(f => {
							const fLoc = f.name.toLocaleLowerCase();
							return (
								fLoc.includes('dialog') || fLoc.includes('full')
							);
						});

						if (findFullDialog.length > 0) {
							findJp = findFullDialog;
						}
					}

					videosToSet[vts].default_subtitle =
						findJp[0].value ?? videosToSet[vts].default_subtitle;
				}
			}
			setValue(
				'videos',
				result.map(r => {
					return { ...r };
				}),
			);
		} catch (e) {
			try {
				toast.error(String(e));
			} catch (_e) {}
			console.error(e);
		} finally {
			setFetchLoading(false);
		}
	};

	const onStopRequest = async () => {
		await emit('cancel_noio');
		shouldStopRef.current = true;
	};

	const processCleanup = () => {
		setFfmpegStdout('');
		setCurrentProcessETA('');
		setProgress(0);
		setProcessingVideo(undefined);
	};

	async function onSubmit(data: z.infer<typeof noIntroOutroSchema>) {
		shouldStopRef.current = false;
		try {
			emitter.emit('taskStart');
			setProcessLoading(true);
			const activeProcesses = [true, data.convert_to_mp4].filter(
				v => v === true,
			).length;
			const progressPart = 100 / activeProcesses;
			const progRatePerVideo = progressPart / data.videos.length;
			let currentProg = 0;

			// General anime episode processing
			for (let dvi = 0; dvi < data.videos.length; dvi++) {
				if (shouldStopRef.current) {
					processCleanup();
					return;
				}

				const videoItem = data.videos[dvi];
				if (
					(videoItem.intro_start !== '' &&
						videoItem.intro_end !== '') ||
					(videoItem.outro_start !== '' &&
						videoItem.outro_end !== '') ||
					videoItem.audio_tracks.length > 1 ||
					videoItem.subtitle_tracks.length > 1
				) {
					setProcessingVideo(videoItem as any);
					await api.no_intro_outro(
						input_path,
						videoItem as any,
						data.overwrite,
					);
					currentProg += progRatePerVideo;
					setProgress(currentProg);
				}
			}

			if (shouldStopRef.current) {
				processCleanup();
				return;
			}

			setProcessingVideo(undefined);
			toast.info('Intro & Outro main process is complete.');

			if (data.convert_to_mp4 === true) {
				console.log('should convert to mp4');
				toast.info('Conversion to mp4 is complete.');
			}

			processCleanup();
			setFetchedVideos([]);
			toast.success('Done.');
		} catch (e) {
			console.error(e);
			try {
				toast.error(String(e));
			} catch (_e) {}
		} finally {
			setProcessLoading(false);
			emitter.emit('taskEnd');
		}
	}

	return (
		<Form {...form}>
			<form
				className="grid gap-4 relative pb-10"
				onSubmit={handleSubmit(onSubmit)}
			>
				<div className="flex gap-4">
					<FormField
						control={control}
						name="input_path"
						render={({ field }) => (
							<FormItem className="grid gap-1 flex-grow">
								<div className="flex items-center">
									<FormLabel className="flex gap-2 items-center">
										Input Path
										<div className="relative">
											<FolderIcon className="w-4 h-4 bottom-[-7px] left-0 absolute" />
										</div>
									</FormLabel>
								</div>
								<FormControl>
									<Input
										disabled={processLoading}
										placeholder="eg. C:\Users\Default\Videos"
										{...field}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name="output_path"
						render={({ field }) => (
							<FormItem className="grid gap-1 flex-grow">
								<div className="flex items-center">
									<FormLabel className="flex gap-2 items-center">
										Output Path
										<div className="relative">
											<FolderIcon className="w-4 h-4 bottom-[-7px] left-0 absolute" />
										</div>
									</FormLabel>
								</div>
								<FormControl>
									<Input
										disabled={processLoading}
										placeholder="Defaults to input path with file names having suffix of _noio"
										{...field}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
				</div>
				<Button
					type="button"
					variant="secondary"
					className={
						fetchLoading || !input_path || processLoading
							? 'disabled'
							: ''
					}
					disabled={fetchLoading || !input_path || processLoading}
					onClick={handleFetch}
				>
					{fetchedVideos.length > 0 ? 'Re-Fetch' : 'Fetch'}
					{fetchLoading && (
						<Loading timeoutMs={250} className="mb-0" />
					)}
				</Button>

				{fetchedVideos.length > 0 && (
					<div>
						<div className="flex flex-wrap pb-4">
							<div className="flex items-center gap-4 w-full mb-4">
								<h5 className="font-bold">Episodes</h5>
								<FormField
									control={control}
									name="overwrite"
									render={({ field }) => (
										<FormItem className="flex flex-row w-[120px] items-start space-x-3 space-y-0 rounded-md border p-3 mt-2 shadow">
											<FormControl>
												<Checkbox
													disabled={processLoading}
													checked={field.value}
													onCheckedChange={
														field.onChange
													}
												/>
											</FormControl>
											<div className="space-y-1 leading-none">
												<FormLabel>Overwrite</FormLabel>
											</div>
										</FormItem>
									)}
								/>
								<FormField
									control={control}
									name="use_cuda"
									render={({ field }) => (
										<FormItem className="flex flex-row w-[95px] items-start space-x-3 space-y-0 rounded-md border p-3 mt-2 shadow">
											<FormControl>
												<Checkbox
													disabled={processLoading}
													checked={field.value}
													onCheckedChange={
														field.onChange
													}
												/>
											</FormControl>
											<div className="space-y-1 leading-none">
												<Tooltip>
													<TooltipTrigger asChild>
														<FormLabel>
															CUDA
														</FormLabel>
													</TooltipTrigger>
													<TooltipContent>
														<p>
															Makes the process
															slower but also may
															prevent throttle of
															the CPU.
														</p>
													</TooltipContent>
												</Tooltip>
											</div>
										</FormItem>
									)}
								/>
								<FormField
									control={control}
									name="convert_to_mp4"
									render={({ field }) => (
										<FormItem className="flex flex-row w-[160px] items-start space-x-3 space-y-0 rounded-md border p-3 mt-2 shadow">
											<FormControl>
												<Checkbox
													disabled={processLoading}
													defaultChecked
													checked={field.value}
													onCheckedChange={
														field.onChange
													}
												/>
											</FormControl>
											<div className="space-y-1 leading-none">
												<FormLabel></FormLabel>

												<Tooltip>
													<TooltipTrigger asChild>
														<FormLabel>
															Convert to MP4
														</FormLabel>
													</TooltipTrigger>
													<TooltipContent>
														<p>
															Double re-encoding
															due to limitations
															of filter_complex.
														</p>
													</TooltipContent>
												</Tooltip>
											</div>
										</FormItem>
									)}
								/>
							</div>
							<div className="flex flex-wrap items-center w-full gap-4">
								{fields.map((field, index) => (
									<VideoItem
										key={field.id}
										field={field}
										index={index}
										control={control}
										videos={videos}
										input_path={input_path}
										setValue={setValue}
										processLoading={processLoading}
									/>
								))}
							</div>
						</div>
						<div className="flex gap-4 fixed w-full bottom-0 bg-background py-3">
							<div>
								<Button
									type="submit"
									variant="secondary"
									className={
										processLoading
											? 'w-[100px] disabled'
											: 'w-[100px] px-2 py-1'
									}
									disabled={processLoading}
								>
									Start
									{processLoading && (
										<Loading
											timeoutMs={250}
											className="mb-0"
										/>
									)}
								</Button>
								{processLoading && (
									<Button
										type="button"
										variant="secondary"
										className="w-[100px] px-2 py-1 mt-2"
										onClick={onStopRequest}
									>
										Stop
									</Button>
								)}
							</div>
							<div className="flex flex-col w-full gap-2">
								<div className="flex w-full gap-3 pe-10">
									<div className="flex whitespace-nowrap items-baseline">
										Progress:
										{progress > 0 && (
											<span className="ms-1">
												%{progress.toFixed(2)}
											</span>
										)}
									</div>
									<Progress
										className="align-middle self-center"
										value={progress}
									/>
								</div>
								<div className="flex text-xs">
									{processingVideo?.filename}
									{currentProcessETA && (
										<div className="flex">
											<span className="mx-1">|</span>
											<span className="text-blue-400">
												ETA: {currentProcessETA}
											</span>
										</div>
									)}
								</div>
								<div className="rounded-md text-sm text-green-500">
									{ffmpegStdout}
								</div>
							</div>
						</div>
					</div>
				)}

				<ScrollToTop />
			</form>
		</Form>
	);
};

export default NoIntroOutro;
