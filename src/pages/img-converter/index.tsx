import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Folder } from 'lucide-react';
import { clsx } from 'clsx';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
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
import { IMGDropzone } from '@/components/img-dropzone';

import { formatFileSize } from '@/lib/utils';

interface ImageFile extends File {
	file: File;
	preview: string;
}

const IMGConverter = () => {
	const [processLoading, setProcessLoading] = useState(false);
	const [images, setImages] = useState<ImageFile[]>([]);

	const form = useForm({
		defaultValues: {
			convert_to: 'jpeg',
			output_path: '',
		},
	});

	function onSubmit(data) {
		console.log(data);
	}

	const handleFilesStateChange = (rawFiles: File[]) => {
		const currentImageNames = images.map(img => img.name);
		const files = rawFiles.filter(
			rff => !currentImageNames.includes(rff.name),
		);
		if (files.length === 0) return;

		const imageFiles = files.filter(file => file.type.startsWith('image/'));
		const imagePreviews = imageFiles.map(file =>
			Object.assign(file, {
				file,
				preview: URL.createObjectURL(file),
			}),
		);
		setImages(prevImages => [...prevImages, ...imagePreviews]);
	};

	return (
		<Form {...form}>
			<form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
				<div className="grid gap-2 text-center">
					<h1 className="text-3xl font-bold mb-5">Image Converter</h1>
					<p className="text-balance text-muted-foreground">
						Convert any image to desired format.
					</p>
				</div>

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
										<SelectItem value="svg">
											SVG (.svg)
										</SelectItem>
										<SelectItem value="tif">
											TIFF (.tiff, .tif)
										</SelectItem>
										<SelectItem value="bmp">
											BMP (.bmp)
										</SelectItem>
										<SelectItem value="heif">
											HEIF (.heif, .heic)
										</SelectItem>
									</SelectContent>
								</Select>
							</FormItem>
						)}
					/>
				</div>

				<IMGDropzone handleFilesStateChange={handleFilesStateChange} />

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
	);
};

export default IMGConverter;
