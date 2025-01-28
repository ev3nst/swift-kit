import { useState } from 'react';
import { Star } from 'lucide-react';

import { MediaGridItem } from '@/components/media-grid-item';
import { Dialog, DialogTitle, DialogContent } from '@/components/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/tabs';

import { Filter } from './partials/filter';

const gridData = [
	{
		id: '1',
		cover: 'https://m.media-amazon.com/images/M/MV5BZjM3ZDA2YmItMzhiMi00ZGI3LTg3ZGQtOTk3Nzk0MDY0ZDZhXkEyXkFqcGc@.jpg',
		personal_rating: '6.2',
		duration: '2h 24m',
		title: 'Transformers',
		genre: 'Action, Sci-Fi, Adventure',
		year: '2007',
		release_date: '03/07/2007',
	},
	{
		id: '2',
		cover: 'https://m.media-amazon.com/images/M/MV5BN2FjNWExYzEtY2YzOC00YjNlLTllMTQtNmIwM2Q1YzBhOWM1XkEyXkFqcGc@.jpg',
		personal_rating: '8.9',
		duration: '2h 18m',
		title: 'Shutter Island',
		genre: 'Psychological, Drama, Mystery',
		year: '2010',
		release_date: '19/02/2010',
	},
];

const Media = () => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<Filter />
			<div className="flex space-x-4 pb-4 mt-5">
				{gridData.map(content => (
					<MediaGridItem
						key={content.title}
						media={content}
						onClick={() => {
							console.log('fetching movie details');
							setIsOpen(true);
						}}
						mediaType="movies"
					/>
				))}
				<Dialog open={isOpen} onOpenChange={setIsOpen}>
					<DialogTitle className="hidden">Movie Details</DialogTitle>
					<DialogContent
						className="sm:max-w-[800px]"
						aria-describedby={undefined}
					>
						<div className="flex flex-row shadow-xl w-full max-w-4xl">
							<div className="w-1/3">
								<img
									src="https://m.media-amazon.com/images/M/MV5BMjMxNjY2MDU1OV5BMl5BanBnXkFtZTgwNzY1MTUwNTM@._V1_QL75_UY979_UX600,0,600,979_.jpg"
									alt="Avengers: Infinity War"
									className="rounded-2xl h-full object-cover"
								/>
							</div>

							<div className="w-2/3 px-6">
								<div className="flex justify-between items-center mb-3">
									<h1 className="text-2xl font-bold">
										Avengers: Infinity War
									</h1>
									<div className="flex items-center text-yellow-400">
										<Star className="w-5 h-5" />
										<span className="ml-1 text-lg">
											9.0
										</span>
									</div>
								</div>

								<p className="flex gap-2 text-sm text-muted-foreground mb-3">
									<span>2018</span>
									<span>|</span>
									<span>2h 23m</span>
									<span>|</span>
									<span>USA</span>
								</p>

								<Tabs defaultValue="overview">
									<TabsList>
										<TabsTrigger value="overview">
											Overview
										</TabsTrigger>
										<TabsTrigger value="trailer">
											Trailer
										</TabsTrigger>
									</TabsList>
									<TabsContent value="overview">
										<p className="text-sm mb-4">
											The Avengers and their Super Hero
											allies must be willing to sacrifice
											all in an attempt to defeat the
											powerful Thanos before his blitz of
											devastation and ruin puts an end to
											the universe.
										</p>
										<div className="grid grid-cols-2 gap-4 text-sm mb-4">
											<div className="font-semibold">
												Genre:
											</div>
											<div className="text-gray-300">
												Action, Adventure, Fantasy
											</div>
											<div className="font-semibold">
												Director:
											</div>
											<div className="text-gray-300">
												John Doe
											</div>
											<div className="font-semibold">
												Writers:
											</div>
											<div className="text-gray-300">
												Anthony Russo, Joe Russo
											</div>
											<div className="font-semibold">
												Starring:
											</div>
											<div className="text-gray-300">
												Scarlett Johansson, Tessa
												Thompson, Robert Downey Jr
											</div>
										</div>
									</TabsContent>
									<TabsContent value="trailer" className="">
										<div className="aspect-video flex-shrink-0 h-[240px]">
											<iframe
												className="w-full h-full"
												allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
												src="https://www.youtube.com/embed/6ZfuNTqbHE8?si=DsErOR3thS-RmKwV"
												allowFullScreen
											/>
										</div>
									</TabsContent>
								</Tabs>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</>
	);
};

export default Media;
