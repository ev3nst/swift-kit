import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/dialog';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/form';
import { Button } from '@/components/button';
import { Input } from '@/components/input';

import { Setting } from '@/lib/models/setting';
import api from '@/lib/api';

const settingsSchema = z.object({
	video2x_binary_path: z.string().optional(),
});

export function Settings() {
	const form = useForm({
		resolver: zodResolver(settingsSchema),
		defaultValues: {
			video2x_binary_path: '',
		},
	});

	useEffect(() => {
		(async () => {
			const { setValue } = form;
			const video2x_binary_path = await Setting.get(
				'video2x_binary_path',
			);
			if (video2x_binary_path) {
				setValue('video2x_binary_path', video2x_binary_path.value);
			}
		})();
	}, [form]);

	async function onSubmit(data: z.infer<typeof settingsSchema>) {
		if (data.video2x_binary_path) {
			const checkVideo2xPath = await api.fetch_files(
				data.video2x_binary_path,
			);

			if (
				checkVideo2xPath.findIndex(
					cfp => cfp.filename === 'video2x.exe',
				) === -1
			) {
				toast.error('Video2x could not be found.');
				return;
			}
		}

		await Setting.save(
			'video2x_binary_path',
			data.video2x_binary_path ?? '',
		);
		toast.success('Settings are saved.');
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="ghost" className="group/toggle h-8 w-8 px-0">
					<SettingsIcon />
					<span className="sr-only">Settings</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Settings</DialogTitle>
					<DialogDescription>
						While all of these are optional, they unlock features of
						the app.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						className="grid gap-4"
						onSubmit={form.handleSubmit(onSubmit)}
					>
						<FormField
							control={form.control}
							name="video2x_binary_path"
							render={({ field }) => (
								<FormItem className="grid gap-1 flex-grow">
									<div className="flex items-center">
										<FormLabel className="flex gap-2 items-center">
											Video2x Path
										</FormLabel>
									</div>
									<FormControl>
										<Input
											placeholder="eg. C:\Users\Default\Documents"
											{...field}
										/>
									</FormControl>
									<FormMessage />
									<FormDescription>
										Only directory path, no need to specify
										video2x.exe in the input.
									</FormDescription>
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="submit">Save changes</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
