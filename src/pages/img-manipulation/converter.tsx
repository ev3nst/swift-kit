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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/select';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { IMGDropzone, type DroppedFile } from '@/components/img-dropzone';
import { PageHeader } from '@/components/page-header';
import IMGManipulationLayout from '@/pages/img-manipulation/layout';

import { useDragEvent } from '@/hooks/use-drag-event';

import { getImageDetailsFromPath } from '@/lib/utils';

const formSchema = z.object({
	convert_to: z.enum(['jpeg', 'png', 'webp', 'bmp']),
	output_path: z.string().optional().nullable(),
});

const pageTitle = 'Image Converter';
const pageDescription = 'Convert any image to desired format.';
const IMGConverter = () => {
	const [processLoading, setProcessLoading] = useState(false);
	const [images, setImages] = useState<DroppedFile[]>([]);
	const { handleDragFilesChange } = useDragEvent();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			convert_to: 'jpeg',
			output_path: '',
		},
	});

	async function onSubmit(data) {
		setProcessLoading(true);
		const convertPromisses = images.map(file => {
			return invoke('convert_image', {
				image_path: file.path,
				output_path: data.output_path,
				convert_to: data.convert_to,
			});
		});

		try {
			await Promise.all(convertPromisses);
			toast.success('Image conversion is complete.');
			setProcessLoading(false);
			handleDragFilesChange('img-converter', []);
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
		<IMGManipulationLayout>
			<Form {...form}>
				<form
					className="grid gap-4"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<PageHeader
						title={pageTitle}
						description={pageDescription}
					/>
					<div className="flex gap-4">
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
							name="convert_to"
							render={({ field }) => (
								<FormItem className="grid gap-1 w-[200px]">
									<FormLabel>Convert To</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Default: jpeg" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="jpeg">
												JPEG (.jpg, .jpeg)
											</SelectItem>
											<SelectItem value="png">
												PNG (.png)
											</SelectItem>
											<SelectItem value="webp">
												WebP (.webp)
											</SelectItem>
											<SelectItem value="bmp">
												BMP (.bmp)
											</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<IMGDropzone
						id="img-converter"
						images={images}
						handleFilesStateChange={handleFilesStateChange}
					/>

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
		</IMGManipulationLayout>
	);
};

export default IMGConverter;
