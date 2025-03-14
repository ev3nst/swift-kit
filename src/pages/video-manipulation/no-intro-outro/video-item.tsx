import { CopyIcon, PlayIcon, XIcon } from 'lucide-react';

import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/form';
import { Button } from '@/components/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/select';
import { TimestampInput } from '@/components/timestamp-input';
import { Separator } from '@/components/separator';

import { formatFileSize, videoPlayerWindow } from '@/lib/utils';

export const VideoItem = ({
	field,
	index,
	control,
	videos,
	input_path,
	setValue,
	processLoading,
}) => {
	const isPlayable =
		field.filename.endsWith('.mp4') || field.filename.endsWith('.webm');

	const handleOpenVideo = () => {
		if (isPlayable) {
			const videoPathRaw = `${input_path}\\${field.filename}`;
			videoPlayerWindow(
				`/video-player/${encodeURIComponent(videoPathRaw)}`,
			);
		}
	};

	const handleIntroDefault = () => {
		setValue(
			'videos',
			videos.map((vid, i) =>
				i === index ? { ...vid, intro_start: '00:00:00' } : vid,
			),
		);
	};

	const handleOutroDefault = () => {
		setValue(
			'videos',
			videos.map((vid, i) =>
				i === index ? { ...vid, outro_end: vid.duration } : vid,
			),
		);
	};

	const handleRemoveVideo = () => {
		const videoToRemove = videos[index].filename;
		const newVideos = videos.filter(vid => vid.filename !== videoToRemove);
		setValue('videos', newVideos);
	};

	function renderSelectOptions(type = 'subtitle') {
		let items = videos[index].subtitle_tracks;
		let keyPart = 'st';
		if (type === 'audio') {
			items = videos[index].audio_tracks;
			keyPart = 'at';
		}

		return items
			? items.map(st => (
					<SelectItem
						key={`no_io_${keyPart}_${st.value}`}
						value={String(st.value)}
					>
						{st.name}
					</SelectItem>
				))
			: null;
	}

	return (
		<div className="flex flex-col w-full xl:w-[calc(50%-1rem)] min-w-0 gap-2 border rounded-lg p-5 py-4 relative">
			<div
				className="absolute right-3 top-3 hover:cursor-pointer hover:text-red-500"
				onClick={handleRemoveVideo}
			>
				<XIcon className="h-4 w-4" />
			</div>
			<FormLabel
				className={`text-sky-400 font-bold flex items-center gap-2 mb-2 ${
					isPlayable ? 'hover:cursor-pointer hover:text-sky-600' : ''
				}`}
				onClick={handleOpenVideo}
			>
				{field.filename}
				{isPlayable && <PlayIcon className="w-3 h-3" />}
			</FormLabel>

			{/* Intro Section */}
			<div className="flex items-center flex-grow">
				<FormLabel
					className={`w-[65px] flex-shrink-0 ${
						videos[index].intro_start && videos[index].intro_end
							? 'text-green-500'
							: ''
					}`}
				>
					Intro
				</FormLabel>
				<div className="flex items-center flex-grow gap-2">
					<FormField
						control={control}
						name={`videos.${index}.intro_start`}
						render={({ field }) => (
							<FormItem className="grid gap-1 flex-grow relative space-y-0">
								<FormControl>
									<TimestampInput
										disabled={processLoading}
										{...field}
									/>
								</FormControl>
								<Button
									type="button"
									variant="secondary"
									size="icon"
									className={`gap-0 absolute top-0 right-0 rounded-l-none ${
										processLoading ? 'disabled' : ''
									}`}
									disabled={processLoading}
									onClick={handleIntroDefault}
								>
									<CopyIcon />
								</Button>
							</FormItem>
						)}
					/>
					-
					<FormField
						control={control}
						name={`videos.${index}.intro_end`}
						render={({ field }) => (
							<FormItem className="grid gap-1 flex-grow">
								<FormControl>
									<TimestampInput
										disabled={processLoading}
										{...field}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
				</div>
			</div>

			{/* Outro Section */}
			<div className="flex items-center flex-grow">
				<FormLabel
					className={`w-[65px] flex-shrink-0 ${
						videos[index].outro_start && videos[index].outro_end
							? 'text-green-500'
							: ''
					}`}
				>
					Outro
				</FormLabel>
				<div className="flex items-center flex-grow gap-2">
					<FormField
						control={control}
						name={`videos.${index}.outro_start`}
						render={({ field }) => (
							<FormItem className="grid gap-1 flex-grow">
								<FormControl>
									<TimestampInput
										disabled={processLoading}
										{...field}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					-
					<FormField
						control={control}
						name={`videos.${index}.outro_end`}
						render={({ field }) => (
							<FormItem className="grid gap-1 flex-grow relative space-y-0">
								<FormControl>
									<TimestampInput
										disabled={processLoading}
										{...field}
									/>
								</FormControl>
								<Button
									type="button"
									variant="secondary"
									size="icon"
									className={`gap-0 absolute top-0 right-0 rounded-l-none ${
										processLoading ? 'disabled' : ''
									}`}
									disabled={processLoading}
									onClick={handleOutroDefault}
								>
									<CopyIcon />
								</Button>
							</FormItem>
						)}
					/>
				</div>
			</div>

			{/* Subtitle & Audio Selectors */}
			<div className="flex items-center flex-grow w-full justify-between">
				<FormLabel className="w-[65px] flex-shrink-0">A/S</FormLabel>
				<div className="grid grid-cols-2 gap-4 flex-grow">
					<FormField
						control={control}
						name={`videos.${index}.default_audio`}
						render={({ field }) => (
							<FormItem className="col-span-1 grid gap-1 flex-grow">
								<div className="space-y-0 w-full flex items-center">
									<Select
										disabled={processLoading}
										defaultValue={
											typeof videos[index]
												.default_audio === 'number'
												? String(
														videos[index]
															.default_audio,
													)
												: undefined
										}
										onValueChange={field.onChange}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{renderSelectOptions('audio')}
										</SelectContent>
									</Select>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name={`videos.${index}.default_subtitle`}
						render={({ field }) => (
							<FormItem className="grid gap-1 flex-grow">
								<div className="space-y-0 w-full flex items-center">
									<Select
										disabled={processLoading}
										defaultValue={
											typeof videos[index]
												.default_subtitle === 'number'
												? String(
														videos[index]
															.default_subtitle,
													)
												: undefined
										}
										onValueChange={field.onChange}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{renderSelectOptions('subtitle')}
										</SelectContent>
									</Select>
								</div>

								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</div>

			{/* Video Info */}
			<div className="flex items-center align-middle text-xs text-indigo-300 gap-2">
				<span>
					{field.width}x{field.height}
				</span>
				<Separator orientation="vertical" className="h-4" />
				<span>{formatFileSize(field.filesize)}</span>
				<Separator orientation="vertical" className="h-4" />
				<span>{field.duration}</span>
				<Separator orientation="vertical" className="h-4" />
				<span>{field.frame_rate.toFixed(2)} f/s</span>
			</div>
		</div>
	);
};
