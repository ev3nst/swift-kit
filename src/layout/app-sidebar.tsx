import * as React from 'react';
import {
	DownloadIcon,
	FilePenIcon,
	GemIcon,
	ImageIcon,
	KeyIcon,
	LinkIcon,
	NotebookIcon,
	ShieldPlusIcon,
	VideoIcon,
} from 'lucide-react';

import {
	Sidebar,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarContent,
	SidebarHeader,
	SidebarRail,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarSeparator,
	SidebarFooter,
} from '@/components/sidebar';

import { useSidebar } from '@/hooks/use-sidebar';

import { NavUser } from './nav-user';

// This is sample data.
const data = {
	user: {
		name: 'example',
		email: 'm@example.com',
	},
	nav: [
		{
			groupName: 'Source & Content',
			items: [
				{
					name: 'Media',
					url: '#',
					icon: GemIcon,
				},
				{
					name: 'Downloader',
					url: '#',
					icon: DownloadIcon,
				},
				{
					name: 'URL Gatherer',
					url: '#',
					icon: LinkIcon,
				},
				{
					name: 'Notes',
					url: '#',
					icon: NotebookIcon,
				},
			],
		},
		{
			groupName: 'File Systems',
			items: [
				{
					name: 'File Name Replacer',
					url: '#',
					icon: FilePenIcon,
				},
				{
					name: 'Image Manipulator',
					url: '#',
					icon: ImageIcon,
				},
				{
					name: 'Video Manipulator',
					url: '#',
					icon: VideoIcon,
				},
			],
		},
		{
			groupName: 'Authorization',
			items: [
				{
					name: 'Security',
					url: '#',
					icon: ShieldPlusIcon,
				},
				{
					name: 'Keychain',
					url: '#',
					icon: KeyIcon,
				},
			],
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { state } = useSidebar();

	return (
		<Sidebar className="bg-background" collapsible="icon" {...props}>
			<SidebarHeader>
				<a className="py-1 flex items-center gap-4" href="/">
					<img
						src="/logo.svg"
						className={
							state === 'expanded' ? 'h-7 ms-2' : 'h-6 ms-0.5'
						}
					/>
					{state === 'expanded' && (
						<img src="/logo.png" className="h-6" />
					)}
				</a>
			</SidebarHeader>
			<SidebarSeparator className="mx-0" />
			<SidebarContent>
				{data.nav.map(group => (
					<SidebarGroup key={`sidebar-${group.groupName}`}>
						<SidebarGroupLabel>{group.groupName}</SidebarGroupLabel>
						<SidebarMenu>
							{group.items.map(item => (
								<SidebarMenuItem
									key={`sidebar-${group.groupName}-${item.name}`}
								>
									<SidebarMenuButton
										tooltip={item.name}
										asChild
									>
										<a href={item.url}>
											<item.icon />
											<span>{item.name}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroup>
				))}
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
