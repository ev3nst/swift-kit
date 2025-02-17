import { SidebarTrigger } from '@/components/sidebar';
import { Separator } from '@/components/separator';

import { useSidebar } from '@/hooks/use-sidebar';

import { Breadcrumbs } from './breadcrumbs';
import { Notifications } from './notifications';
import { Settings } from './settings';
import { WindowActions } from './window-actions';

export function Header() {
	const { state } = useSidebar();
	return (
		<header
			className={`flex h-[3.30rem] shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear px-4 app-drag-region fixed bg-background z-10 right-0 border-b ${
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
				<WindowActions />
			</div>
		</header>
	);
}
