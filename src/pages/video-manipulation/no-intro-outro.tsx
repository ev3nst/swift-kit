import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LayersIcon, FolderIcon } from 'lucide-react';
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/select';
import { Checkbox } from '@/components/checkbox';
import { Separator } from '@/components/separator';

const NoIntroOutro = () => {
	const [processLoading, setProcessLoading] = useState(false);
	const [fetchedVideos, setFetchedVideos] = useState([]);
	const [fetchLoading, setFetchLoading] = useState(false);

	const form = useForm({
		defaultValues: {
			input_path: '',
			output_path: '',
			concurrency: '',
			interpolate: true,
			intro_start: [],
			intro_end: [],
			outro_start: [],
			outro_end: [],
			subtitle: [],
			audio: [],
		},
	});

	function onSubmit(data) {
		console.log(data);
		console.log(setProcessLoading);
		console.log(setFetchedVideos);
		console.log(setFetchLoading);
	}

	const { getValues } = form;
	const { input_path } = getValues();

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
					className={fetchLoading || !input_path ? 'disabled' : ''}
					disabled={fetchLoading || !input_path}
					onClick={async () => {
						console.log('predicton?');
					}}
				>
					Fetch
				</Button>

				<div className="flex flex-wrap pb-4">
					<div className="w-full mb-4">
						<h5 className="font-bold">Episodes</h5>
						<div className="flex gap-2 items-center">
							<p className="text-sm text-muted-foreground">
								Intro Start's have default value of 00:00.
							</p>
							<Separator orientation="vertical" className="h-4" />
							<p className="text-sm text-muted-foreground">
								Outro End's have defaults to the end of the
								video.
							</p>
						</div>
						<FormField
							control={form.control}
							name="interpolate"
							render={({ field }) => (
								<FormItem className="flex flex-row w-[240px] items-start space-x-3 space-y-0 rounded-md border p-3 mt-2 shadow">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>
											Interpolate videos to 60fps
										</FormLabel>
									</div>
								</FormItem>
							)}
						/>
					</div>
					<div className="flex flex-wrap items-center w-full gap-4">
						{Array.from({ length: 5 }).map((_v, i) => (
							<div
								key={i}
								className="flex flex-col flex-grow gap-2 border rounded-lg p-5"
							>
								<FormLabel className="text-sky-400 font-bold">
									S0{i}E0{i}.mkv
								</FormLabel>

								<div className="flex items-center flex-grow">
									<FormLabel className="w-[65px] flex-shrink-0">
										Intro
									</FormLabel>
									<div className="flex items-center flex-grow gap-2 text-muted-foreground">
										<FormField
											control={form.control}
											name={`intro_start[${i}]` as any}
											render={({ field }) => (
												<FormItem className="grid gap-1 flex-grow">
													<FormControl>
														<Input
															placeholder="00:00"
															{...field}
														/>
													</FormControl>
												</FormItem>
											)}
										/>
										-
										<FormField
											control={form.control}
											name={`intro_end[${i}]` as any}
											render={({ field }) => (
												<FormItem className="grid gap-1 flex-grow">
													<FormControl>
														<Input {...field} />
													</FormControl>
												</FormItem>
											)}
										/>
									</div>
								</div>
								<div className="flex items-center flex-grow">
									<FormLabel className="w-[65px] flex-shrink-0">
										Outro
									</FormLabel>
									<div className="flex items-center flex-grow gap-2 text-muted-foreground">
										<FormField
											control={form.control}
											name={`outro_start[${i}]` as any}
											render={({ field }) => (
												<FormItem className="grid gap-1 flex-grow">
													<FormControl>
														<Input {...field} />
													</FormControl>
												</FormItem>
											)}
										/>
										-
										<FormField
											control={form.control}
											name={`outro_end[${i}]` as any}
											render={({ field }) => (
												<FormItem className="grid gap-1 flex-grow">
													<FormControl>
														<Input {...field} />
													</FormControl>
												</FormItem>
											)}
										/>
									</div>
								</div>

								<div className="flex flex-col gap-2">
									<FormField
										control={form.control}
										name={`subtitle[${i}]` as any}
										render={({ field }) => (
											<FormItem className="space-y-0 w-full flex items-center">
												<FormLabel className="w-[65px] flex-shrink-0">
													Subtitle
												</FormLabel>
												<Select
													onValueChange={
														field.onChange
													}
													defaultValue={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Default" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="Youtube">
															Youtube
														</SelectItem>
														<SelectItem value="m3u8">
															Stream Video (m3u8)
														</SelectItem>
													</SelectContent>
												</Select>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name={`audio[${i}]` as any}
										render={({ field }) => (
											<FormItem className="space-y-0 w-full flex items-center">
												<FormLabel className="w-[65px] flex-shrink-0">
													Audio
												</FormLabel>
												<Select
													onValueChange={
														field.onChange
													}
													defaultValue={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Default" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="Youtube">
															Youtube
														</SelectItem>
														<SelectItem value="m3u8">
															Stream Video (m3u8)
														</SelectItem>
													</SelectContent>
												</Select>
											</FormItem>
										)}
									/>
								</div>
							</div>
						))}
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
				<div className="flex flex-col gap-3">
					<div>Progress:</div>
					<Progress value={60} />
				</div>
			</form>
		</Form>
	);
};

export default NoIntroOutro;
