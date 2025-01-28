import { Fragment } from 'react';
import { Link, useLocation } from 'wouter';
import { FilmIcon, Gamepad2Icon, SparklesIcon, TvIcon } from 'lucide-react';

import { Separator } from '@/components/separator';

import { cn } from '@/lib/utils';

const data = [
	{
		name: 'Movies',
		href: '/movies',
		icon: FilmIcon,
	},
	{
		name: 'Animes',
		href: '/animes',
		icon: SparklesIcon,
	},
	{
		name: 'TV Series',
		href: '/tv-series',
		icon: TvIcon,
	},
	{
		name: 'Games',
		href: '/games',
		icon: Gamepad2Icon,
	},
];

export function Nav() {
	const [wouterLocation] = useLocation();
	return (
		<div className="flex items-center gap-2">
			{data.map((tool, ti) => (
				<Fragment key={`layout_link_${ti}`}>
					<Link
						to={tool.href}
						key={tool.href}
						title={tool.name}
						className={cn(
							'flex items-center justify-center rounded-lg px-3 py-2 text-center text-xs md:text-sm transition-colors',
							wouterLocation?.startsWith(tool.href) ||
								(location.pathname === '/media' && ti === 0)
								? 'bg-muted'
								: 'text-muted-foreground',
						)}
					>
						<tool.icon className="w-3.5 h-3.5 me-1 hidden sm:block" />
						{tool.name}
					</Link>

					{ti + 1 !== data.length && (
						<Separator
							orientation="vertical"
							className="mx-1 h-4 hidden lg:block"
						/>
					)}
				</Fragment>
			))}
		</div>
	);
}
