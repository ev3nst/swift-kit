import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Folder } from 'lucide-react';
import { clsx } from 'clsx';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
import { Label } from '@/components/label';

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
	const [images, setImages] = useState<File[]>([]);

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

	async function onSubmit(data: z.infer<typeof imgManipulatorSchema>) {
		console.log('data:', data);
		console.log('setProcessLoading:', setProcessLoading);
		console.log('setImages:', setImages);
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

				<div className="grid w-full items-center gap-1.5">
					<Label htmlFor="images">Images</Label>
					<Input
						id="images"
						className="md:leading-[26px]"
						type="file"
						multiple
						onChange={e => {
							if (e.target.files) {
								setImages(Array.from(e.target.files));
							}
						}}
					/>
				</div>

				{images.length !== 0 && (
					<div className="flex flex-wrap items-center gap-3">
						{images.map(image => (
							<div className="space-y-3">
								<div className="overflow-hidden rounded-md w-[150px] h-[150px]">
									<img
										src={URL.createObjectURL(image)}
										alt={image.name}
										width={150}
										height={150}
										className="h-auto w-auto object-cover transition-all hover:scale-105 aspect-square"
									/>
								</div>

								<div className="space-y-1 text-sm">
									<h3 className="font-medium leading-none">
										{image.name}
									</h3>
									<p className="text-xs text-muted-foreground">
										{image.size} bytes
									</p>
								</div>
							</div>
						))}
					</div>
				)}

				<Button
					type="submit"
					variant="secondary"
					className={clsx(
						'w-full',
						(processLoading || images.length === 0) && 'disabled',
					)}
					disabled={processLoading || images.length === 0}
				>
					Start
				</Button>
			</form>
		</Form>
	);
};

export default ImageManipulator;
