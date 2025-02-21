import { useState } from 'react';
import { PlusIcon } from 'lucide-react';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs';
import { Button } from '@/components/button';

import { CreateMovie } from './create-movie';
import { CreateAnime } from './create-anime';
import { CreateGame } from './create-game';

export function Create() {
	const [isOpen, setIsOpen] = useState(false);
	const closeDialog = () => {
		setIsOpen(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					variant="secondary"
					size="icon"
					className="text-green-500 hover:text-green-600"
				>
					<PlusIcon className="w-4 h-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="md:max-w-[800px]">
				<DialogHeader>
					<DialogTitle>Create Content</DialogTitle>
					<DialogDescription>
						Fill the required fields to create a new content.
					</DialogDescription>
				</DialogHeader>
				<Tabs defaultValue="movie">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="movie">Movie</TabsTrigger>
						<TabsTrigger value="anime">Anime</TabsTrigger>
						<TabsTrigger value="tv-serie">TV Serie</TabsTrigger>
						<TabsTrigger value="game">Game</TabsTrigger>
					</TabsList>
					<TabsContent
						value="movie"
						className="h-[400px] overflow-hidden overflow-y-scroll scrollbar-hide pt-2"
					>
						<CreateMovie
							key="create-movie-form"
							closeDialog={closeDialog}
						/>
					</TabsContent>
					<TabsContent
						value="anime"
						className="h-[500px] overflow-hidden overflow-y-scroll scrollbar-hide pt-2"
					>
						<CreateAnime closeDialog={closeDialog} />
					</TabsContent>
					<TabsContent
						value="tv-serie"
						className="h-[500px] overflow-hidden overflow-y-scroll scrollbar-hide pt-2"
					>
						<CreateMovie
							key="create-tv-serie-form"
							closeDialog={closeDialog}
						/>
					</TabsContent>
					<TabsContent
						value="game"
						className="h-[500px] overflow-hidden overflow-y-scroll scrollbar-hide pt-2"
					>
						<CreateGame closeDialog={closeDialog} />
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
