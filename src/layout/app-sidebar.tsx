import * as React from 'react';
import { Link, useLocation } from 'wouter';
import {
	DownloadIcon,
	FilePenIcon,
	GemIcon,
	ImageIcon,
	KeyIcon,
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
					to: '/media',
					icon: GemIcon,
				},
				{
					name: 'Downloader',
					to: '/downloader',
					icon: DownloadIcon,
				},
				{
					name: 'Notes',
					to: '/notes',
					icon: NotebookIcon,
				},
			],
		},
		{
			groupName: 'File Systems',
			items: [
				{
					name: 'Image Manipulator',
					to: '/image-manipulator',
					icon: ImageIcon,
				},
				{
					name: 'Video Manipulator',
					to: '/video-manipulator',
					icon: VideoIcon,
				},
				{
					name: 'File Name Replacer',
					to: '/filename-replacer',
					icon: FilePenIcon,
				},
			],
		},
		{
			groupName: 'Authorization',
			items: [
				{
					name: 'Security',
					to: '/security',
					icon: ShieldPlusIcon,
				},
				{
					name: 'Keychain',
					to: '/keychain',
					icon: KeyIcon,
				},
			],
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { state } = useSidebar();
	const [location] = useLocation();

	return (
		<Sidebar className="bg-background" collapsible="icon" {...props}>
			<SidebarHeader>
				<Link className="py-1 flex items-center gap-4" to="/">
					<img
						src="/logo.svg"
						className={
							state === 'expanded' ? 'h-7 ms-2' : 'h-6 ms-0.5'
						}
					/>
					{state === 'expanded' && (
						<img src="/logo.png" className="h-6" />
					)}
				</Link>
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
										isActive={location.startsWith(item.to)}
									>
										<Link to={item.to}>
											<item.icon />
											<span>{item.name}</span>
										</Link>
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
