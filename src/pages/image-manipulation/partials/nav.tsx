import { Fragment } from 'react';
import { Link, useLocation } from 'wouter';
import { CropIcon, DiamondIcon, ImageOffIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

const data = [
	{
		name: 'Manipulator',
		href: '/manipulator',
		icon: ImageOffIcon,
	},
	{
		name: 'Cropper',
		href: '/cropper',
		icon: CropIcon,
	},
	{
		name: 'Icon Generator',
		href: '/icon-generator',
		icon: DiamondIcon,
	},
];

export function Nav() {
	const [wouterLocation] = useLocation();
	return (
		<div className="inline-flex -space-x-px rounded-lg border">
			{data.map((tool, ti) => (
				<Fragment key={`layout_link_${ti}`}>
					<Link
						to={tool.href}
						key={tool.href}
						title={tool.name}
						className={cn(
							'flex items-center justify-center px-3 py-2 text-center text-xs md:text-sm transition-colors rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10 border-r last:border-r-0',
							wouterLocation?.startsWith(tool.href) ||
								(location.pathname ===
									'/app/image-manipulation' &&
									ti === 0)
								? 'bg-muted'
								: 'text-muted-foreground',
						)}
					>
						<tool.icon className="w-3.5 h-3.5 me-1 hidden sm:block" />
						{tool.name}
					</Link>
				</Fragment>
			))}
		</div>
	);
}
