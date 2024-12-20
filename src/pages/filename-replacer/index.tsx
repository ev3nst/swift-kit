import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Folder } from 'lucide-react';
import { clsx } from 'clsx';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from '@/components/form';
import { Input } from '@/components/input';
import { Button } from '@/components/button';

const FilenameReplacer = () => {
	const [processLoading, setProcessLoading] = useState(false);
	const [fetchedFiles, setFetchedFiles] = useState([]);
	const [fetchLoading, setFetchLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const form = useForm({
		defaultValues: {
			files_path: '',
			extension_filter: '',
		},
	});

	function onSubmit(data) {
		console.log(data);
	}

	return (
		<Form {...form}>
			<form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
				<div className="grid gap-2 text-center">
					<h1 className="text-3xl font-bold mb-5">
						File Name Replacer
					</h1>
					<p className="text-balance text-muted-foreground">
						Replace file names individually or bulk rename with
						replacing rules.
					</p>
				</div>
				<div className="flex gap-4">
					<FormField
						control={form.control}
						name="files_path"
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
									<Input placeholder=".txt" {...field} />
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
									<FormLabel>
										Replace Rule
										
									</FormLabel>
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
						className={clsx('w-[200px]', fetchLoading && 'disabled')}
						disabled={fetchLoading}
					>
						Bulk Replace
					</Button>
				</div>

				{fetchedFiles.length === 0 ? (
					<Button
						type="button"
						variant="secondary"
						className={clsx('w-full', fetchLoading && 'disabled')}
						disabled={fetchLoading}
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
			</form>
		</Form>
	);
};

export default FilenameReplacer;
