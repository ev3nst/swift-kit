import { Star } from 'lucide-react';

import { Dialog, DialogTitle, DialogContent } from '@/components/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/tabs';

export const AnimeDetail = ({ isOpen, setIsOpen, currentMedia }) => {
	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTitle className="hidden">Media Details</DialogTitle>
			<DialogContent
				className="sm:max-w-[800px]"
				aria-describedby={undefined}
			>
				<div className="flex flex-row shadow-xl w-full max-w-4xl">
					{currentMedia.cover && (
						<div className="w-1/3">
							<img
								src={currentMedia.cover}
								alt={currentMedia.title}
								className="rounded-2xl h-full object-cover"
							/>
						</div>
					)}

					<div className="w-2/3 px-6">
						<div className="flex justify-between items-center mb-3">
							<h1 className="text-2xl font-bold">
								{currentMedia.title}
							</h1>
						</div>

						<p className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
							{currentMedia.original_title && (
								<>
									<span>{currentMedia.original_title}</span>
								</>
							)}
						</p>

						<p className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
							{currentMedia.year && (
								<>
									<span>{currentMedia.year}</span>
								</>
							)}
							{currentMedia.duration && (
								<>
									<span>|</span>
									<span>{currentMedia.duration}</span>
								</>
							)}
						</p>

						<Tabs defaultValue="overview">
							<div className="flex gap-3">
								<TabsList>
									<TabsTrigger value="overview">
										Overview
									</TabsTrigger>
									<TabsTrigger value="trailer">
										Trailer
									</TabsTrigger>
								</TabsList>
								<div className="flex items-center text-yellow-400">
									<Star className="w-5 h-5" />
									<span className="ml-1 text-lg">
										{currentMedia.mal_rating}
									</span>
								</div>
							</div>
							<TabsContent
								className="h-[250px] overflow-y-auto overflow-x-hidden"
								value="overview"
							>
								{currentMedia.description && (
									<p className="text-sm mb-4 line-clamp-4">
										{currentMedia.description}
									</p>
								)}
								<div className="flex flex-col gap-4 text-sm mb-4">
									<div className="flex">
										<div className="font-semibold w-[100px]">
											Genre:
										</div>
										<div className="text-gray-300 flex-grow">
											{currentMedia.genre}
										</div>
									</div>
									<div className="flex">
										<div className="font-semibold w-[100px]">
											Episodes:
										</div>
										<div className="text-gray-300 flex-grow">
											{currentMedia.episodes}
										</div>
									</div>
									<div className="flex">
										<div className="font-semibold w-[100px]">
											Studios:
										</div>
										<div className="text-gray-300 flex-grow">
											{currentMedia.studios}
										</div>
									</div>
								</div>
							</TabsContent>
							<TabsContent
								className="h-[250px] overflow-y-auto overflow-x-hidden"
								value="trailer"
							>
								<div className="aspect-video flex-shrink-0">
									{currentMedia.trailer && (
										<iframe
											className="w-full h-full"
											allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
											src={currentMedia.trailer}
											allowFullScreen
										/>
									)}
								</div>
							</TabsContent>
						</Tabs>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
