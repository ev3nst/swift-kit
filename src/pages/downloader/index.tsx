import { PauseIcon, XIcon } from 'lucide-react';

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
import { Progress } from '@/components/progress';
import { Separator } from '@/components/separator';

import { buttonVariants } from '@/lib/utils';

import AddToQueue from './add-to-queue';

const queueData = [
	{
		source_url: 'https://www.youtube.com/watch?v=123123',
		source_type: 'Youtube',
	},
	{
		source_url: 'https://www.youtube.com/watch?v=123123',
		source_type: 'Youtube',
	},
];

function Downloader() {
	return (
		<div>
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
										This will pause all download processes
										which some may not support resuming.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>
										Cancel
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={() => console.log('pause')}
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
						<TableHead className="text-right">
							<AddToQueue />
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{queueData.map(queue => (
						<TableRow key={queue.source_url}>
							<TableCell>
								<a
									className="hover:underline text-blue-400"
									href={queue.source_url}
									target="_blank"
								>
									{queue.source_url}
								</a>
							</TableCell>
							<TableCell>{queue.source_type}</TableCell>
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
