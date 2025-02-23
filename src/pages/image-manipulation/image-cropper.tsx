import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Folder } from 'lucide-react';
import { clsx } from 'clsx';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

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
import { Loading } from '@/components/loading';
import { type FileMeta, NativeFileInput } from '@/components/native-file-input';

import { convertFileSrc } from '@tauri-apps/api/core';
import api from '@/lib/api';

const imageCropperSchema = z.object({
	base_image: z.string(),
	output_path: z.string().optional(),
});

const ImageCropper = () => {
	const imgRef = useRef<HTMLImageElement>(null);
	const [processLoading, setProcessLoading] = useState(false);
	const [crop, setCrop] = useState<Crop>();
	const [imgSrc, setImgSrc] = useState<string>();
	const [currentFile, setCurrentFile] = useState<FileMeta>();
	const [displayedDimensions, setDisplayedDimensions] = useState({
		width: 0,
		height: 0,
	});

	const form = useForm<z.infer<typeof imageCropperSchema>>({
		resolver: zodResolver(imageCropperSchema),
		defaultValues: {
			base_image: '',
			output_path: '',
		},
	});

	useEffect(() => {
		if (imgRef.current) {
			setDisplayedDimensions({
				width: imgRef.current.width,
				height: imgRef.current.height,
			});
		}
	}, [imgSrc]);

	async function onSubmit(data: z.infer<typeof imageCropperSchema>) {
		if (
			typeof currentFile === 'undefined' ||
			typeof crop === 'undefined' ||
			!currentFile.width ||
			!currentFile.height ||
			imgRef.current === null
		)
			return;
		setProcessLoading(true);
		try {
			const scaleX =
				imgRef.current.naturalWidth / displayedDimensions.width;
			const scaleY =
				imgRef.current.naturalHeight / displayedDimensions.height;

			const scaledCrop = { ...crop };
			scaledCrop.x = crop.x * scaleX;
			scaledCrop.y = crop.y * scaleY;
			scaledCrop.width = Math.round(crop.width * scaleX);
			scaledCrop.height = Math.round(crop.height * scaleY);

			await api.image_crop(
				currentFile.path,
				scaledCrop,
				data.output_path,
			);

			setCurrentFile(undefined);
			setCrop(undefined);
			setImgSrc(undefined);
			toast.success('Cropping is complete.');
		} catch (error) {
			try {
				toast.error(String(error));
			} catch (_e) {}
			console.error(error);
		} finally {
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
										placeholder="Defaults to the folder of the given file"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<NativeFileInput
					key={currentFile?.path}
					onFileChange={file => {
						setCurrentFile(file);
						setImgSrc(convertFileSrc(file.path));
						return true;
					}}
					dialogTitle="Select Image"
					extensionFilter={['jpg', 'png', 'webp', 'bmp']}
				/>

				{imgSrc && (
					<div className="grid w-full justify-center">
						<ReactCrop
							className="max-h-[350px] w-full h-full !flex mx-auto"
							crop={crop}
							onChange={c => setCrop(c)}
							disabled={processLoading}
						>
							<img
								ref={imgRef}
								className="aspect-auto border h-full select-none"
								src={imgSrc}
							/>
						</ReactCrop>
					</div>
				)}

				<Button
					type="submit"
					variant="secondary"
					className={clsx(
						'w-full flex gap-2 items-center',
						(processLoading ||
							typeof currentFile === 'undefined') &&
							'disabled',
					)}
					disabled={
						processLoading || typeof currentFile === 'undefined'
					}
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

export default ImageCropper;
