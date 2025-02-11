import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Folder } from 'lucide-react';
import { clsx } from 'clsx';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

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
import { IMGDropzone, type DroppedFile } from '@/components/img-dropzone';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { Label } from '@/components/label';

import { useDragEvent } from '@/hooks/use-drag-event';

import { getImageDetailsFromPath } from '@/lib/utils';
import api from '@/lib/api';
import { Loading } from '@/components/loading';

const imgManipulatorSchema = z.object({
	width: z.coerce.number().optional(),
	height: z.coerce.number().optional(),
	quality: z.coerce
		.number()
		.min(0, { message: 'Quality must be between 0 and 100' })
		.max(100, { message: 'Quality must be between 0 and 100' })
		.optional(),
	convert_to: z
		.enum(['none', 'jpeg', 'png', 'webp', 'bmp', 'ico'])
		.optional(),
	output_path: z.string().optional(),
});

const ImageManipulator = () => {
	const [processLoading, setProcessLoading] = useState(false);
	const [images, setImages] = useState<DroppedFile[]>([]);
	const { handleDragFilesChange } = useDragEvent();

	const form = useForm<z.infer<typeof imgManipulatorSchema>>({
		resolver: zodResolver(imgManipulatorSchema),
		defaultValues: {
			width: '' as any,
			height: '' as any,
			quality: '' as any,
			convert_to: 'none',
			output_path: '',
		},
	});

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

	async function onSubmit(data: z.infer<typeof imgManipulatorSchema>) {
		setProcessLoading(true);

		try {
			if (
				typeof data.convert_to === 'string' &&
				data.convert_to !== 'none'
			) {
				let showSuccessAlert = false;
				for (let mi = 0; mi < images.length; mi++) {
					const imageFile = images[mi];
					if (imageFile.path.endsWith(data.convert_to)) continue;
					images[mi].path = await api.image_convert(
						imageFile.path,
						data.convert_to as string,
						data.output_path,
					);
					showSuccessAlert = true;
				}
				if (showSuccessAlert)
					toast.success('Image conversion is complete.');
			}

			if (
				(typeof data.width === 'number' && data.width !== 0) ||
				(typeof data.height === 'number' && data.height !== 0)
			) {
				let showSuccessAlert = false;
				for (let mi = 0; mi < images.length; mi++) {
					const imageFile = images[mi];
					await api.image_resize(
						imageFile.path,
						data.width as number,
						data.height as number,
						data.output_path,
					);
					showSuccessAlert = true;
				}

				if (showSuccessAlert)
					toast.success('Image resizing is complete.');
			}

			if (typeof data.quality === 'number' && data.quality !== 0) {
				let showSuccessAlert = false;
				for (let mi = 0; mi < images.length; mi++) {
					const imageFile = images[mi];
					await api.image_compress(
						imageFile.path,
						data.quality as number,
						data.output_path,
					);
					showSuccessAlert = true;
				}

				if (showSuccessAlert)
					toast.success('Image compression is complete.');
			}

			setProcessLoading(false);
			handleDragFilesChange('image-manipulator', []);
			setImages([]);
		} catch (error) {
			console.error(error);
			try {
				toast.error(String(error));
			} catch (_e) {}
			setProcessLoading(false);
		}
	}

	return (
		<Form {...form}>
			<form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
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
											<SelectValue placeholder="Default" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="none">
											Default
										</SelectItem>
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
										<SelectItem value="ico">
											ICO (.ico)
										</SelectItem>
									</SelectContent>
								</Select>
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
									<FormLabel>Quality (Compression)</FormLabel>
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

				<div className="flex justify-between gap-4">
					<FormField
						control={form.control}
						name="width"
						render={({ field }) => (
							<FormItem className="grid gap-1 flex-grow">
								<div className="flex items-center">
									<FormLabel>Width</FormLabel>
								</div>
								<FormControl>
									<Input type="number" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="height"
						render={({ field }) => (
							<FormItem className="grid gap-1 flex-grow">
								<div className="flex items-center">
									<FormLabel>Height</FormLabel>
								</div>
								<FormControl>
									<Input type="number" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="grid w-full items-center gap-3">
					<Label htmlFor="images">Images</Label>
					<IMGDropzone
						id="image-manipulator"
						images={images}
						handleFilesStateChange={handleFilesStateChange}
					/>
				</div>

				<Button
					type="submit"
					variant="secondary"
					className={clsx(
						'w-full flex gap-2 items-center',
						(processLoading || images.length === 0) && 'disabled',
					)}
					disabled={processLoading || images.length === 0}
				>
					Start
					{processLoading && (
						<Loading timeoutMs={250} className="mb-0" />
					)}
				</Button>
			</form>
		</Form>
	);
};

export default ImageManipulator;
