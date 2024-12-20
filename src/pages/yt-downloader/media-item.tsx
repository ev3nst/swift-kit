import { cn } from '@/lib/utils';

type MediaItemProps = {
	media: any;
	aspectRatio?: 'portrait' | 'square';
	width?: number;
	height?: number;
	className?: string;
};

export function MediaItem({
	media,
	aspectRatio = 'portrait',
	width,
	height,
	className,
	...props
}: MediaItemProps) {
	return (
		<div className={cn('space-y-3', className)} {...props}>
			<div className="overflow-hidden rounded-md">
				<img
					src={media.thumbnail}
					alt={media.title}
					width={width}
					height={height}
					className={cn(
						'h-auto w-auto object-cover transition-all hover:scale-105',
						aspectRatio === 'portrait'
							? 'aspect-[3/4]'
							: 'aspect-square',
					)}
				/>
			</div>

			<div className="space-y-1 text-sm">
				<h3 className="font-medium leading-none">{media.title}</h3>
				<p className="text-xs text-muted-foreground">
					{media.uploader}
				</p>
			</div>
		</div>
	);
}
