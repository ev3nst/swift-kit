import { useState } from 'react';
import {
	InfoIcon,
	TrashIcon,
	ClipboardIcon,
	EllipsisVerticalIcon,
} from 'lucide-react';
import { Button } from '@/components/button';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/table';
import { Input } from '@/components/input';

import { CreateForm } from './create';
import { platforms } from './platforms';

export function Keychain() {
	const [platformFilter, setPlatformFilter] = useState('');
	const [usernameFilter, setUsernameFilter] = useState('');
	const renderPlatform = (platformValue: string) => {
		const platformData = Object.values(platforms).find(
			p => p.value === platformValue.toLocaleLowerCase(),
		);
		const platformName = Object.keys(platforms).find(
			pName => pName.toLocaleLowerCase() === platformValue,
		);

		return (
			<div className="flex align-middle items-center gap-2">
				{platformData?.icon ?? <EllipsisVerticalIcon className="w-4" />}
				{platformValue === 'wifi'
					? 'Wi-Fi'
					: (platformName ?? platformValue)}
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
				<CreateForm />
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
					{Array.from({ length: 8 }).map(cred => (
						<TableRow key={`keychain-table-${cred}`}>
							<TableCell className="font-medium">
								{renderPlatform('Gmail')}
							</TableCell>
							<TableCell>
								<div className="flex items-center">
									<Button
										className="me-2"
										variant="ghost"
										size="icon"
									>
										<ClipboardIcon />
									</Button>
									<div>test@example.com</div>
								</div>
							</TableCell>
							<TableCell>
								<div className="flex items-center font-mono">
									<Button
										className="me-2"
										variant="ghost"
										size="icon"
									>
										<ClipboardIcon />
									</Button>
									<div>123123</div>
								</div>
							</TableCell>
							<TableCell className="text-right">
								<div className="text-right">
									<Button
										className="me-1"
										variant="outline"
										size="icon"
										onClick={() => {}}
									>
										<InfoIcon />
									</Button>
									<Button
										className="text-red-500 hover:text-red-600"
										variant="outline"
										size="icon"
										onClick={() => {}}
									>
										<TrashIcon />
									</Button>
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
