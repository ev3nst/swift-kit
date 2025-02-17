import { RefObject, useEffect, useRef, useState } from 'react';
import { MediaPlayerInstance } from '@vidstack/react';
import {
	Pause,
	PlayIcon,
	RepeatIcon,
	ShuffleIcon,
	Trash2Icon,
	XIcon,
} from 'lucide-react';

import { useDragEvent } from '@/hooks/use-drag-event';
import { convertFileSrc } from '@tauri-apps/api/core';

import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from '@/components/sheet';
import { Button } from '@/components/button';

import api, { type IVideoMeta } from '@/lib/api';
import { shuffleArray } from '@/lib/utils';

export function Playlist({
	isOpen,
	player,
	initialVideos,
	onVideoChange,
	onClickClose,
}: {
	isOpen: boolean;
	player: RefObject<MediaPlayerInstance>;
	initialVideos?: IVideoMeta[];
	onVideoChange: (src: string) => void;
	onClickClose: () => void;
}) {
	const id = 'video-player-playlist';
	const dropZoneRef = useRef(null);
	const sheetRef = useRef<HTMLDivElement>(null);
	const [videos, setVideos] = useState(initialVideos);
	const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isRepeat, setIsRepeat] = useState(false);

	const { isHovered, currentFiles, addDropZoneRef, removeDropZoneRef } =
		useDragEvent();

	useEffect(() => {
		addDropZoneRef(id, dropZoneRef);
		return () => removeDropZoneRef(id);
	}, [addDropZoneRef, removeDropZoneRef]);

	useEffect(() => {
		if (currentFiles[id]?.length > 0) {
			handleFilesStateChange(currentFiles[id]);
		}
	}, [currentFiles, id]);

	useEffect(() => {
		if (player.current) {
			const handlePlay = () => setIsPlaying(true);
			const handlePause = () => setIsPlaying(false);
			const handleEnded = () => handleVideoEnd(isRepeat, videos);

			player.current.addEventListener('play', handlePlay);
			player.current.addEventListener('pause', handlePause);
			player.current.addEventListener('ended', handleEnded);

			return () => {
				player.current?.removeEventListener('play', handlePlay);
				player.current?.removeEventListener('pause', handlePause);
				// eslint-disable-next-line react-hooks/exhaustive-deps
				player.current?.removeEventListener('ended', handleEnded);
			};
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [player, isRepeat, videos]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				sheetRef.current &&
				!sheetRef.current.contains(event.target as Node)
			) {
				onClickClose();
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
			return () =>
				document.removeEventListener('mousedown', handleClickOutside);
		}
	}, [isOpen, onClickClose]);

	const handleFilesStateChange = async (files: string[]) => {
		const newVideos: IVideoMeta[] = [];
		for (let fi = 0; fi < files.length; fi++) {
			const filePath = files[fi];
			const details = await api.get_video_details(filePath);
			details.src = convertFileSrc(filePath);
			newVideos.push(details);
		}

		setVideos(prev => [...(prev ?? []), ...newVideos]);
	};

	const handleVideoEnd = (isRepeat: boolean, videos?: IVideoMeta[]) => {
		if (isRepeat) {
			playVideo(currentVideoIndex);
		} else {
			if (
				typeof videos !== 'undefined' &&
				currentVideoIndex < videos.length - 1
			) {
				playVideo(currentVideoIndex + 1);
			}
		}
	};

	const playVideo = (index: number) => {
		if (
			typeof videos !== 'undefined' &&
			index >= 0 &&
			index < videos.length
		) {
			setCurrentVideoIndex(index);
			onVideoChange(videos[index].src as string);
			player.current?.play();
			setIsPlaying(true);
		}
	};

	const togglePlayPause = (index: number) => {
		if (currentVideoIndex === index) {
			if (isPlaying) {
				player.current?.pause();
			} else {
				player.current?.play();
			}
		} else {
			playVideo(index);
		}
	};

	return (
		<Sheet
			open={isOpen}
			onOpenChange={isOpen => {
				if (player.current) {
					if (isOpen) {
						player.current.controls.pause();
					} else {
						player.current.controls.resume();
					}
				}
			}}
		>
			<SheetContent
				ref={sheetRef}
				className="z-[9999] min-w-[260px] flex flex-col rounded-none bg-black/50 p-0 gap-0 text-[15px] font-medium backdrop-blur-sm border-none"
				onClickClose={onClickClose}
			>
				<SheetHeader className="text-left p-3">
					<SheetTitle className="flex items-center gap-1">
						<span className="me-2">Playlist</span>

						<Button
							variant="ghost"
							size="icon"
							onClick={() => setIsRepeat(!isRepeat)}
							className={isRepeat ? 'text-blue-500' : ''}
						>
							<RepeatIcon />
						</Button>

						<Button
							variant="ghost"
							size="icon"
							onClick={() => {
								if (typeof videos === 'undefined') return;
								let videosToShuffle = [...videos];
								const currentVideo = {
									...videos[currentVideoIndex],
								};
								delete videosToShuffle[currentVideoIndex];
								videosToShuffle = shuffleArray(videosToShuffle);
								const shuffledVideos = [
									currentVideo,
									...videosToShuffle,
								].filter(sv => sv);
								setVideos(shuffledVideos);
							}}
						>
							<ShuffleIcon />
						</Button>

						<Button
							variant="ghost"
							size="icon"
							onClick={() => {
								if (videos) {
									const newVideos = videos.filter(
										(_, i) => i === currentVideoIndex,
									);
									setVideos(newVideos);
								}
							}}
						>
							<Trash2Icon />
						</Button>
					</SheetTitle>
				</SheetHeader>
				<div
					ref={dropZoneRef}
					className={`w-full text-xs overflow-y-auto p-0 m-0 h-full ${
						isHovered ? 'bg-secondary' : ''
					}`}
				>
					<div className="divide-y divide-zinc-800">
						{videos?.map((video, index) => (
							<div
								key={`video-player-playlist_item_${index}`}
								className={`flex items-center px-2 gap-3 transition cursor-pointer ${
									currentVideoIndex === index
										? 'bg-zinc-800'
										: 'hover:bg-zinc-800'
								}`}
							>
								<div
									className="flex-1 truncate flex items-center gap-2"
									onClick={() => playVideo(index)}
								>
									<p className="font-medium truncate">
										{video.filename}
									</p>
									<p className="text-xs text-zinc-400">
										{video.duration}
									</p>
								</div>
								<div>
									<Button
										variant="ghost"
										size="icon"
										className="text-zinc-300 hover:text-white"
										onClick={e => {
											e.stopPropagation();
											togglePlayPause(index);
										}}
									>
										{currentVideoIndex === index &&
										isPlaying ? (
											<Pause className="w-5 h-5" />
										) : (
											<PlayIcon className="w-5 h-5" />
										)}
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="text-zinc-300 hover:text-white"
										onClick={() => {
											const newVideos = videos.filter(
												(_, i) => i !== index,
											);
											setVideos(newVideos);
										}}
									>
										<XIcon />
									</Button>
								</div>
							</div>
						))}
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}

export default Playlist;
