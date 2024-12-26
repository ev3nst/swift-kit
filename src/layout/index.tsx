import { Fragment, ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import {
	FileCode2,
	Images,
	Scissors,
	Youtube,
	XIcon,
	SquareIcon,
	MinusIcon,
} from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

import { Button } from '@/components/button';
import { Separator } from '@/components/separator';

import { cn } from '@/lib/utils';

import Logo from '@/assets/logo.png';

const tools = [
	{
		name: 'YT Downloader',
		href: '/yt-downloader',
		icon: Youtube,
	},
	{
		name: 'No Intro & Outro',
		href: '/no-intro-outro',
		icon: Scissors,
	},
	{
		name: 'IMG Manipulation',
		href: '/image-manipulation/compressor',
		icon: Images,
	},
	{
		name: 'File Name Replacer',
		href: '/filename-replacer',
		icon: FileCode2,
	},
];

const Layout = ({ children }: { children: ReactNode }) => {
	const [location] = useLocation();
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
		<div className="pt-[6rem]">
			<div className="flex justify-between items-center px-6 select-none fixed top-0 left-0 right-0 py-5 w-full app-drag-region bg-background z-50 border-b">
				<div className="flex gap-2 items-center">
					<img className="h-[35px] w-auto" src={Logo} />
					<span className="font-sankofa text-2xl">SWIFTKIT</span>
				</div>
				<div className="flex items-center">
					{tools.map((tool, ti) => (
						<Fragment key={`layout_link_${ti}`}>
							<Link
								to={tool.href}
								key={tool.href}
								title={tool.name}
								className={cn(
									'flex h-10 md:h-8 px-4 md:px-3 items-center justify-center rounded-lg text-center text-xs md:text-sm transition-colors hover:text-primary gap-1.5 select-none',
									location?.startsWith(
										tool.href.split('/').length === 3
											? `/${tool.href.split('/')[1]}`
											: tool.href,
									) ||
										(location === '/' &&
											tool.href === '/yt-downloader')
										? 'bg-muted text-primary'
										: 'text-muted-foreground',
								)}
							>
								<tool.icon className="w-5 h-5 lg:w-3.5 lg:h-3.5 hidden sm:block md:hidden lg:block" />
								<span className="sm:hidden md:block">
									{tool.name}
								</span>
							</Link>
							{ti + 1 !== tools.length && (
								<Separator
									orientation="vertical"
									className="mx-2 h-4 hidden lg:block"
								/>
							)}
						</Fragment>
					))}
				</div>
				<div className="flex gap-1">
					<Button
						variant="ghost"
						className="clickable-content h-8 w-8 px-0"
						onClick={handleMinimize}
					>
						<MinusIcon className="h-[1rem] w-[1rem] " />
					</Button>
					<Button
						variant="ghost"
						className="clickable-content h-8 w-8 px-0"
						onClick={handleMaximize}
					>
						<SquareIcon className="h-[0.85rem] w-[0.85rem] " />
					</Button>
					<Button
						variant="ghost"
						className="clickable-content h-8 w-8 px-0 hover:bg-red-800"
						onClick={handleClose}
					>
						<XIcon className="h-[1.2rem] w-[1.2rem] " />
					</Button>
				</div>
			</div>
			<div className="container mx-auto sm:px-6">{children}</div>
		</div>
	);
};

export default Layout;
