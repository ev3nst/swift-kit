import { StarIcon } from 'lucide-react';
import { Badge } from '@/components/badge';
import { cn } from '@/lib/utils';

export function MediaGridItem({ media, className, ...props }: any) {
	return (
		<div
			className={cn('w-[150px] relative select-none', className)}
			{...props}
		>
			<div className="mb-2">
				<img
					src={media.cover}
					alt={media.title}
					className="h-[193px] w-full object-cover rounded-lg hover:scale-105 transition-transform duration-300"
				/>

				<Badge className="flex absolute right-1 top-1 bg-background/100 hover:bg-background/100 text-yellow-400 text-sm px-1 py-0 items-center">
					<StarIcon className="w-3" />
					<span className="ms-1">{media.imdb_rating}</span>
				</Badge>
			</div>

			<div className="space-y-1 sm:text-[0.85rem] xl:text-[0.9rem] mt-0">
				<h3 className="font-medium text-xs truncate hover:brightness-125">
					{media.title}
				</h3>
				<div className="text-xs text-muted-foreground flex justify-between">
					<p className="truncate pe-3 text-xs hover:brightness-125">
						{media.genre}
					</p>
					<p className="text-xs hover:brightness-125">
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
