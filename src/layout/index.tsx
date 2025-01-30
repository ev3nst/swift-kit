import type { ReactNode } from 'react';
import { XIcon, SquareIcon, MinusIcon } from 'lucide-react';

import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/sidebar';
import { Button } from '@/components/button';
import { Separator } from '@/components/separator';

import { AppSidebar } from './app-sidebar';
import { Breadcrumbs } from './breadcrumbs';
import { Notifications } from './notifications';

const Layout = ({ children }: { children: ReactNode }) => {
	const handleMinimize = () => {
		console.log('handleMinimize');
	};
	const handleMaximize = () => {
		console.log('handleMaximize');
	};
	const handleClose = () => {
		console.log('handleClose');
	};

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-[3.25rem] shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 px-4">
					<div className="flex items-center gap-2">
						<SidebarTrigger className="-ml-1" />
						<Separator
							orientation="vertical"
							className="mr-2 h-4"
						/>
						<Breadcrumbs />
					</div>
					<div className="flex gap-2 items-center">
						<div className="flex gap-2">
							<Notifications />
						</div>
						<Separator
							orientation="vertical"
							className="mr-2 h-4"
						/>
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
				<Separator />
				<div className="flex flex-1 flex-col gap-4 p-4 relative">
					{children}
					<ul className="animated-bg">
						<li></li>
						<li></li>
						<li></li>
						<li></li>
						<li></li>
						<li></li>
						<li></li>
						<li></li>
						<li></li>
						<li></li>
					</ul>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
};

export default Layout;
