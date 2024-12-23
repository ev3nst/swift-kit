import { Fragment, ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { FileCode2, Images, Scissors, Youtube } from 'lucide-react';

import { Separator } from '@/components/separator';

import { cn } from '@/lib/utils';

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
	return (
		<div className="container mx-auto p-6">
			<div className="flex items-center justify-center">
				{tools.map((tool, ti) => (
					<Fragment key={`layout_link_${ti}`}>
						<Link
							to={tool.href}
							key={tool.href}
							className={cn(
								'flex h-12 md:h-8 items-center justify-center rounded-lg px-4 text-center text-xs md:text-sm transition-colors hover:text-primary gap-1.5',
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
							<tool.icon className="w-3.5 h-3.5 hidden md:block" />
							{tool.name}
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
			<Separator className="my-6" />
			{children}
		</div>
	);
};

export default Layout;
