import { useEffect, useState } from 'react';
import {
	InfoIcon,
	ClipboardIcon,
	EllipsisVerticalIcon,
	XIcon,
} from 'lucide-react';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';

import { Button } from '@/components/button';
import {
	Table,
	TableBody,
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
import { Input } from '@/components/input';

import { Credential } from '@/lib/models/credential';

import { CreateForm } from './create';
import { platforms } from './platforms';
import { toast } from 'sonner';
import { buttonVariants } from '@/lib/utils';

export function Keychain() {
	const [_, forceRender] = useState(0);
	const [credentials, setCredentials] = useState<
		Pick<Credential, 'id' | 'platform' | 'username' | 'password'>[]
	>([]);
	const [currentCredId, setCurrentCredId] = useState(0);
	const [platformFilter, setPlatformFilter] = useState('');
	const [usernameFilter, setUsernameFilter] = useState('');

	useEffect(() => {
		(async () => setCredentials(await Credential.getAll()))();
	}, []);

	const renderPlatform = (platformValue: string) => {
		const platformData = Object.values(platforms).find(
			p => p.value === platformValue.toLocaleLowerCase()
		);
		const platformName = Object.keys(platforms).find(
			pName => pName.toLocaleLowerCase() === platformValue
		);

		return (
			<div className="flex align-middle items-center gap-2">
				{platformData?.icon ?? <EllipsisVerticalIcon className="w-4" />}
				{platformValue === 'wifi'
					? 'Wi-Fi'
					: platformName ?? platformValue}
			</div>
		);
	};
	return (
		<div className="flex flex-col gap-5">
			<div className="flex flex-row items-center justify-between">
				<div className="flex gap-5">
					<div className="items-center">
						<Input
							type="text"
							placeholder="Platform"
							value={platformFilter}
							spellCheck={false}
							onChange={e => {
								setPlatformFilter(e.target.value);
							}}
						/>
					</div>
					<div className="items-center">
						<Input
							type="text"
							placeholder="Username"
							value={usernameFilter}
							spellCheck={false}
							onChange={e => {
								setUsernameFilter(e.target.value);
							}}
						/>
					</div>
				</div>
				<CreateForm
					key={`credential_modal_${_}`}
					currentCredId={currentCredId}
					onSubmitCb={async () => {
						setCredentials(await Credential.getAll());
					}}
				/>
			</div>

			<Table>
				<TableHeader>
					<TableRow className="uppercase">
						<TableHead className="font-light">Platform</TableHead>
						<TableHead className="font-light">Username</TableHead>
						<TableHead className="font-light">Password</TableHead>
						<TableHead className="font-light text-right">
							Actions
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{credentials.map(cred => (
						<TableRow key={`keychain-table-${cred.id}`}>
							<TableCell className="font-medium">
								{renderPlatform(cred.platform)}
							</TableCell>
							<TableCell>
								<div className="flex items-center">
									<Button
										className="me-2"
										variant="ghost"
										size="icon"
										onClick={async () => {
											await writeText(cred.username);
											toast.success(
												'Copied to clipboard!'
											);
										}}
									>
										<ClipboardIcon />
									</Button>
									<div>{cred.username}</div>
								</div>
							</TableCell>
							<TableCell>
								<div className="flex items-center font-mono">
									<Button
										className="me-2"
										variant="ghost"
										size="icon"
										onClick={async () => {
											await writeText(cred.password);
											toast.success(
												'Copied to clipboard!'
											);
										}}
									>
										<ClipboardIcon />
									</Button>
									<div>{cred.password}</div>
								</div>
							</TableCell>
							<TableCell className="text-right">
								<div className="text-right">
									<Button
										className="me-1"
										variant="outline"
										size="icon"
										onClick={() => {
											setCurrentCredId(cred.id);
											forceRender(_ + 1);
										}}
									>
										<InfoIcon />
									</Button>

									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												className="text-red-500 hover:text-red-600"
												variant="outline"
												size="icon"
											>
												<XIcon />
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>
													Are you absolutely sure?
												</AlertDialogTitle>
												<AlertDialogDescription>
													This action cannot be
													undone. This will
													permanently delete the
													selected credential record.
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
													onClick={async () => {
														const fetchedCred =
															await Credential.get(
																cred.id
															);
														await (
															fetchedCred as Credential
														).delete();
														const credentialsList =
															await Credential.getAll();
														setCredentials(
															credentialsList
														);
													}}
												>
													Delete
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

export default Keychain;
