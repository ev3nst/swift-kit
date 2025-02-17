import { useEffect, useRef, useState } from 'react';
import { useRoute } from 'wouter';
import {
	MediaPlayer,
	MediaProvider,
	Track,
	type MediaPlayerInstance,
} from '@vidstack/react';

import { convertFileSrc } from '@tauri-apps/api/core';
import { appConfigDir } from '@tauri-apps/api/path';

import api, { IVideoMeta } from '@/lib/api';
import { VideoThumbnails } from '@/lib/models/video_thumbnails';

import { VideoLayout } from './layout';
import { Playlist } from './playlist';

import '@vidstack/react/player/styles/base.css';
import '@/styles/video-player.css';

type Subtitle = {
	src?: string;
	label?: string;
	language?: string;
	kind: TextTrackKind;
	default?: boolean;
};

const subtitles: Subtitle[] = [];

function VideoPlayer() {
	const player = useRef<MediaPlayerInstance>(null);
	const [_match, params] = useRoute('/video-player/:video');
	const videoPath = decodeURIComponent(params!.video);

	const [isPlaylistOpen, setIsPlaylistOpen] = useState<boolean>(false);
	const [thumbnailsSrc, setThumbnailsSrc] = useState<string>('');
	const [videoUrl, setVideoUrl] = useState<string>(convertFileSrc(videoPath));
	const [initialVideoMeta, setInitialVideoMeta] = useState<IVideoMeta>();

	useEffect(() => {
		if (player.current) {
			player.current.enterFullscreen();
		}

		fetchThumbnails(videoPath);
		getVideoDetails();
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const getVideoDetails = async () => {
		const details = await api.get_video_details(videoPath);
		details.src = videoUrl;
		setInitialVideoMeta(details);
	};

	const fetchThumbnails = async (videoPath: string) => {
		const thumbnails = await VideoThumbnails.get(videoPath);
		if (thumbnails) {
			setThumbnailsSrc(thumbnails.thumbnails_file);
		}
	};

	const generateThumbnails = async (videoPath: string) => {
		let thumbnails = await VideoThumbnails.get(videoPath);
		if (thumbnails) {
			try {
				const appConfigPath = await appConfigDir();
				const folderToDelete = `${appConfigPath}\\${thumbnails.thumbnail_folder}`;
				console.log(folderToDelete, 'ff');
				await api.trash_folder(
					`${appConfigPath}/${thumbnails.thumbnail_folder}`,
				);
			} catch (e) {
				console.error(e);
			}
			await thumbnails.delete();
		}

		const results = await api.generate_video_thumbnails(videoPath);
		thumbnails = await VideoThumbnails.save(
			results.video_path,
			results.thumbnail_folder,
		);
		setThumbnailsSrc(thumbnails.thumbnails_file);
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === ' ') {
			e.preventDefault();
		}

		if (e.key === ' ') {
			const videoElement = player.current;
			if (videoElement) {
				if (videoElement.paused) {
					videoElement.play();
				} else {
					videoElement.pause();
				}
			}
		}
	};

	const handleOpenPlaylist = () => setIsPlaylistOpen(true);
	const handleClosePlaylist = () => setIsPlaylistOpen(false);
	const handleVideoChange = async (newUrl: string) => {
		setVideoUrl(newUrl);
		if (newUrl === '') {
			setThumbnailsSrc('');
			return;
		}
		const newVideoPath = decodeURIComponent(
			newUrl.split('/').pop() as string,
		);
		const thumbnails = await VideoThumbnails.get(newVideoPath);
		if (thumbnails) {
			setThumbnailsSrc(thumbnails.thumbnails_file);
		} else {
			setThumbnailsSrc('');
		}
	};

	if (!initialVideoMeta) return;

	return (
		<div>
			<MediaPlayer
				id="videoPlayer"
				ref={player}
				src={videoUrl}
				key={videoUrl}
				className="h-screen max-h-screen max-w-screen shadow-lg rounded-none m-0 p-0 [&>video]:rounded-none video-player app-drag-region"
				title="Sprite Fight"
				storage="video-player"
				autoPlay
			>
				<div id="invisible-overlay" className="invisible-overlay" />
				<MediaProvider>
					{subtitles.map(track => (
						<Track {...track} key={track.src} />
					))}
				</MediaProvider>
				<VideoLayout
					thumbnailsUrl={thumbnailsSrc}
					openPlaylist={handleOpenPlaylist}
					showSubtitlesButton={subtitles.length > 0}
					shouldGenerateThumbnails={async () => {
						const newVideoPath = decodeURIComponent(
							videoUrl.split('/').pop() as string,
						);
						await generateThumbnails(newVideoPath);
					}}
				/>
			</MediaPlayer>
			<Playlist
				onClickClose={handleClosePlaylist}
				isOpen={isPlaylistOpen}
				player={player}
				initialVideos={[initialVideoMeta]}
				onVideoChange={handleVideoChange}
			/>
		</div>
	);
}

export default VideoPlayer;
