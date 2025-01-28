import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
	DownloadIcon,
	FileIcon,
	FolderIcon,
	Link2Icon,
	PauseIcon,
	XIcon,
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
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/table';
import { Input } from '@/components/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/select';
import { Button } from '@/components/button';
import { Separator } from '@/components/separator';

const queueData = [
	{
		source_url: 'https://www.youtube.com/watch?v=6ZfuNTqbHE8',
		source_type: 'Youtube',
	},
	{
		source_url: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
		source_type: 'Youtube',
	},
];

const downloaderSchema = z.object({
	output_path: z.string().nullable(),
	source_url: z
		.string()
		.nonempty({ message: 'URL is required' })
		.url({ message: 'Must be a valid URL.' }),
	source_type: z.string(),
	download_rate: z.coerce.number().optional().nullable(),
	filename: z.string().min(1, { message: 'Filename is required.' }),
});

function Downloader() {
	const [processLoading, setProcessLoading] = useState(false);
	const form = useForm({
		resolver: zodResolver(downloaderSchema),
		defaultValues: {
			output_path: '',
			source_url: '',
			source_type: 'default',
			download_rate: '' as any,
			filename: '',
		},
	});

	async function onSubmit(data: z.infer<typeof downloaderSchema>) {
		console.log('data:', data);
		console.log('setProcessLoading:', setProcessLoading);
	}

	return (
		<div>
			<Form {...form}>
				<form
					className="grid gap-4"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<div className="flex flex-wrap lg:flex-nowrap gap-4">
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
						<div className="flex gap-4 justify-between lg:w-[400px] w-full">
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
			<Table className="mt-10">
				<TableCaption className="text-start px-2">
					Estimate completion of queue & total size etc...
				</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead>URL</TableHead>
						<TableHead>Type</TableHead>
						<TableHead>Progress</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{queueData.map(queue => (
						<TableRow key={queue.source_url}>
							<TableCell>{queue.source_url}</TableCell>
							<TableCell>{queue.source_type}</TableCell>
							<TableCell>
								<div className="flex items-center gap-2">
									<div>
										<span className="text-xs">%</span>17
									</div>
									<Separator
										orientation="vertical"
										className="h-4"
									/>
									<div>
										3214
										<span className="text-xs">KB/s</span>
									</div>
									<Separator
										orientation="vertical"
										className="h-4"
									/>
									<div>
										15 <span className="text-xs">min</span>
									</div>
								</div>
							</TableCell>
							<TableCell className="text-right">
								<Button
									variant="ghost"
									className="h-8 w-8 px-0"
									onClick={() => console.log('pause')}
								>
									<PauseIcon className="h-[1.2rem] w-[1.2rem] " />
								</Button>
								<Button
									variant="ghost"
									className="h-8 w-8 px-0 hover:bg-red-800"
									onClick={() => console.log('delete')}
								>
									<XIcon className="h-[1.2rem] w-[1.2rem] " />
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

export default Downloader;
