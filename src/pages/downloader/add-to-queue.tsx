import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
	DownloadIcon,
	FileIcon,
	FolderIcon,
	Link2Icon,
	PlusIcon,
} from 'lucide-react';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/form';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/dialog';
import { Input } from '@/components/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/select';
import { Button } from '@/components/button';

const addToQueueSchema = z.object({
	output_path: z.string().nullable(),
	source_url: z
		.string()
		.nonempty({ message: 'URL is required' })
		.url({ message: 'Must be a valid URL.' }),
	source_type: z.string(),
	download_rate: z.coerce.number().optional().nullable(),
	filename: z.string().min(1, { message: 'Filename is required.' }),
});

function AddToQueue() {
	const [processLoading, setProcessLoading] = useState(false);
	const form = useForm({
		resolver: zodResolver(addToQueueSchema),
		defaultValues: {
			output_path: '',
			source_url: '',
			source_type: 'default',
			download_rate: '' as any,
			filename: '',
		},
	});

	async function onSubmit(data: z.infer<typeof addToQueueSchema>) {
		console.log('data:', data);
		console.log('setProcessLoading:', setProcessLoading);
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="ghost">
					<PlusIcon />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Edit profile</DialogTitle>
					<DialogDescription>
						Make changes to your profile here. Click save when
						you're done.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						className="grid gap-4"
						onSubmit={form.handleSubmit(onSubmit)}
					>
						<FormField
							control={form.control}
							name="source_url"
							render={({ field }) => (
								<FormItem className="grid gap-1 flex-grow">
									<FormLabel className="flex gap-2 items-center">
										URL
										<div className="relative">
											<Link2Icon className="w-4 h-4 bottom-[-7px] left-0 absolute" />
										</div>
										<span className="text-destructive ms-3">
											*
										</span>
									</FormLabel>
									<FormControl>
										<Input
											placeholder="eg. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="flex flex-wrap lg:flex-nowrap gap-4">
							<div className="flex gap-4 justify-between w-full">
								<FormField
									control={form.control}
									name="source_type"
									render={({ field }) => (
										<FormItem className="w-full flex flex-col gap-1">
											<FormLabel>Type</FormLabel>
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
													<SelectItem value="default">
														Default
													</SelectItem>
													<SelectItem value="Youtube">
														Youtube
													</SelectItem>
													<SelectItem value="m3u8">
														Stream Video (m3u8)
													</SelectItem>
												</SelectContent>
											</Select>

											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="download_rate"
									render={({ field }) => (
										<FormItem className="w-full flex flex-col gap-1">
											<div className="flex items-center">
												<FormLabel className="flex gap-2 items-center">
													Download Rate
													<div className="relative">
														<DownloadIcon className="w-4 h-4 bottom-[-7px] left-0 absolute" />
													</div>
												</FormLabel>
											</div>
											<FormControl>
												<Input
													placeholder="KB/s"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
						<div className="flex gap-4">
							<FormField
								control={form.control}
								name="output_path"
								render={({ field }) => (
									<FormItem className="grid gap-1 flex-grow">
										<div className="flex items-center">
											<FormLabel className="flex gap-2 items-center">
												Output Folder Path
												<div className="relative">
													<FolderIcon className="w-4 h-4 bottom-[-7px] left-0 absolute" />
												</div>
											</FormLabel>
										</div>
										<FormControl>
											<Input
												placeholder="Defaults to Downloads folder"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="filename"
								render={({ field }) => (
									<FormItem className="grid gap-1 flex-grow">
										<div className="flex items-center">
											<FormLabel className="flex gap-2 items-center">
												File Name
												<div className="relative">
													<FileIcon className="w-4 h-4 bottom-[-7px] left-0 absolute" />
												</div>
												<span className="text-destructive ms-3">
													*
												</span>
											</FormLabel>
										</div>
										<FormControl>
											<Input
												placeholder="Name of the downloaded file"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Button
							type="submit"
							variant="secondary"
							className={processLoading ? 'disabled' : ''}
							disabled={processLoading}
						>
							Add to Queue
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export default AddToQueue;
