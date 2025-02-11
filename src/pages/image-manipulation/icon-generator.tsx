import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Folder } from 'lucide-react';
import { clsx } from 'clsx';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { dirname } from '@tauri-apps/api/path';

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
import { Loading } from '@/components/loading';
import { type FileMeta, NativeFileInput } from '@/components/native-file-input';

import { iconPresetNames, iconPresets } from './icon-presets';
import api from '@/lib/api';

const iconGeneratorSchema = z.object({
	base_image: z.coerce.string(),
	icon_preset_key: z
		.enum(['tauri-app', 'android-mobile', 'ios-mobile'])
		.optional(),
	output_path: z.string().optional(),
});

const IconGenerator = () => {
	const [processLoading, setProcessLoading] = useState(false);
	const [currentFile, setCurrentFile] = useState<FileMeta>();

	const form = useForm<z.infer<typeof iconGeneratorSchema>>({
		resolver: zodResolver(iconGeneratorSchema),
		defaultValues: {
			base_image: '',
			icon_preset_key: 'tauri-app',
			output_path: '',
		},
	});

	async function onSubmit(data: z.infer<typeof iconGeneratorSchema>) {
		if (typeof currentFile === 'undefined') return;
		setProcessLoading(true);
		try {
			const iconPreset = iconPresets[data.icon_preset_key as any];

			// Dimension control
			const sizes = iconPreset.icons.map(ip => ip.size);
			const maxSize = Math.max(...sizes);
			// @ts-ignore
			if (maxSize > currentFile.width) {
				toast.error(
					`Selected icon preset requires at least ${maxSize}x${maxSize} but the current file is ${currentFile?.width}x${currentFile?.height}`,
				);
				return;
			}

			const trashLater: string[] = [];
			const currentImageFormat = currentFile?.mime.replace(
				'image/',
				'',
			) as string;
			const baseImages = {
				[currentImageFormat]: currentFile.path,
			};
			const output_folder =
				data.output_path ?? (await dirname(currentFile.path));
			let additionalFormats = iconPreset.icons
				.map(ip =>
					ip.format ? ip.format.replace('image/', '') : 'png',
				)
				.filter(ipf => ipf !== currentImageFormat);
			additionalFormats = [...new Set(additionalFormats)];
			if (additionalFormats.length > 0) {
				for (let afi = 0; afi < additionalFormats.length; afi++) {
					const convertedImg = await api.image_convert(
						currentFile.path,
						additionalFormats[afi],
						output_folder,
					);
					baseImages[additionalFormats[afi]] = convertedImg;
					trashLater.push(convertedImg);
				}
			}

			for (let ipi = 0; ipi < iconPreset.icons.length; ipi++) {
				const iconItem = iconPreset.icons[ipi];
				const format = iconItem.format ?? 'png';
				const iconImg = await api.image_resize(
					baseImages[format],
					iconItem.size,
					iconItem.size,
					output_folder,
					iconItem.fileName ?? `${iconItem.size}x${iconItem.size}`,
				);
				if (['jpg', 'jpeg', 'png', 'webp'].includes(format)) {
					await api.image_compress(iconImg, 75);
				}
			}

			setProcessLoading(false);
			toast.success('Icon generation is complete.');
		} catch (error) {
			setProcessLoading(false);
			try {
				toast.error(String(error));
			} catch (_e) {}
			console.error(error);
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
					<FormField
						control={form.control}
						name="icon_preset_key"
						render={({ field }) => (
							<FormItem className="grid gap-1 w-[200px]">
								<FormLabel>Convert To</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Tauri App" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{iconPresetNames.map(ipName => (
											<SelectItem
												value={ipName}
												key={`icon_generator_option_${ipName}`}
											>
												{iconPresets[ipName].title}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<NativeFileInput
					onFileChange={file => {
						if (file.width !== file.height) {
							toast.error(
								'Image width & height are not equal which is required for icon generation.',
							);
							return false;
						}

						setCurrentFile(file);
						return true;
					}}
					dialogTitle="Select Logo/Icon"
					extensionFilter={['jpg', 'png', 'webp', 'bmp']}
				/>

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

export default IconGenerator;
