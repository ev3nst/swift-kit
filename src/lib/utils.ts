import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cva } from 'class-variance-authority';

import { convertFileSrc } from '@tauri-apps/api/core';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';

import { type IAnimeMeta } from '@/lib/api';

import type { FileMeta } from '@/components/native-file-input';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const formatFileSize = (sizeInBytes: number): string => {
	if (sizeInBytes === 0) return '0 Bytes';

	const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
	const sizeIndex = Math.floor(Math.log(sizeInBytes) / Math.log(1024));

	const size = (sizeInBytes / Math.pow(1024, sizeIndex)).toFixed(2);
	return `${size} ${units[sizeIndex]}`;
};

type FFmpegProgress = {
	frame: number;
	fps: number;
	time: string;
	speed: number;
};

export const parseFFmpegProgress = (stdout: string): FFmpegProgress | null => {
	try {
		const fpsMatch = stdout.match(/fps=(\d+)/);
		const frameMatch = stdout.match(/frame=\s*(\d+)/);
		const timeMatch = stdout.match(/time=(\d+:\d+:\d+\.\d+)/);
		const speedMatch = stdout.match(/speed=(\d+\.?\d*)x/);

		if (!fpsMatch || !frameMatch || !timeMatch || !speedMatch) {
			return null;
		}

		return {
			frame: parseInt(frameMatch[1]),
			fps: parseInt(fpsMatch[1]),
			time: timeMatch[1],
			speed: parseFloat(speedMatch[1]),
		};
	} catch (_error) {
		return null;
	}
};

export const timeToSeconds = (timeStr: string): number => {
	const [hours, minutes, seconds] = timeStr.split(':').map(Number);
	return hours * 3600 + minutes * 60 + seconds;
};

export const formatDuration = (seconds: number): string => {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);

	return `${hours.toString().padStart(2, '0')}:${minutes
		.toString()
		.padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const calculateFFmpegETA = (
	ffmpegOutput: string,
	totalDuration: string,
) => {
	const progress = parseFFmpegProgress(ffmpegOutput);
	if (!progress) {
		return {
			eta: null,
			etaInSeconds: 0,
			progress: 0,
			currentTime: '00:00:00',
			totalDuration: formatDuration(timeToSeconds(totalDuration)),
			speed: 0,
		};
	}

	const totalSeconds = timeToSeconds(totalDuration);
	const processedSeconds = timeToSeconds(progress.time);
	const remainingSeconds = totalSeconds - processedSeconds;

	const estimatedSecondsRemaining = remainingSeconds / progress.speed;
	const progressPercent = (processedSeconds / totalSeconds) * 100;

	return {
		eta: formatDuration(Math.ceil(estimatedSecondsRemaining)),
		etaInSeconds: Math.ceil(estimatedSecondsRemaining),
		progress: Math.min(100, Math.round(progressPercent)),
		currentTime: formatDuration(processedSeconds),
		totalDuration: formatDuration(totalSeconds),
		speed: progress.speed,
	};
};

export const calculateQueueETA = (
	currentVideo: IAnimeMeta,
	videoQueue: IAnimeMeta[],
	ffmpegOutput: string,
): string => {
	const currentIndex = videoQueue.findIndex(
		v => v.filename === currentVideo.filename,
	);
	if (currentIndex === -1) return '';

	const currentETA = calculateFFmpegETA(ffmpegOutput, currentVideo.duration);
	if (!currentETA.speed || currentETA.speed === 0) return '';

	let totalETASeconds = currentETA.etaInSeconds;
	for (let i = currentIndex + 1; i < videoQueue.length; i++) {
		const video = videoQueue[i];
		const videoDurationSeconds = timeToSeconds(video.duration);
		totalETASeconds += videoDurationSeconds / currentETA.speed;
	}

	return `${currentETA.eta} | ${currentIndex + 1}/${
		videoQueue.length
	} ${formatDuration(Math.ceil(totalETASeconds))}`;
};

export async function getFileDetailsFromPath(path: string): Promise<FileMeta> {
	const name = path.split('\\').pop() as string;
	const url = convertFileSrc(path);
	const response = await fetch(url, { method: 'HEAD' });
	const fileSize = response.headers.get('Content-Length') as string;
	const mime = response.headers.get('Content-Type') as string;

	const fileDetails: FileMeta = {
		path,
		name,
		size: parseInt(fileSize, 10),
		mime,
	};

	if (mime?.startsWith('image/')) {
		fileDetails.preview = url;
		await new Promise<void>((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				fileDetails.width = img.width;
				fileDetails.height = img.height;
				resolve();
			};
			img.onerror = reject;
			img.src = url;
		});
	}

	return fileDetails;
}

export async function resolveImageDetails(
	currentImages: FileMeta[],
	filePaths: string[],
): Promise<FileMeta[]> {
	const rawImages = await Promise.all(
		filePaths.map(async ri => {
			return await getFileDetailsFromPath(ri);
		}),
	);

	const currentImageNames = currentImages.map(img => img.name);
	const newImages = rawImages.filter(
		rff => !currentImageNames.includes(rff.name),
	);

	if (newImages.length === 0) return [];
	const imageFiles = newImages.filter(file => {
		return (
			file.mime.startsWith('image/') &&
			['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(
				file.mime,
			)
		);
	});

	return imageFiles;
}

export async function videoPlayerWindow(url: string, title?: string) {
	const aspectRatio = 16 / 9;
	const initialWidth = 630;
	const initialHeight = initialWidth / aspectRatio;
	new WebviewWindow('video-player', {
		url,
		title: title ?? 'Video Player',
		width: initialWidth,
		height: initialHeight,
		minWidth: 330,
		resizable: true,
		theme: 'dark',
		decorations: false,
		shadow: false,
		transparent: true,
		contentProtected: true,
		useHttpsScheme: true,
		// hacky way to disable double-click behavior
		maximizable: false,
	});
}

export function shuffleArray(array: Array<any>) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}

	return array;
}

export const buttonVariants = cva(
	'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
	{
		variants: {
			variant: {
				default:
					'bg-primary text-primary-foreground shadow hover:bg-primary/90',
				'default-outline':
					'border border-input bg-background shadow hover:bg-accent hover:text-accent-foreground',
				success: 'bg-green-700 text-white shadow hover:bg-green-600',
				info: 'bg-blue-700 text-white shadow hover:bg-blue-600',
				'success-outline':
					'border border-green-500 text-green-500 hover:border-green-600 hover:bg-green-600 hover:text-white',
				'info-outline':
					'border border-blue-500 text-blue-500 hover:border-blue-600 hover:bg-blue-600 hover:text-white',
				destructive:
					'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
				outline:
					'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
				secondary:
					'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-9 px-4 py-2',
				sm: 'h-8 rounded-md px-3 text-xs',
				lg: 'h-10 rounded-md px-8',
				icon: 'h-9 w-9',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

export const badgeVariants = cva(
	'inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
	{
		variants: {
			variant: {
				default:
					'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
				secondary:
					'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
				destructive:
					'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
				outline: 'text-foreground',
				success:
					'border-transparent bg-green-500 text-white shadow hover:bg-green-400',
				warning:
					'border-transparent bg-yellow-500 text-black shadow hover:bg-yellow-400',
				info: 'border-transparent bg-blue-500 text-white shadow hover:bg-blue-400',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);
