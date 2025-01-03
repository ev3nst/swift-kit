import { Fragment, ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Crop, FileDown, ImageOff, Scaling } from 'lucide-react';

import { Separator } from '@/components/separator';

import { cn } from '@/lib/utils';

const img_tools = [
	{
		name: 'Compressor',
		href: '/compressor',
		icon: FileDown,
	},
	{
		name: 'Converter',
		href: '/converter',
		icon: ImageOff,
	},
	{
		name: 'Crop',
		href: '/crop',
		icon: Crop,
	},
	{
		name: 'Resizer',
		href: '/resizer',
		icon: Scaling,
	},
];

const IMGManipulationLayout = ({ children }: { children: ReactNode }) => {
	const [location] = useLocation();
	return (
		<div className="container mx-auto">
			<div className="flex items-center justify-center mb-4 gap-2">
				{img_tools.map((tool, ti) => (
					<Fragment key={`layout_link_${ti}`}>
						<Link
							to={tool.href}
							key={tool.href}
							title={tool.name}
							className={cn(
								'flex h-9 items-center justify-center rounded-lg px-2 text-center text-xs md:text-sm transition-colors hover:text-sky-400',
								location?.startsWith(tool.href)
									? 'bg-muted text-sky-400'
									: 'text-muted-foreground',
							)}
						>
							<tool.icon className="w-4 h-4 md:w-5 md:h-5" />
						</Link>
						{ti + 1 !== img_tools.length && (
							<Separator
								orientation="vertical"
								className="mx-2 h-4 hidden lg:block"
							/>
						)}
					</Fragment>
				))}
			</div>
			{children}
		</div>
	);
};

export default IMGManipulationLayout;
