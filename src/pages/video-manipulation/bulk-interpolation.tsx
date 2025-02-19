import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/table';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/select';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Progress } from '@/components/progress';
import { Checkbox } from '@/components/checkbox';
import { Loading } from '@/components/loading';

import api, { IVideoMeta } from '@/lib/api';
import { formatFileSize } from '@/lib/utils';
import { emitter } from '@/lib/event';

const bulkInterpolationSchema = z.object({
	input_path: z.string(),
	output_path: z.string().optional(),
	overwrite: z.boolean().default(false).optional(),
	encoder: z.string().default('h264_nvenc'),
	rife_model: z.string().default('rife-v4.6'),
	multiplier: z.number().default(2),
});

const BulkInterpolation = () => {
	const shouldStopRef = useRef(false);
	const [processLoading, setProcessLoading] = useState(false);
	const [fetchedVideos, setFetchedVideos] = useState<IVideoMeta[]>([]);
	const [fetchLoading, setFetchLoading] = useState(false);
	const [interpolationStdout, setInterpolationStdout] = useState<string>('');
	const [processingVideo, setProcessingVideo] = useState<
		IVideoMeta | undefined
	>(undefined);
	const [progress, setProgress] = useState(0);

	const form = useForm<z.infer<typeof bulkInterpolationSchema>>({
		resolver: zodResolver(bulkInterpolationSchema),
		defaultValues: {
			input_path: '',
			output_path: '',
			overwrite: false,
			encoder: 'h264_nvenc',
			rife_model: 'rife-v4.6',
			multiplier: 2,
		},
	});

	useEffect(() => {
		const unlisten_stdout = listen<string>(
			'interpolation_stdout',
			event => {
				setInterpolationStdout(event.payload);
			},
		);

		const unlisten_stderr = listen<string>(
			'interpolation_stderr',
			event => {
				console.error(event.payload);
				toast.error(event.payload);
			},
		);

		return () => {
			unlisten_stdout.then(f => f());
			unlisten_stderr.then(f => f());
			emit('cancel_interpolation')
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

	const { getValues } = form;
	const input_path = getValues('input_path');

	const onStopRequest = async () => {
		await emit('cancel_interpolation');
		shouldStopRef.current = true;
	};

	const handleFetch = async () => {
		const { input_path } = getValues();
		setFetchLoading(true);
		try {
			let result = (await api.fetch_files(input_path)) ?? [];
			result = result.filter(
				rf =>
					rf.filename.endsWith('.mp4') ||
					rf.filename.endsWith('.mkv'),
			);
			const videos: IVideoMeta[] = [];
			for (let ri = 0; ri < result.length; ri++) {
				const video = await api.get_video_details(
					`${input_path}\\${result[ri].filename}`,
				);

				if (video.frame_rate < 35) {
					videos.push(video);
				}
			}

			setFetchedVideos(videos);
		} catch (e) {
			try {
				toast.error(String(e));
			} catch (_e) {}
			console.error(e);
		} finally {
			setFetchLoading(false);
		}
	};

	const processCleanup = () => {
		setInterpolationStdout('');
		setProgress(0);
		setProcessingVideo(undefined);
	};

	async function onSubmit(data: z.infer<typeof bulkInterpolationSchema>) {
		shouldStopRef.current = false;
		try {
			emitter.emit('taskStart');
			setProcessLoading(true);
			let currentProg = 0;
			const progRatePerVideo = 100 / fetchedVideos.length;

			for (let dvi = 0; dvi < fetchedVideos.length; dvi++) {
				if (shouldStopRef.current) {
					processCleanup();
					return;
				}

				const videoItem = fetchedVideos[dvi];
				setProcessingVideo(videoItem as any);
				await api.interpolate(
					`${data.input_path}\\${videoItem.filename}`,
					data.encoder,
					data.rife_model,
					data.multiplier,
					data.overwrite,
				);
				currentProg += progRatePerVideo;
				setProgress(currentProg);
			}

			if (shouldStopRef.current) {
				processCleanup();
				return;
			}

			processCleanup();
			setFetchedVideos([]);
			toast.success('Interpolation is complete.');
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
				className="grid relative"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<div className="flex gap-4 mb-2">
					<FormField
						control={form.control}
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
						control={form.control}
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
										placeholder="Defaults to input path suffixed with a folder named output"
										{...field}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
				</div>

				<div className="flex items-end gap-4">
					<FormField
						control={form.control}
						name="encoder"
						render={({ field }) => (
							<FormItem className="flex-grow">
								<FormLabel>Encoder</FormLabel>
								<Select
									disabled={processLoading}
									defaultValue={field.value}
									onValueChange={field.onChange}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="h264_nvenc">
											h264_nvenc (--pix-fmt yuv420p)
										</SelectItem>
										<SelectItem value="hevc_nvenc">
											hevc_nvenc (--pix-fmt p010le)
										</SelectItem>
										<SelectItem value="libx264">
											libx264 (CPU)
										</SelectItem>
									</SelectContent>
								</Select>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="rife_model"
						defaultValue="rife-v4.6"
						render={({ field }) => (
							<FormItem className="flex-grow">
								<FormLabel>RIFE Model</FormLabel>
								<Select
									disabled={processLoading}
									defaultValue={field.value}
									onValueChange={field.onChange}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="rife-anime">
											rife-anime
										</SelectItem>
										<SelectItem value="rife-v4.26">
											rife-v4.26
										</SelectItem>
										<SelectItem value="rife-v4.25-lite">
											rife-v4.25-lite
										</SelectItem>
										<SelectItem value="rife-v4.6">
											rife-v4.6
										</SelectItem>
									</SelectContent>
								</Select>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="multiplier"
						render={({ field }) => (
							<FormItem className="w-[100px]">
								<FormLabel>Multiplier</FormLabel>
								<Select
									disabled={processLoading}
									defaultValue={String(field.value)}
									onValueChange={field.onChange}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="2">2</SelectItem>
										<SelectItem value="3">3</SelectItem>
										<SelectItem value="4">4</SelectItem>
									</SelectContent>
								</Select>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="overwrite"
						render={({ field }) => (
							<FormItem className="flex flex-row w-[120px] items-start space-x-3 space-y-0 rounded-md border p-2.5 shadow">
								<FormControl>
									<Checkbox
										disabled={processLoading}
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
								<div className="space-y-1 leading-none">
									<FormLabel>Overwrite</FormLabel>
								</div>
							</FormItem>
						)}
					/>
				</div>

				<Button
					type="button"
					variant="secondary"
					className={
						fetchLoading || !input_path || processLoading
							? 'disabled mt-3 mb-2'
							: 'mt-3 mb-2'
					}
					disabled={fetchLoading || !input_path || processLoading}
					onClick={handleFetch}
				>
					{fetchedVideos.length > 0 ? 'Re-Fetch' : 'Fetch'}
					{fetchLoading && (
						<Loading timeoutMs={250} className="mb-0" />
					)}
				</Button>

				<div className="flex flex-wrap">
					<div className="w-full">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Video</TableHead>
									<TableHead>Size</TableHead>
									<TableHead>Duration</TableHead>
									<TableHead>Resolution</TableHead>
									<TableHead>FPS</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody className="text-xs">
								{fetchedVideos.map(queue => (
									<TableRow
										key={`bulk-interpolation-${queue.filename}`}
									>
										<TableCell className="truncate">
											{queue.filename}
										</TableCell>
										<TableCell>
											{formatFileSize(queue.filesize)}
										</TableCell>
										<TableCell>{queue.duration}</TableCell>
										<TableCell>
											{queue.width}x{queue.height}
										</TableCell>
										<TableCell>
											{queue.frame_rate.toFixed(2)} f/s
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</div>

				{fetchedVideos.length !== 0 && (
					<div className="flex gap-4 sticky w-full bottom-0 bg-background py-3 pe-10">
						<div className="flex flex-col gap-2">
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
									<Loading timeoutMs={250} className="mb-0" />
								)}
							</Button>
							{processLoading && (
								<Button
									type="button"
									variant="secondary"
									className="w-[100px] px-2 py-1"
									onClick={onStopRequest}
								>
									Stop
								</Button>
							)}
						</div>
						<div className="flex flex-col w-full gap-2 ">
							<div className="flex w-full gap-3">
								<div className="flex whitespace-nowrap items-baseline">
									Progress:
									{progress > 0 && (
										<span className="ms-1">
											%{progress.toFixed(2)}
										</span>
									)}
								</div>
								<Progress
									className="align-middle self-center pe-10"
									value={progress}
								/>
							</div>
							<div className="flex text-xs">
								{processingVideo?.filename}
							</div>
							<div className="rounded-md text-sm text-green-500">
								{interpolationStdout}
							</div>
						</div>
					</div>
				)}
			</form>
		</Form>
	);
};

export default BulkInterpolation;
