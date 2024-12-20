import { cn } from '@/lib/utils';
import { Separator } from '@/components/separator';
import { FileCode2, ImageOff, Images, Scissors, Youtube } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';

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
		name: 'IMG Converter',
		href: '/image-converter',
		icon: Images,
	},
	{
		name: 'IMG Compressor',
		href: '/image-compressor',
		icon: ImageOff,
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
			<div className="mb-4 flex items-center justify-center">
				{tools.map((tool, ti) => (
					<>
						<Link
							href={tool.href}
							key={tool.href}
							className={cn(
								'flex h-8 items-center justify-center rounded-lg px-4 text-center text-sm transition-colors hover:text-primary gap-1',
								location?.startsWith(tool.href)
									? 'bg-muted text-primary'
									: 'text-muted-foreground',
							)}
						>
							<tool.icon className="w-4 h-4" />
							{tool.name}
						</Link>
						{ti + 1 !== tools.length && (
							<Separator
								orientation="vertical"
								className="mx-2 h-4"
							/>
						)}
					</>
				))}
			</div>
			{children}
		</div>
	);
};

export default Layout;
