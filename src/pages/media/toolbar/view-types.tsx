import { LayoutGridIcon, ListIcon } from 'lucide-react';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '@/components/dropdown-menu';
import { Button } from '@/components/button';

const availableTypes = [
	{
		name: 'Grid',
		icon: LayoutGridIcon,
	},
	{
		name: 'List',
		icon: ListIcon,
	},
];

export function ViewTypes() {
	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="secondary" size="icon">
						<LayoutGridIcon className="opacity-80 w-6 h-6" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className="w-30 rounded-lg space-y-1"
					align="start"
					side="bottom"
					sideOffset={4}
				>
					<DropdownMenuLabel className="text-xs text-muted-foreground">
						View Types
					</DropdownMenuLabel>
					{availableTypes.map(vtype => (
						<DropdownMenuItem
							key={vtype.name}
							onClick={() => console.log(vtype)}
							className={`gap-2 p-2 ${
								vtype.name === 'Grid' ? 'bg-secondary' : ''
							}`}
						>
							<vtype.icon />
							{vtype.name}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}
