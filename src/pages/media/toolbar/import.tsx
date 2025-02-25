import { ChangeEvent, ClipboardEvent, useState } from 'react';
import { DownloadIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/dialog';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Loading } from '@/components/loading';

import api from '@/lib/api';
import { MovieModel } from '@/lib/models/movie';
import { AnimeModel } from '@/lib/models/anime';
import { GameModel } from '@/lib/models/game';
import { hasNewLines, sleep } from '@/lib/utils';

function determineLinkType(
	link: string,
): ('movie' | 'game' | 'anime') | undefined {
	if (link.startsWith('https://www.imdb.com')) {
		return 'movie';
	}
	if (link.startsWith('https://store.steampowered.com')) {
		return 'game';
	}
	if (link.startsWith('https://steamdb.info')) {
		return 'game';
	}
	if (link.startsWith('https://myanimelist.net')) {
		return 'anime';
	}
}

export function Import() {
	const [isOpen, setIsOpen] = useState(false);
	const [links, setLinks] = useState<string[]>([]);
	const [processLoading, setProcessLoading] = useState(false);

	const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		const rawText = e.clipboardData.getData('text');
		if (hasNewLines(rawText)) {
			const lines = rawText.split(/\r?\n/);
			for (let li = 0; li < lines.length; li++) {
				const line = lines[li];
				addLink(line);
			}
		} else if (rawText.includes(',')) {
			const lines = rawText.split(',');
			for (let li = 0; li < lines.length; li++) {
				const line = lines[li];
				addLink(line);
			}
		} else {
			addLink(rawText);
		}
	};

	const addLink = (str: string) => {
		let pastedText = str;
		if (pastedText.includes('?')) {
			pastedText = pastedText.split('?')[0];
		}

		pastedText = pastedText.replace(/\/$/, '').trim();
		if (determineLinkType(pastedText) !== undefined) {
			if (!links.includes(pastedText)) {
				if (pastedText.startsWith('https://steamdb.info')) {
					pastedText = pastedText.replace(
						'https://steamdb.info',
						'https://store.steampowered.com',
					);
				}
				setLinks(prevState => [...prevState, pastedText]);
			}
		}
	};

	const preventTyping = (e: ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
	};

	const handleStart = async () => {
		setProcessLoading(true);
		try {
			for (let li = 0; li < links.length; li++) {
				const link = links[li];
				toast.info(`Link: ${link} process started.`);

				try {
					if (determineLinkType(link) === 'movie') {
						const checkIfExists =
							await MovieModel.getByScrapedUrl(link);
						if (!checkIfExists) {
							const data = await api.scrape_movie(link);
							if (data.title && data.title !== '') {
								const newMovie = new MovieModel(data);
								await newMovie.save();
								toast.success(
									`Movie: ${data.title} has been saved.`,
								);
								await sleep(2000);
							}
						}
					}

					if (determineLinkType(link) === 'anime') {
						const checkIfExists =
							await AnimeModel.getByScrapedUrl(link);
						if (!checkIfExists) {
							const data = await api.scrape_anime(link);
							if (data.title && data.title !== '') {
								const newAnime = new AnimeModel(data);
								await newAnime.save();
								toast.success(
									`Anime: ${data.title} has been saved.`,
								);
								await sleep(2000);
							}
						}
					}

					if (determineLinkType(link) === 'game') {
						const checkIfExists =
							await GameModel.getByScrapedUrl(link);
						if (!checkIfExists) {
							const data = await api.scrape_game(link);
							if (data.title && data.title !== '') {
								const newGame = new GameModel(data);
								await newGame.save();
								toast.success(
									`Game: ${data.title} has been saved.`,
								);
								await sleep(2000);
							}
						}
					}
				} catch (e) {
					console.error(e);
					toast.error('Error while parsing: ' + link);
				}

				setLinks(prevState => prevState.filter(f => f !== link));
			}

			setLinks([]);
			toast.success('Import successfull.');
		} catch (error) {
			try {
				toast.error(String(error));
			} catch (_e) {}
		} finally {
			setProcessLoading(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					variant="secondary"
					size="icon"
					className="text-orange-500 hover:text-orange-600"
				>
					<DownloadIcon className="w-4 h-4" />
				</Button>
			</DialogTrigger>
			<DialogContent
				className="md:max-w-[800px] xl:max-w-[1200px]"
				// @ts-ignore
				closeDisabled={processLoading}
				onEscapeKeyDown={e => e.preventDefault()}
				onInteractOutside={e => {
					e.preventDefault();
				}}
			>
				<DialogHeader>
					<DialogTitle>Bulk Import Content</DialogTitle>
					<DialogDescription className="flex gap-1">
						Supported links are:
						<span className="text-blue-500">Steam,</span>
						<span className="text-yellow-400">IMDB,</span>
						<span className="text-sky-500">My Anime List</span>
					</DialogDescription>
				</DialogHeader>
				<Input
					value=""
					placeholder="Paste link here..."
					onPaste={handlePaste}
					onChange={preventTyping}
					className={processLoading ? 'disabled' : ''}
					disabled={processLoading}
				/>
				<div>Links: {links.length}</div>
				<div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
					{links.map((l, li) => (
						<div
							className="flex items-center gap-2 text-sm"
							key={`bulk_import_links_${li}`}
						>
							{determineLinkType(l) === 'movie' && (
								<img className="h-4" src="/imdb-logo.jpg" />
							)}
							{determineLinkType(l) === 'game' && (
								<img className="h-4" src="/steam-logo.png" />
							)}
							{determineLinkType(l) === 'anime' && (
								<img className="h-4" src="/mal-logo.png" />
							)}
							<span>{l}</span>
							{!processLoading && (
								<div
									className="text-red-500 hover:cursor-pointer hover:text-red-600"
									onClick={() =>
										setLinks(links =>
											links.filter((_, i) => i !== li),
										)
									}
								>
									<XIcon className="w-4 h-4" />
								</div>
							)}
						</div>
					))}
				</div>

				<Button
					className={processLoading ? 'w-full disabled' : 'w-full'}
					disabled={processLoading}
					variant="secondary"
					onClick={handleStart}
				>
					Start
					{processLoading && (
						<Loading timeoutMs={250} className="mb-0" />
					)}
				</Button>
			</DialogContent>
		</Dialog>
	);
}
