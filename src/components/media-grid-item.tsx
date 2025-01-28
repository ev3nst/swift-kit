import { ClockIcon, StarIcon } from 'lucide-react';

import { Badge } from '@/components/badge';

import { cn } from '@/lib/utils';

export function MediaGridItem({ media, mediaType, className, ...props }: any) {
	const coverSplit = media.cover.split('.jpg');
	const thumbnailSize = `${coverSplit[0]}._V1_QL75_UY400_UX270,0,270,400_.jpg`;

	return (
		<div
			className={cn('space-y-3 info-wrap select-none', className)}
			{...props}
		>
			<div className="overflow-hidden rounded-md relative">
				<img
					src={thumbnailSize}
					alt={media.title}
					className="object-cover w-full h-[250px] hover:scale-105 transition-transform duration-300"
				/>

				<Badge className="flex absolute right-2 top-1 bg-background/40 text-yellow-400 text-sm px-1 py-0 items-center">
					<StarIcon className="w-3" />
					<span className="ms-1">{media.personal_rating}</span>
				</Badge>

				{media.duration && (
					<Badge className="flex absolute left-2 top-1 bg-background/40 font-light text-xs px-1 py-0 items-center">
						<ClockIcon className="w-3" />
						<span className="ms-1">{media.duration}</span>
					</Badge>
				)}
			</div>

			<div className="space-y-1 sm:text-[0.85rem] xl:text-[0.9rem] mt-0">
				<h3 className="font-medium truncate">{media.title}</h3>
				<div className="text-sm text-muted-foreground flex justify-between">
					<p className="truncate pe-3">{media.genre}</p>
					<p>
						{media.year
							? media.year
							: media.release_date
								? media.release_date
								: ''}
					</p>
				</div>
			</div>
		</div>
	);
}
