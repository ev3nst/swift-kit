import { useForm } from 'react-hook-form';
import { LayersIcon, FolderIcon, PlusIcon, XIcon } from 'lucide-react';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
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
import { Button } from '@/components/button';
import { Input } from '@/components/input';

import { Checkbox } from '@/components/checkbox';
import { buttonVariants } from '@/lib/utils';
import { Progress } from '@/components/progress';
import { Separator } from '@/components/separator';

const CutAndMerge = () => {
	const form = useForm({
		defaultValues: {
			input_path: '',
			output_path: '',
			concurrency: '',
			interpolate: false,
			cuts: [],
		},
	});

	function onSubmit(data) {
		console.log(data);
	}

	return (
		<div>
			<Form {...form}>
				<form
					className="grid gap-4"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<div className="flex items-end gap-4">
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
						<FormField
							control={form.control}
							name="interpolate"
							render={({ field }) => (
								<FormItem className="flex flex-row w-[180px] items-start space-x-3 space-y-0 rounded-md border p-2.5 mt-2 shadow">
									<FormLabel>Interpolate to 60fps</FormLabel>
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
					</div>
					<div className="flex flex-wrap pb-4">
						<div className="flex flex-col w-full gap-4">
							<div className="flex flex-col flex-grow gap-2">
								<FormLabel className="w-[65px] flex-shrink-0">
									Cut 1
								</FormLabel>
								<div className="flex items-center flex-grow gap-2 text-muted-foreground">
									<FormField
										control={form.control}
										name={`cut_start` as any}
										render={({ field }) => (
											<FormItem className="grid gap-1 flex-grow">
												<FormControl>
													<Input
														placeholder="Start --:--"
														{...field}
													/>
												</FormControl>
											</FormItem>
										)}
									/>
									-
									<FormField
										control={form.control}
										name={`cut_end` as any}
										render={({ field }) => (
											<FormItem className="grid gap-1 flex-grow">
												<FormControl>
													<Input
														placeholder="End --:--"
														{...field}
													/>
												</FormControl>
											</FormItem>
										)}
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<Button type="button" variant="secondary">
										More Cut{' '}
										<PlusIcon className="w-4 h-4" />
									</Button>
									<Button type="button" variant="info">
										Add to Queue
									</Button>
								</div>
							</div>
						</div>
					</div>
				</form>
			</Form>
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
										This action cannot be undone. This will
										permanently delete all queued downloads.
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
										onClick={() => console.log('delete')}
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
						<TableHead>URL</TableHead>
						<TableHead>Type</TableHead>
						<TableHead>Progress</TableHead>
						<TableHead />
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: 6 }).map(queue => (
						<TableRow key={`cut-and-merge-queue-${queue}`}>
							<TableCell>asdasd</TableCell>
							<TableCell>qweqwe</TableCell>
							<TableCell>
								<div className="flex items-center gap-2">
									<Progress value={60} className="w-[60%]" />
									<div className="text-nowrap flex items-baseline">
										<span className="text-xs">%</span>17
									</div>
									<Separator
										orientation="vertical"
										className="h-4"
									/>
									<div className="text-nowrap flex items-baseline gap-1">
										3214
										<span className="text-xs">KB/s</span>
									</div>
									<Separator
										orientation="vertical"
										className="h-4"
									/>
									<div className="text-nowrap flex items-baseline gap-1">
										15
										<span className="text-xs">min</span>
									</div>
								</div>
							</TableCell>
							<TableCell className="text-right">
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
};

export default CutAndMerge;
