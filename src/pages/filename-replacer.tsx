import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Folder } from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';

import { invoke } from '@tauri-apps/api/core';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from '@/components/form';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { PageHeader } from '@/components/page-header';

const pageTitle = 'File Name Replacer';
const pageDescription =
	'Replace file names individually or bulk rename with replacing rules.';
const FilenameReplacer = () => {
	const [processLoading, setProcessLoading] = useState(false);
	const [fetchedFiles, setFetchedFiles] = useState([]);
	const [fetchLoading, setFetchLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const form = useForm({
		defaultValues: {
			folder_path: '',
			extension_filter: '',
			replace_rule: '',
			rename_mapping: [],
		},
	});

	useEffect(() => {
		if (fetchedFiles && fetchedFiles.length > 0) {
			const initialRenameMapping = fetchedFiles.map(() => '');
			form.reset({
				...form.getValues(),
				rename_mapping: initialRenameMapping,
			});
		}
	}, [fetchedFiles, form]);

	const { getValues, setValue } = form;
	async function handleFetch() {
		setFetchLoading(true);
		setErrorMessage('');
		try {
			const { folder_path, extension_filter } = getValues();
			const files = (await invoke('fetch_files', {
				folder_path,
				extension_filter,
			})) as string[];
			setFetchedFiles(files);
			setFetchLoading(false);
		} catch (error) {
			console.error('Error:', error);
			setErrorMessage(error);
			setFetchLoading(false);
			toast.error(error);
		}
	}

	async function handleBulkRename() {
		setProcessLoading(true);
		setErrorMessage('');
		try {
			const { folder_path, replace_rule } = getValues();
			await invoke('rename_files', {
				folder_path: folder_path,
				replace_rule: replace_rule,
			});
			setProcessLoading(false);
			toast.success('Renaming successful.');
			handleFetch();
		} catch (error) {
			console.error('Error:', error);
			setErrorMessage(error);
			setProcessLoading(false);
			toast.error(error);
		}
	}

	async function onSubmit(data) {
		const fileReMapping = fetchedFiles.map((ff, ffi) => {
			let new_name = (data.rename_mapping[ffi] || '') as string;
			if (
				new_name.length > 0 &&
				new_name.indexOf('.') === -1 &&
				ff.indexOf('.') !== -1
			) {
				const old_ext = ff.split('.')[1];
				new_name += '.' + old_ext;
			}
			return [ff, new_name];
		});

		setProcessLoading(true);
		setErrorMessage('');
		try {
			await invoke('rename_files', {
				folder_path: data.folder_path,
				rename_mapping: fileReMapping,
			});
			setProcessLoading(false);
			toast.success('Renaming successful.');
			handleFetch();
			setValue('rename_mapping', []);
		} catch (error) {
			console.error('Error:', error);
			setErrorMessage(error);
			setProcessLoading(false);
			toast.error(error);
		}
	}

	const { folder_path } = getValues();
	return (
		<Form {...form}>
			<form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
				<PageHeader title={pageTitle} description={pageDescription} />
				<div className="flex gap-4">
					<FormField
						control={form.control}
						name="folder_path"
						render={({ field }) => (
							<FormItem className="grid gap-1 flex-grow">
								<div className="flex items-center">
									<FormLabel className="flex gap-2 items-center">
										Files Path
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
							</FormItem>
						)}
					/>
				</div>
				<div className="flex gap-4 items-end">
					<FormField
						control={form.control}
						name="replace_rule"
						render={({ field }) => (
							<FormItem className="grid gap-1 flex-grow">
								<div className="flex items-center">
									<FormLabel>Replace Rule</FormLabel>
								</div>
								<FormControl>
									<Input
										placeholder="eg. MyFiles - , Myfiles - "
										{...field}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					<Button
						type="button"
						variant="secondary"
						className={clsx(
							'w-[200px]',
							fetchLoading && 'disabled',
						)}
						disabled={fetchLoading}
						onClick={handleBulkRename}
					>
						Bulk Replace
					</Button>
				</div>

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
									<FormLabel>{ff}</FormLabel>
								</div>
								<FormControl>
									<Input {...field} />
								</FormControl>
							</FormItem>
						)}
					/>
				))}

				{fetchedFiles.length === 0 ? (
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
						Fetch
					</Button>
				) : (
					<Button
						type="submit"
						variant="secondary"
						className={clsx('w-full', processLoading && 'disabled')}
						disabled={processLoading}
					>
						Rename
					</Button>
				)}
				{errorMessage && (
					<div className="text-center text-sm text-destructive">
						{errorMessage}
					</div>
				)}
			</form>
		</Form>
	);
};

export default FilenameReplacer;
