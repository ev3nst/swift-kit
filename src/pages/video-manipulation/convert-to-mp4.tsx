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
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { Progress } from '@/components/progress';
import { Loading } from '@/components/loading';

import api, { IVideoMeta } from '@/lib/api';
import { emitter } from '@/lib/event';
import { calculateQueueETA, formatFileSize } from '@/lib/utils';

const converToMp4Schema = z.object({
	input_path: z.string(),
});

const ConverToMp4 = () => {
	const shouldStopRef = useRef(false);
	const [processLoading, setProcessLoading] = useState(false);
	const [fetchedVideos, setFetchedVideos] = useState<IVideoMeta[]>([]);
	const [fetchLoading, setFetchLoading] = useState(false);
	const [converToMp4Stdout, setConverToMp4Stdout] = useState<string>('');
	const [currentProcessETA, setCurrentProcessETA] = useState<string>('');
	const [processingVideo, setProcessingVideo] = useState<
		IVideoMeta | undefined
	>(undefined);
	const [progress, setProgress] = useState(0);

	const form = useForm<z.infer<typeof converToMp4Schema>>({
		resolver: zodResolver(converToMp4Schema),
		defaultValues: {
			input_path: '',
		},
	});

	useEffect(() => {
		const unlisten_stdout = listen<string>(
			'convert_to_mp4_stdout',
			event => {
				setConverToMp4Stdout(event.payload);
			},
		);

		const unlisten_stderr = listen<string>(
			'convert_to_mp4_stderr',
			event => {
				console.error(event.payload);
				toast.error(event.payload);
			},
		);

		return () => {
			unlisten_stdout.then(f => f());
			unlisten_stderr.then(f => f());
			emit('cancel_converToMp4')
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
				calculateQueueETA(
					processingVideo,
					fetchedVideos,
					converToMp4Stdout,
				),
			);
		}
	}, [fetchedVideos, processingVideo, converToMp4Stdout]);

	const { getValues } = form;
	const input_path = getValues('input_path');

	const onStopRequest = async () => {
		await emit('cancel_convert_to_mp4');
		shouldStopRef.current = true;
	};

	const handleFetch = async () => {
		const { input_path } = getValues();
		setFetchLoading(true);
		try {
			let result = (await api.fetch_files(input_path)) ?? [];
			result = result.filter(rf => rf.filename.endsWith('.mkv'));
			const videos: IVideoMeta[] = [];
			for (let ri = 0; ri < result.length; ri++) {
				const video = await api.get_video_details(
					`${input_path}\\${result[ri].filename}`,
				);

				videos.push(video);
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
		setConverToMp4Stdout('');
		setCurrentProcessETA('');
		setProgress(0);
		setProcessingVideo(undefined);
	};

	async function onSubmit(data: z.infer<typeof converToMp4Schema>) {
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
				await api.convert_to_mp4(
					`${data.input_path}\\${videoItem.filename}`,
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
			toast.success('Conversion is complete.');
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
		<div>
			<Form {...form}>
				<form
					className="grid relative"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<div className="flex items-end gap-4">
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
											placeholder="eg. C:\Users\Default\Videos"
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
											<TableCell>
												{queue.duration}
											</TableCell>
											<TableCell>
												{queue.width}x{queue.height}
											</TableCell>
											<TableCell>
												{queue.frame_rate.toFixed(2)}{' '}
												f/s
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
									{converToMp4Stdout}
								</div>
							</div>
						</div>
					)}
				</form>
			</Form>
		</div>
	);
};

export default ConverToMp4;
