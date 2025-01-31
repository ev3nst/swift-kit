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
import { platforms } from './platforms';
import { useState } from 'react';

const createSchema = z.object({
	id: z.number().nullable().optional(),
	platform: z.string(),
	username: z.string(),
	password: z.string(),
	secret_question: z.any().nullable(),
	secret_question_answer: z.string().nullable(),
	note: z.string().nullable(),
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

export function CreateForm() {
	const [upsertFormOpen, setUpsertFormOpen] = useState(false);
	const form = useForm({
		resolver: zodResolver(createSchema),
		defaultValues: { ...emptyCredentialValues },
	});

	const { reset, getValues } = form;

	const closeDialog = () => {
		setUpsertFormOpen(false);
		reset({ ...emptyCredentialValues });
	};

	async function onSubmit(data: z.infer<typeof createSchema>) {
		console.log(data, 'data');
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
				<Button variant="info">
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
											<FormLabel className="flex gap-2 items-center text-sky-600">
												Platform
												<div className="relative">
													<Share2Icon className="w-4 h-4 bottom-[-8px] left-0 absolute" />
												</div>
											</FormLabel>
											{platformNames.filter(
												pn => pn === platform,
											).length !== 0 ? (
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
											<FormLabel className="flex gap-2 items-center text-sky-600">
												<div>
													Username
													<span className="ms-1 text-destructive">
														*
													</span>
												</div>
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
											<FormLabel className="flex gap-2 items-center text-sky-600">
												Password
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
