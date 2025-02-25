import { Star } from 'lucide-react';

import { convertFileSrc } from '@tauri-apps/api/core';

import { Dialog, DialogTitle, DialogContent } from '@/components/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/tabs';

import api from '@/lib/api';

export const MovieDetail = ({ isOpen, setIsOpen, currentMedia }) => {
	const renderOtherImages = () => {
		let otherImagesArr = currentMedia.other_images.split(',');
		if (
			currentMedia.other_images_local !== null &&
			currentMedia.other_images_local !== ''
		) {
			otherImagesArr = otherImagesArr.map(i => convertFileSrc(i));
		}

		return otherImagesArr.map((oi, ii) => (
			<img
				key={`oi_${currentMedia.id}_${ii}`}
				className="h-[150px]"
				src={oi}
			/>
		));
	};

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
							{currentMedia.country && (
								<>
									<span>|</span>
									<span>{currentMedia.country}</span>
								</>
							)}

							{currentMedia.country && (
								<>
									<span>|</span>
									<span>{currentMedia.language}</span>
								</>
							)}
							{currentMedia.scraped_url && (
								<>
									<span>|</span>
									<img
										src="/imdb-logo.png"
										className="h-4 hover:cursor-pointer hover:brightness-125"
										onClick={() =>
											api.open_external_url(
												currentMedia.scraped_url,
											)
										}
									/>
								</>
							)}
						</p>

						<Tabs defaultValue="overview">
							<div className="flex gap-3">
								<TabsList>
									<TabsTrigger value="overview">
										Overview
									</TabsTrigger>
									<TabsTrigger value="other_images">
										Images
									</TabsTrigger>
									<TabsTrigger value="trailer">
										Trailer
									</TabsTrigger>
								</TabsList>
								<div className="flex items-center text-yellow-400">
									<Star className="w-5 h-5" />
									<span className="ml-1 text-lg">
										{currentMedia.imdb_rating}
									</span>
								</div>
							</div>
							<TabsContent
								className="h-[250px] overflow-y-auto overflow-x-hidden"
								value="other_images"
							>
								<div className="flex flex-wrap gap-4 overflow-y-auto">
									{currentMedia.other_images &&
										renderOtherImages()}
								</div>
							</TabsContent>
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
									<div className="webkit-box">
										<div className="font-semibold w-[100px]">
											Genre:
										</div>
										<div className="text-gray-300 max-w-[385px] line-clamp-2">
											{currentMedia.genre}
										</div>
									</div>
									<div className="webkit-box">
										<div className="font-semibold w-[100px]">
											Director:
										</div>
										<div className="text-gray-300 max-w-[385px] line-clamp-2">
											{currentMedia.directors}
										</div>
									</div>
									<div className="webkit-box">
										<div className="font-semibold w-[100px]">
											Writers:
										</div>
										<div className="text-gray-300 max-w-[385px] line-clamp-2">
											{currentMedia.writers}
										</div>
									</div>
									<div className="webkit-box">
										<div className="font-semibold w-[100px]">
											Starring:
										</div>
										<div className="text-gray-300 max-w-[385px] line-clamp-2">
											{currentMedia.actors}
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
