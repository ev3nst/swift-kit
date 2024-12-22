import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Folder } from 'lucide-react';
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
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { IMGDropzone, type DroppedFile } from '@/components/img-dropzone';

import { formatFileSize, getImageDetailsFromPath } from '@/lib/utils';
import { useDragEvent } from '@/hooks/use-drag-event';

async function compressImage(
	image_path: string,
	output_path: string,
	quality: number = 50,
) {
	await invoke('compress_image', {
		image_path,
		output_path,
		quality,
	});
}

const formSchema = z.object({
	quality: z.coerce
		.number()
		.min(0, { message: 'Quality must be between 0 and 100' })
		.max(100, { message: 'Quality must be between 0 and 100' })
		.optional()
		.nullable(),
	output_path: z.string().optional().nullable(),
});

const IMGConverter = () => {
	const [processLoading, setProcessLoading] = useState(false);
	const [images, setImages] = useState<DroppedFile[]>([]);
	const { handleDragFilesChange } = useDragEvent();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			quality: 65,
			output_path: '',
		},
	});

	async function onSubmit(data) {
		setProcessLoading(true);
		const compressPromises = images.map(file => {
			console.log(file.path, data.output_path, data.quality);
			return compressImage(file.path, data.output_path, data.quality);
		});

		try {
			await Promise.all(compressPromises);
			toast.success('Image compression is complete.');
			setProcessLoading(false);
			handleDragFilesChange('img-compressor', []);
			setImages([]);
		} catch (error) {
			console.error(error);
			toast.error(error);
			setProcessLoading(false);
		}
	}

	const handleFilesStateChange = async (_id: string, rawFiles?: string[]) => {
		if (typeof rawFiles === 'undefined') return;
		try {
			const rawImages = await Promise.all(
				rawFiles.map(async ri => await getImageDetailsFromPath(ri)),
			);

			// Filter out already existing images by name
			const currentImageNames = images.map(img => img.name);
			const newImages = rawImages.filter(
				rff => !currentImageNames.includes(rff.name),
			);

			if (newImages.length === 0) return;
			const imageFiles = newImages.filter(file => {
				return (
					file.mime.startsWith('image/') &&
					[
						'image/jpeg',
						'image/jpg',
						'image/png',
						'image/webp',
					].includes(file.mime)
				);
			});

			// Update the state with new images
			setImages(prevImages => [...prevImages, ...imageFiles]);
		} catch (error) {
			console.error('Error reading files:', error);
		}
	};

	return (
		<div>
			<Form {...form}>
				<form
					className="grid gap-4"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<div className="grid gap-2 text-center">
						<h1 className="text-3xl font-bold mb-5">
							Image Compressor
						</h1>
						<p className="text-balance text-muted-foreground">
							Compress images with desired quality.
						</p>
					</div>
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
											placeholder="Defaults to downloads folder if left empty"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="quality"
							render={({ field }) => (
								<FormItem className="grid gap-1 w-[200px]">
									<div className="flex items-center">
										<FormLabel>Quality</FormLabel>
									</div>
									<FormControl>
										<Input
											type="number"
											placeholder="Quality (0-100)"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<IMGDropzone
						id="img-compressor"
						handleFilesStateChange={handleFilesStateChange}
					/>

					<div className="flex flex-wrap gap-4">
						{images.map((image, index) => (
							<div
								className="space-y-3"
								key={`img_converter_thumb_${index}`}
							>
								<div className="overflow-hidden rounded-md">
									<img
										src={image.preview}
										alt={image.name}
										className="h-auto w-[150px] object-cover transition-all hover:scale-105 aspect-square"
									/>
								</div>

								<div className="space-y-2 text-sm">
									<div className="text-xs">{image.name}</div>
									<div className="flex justify-between">
										<p className="text-xs text-muted-foreground">
											{formatFileSize(image.size)}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
					<Button
						type="submit"
						variant="secondary"
						className={clsx('w-full', processLoading && 'disabled')}
						disabled={processLoading}
					>
						Start
					</Button>
				</form>
			</Form>
		</div>
	);
};

export default IMGConverter;
