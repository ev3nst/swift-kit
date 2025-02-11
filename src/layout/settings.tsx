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
	ffmpeg_binary_path: z.string().optional(),
	yt_dlp_binary_path: z.string().optional(),
});

export function Settings() {
	const form = useForm({
		resolver: zodResolver(settingsSchema),
		defaultValues: {
			ffmpeg_binary_path: '',
			yt_dlp_binary_path: '',
		},
	});

	useEffect(() => {
		(async () => {
			const { setValue } = form;
			const ffmpeg_binary_path = await Setting.get('ffmpeg_binary_path');
			if (ffmpeg_binary_path) {
				setValue('ffmpeg_binary_path', ffmpeg_binary_path.value);
			}
		})();
	}, [form]);

	async function onSubmit(data: z.infer<typeof settingsSchema>) {
		if (data.ffmpeg_binary_path) {
			const checkFFmpegPath = await api.fetch_files(
				data.ffmpeg_binary_path,
			);

			if (
				checkFFmpegPath.findIndex(
					cfp => cfp.filename === 'ffmpeg.exe',
				) === -1
			) {
				toast.error('FFmpeg could not be found.');
				return;
			}
		}

		await Setting.save('ffmpeg_binary_path', data.ffmpeg_binary_path ?? '');
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
							name="ffmpeg_binary_path"
							render={({ field }) => (
								<FormItem className="grid gap-1 flex-grow">
									<div className="flex items-center">
										<FormLabel className="flex gap-2 items-center">
											FFmpeg Binary Path
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
										ffmpeg.exe in the input.
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
