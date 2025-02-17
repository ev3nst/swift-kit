import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cva } from 'class-variance-authority';

import { convertFileSrc } from '@tauri-apps/api/core';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';

import type { FileMeta } from '@/components/native-file-input';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
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

export const toggleVariants = cva(
	'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
	{
		variants: {
			variant: {
				default: 'bg-transparent',
				outline:
					'border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground',
			},
			size: {
				default: 'h-9 px-2 min-w-9',
				sm: 'h-8 px-1.5 min-w-8',
				lg: 'h-10 px-2.5 min-w-10',
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

export const formatFileSize = (sizeInBytes: number): string => {
	if (sizeInBytes === 0) return '0 Bytes';

	const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
	const sizeIndex = Math.floor(Math.log(sizeInBytes) / Math.log(1024));

	const size = (sizeInBytes / Math.pow(1024, sizeIndex)).toFixed(2);
	return `${size} ${units[sizeIndex]}`;
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

	// Filter out already existing images by name
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
