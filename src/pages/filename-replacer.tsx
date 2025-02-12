import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArrowRightIcon, Folder } from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';

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

import api, { type IFileMeta } from '@/lib/api';

const filenameReplacerSchema = z.object({
	folder_path: z.string().min(1, {
		message: 'Folder path is required.',
	}),
	extension_filter: z.string().optional(),
	search: z.string().optional(),
	replace: z.string().optional(),
	rename_mapping: z.any().optional(),
});

const FilenameReplacer = () => {
	const [processLoading, setProcessLoading] = useState(false);
	const [fetchedFiles, setFetchedFiles] = useState<IFileMeta[]>([]);
	const [fetchLoading, setFetchLoading] = useState(false);
	const form = useForm<z.infer<typeof filenameReplacerSchema>>({
		resolver: zodResolver(filenameReplacerSchema),
		defaultValues: {
			folder_path: '',
			extension_filter: '',
			search: '',
			replace: '',
			rename_mapping: [],
		},
	});

	useEffect(() => {
		if (fetchedFiles && fetchedFiles.length > 0) {
			const initialRenameMapping = fetchedFiles.map(() => '');
			form.reset({
				...form.getValues(),
				rename_mapping: initialRenameMapping as any,
			});
		}
	}, [fetchedFiles, form]);

	const { getValues, setValue } = form;
	async function handleFetch() {
		setFetchLoading(true);
		try {
			const { folder_path, extension_filter } = getValues();
			const files = await api.fetch_files(folder_path, extension_filter);
			setFetchedFiles(files);
			setFetchLoading(false);
		} catch (error) {
			console.error('Error:', error);
			setFetchLoading(false);
			toast.error(String(error));
		}
	}

	async function handleBulkRename() {
		const { folder_path, search, replace, extension_filter } = getValues();
		if (typeof search !== 'string') return;

		setProcessLoading(true);
		try {
			await api.bulk_rename(
				folder_path,
				search,
				replace,
				extension_filter,
			);
			setProcessLoading(false);
			toast.success('Renaming successful.');
			handleFetch();
		} catch (error) {
			console.error('Error:', error);
			setProcessLoading(false);
			toast.error(String(error));
		}
	}

	async function onSubmit(data: z.infer<typeof filenameReplacerSchema>) {
		const fileReMapping = fetchedFiles
			.map((ff, ffi) => {
				let new_name = (
					data.rename_mapping && data.rename_mapping[ffi] !== null
						? data.rename_mapping[ffi]
						: ''
				) as string;
				if (
					new_name.length > 0 &&
					new_name.indexOf('.') === -1 &&
					ff.filename.indexOf('.') !== -1
				) {
					const old_ext = ff.filename.split('.')[1];
					new_name += '.' + old_ext;
				}

				if (new_name.length > 0) {
					return {
						old: ff.filename,
						new: new_name,
					};
				}
			})
			.filter(value => value !== undefined && value !== null);
		setProcessLoading(true);
		try {
			await api.rename_files(
				data.folder_path,
				fileReMapping,
				data.extension_filter,
			);
			setProcessLoading(false);
			toast.success('Renaming successful.');
			handleFetch();
			setValue('rename_mapping', []);
		} catch (error) {
			console.error('Error:', error);
			setProcessLoading(false);
			toast.error(String(error));
		}
	}

	const { folder_path } = getValues();
	function previewNameChange(originalFilename: string, mapIndex: number) {
		const { search, replace, rename_mapping } = form.watch();
		let finalFilename = originalFilename;
		if (typeof search === 'string' && search.length > 0) {
			finalFilename = finalFilename.replace(search, replace ?? '');
		}

		if (
			typeof rename_mapping !== 'undefined' &&
			rename_mapping !== null &&
			typeof rename_mapping[mapIndex] !== 'undefined' &&
			(rename_mapping[mapIndex] as string).length > 0
		) {
			finalFilename = rename_mapping[mapIndex];
			if (
				finalFilename.indexOf('.') === -1 &&
				originalFilename.indexOf('.') !== -1
			) {
				finalFilename += `.${originalFilename.split('.')[1]}`;
			}
		}

		if (originalFilename !== finalFilename) {
			return (
				<FormLabel className="flex items-center gap-3">
					<div className="text-red-500">{originalFilename}</div>
					<ArrowRightIcon className="h-3 w-3" />
					<div className="text-green-500">{finalFilename}</div>
				</FormLabel>
			);
		}

		return <FormLabel>{originalFilename}</FormLabel>;
	}

	return (
		<Form {...form}>
			<form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
				<div className="flex gap-4">
					<FormField
						control={form.control}
						name="folder_path"
						render={({ field }) => (
							<FormItem className="grid gap-1 flex-grow">
								<div className="flex items-center">
									<FormLabel className="flex gap-2 items-center">
										Folder Path
										<div className="relative">
											<Folder className="w-4 h-4 bottom-[-7px] left-0 absolute" />
										</div>
									</FormLabel>
								</div>
								<FormControl>
									<Input
										placeholder="eg. C:\Users\Default\Documents"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="extension_filter"
						render={({ field }) => (
							<FormItem className="grid gap-1 w-[200px]">
								<div className="flex items-center">
									<FormLabel>Extension Filter</FormLabel>
								</div>
								<FormControl>
									<Input placeholder="eg. txt" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<div className="flex gap-4 items-end">
					<FormField
						control={form.control}
						name="search"
						render={({ field }) => (
							<FormItem className="grid gap-1 flex-grow">
								<div className="flex items-center">
									<FormLabel>Search</FormLabel>
								</div>
								<FormControl>
									<Input placeholder="" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="replace"
						render={({ field }) => (
							<FormItem className="grid gap-1 flex-grow">
								<div className="flex items-center">
									<FormLabel>Replace</FormLabel>
								</div>
								<FormControl>
									<Input placeholder="Replace" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button
						type="button"
						variant="success-outline"
						className={clsx(
							'w-[200px]',
							(fetchLoading || folder_path.length === 0) &&
								'disabled',
						)}
						disabled={fetchLoading || folder_path.length === 0}
						onClick={handleBulkRename}
					>
						Bulk Replace
					</Button>
				</div>

				<Button
					type="button"
					variant="secondary"
					className={clsx(
						'w-full',
						(fetchLoading || folder_path.length === 0) &&
							'disabled',
					)}
					disabled={fetchLoading || folder_path.length === 0}
					onClick={handleFetch}
				>
					{fetchedFiles.length > 0 ? 'Re-Fetch' : 'Fetch'}
				</Button>

				{fetchedFiles.length !== 0 && (
					<>
						<h6 className="mt-4">
							Fetched Files
							<span className="text-sm text-muted-foreground ms-2">
								(Individual Renaming)
							</span>
							<p className="text-sm text-muted-foreground mt-2">
								Typing the extension of the files is optional.
							</p>
						</h6>
					</>
				)}
				{fetchedFiles.map((ff, ffi) => (
					<FormField
						key={`fetched_files_${ffi}`}
						control={form.control}
						name={`rename_mapping[${ffi}]` as any}
						render={({ field }) => (
							<FormItem className="grid gap-1 flex-grow">
								<div className="flex items-center">
									{previewNameChange(ff.filename, ffi)}
								</div>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				))}

				{fetchedFiles.length !== 0 && (
					<Button
						type="submit"
						variant="secondary"
						className={clsx('w-full', processLoading && 'disabled')}
						disabled={processLoading}
					>
						Rename
					</Button>
				)}
			</form>
		</Form>
	);
};

export default FilenameReplacer;
