import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Cpu, Folder } from 'lucide-react';
import { clsx } from 'clsx';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from '@/components/form';
import { Progress } from '@/components/progress';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { PageHeader } from '@/components/page-header';

const pageTitle = 'No Intro & Outro';
const pageDescription =
	'Process will remove intro & outro from each episode and combine all of them into single video file.';
const NoIntroOutro = () => {
	const [processLoading, setProcessLoading] = useState(false);
	const [fetchedVideos, setFetchedVideos] = useState([]);
	const [fetchLoading, setFetchLoading] = useState(false);

	const form = useForm({
		defaultValues: {
			input_path: '',
			output_path: '',
			threads: '',
		},
	});

	function onSubmit(data) {
		console.log(data);
	}

	return (
		<Form {...form}>
			<form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
				<div className="grid gap-6">
					<PageHeader
						title={pageTitle}
						description={pageDescription}
					/>
					<div className="grid gap-5">
						<FormField
							control={form.control}
							name="input_path"
							render={({ field }) => (
								<FormItem className="grid gap-1">
									<div className="flex items-center">
										<FormLabel className="flex gap-2 items-center">
											Input Path
											<div className="relative">
												<Folder className="w-4 h-4 bottom-[-7px] left-0 absolute" />
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
								<FormItem className="grid gap-1">
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
											placeholder="Defaults to input path suffixed with a folder named output"
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="threads"
							render={({ field }) => (
								<FormItem className="grid gap-1">
									<div className="flex items-center">
										<FormLabel className="flex gap-2 items-center">
											CPU Threads
											<div className="relative">
												<Cpu className="w-4 h-4 bottom-[-7px] left-0 absolute" />
											</div>
										</FormLabel>
									</div>
									<FormControl>
										<Input
											placeholder="CPU Cores & Threads are different things."
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<div className="flex flex-wrap pb-4">
							<div className="w-full mb-4">
								<h5 className="font-bold">Episodes</h5>
								<p className="text-sm text-muted-foreground">
									Intro starts have default value of 00:00 and
									outro ends have defaults to end of the
									video.
								</p>
							</div>
							<div className="flex flex-col gap-2 w-[350px]">
								<Label>S01E01.mkv</Label>
								<div className="flex gap-3">
									<FormField
										control={form.control}
										name="threads"
										render={({ field }) => (
											<FormItem className="grid gap-1">
												<FormControl>
													<Input
														placeholder="Intro Start"
														{...field}
													/>
												</FormControl>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="threads"
										render={({ field }) => (
											<FormItem className="grid gap-1">
												<FormControl>
													<Input
														placeholder="Intro End"
														{...field}
													/>
												</FormControl>
											</FormItem>
										)}
									/>
								</div>
								<div className="flex gap-3">
									<FormField
										control={form.control}
										name="threads"
										render={({ field }) => (
											<FormItem className="grid gap-1">
												<FormControl>
													<Input
														placeholder="Outro Start"
														{...field}
													/>
												</FormControl>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="threads"
										render={({ field }) => (
											<FormItem className="grid gap-1">
												<FormControl>
													<Input
														placeholder="Outro End"
														{...field}
													/>
												</FormControl>
											</FormItem>
										)}
									/>
								</div>
							</div>
						</div>

						{fetchedVideos.length === 0 ? (
							<Button
								type="button"
								variant="secondary"
								className={clsx(
									'w-full',
									fetchLoading && 'disabled',
								)}
								disabled={fetchLoading}
							>
								Fetch
							</Button>
						) : (
							<Button
								type="submit"
								variant="secondary"
								className={clsx(
									'w-full',
									processLoading && 'disabled',
								)}
								disabled={processLoading}
							>
								Start
							</Button>
						)}
					</div>
				</div>
				<div className="mt-5 flex flex-col gap-3">
					<div>Progress:</div>
					<Progress value={60} />
				</div>
			</form>
		</Form>
	);
};

export default NoIntroOutro;
