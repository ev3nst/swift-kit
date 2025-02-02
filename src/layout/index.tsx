import type { ReactNode } from 'react';

import { SidebarInset, SidebarProvider } from '@/components/sidebar';
import { Separator } from '@/components/separator';

import { AppSidebar } from './app-sidebar';
import { Header } from './header';

const Layout = ({ children }: { children: ReactNode }) => {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<Header />
				<Separator />
				<div className="flex flex-1 flex-col gap-4 p-4 relative pt-[4.4rem]">
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
