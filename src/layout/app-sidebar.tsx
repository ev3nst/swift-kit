import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
	DownloadIcon,
	FilePenIcon,
	FileSearchIcon,
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
import { useIsMobile } from '@/hooks/use-mobile';

import { emitter } from '@/lib/event';

import { NavUser } from './nav-user';

const data = {
	// This is sample data.
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
					name: 'Image Manipulation',
					to: '/image-manipulation',
					icon: ImageIcon,
				},
				{
					name: 'Video Manipulator',
					to: '/video-manipulation',
					icon: VideoIcon,
				},
				{
					name: 'File Name Replacer',
					to: '/filename-replacer',
					icon: FilePenIcon,
				},
				{
					name: 'Finder',
					to: '/finder',
					icon: FileSearchIcon,
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
	const [wouterLocation] = useLocation();
	const isMobile = useIsMobile();
	const [isTaskRunning, setIsTaskRunning] = useState(false);

	useEffect(() => {
		const handleTaskStart = () => setIsTaskRunning(true);
		const handleTaskEnd = () => setIsTaskRunning(false);

		emitter.on('taskStart', handleTaskStart);
		emitter.on('taskEnd', handleTaskEnd);
		return () => {
			emitter.off('taskStart', handleTaskStart);
			emitter.off('taskEnd', handleTaskEnd);
		};
	}, []);

	return (
		<Sidebar
			className={`bg-background ${isTaskRunning ? 'hover:cursor-wait' : ''}`}
			collapsible="icon"
			{...props}
		>
			<SidebarHeader className="flex-row flex items-center gap-4 py-3 app-drag-region">
				<img
					src="/logo-square.png"
					className={state === 'expanded' ? 'h-7 ms-2' : 'h-6 ms-0.5'}
				/>
				{(state === 'expanded' || isMobile) && (
					<img src="/logo.png" className="h-6" />
				)}
			</SidebarHeader>
			<SidebarSeparator className="mx-0" />
			<SidebarContent
				className={isTaskRunning ? 'pointer-events-none' : ''}
			>
				{data.nav.map((group, groupIndex) => (
					<SidebarGroup key={`sidebar-${group.groupName}`}>
						<SidebarGroupLabel>{group.groupName}</SidebarGroupLabel>
						<SidebarMenu>
							{group.items.map((item, itemIndex) => (
								<SidebarMenuItem
									key={`sidebar-${group.groupName}-${item.name}`}
								>
									<SidebarMenuButton
										tooltip={item.name}
										asChild
										isActive={
											wouterLocation.startsWith(
												item.to,
											) ||
											(location.pathname === '/app/' &&
												itemIndex === 0 &&
												groupIndex === 0)
										}
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
			<SidebarFooter
				className={isTaskRunning ? 'pointer-events-none' : ''}
			>
				<NavUser user={data.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
