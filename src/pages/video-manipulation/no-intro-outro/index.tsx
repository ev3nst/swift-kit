import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { FolderIcon } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { listen } from '@tauri-apps/api/event';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from '@/components/form';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Checkbox } from '@/components/checkbox';
import { ScrollToTop } from '@/components/scroll-to-top';
import { Progress } from '@/components/progress';
import { Loading } from '@/components/loading';

import api, { type IAnimeMeta } from '@/lib/api';

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
		})
	),
	default_subtitle: z.any().optional(),
	audio_tracks: z.array(
		z.object({
			name: z.string(),
			value: z.any(),
		})
	),
	default_audio: z.any().optional(),
});

const noIntroOutroSchema = z.object({
	input_path: z.string(),
	output_path: z.string().optional(),
	interpolate: z.boolean().optional(),
	convert_to_mp4: z.boolean().default(true).optional(),
	videos: z.array(animeVideoObj).min(1, 'No video is provided'),
});

const NoIntroOutro = () => {
	const [processLoading, setProcessLoading] = useState(false);
	const [fetchedVideos, setFetchedVideos] = useState<IAnimeMeta[]>([]);
	const [fetchLoading, setFetchLoading] = useState(false);
	const [ffmpegStdout, setFfmpegStdout] = useState<string>('');
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const unlisten = listen<string>('no_intro_outro_stdout', event => {
			setFfmpegStdout(event.payload);
		});

		return () => {
			unlisten.then(f => f());
		};
	}, []);

	const form = useForm<z.infer<typeof noIntroOutroSchema>>({
		resolver: zodResolver(noIntroOutroSchema),
		defaultValues: {
			input_path: '',
			output_path: '',
			interpolate: false,
			convert_to_mp4: true,
			videos: [],
		},
	});

	const { control, handleSubmit, getValues, setValue, watch } = form;
	const { fields } = useFieldArray({ control, name: 'videos' });

	const input_path = getValues('input_path');
	const videos = watch('videos');

	async function onSubmit(data: z.infer<typeof noIntroOutroSchema>) {
		try {
			setProcessLoading(true);
			const activeProcesses = [
				true,
				data.interpolate,
				data.convert_to_mp4,
			].filter(Boolean).length;
			const progressPart = 100 / activeProcesses;
			const progRatePerVideo = progressPart / data.videos.length;
			let currentProg = 0;

			// General anime episode processing
			for (let dvi = 0; dvi < data.videos.length; dvi++) {
				const videoItem = data.videos[dvi];
				if (
					(videoItem.intro_start !== '' &&
						videoItem.intro_end !== '') ||
					(videoItem.outro_start !== '' &&
						videoItem.outro_end !== '') ||
					videoItem.audio_tracks.length > 1 ||
					videoItem.subtitle_tracks.length > 1
				) {
					await api.no_intro_outro(
						input_path,
						videoItem as any,
						false
					);
					currentProg += progRatePerVideo;
					setProgress(currentProg);
				}
			}

			toast.info('Intro & Outro main process is complete.');

			if (data.interpolate === true) {
				console.log('should interpolate');
				toast.info('Interpolation is complete.');
			}

			if (data.convert_to_mp4 === true) {
				console.log('should convert to mp4');
				toast.info('Conversion to mp4 is complete.');
			}

			setProgress(100);
			setProcessLoading(false);
			toast.success('Done.');
		} catch (e) {
			console.error(e);
			try {
				toast.error(String(e));
			} catch (_e) {}
		} finally {
			setProcessLoading(false);
		}
	}

	return (
		<Form {...form}>
			<form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
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
										placeholder="Defaults to input path suffixed with a folder named output"
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
					onClick={async () => {
						const { input_path } = getValues();
						setFetchLoading(true);
						try {
							const result =
								(await api.intro_outro_prediction(
									input_path
								)) ?? [];
							setFetchedVideos(result);
							const videosToSet = [...result];
							for (let vts = 0; vts < videosToSet.length; vts++) {
								if (videosToSet[vts].audio_tracks.length > 1) {
									const findJp = videosToSet[
										vts
									].audio_tracks.filter(f => {
										const fLoc = f.name.toLocaleLowerCase();
										return (
											fLoc.includes('jpn') ||
											fLoc.includes('japan')
										);
									});
									videosToSet[vts].default_audio =
										findJp[0].value ??
										videosToSet[vts].default_audio;
								}

								if (
									videosToSet[vts].subtitle_tracks.length > 1
								) {
									let findJp = videosToSet[
										vts
									].subtitle_tracks.filter(f => {
										const fLoc = f.name.toLocaleLowerCase();
										return fLoc.includes('eng');
									});
									if (findJp.length > 1) {
										const findFullDialog = findJp.filter(
											f => {
												const fLoc =
													f.name.toLocaleLowerCase();
												return (
													fLoc.includes('dialog') ||
													fLoc.includes('full')
												);
											}
										);

										if (findFullDialog.length > 0) {
											findJp = findFullDialog;
										}
									}

									videosToSet[vts].default_subtitle =
										findJp[0].value ??
										videosToSet[vts].default_subtitle;
								}
							}
							setValue(
								'videos',
								result.map(r => {
									return { ...r };
								})
							);
						} catch (e) {
							try {
								toast.error(String(e));
							} catch (_e) {}
							console.error(e);
						} finally {
							setFetchLoading(false);
						}
					}}
				>
					{fetchedVideos.length > 0 ? 'Re-Fetch' : 'Fetch'}
					{fetchLoading && (
						<Loading timeoutMs={250} className="mb-0" />
					)}
				</Button>

				{fetchedVideos.length > 0 && (
					<div className="flex flex-wrap pb-4">
						<div className="flex items-center gap-4 w-full mb-4">
							<h5 className="font-bold">Episodes</h5>
							<FormField
								control={control}
								name="interpolate"
								render={({ field }) => (
									<FormItem className="flex flex-row w-[240px] items-start space-x-3 space-y-0 rounded-md border p-3 mt-2 shadow">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
										<div className="space-y-1 leading-none">
											<FormLabel>
												Interpolate videos to 60fps
											</FormLabel>
										</div>
									</FormItem>
								)}
							/>
							<FormField
								control={control}
								name="convert_to_mp4"
								render={({ field }) => (
									<FormItem className="flex flex-row w-[240px] items-start space-x-3 space-y-0 rounded-md border p-3 mt-2 shadow">
										<FormControl>
											<Checkbox
												defaultChecked
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
										<div className="space-y-1 leading-none">
											<FormLabel>
												Convert to MP4
											</FormLabel>
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
								/>
							))}
						</div>
						<div className="flex flex-col w-full mt-3 gap-3">
							<div>Progress:</div>
							<Progress value={progress} />
							<div className="rounded-md text-sm text-green-500">
								{ffmpegStdout}
							</div>
						</div>
					</div>
				)}

				{fetchedVideos.length > 0 && (
					<Button
						type="submit"
						variant="secondary"
						className={processLoading ? 'disabled' : ''}
						disabled={processLoading}
					>
						Start
						{processLoading && (
							<Loading timeoutMs={250} className="mb-0" />
						)}
					</Button>
				)}

				<ScrollToTop />
			</form>
		</Form>
	);
};

export default NoIntroOutro;
