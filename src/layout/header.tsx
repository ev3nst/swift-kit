import { XIcon, SquareIcon, MinusIcon } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

import { SidebarTrigger } from '@/components/sidebar';
import { Button } from '@/components/button';
import { Separator } from '@/components/separator';

import { useSidebar } from '@/hooks/use-sidebar';

import { Breadcrumbs } from './breadcrumbs';
import { Notifications } from './notifications';
import { Settings } from './settings';

export function Header() {
	const { state } = useSidebar();
	const appWindow = getCurrentWindow();

	const handleMinimize = async () => {
		await appWindow.minimize();
	};

	const handleMaximize = async () => {
		await appWindow.toggleMaximize();
	};

	const handleClose = async () => {
		await appWindow.close();
	};
	return (
		<header
			className={`flex h-[3.30rem] shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear  px-4 app-drag-region fixed bg-background z-10 right-0 border-b ${
				state === 'collapsed' ? 'left-0' : 'md:left-[256px] sm:left-0'
			}`}
		>
			<div className="flex items-center gap-2">
				<SidebarTrigger className="-ml-1" />
				<Separator orientation="vertical" className="mr-2 h-4" />
				<Breadcrumbs />
			</div>
			<div className="flex gap-2 items-center">
				<div className="flex gap-2">
					<Notifications />
					<Settings />
				</div>
				<Separator orientation="vertical" className="mr-2 h-4" />
				<div className="flex gap-1">
					<Button
						variant="ghost"
						className="h-8 w-8 px-0"
						onClick={handleMinimize}
					>
						<MinusIcon className="h-[1rem] w-[1rem] " />
					</Button>
					<Button
						variant="ghost"
						className="h-8 w-8 px-0"
						onClick={handleMaximize}
					>
						<SquareIcon className="h-[0.85rem] w-[0.85rem] " />
					</Button>
					<Button
						variant="ghost"
						className="h-8 w-8 px-0 hover:bg-red-800"
						onClick={handleClose}
					>
						<XIcon className="h-[1.2rem] w-[1.2rem] " />
					</Button>
				</div>
			</div>
		</header>
	);
}
