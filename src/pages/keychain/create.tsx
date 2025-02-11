import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { KeyIcon, PlusIcon, Share2Icon, UserIcon } from 'lucide-react';

import {
	Dialog,
	DialogContent,
	DialogTrigger,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/dialog';
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from '@/components/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/select';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { Textarea } from '@/components/textarea';

import { Credential } from '@/lib/models/credential';

import { platforms } from './platforms';

const createSchema = z.object({
	platform: z.string(),
	username: z.string(),
	password: z.string(),
	secret_question: z.any().optional(),
	secret_question_answer: z.string().optional(),
	note: z.string().optional(),
});

const platformNames = Object.keys(platforms);
const emptyCredentialValues = {
	platform: '',
	username: '',
	password: '',
	secret_question: '',
	secret_question_answer: '',
	note: '',
};

export function CreateForm({ currentCredId, onSubmitCb }) {
	const [mode, setMode] = useState('create');
	const [upsertFormOpen, setUpsertFormOpen] = useState(false);
	const form = useForm({
		resolver: zodResolver(createSchema),
		defaultValues: { ...emptyCredentialValues },
	});
	const { reset, getValues, setValue } = form;

	useEffect(() => {
		if (currentCredId !== 0) {
			(async () => {
				const fetchedCred = await Credential.get(currentCredId);
				Object.entries(fetchedCred).forEach(([key, value]) => {
					setValue(key as any, value);
				});
				setMode('update');
				setUpsertFormOpen(true);
			})();
		}
	}, [currentCredId, setValue]);

	const closeDialog = () => {
		setUpsertFormOpen(false);
		reset({ ...emptyCredentialValues });
	};

	async function onSubmit(data: z.infer<typeof createSchema>) {
		if (mode === 'create') {
			await Credential.insert(data);
		} else {
			const fetchedCred = await Credential.get(currentCredId);
			const {
				platform,
				username,
				password,
				secret_question,
				secret_question_answer,
				note,
			} = getValues();
			fetchedCred.platform = platform;
			fetchedCred.username = username;
			fetchedCred.password = password;
			fetchedCred.secret_question = secret_question;
			fetchedCred.secret_question_answer = secret_question_answer;
			fetchedCred.note = note;
			await fetchedCred.update();
		}

		await onSubmitCb();
		closeDialog();
	}

	const platform = getValues('platform');

	return (
		<Dialog
			open={upsertFormOpen}
			onOpenChange={() => {
				setUpsertFormOpen(!upsertFormOpen);
				reset({ ...emptyCredentialValues });
			}}
		>
			<DialogTrigger asChild>
				<Button
					variant="info"
					onClick={() => {
						setMode('create');
					}}
				>
					New
					<PlusIcon className="h-3" />
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-[800px] overflow-visible clickable-content">
				<DialogHeader>
					<DialogTitle className="flex gap-2 items-center">
						Credential Record <KeyIcon className="w-4" />
					</DialogTitle>
					<DialogDescription>
						Create or update a credential record.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						className="grid gap-5"
						onSubmit={form.handleSubmit(onSubmit)}
					>
						<div className="flex flex-col gap-5">
							<div className="grid grid-cols-3 gap-5">
								<FormField
									control={form.control}
									name="platform"
									render={({ field }) => (
										<FormItem className="grid gap-1">
											<FormLabel className="flex gap-1 items-center text-sky-600">
												Platform
												<span className="text-destructive">
													*
												</span>
												<div className="relative">
													<Share2Icon className="w-4 h-4 bottom-[-8px] left-0 absolute" />
												</div>
											</FormLabel>
											{(currentCredId !== 0 &&
												platformNames.filter(
													pn =>
														pn.toLocaleLowerCase() ===
														platform,
												).length !== 0) ||
											platform === '' ? (
												<Select
													onValueChange={
														field.onChange
													}
													defaultValue={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select a Platform" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{platformNames.map(
															platformName => (
																<SelectItem
																	key={`credential_form_platform_${platforms[platformName].value}`}
																	value={
																		platforms[
																			platformName
																		].value
																	}
																>
																	<div className="flex gap-2 items-center">
																		{
																			platforms[
																				platformName
																			]
																				.icon
																		}
																		{
																			platformName
																		}
																	</div>
																</SelectItem>
															),
														)}
													</SelectContent>
												</Select>
											) : (
												<FormControl>
													<Input {...field} />
												</FormControl>
											)}
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="username"
									render={({ field }) => (
										<FormItem className="grid gap-1">
											<FormLabel className="flex gap-1 items-center text-sky-600">
												Username
												<span className="text-destructive">
													*
												</span>
												<div className="relative">
													<UserIcon className="w-4 h-4 bottom-[-8px] left-0 absolute" />
												</div>
											</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem className="grid gap-1">
											<FormLabel className="flex gap-1 items-center text-sky-600">
												Password
												<span className="text-destructive">
													*
												</span>
												<div className="relative">
													<KeyIcon className="w-4 h-4 bottom-[-7px] left-0 absolute" />
												</div>
											</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<FormField
								control={form.control}
								name="secret_question"
								render={({ field }) => (
									<FormItem className="grid gap-1">
										<FormLabel className="text-sky-600">
											<div>Secret Question</div>
										</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="secret_question_answer"
								render={({ field }) => (
									<FormItem className="grid gap-1">
										<FormLabel className="text-sky-600">
											<div>Secret Question Answer</div>
										</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="note"
								render={({ field }) => (
									<FormItem className="grid gap-1">
										<FormLabel className="text-sky-600">
											Note
										</FormLabel>
										<FormControl>
											<Textarea
												rows={3}
												placeholder="Extra notes about this credential record."
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<Button variant="secondary" type="submit">
							Submit
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
