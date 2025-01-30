import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FolderIcon, LayersIcon, PauseIcon, XIcon } from 'lucide-react';
import { clsx } from 'clsx';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from '@/components/form';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/alert-dialog';
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/table';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Separator } from '@/components/separator';
import { buttonVariants } from '@/lib/utils';

const BulkInterpolation = () => {
	const [processLoading, setProcessLoading] = useState(false);
	const [fetchedVideos, setFetchedVideos] = useState([]);
	const [fetchLoading, setFetchLoading] = useState(false);

	const form = useForm({
		defaultValues: {
			input_path: '',
			output_path: '',
			concurrency: '',
		},
	});

	function onSubmit(data) {
		console.log(data);
		console.log(setProcessLoading);
		console.log(setFetchedVideos);
		console.log(setFetchLoading);
	}

	return (
		<Form {...form}>
			<form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
				<div className="flex gap-4">
					<FormField
						control={form.control}
						name="input_path"
						render={({ field }) => (
							<FormItem className="grid gap-1 flex-grow">
								<div className="flex items-center">
									<FormLabel className="flex gap-2 items-center">
										Input Path
										<div className="relative">
											<FolderIcon className="w-4 h-4 bottom-[-7px] left-0 absolute" />
										</div>
									</FormLabel>
								</div>
								<FormControl>
									<Input
										placeholder="eg. C:\Users\Default\Videos"
										{...field}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="output_path"
						render={({ field }) => (
							<FormItem className="grid gap-1 flex-grow">
								<div className="flex items-center">
									<FormLabel className="flex gap-2 items-center">
										Output Path
										<div className="relative">
											<FolderIcon className="w-4 h-4 bottom-[-7px] left-0 absolute" />
										</div>
									</FormLabel>
								</div>
								<FormControl>
									<Input
										placeholder="Defaults to input path suffixed with a folder named output"
										{...field}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="concurrency"
						render={({ field }) => (
							<FormItem className="grid gap-1 w-[200px]">
								<div className="flex items-center">
									<FormLabel className="flex gap-2 items-center">
										Concurrency
										<div className="relative">
											<LayersIcon className="w-4 h-4 bottom-[-7px] left-0 absolute" />
										</div>
									</FormLabel>
								</div>
								<FormControl>
									<Input {...field} />
								</FormControl>
							</FormItem>
						)}
					/>
				</div>

				<Button
					type="button"
					variant="secondary"
					className={clsx('w-full', fetchLoading && 'disabled')}
					disabled={fetchLoading}
				>
					Fetch
				</Button>

				<div className="flex flex-wrap pb-4">
					<div className="w-full mb-4">
						<h5 className="font-bold">Videos</h5>
						<Table>
							<TableCaption className="text-start px-2">
								<div className="flex items-center gap-3 mb-2">
									<span>Queue: 4/16</span>
									<span>Size: 14.6 GB</span>
									<span>ETA: 2h 32min</span>

									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												variant="ghost"
												className="h-8 w-8 px-0"
											>
												<PauseIcon className="h-[1.2rem] w-[1.2rem] " />
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>
													Are you absolutely sure?
												</AlertDialogTitle>
												<AlertDialogDescription>
													This will pause all
													interpolation processes.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>
													Cancel
												</AlertDialogCancel>
												<AlertDialogAction
													onClick={() =>
														console.log('pause')
													}
												>
													Pause
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>

									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												variant="ghost"
												className="h-8 w-8 px-0 hover:bg-red-800"
											>
												<XIcon className="h-[1.2rem] w-[1.2rem] " />
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>
													Are you absolutely sure?
												</AlertDialogTitle>
												<AlertDialogDescription>
													This action cannot be
													undone. This will clear all
													queued interpolation
													processes of videos
													regardless of completion.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>
													Cancel
												</AlertDialogCancel>
												<AlertDialogAction
													className={buttonVariants({
														variant: 'destructive',
													})}
													onClick={() =>
														console.log('delete')
													}
												>
													Clear Queue
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							</TableCaption>
							<TableHeader>
								<TableRow>
									<TableHead>Video Path</TableHead>
									<TableHead>Duration</TableHead>
									<TableHead>Size</TableHead>
									<TableHead>Progress</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{Array.from({ length: 8 }).map(queue => (
									<TableRow
										key={`bulk-interpolation-${queue}`}
									>
										<TableCell>video.mkv</TableCell>
										<TableCell>00:23:54</TableCell>
										<TableCell>432 MB</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<div className="text-nowrap flex items-baseline">
													<span className="text-xs">
														%
													</span>
													17
												</div>
												<Separator
													orientation="vertical"
													className="h-4"
												/>
												<div className="text-nowrap flex items-baseline gap-1">
													15
													<span className="text-xs">
														min
													</span>
												</div>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</div>

				{fetchedVideos.length !== 0 && (
					<Button
						type="submit"
						variant="secondary"
						className={clsx('w-full', processLoading && 'disabled')}
						disabled={processLoading}
					>
						Start
					</Button>
				)}
			</form>
		</Form>
	);
};

export default BulkInterpolation;
