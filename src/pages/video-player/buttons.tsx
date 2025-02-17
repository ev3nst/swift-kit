import { useEffect, useState } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import {
	CaptionButton,
	isTrackCaptionKind,
	MuteButton,
	PlayButton,
	useMediaState,
} from '@vidstack/react';
import {
	ImageIcon,
	ListIcon,
	VolumeX as MuteIcon,
	PauseIcon,
	PinIcon,
	PinOffIcon,
	PlayIcon,
	SquareDashedMousePointerIcon,
	SubtitlesIcon,
	Volume2 as VolumeHighIcon,
	Volume1 as VolumeLowIcon,
} from 'lucide-react';

import { getCurrentWebview } from '@tauri-apps/api/webview';
import { PhysicalSize } from '@tauri-apps/api/dpi';

import api from '@/lib/api';

import { Button } from '@/components/button';
import { Loading } from '@/components/loading';

export interface MediaButtonProps {
	tooltipSide?: Tooltip.TooltipContentProps['side'];
	tooltipAlign?: Tooltip.TooltipContentProps['align'];
	tooltipOffset?: number;
}

export const buttonClass =
	'group ring-media-focus relative inline-flex cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 focus-visible:ring-4 aria-disabled:hidden sm:h-10 sm:w-10 sm:[&_svg]:size-6 h-8 w-8 [&_svg]:size-5';

export const tooltipClass =
	'animate-out fade-out slide-out-to-bottom-2 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in data-[state=delayed-open]:slide-in-from-bottom-4 z-10 rounded-sm bg-black/90 px-2 py-0.5 text-sm font-medium text-white parent-data-[open]:hidden';

export function Play({
	tooltipOffset = 0,
	tooltipSide = 'top',
	tooltipAlign = 'center',
}: MediaButtonProps) {
	const isPaused = useMediaState('paused');
	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>
				<PlayButton className={buttonClass}>
					{isPaused ? (
						<PlayIcon className="translate-x-px" />
					) : (
						<PauseIcon />
					)}
				</PlayButton>
			</Tooltip.Trigger>
			<Tooltip.Content
				className={tooltipClass}
				side={tooltipSide}
				align={tooltipAlign}
				sideOffset={tooltipOffset}
			>
				{isPaused ? 'Play' : 'Pause'}
			</Tooltip.Content>
		</Tooltip.Root>
	);
}

export function Mute({
	tooltipOffset = 0,
	tooltipSide = 'top',
	tooltipAlign = 'center',
}: MediaButtonProps) {
	const volume = useMediaState('volume'),
		isMuted = useMediaState('muted');
	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>
				<MuteButton className={buttonClass}>
					{isMuted || volume == 0 ? (
						<MuteIcon />
					) : volume < 0.5 ? (
						<VolumeLowIcon />
					) : (
						<VolumeHighIcon />
					)}
				</MuteButton>
			</Tooltip.Trigger>
			<Tooltip.Content
				className={tooltipClass}
				side={tooltipSide}
				align={tooltipAlign}
				sideOffset={tooltipOffset}
			>
				{isMuted ? 'Unmute' : 'Mute'}
			</Tooltip.Content>
		</Tooltip.Root>
	);
}

export function Caption({
	tooltipOffset = 0,
	tooltipSide = 'top',
	tooltipAlign = 'center',
}: MediaButtonProps) {
	const track = useMediaState('textTrack'),
		isOn = track && isTrackCaptionKind(track);
	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>
				<CaptionButton className={buttonClass}>
					<SubtitlesIcon className={isOn ? 'text-blue-500' : ''} />
				</CaptionButton>
			</Tooltip.Trigger>
			<Tooltip.Content
				className={tooltipClass}
				side={tooltipSide}
				align={tooltipAlign}
				sideOffset={tooltipOffset}
			>
				{isOn ? 'Closed-Captions Off' : 'Closed-Captions On'}
			</Tooltip.Content>
		</Tooltip.Root>
	);
}

export function AspectRatio({
	tooltipOffset = 0,
	tooltipSide = 'top',
	tooltipAlign = 'center',
}: MediaButtonProps) {
	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className={buttonClass}
					onClick={async () => {
						const appWindow = getCurrentWebview();
						const { width } = await appWindow.size();
						const newHeight = Math.round(width * (9 / 16));
						await appWindow.window.setSize(
							new PhysicalSize(width, newHeight),
						);
					}}
				>
					<SquareDashedMousePointerIcon />
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content
				className={tooltipClass}
				side={tooltipSide}
				align={tooltipAlign}
				sideOffset={tooltipOffset}
			>
				Aspect Ratio
			</Tooltip.Content>
		</Tooltip.Root>
	);
}

export function AlwaysOnTop({
	tooltipOffset = 0,
	tooltipSide = 'top',
	tooltipAlign = 'center',
}: MediaButtonProps) {
	const [isPinned, setIsPinned] = useState(false);

	useEffect(() => {
		const fetchState = async () => {
			const state = await api.always_on_top(true);
			setIsPinned(state);
		};

		fetchState();
	}, []);

	const togglePin = async () => {
		const newState = await api.always_on_top(false);
		setIsPinned(newState);
	};

	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className={buttonClass}
					onClick={togglePin}
				>
					{isPinned ? <PinOffIcon /> : <PinIcon />}
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content
				className={tooltipClass}
				side={tooltipSide}
				align={tooltipAlign}
				sideOffset={tooltipOffset}
			>
				Always On Top
			</Tooltip.Content>
		</Tooltip.Root>
	);
}

export function PlaylistToggle({
	tooltipOffset = 0,
	tooltipSide = 'top',
	tooltipAlign = 'center',
	openPlaylist,
}: MediaButtonProps & { openPlaylist: any }) {
	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className={buttonClass}
					onClick={() => openPlaylist()}
				>
					<ListIcon />
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content
				className={tooltipClass}
				side={tooltipSide}
				align={tooltipAlign}
				sideOffset={tooltipOffset}
			>
				Playlist
			</Tooltip.Content>
		</Tooltip.Root>
	);
}

export function GenerateThumbnails({
	tooltipOffset = 0,
	tooltipSide = 'top',
	tooltipAlign = 'center',
	shouldGenerateThumbnails = async () => {},
	thumbnailsUrl = '',
}: MediaButtonProps & {
	shouldGenerateThumbnails: any;
	thumbnailsUrl?: string;
}) {
	const [loading, setLoading] = useState(false);
	const handleGenerate = async () => {
		setLoading(true);
		await shouldGenerateThumbnails();
		setLoading(false);
	};
	const handleStopGenerate = async () => {
		await api.stop_video_thumbnail_generation();
		setLoading(false);
	};

	if (loading) {
		return (
			<Tooltip.Root>
				<Tooltip.Trigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className={buttonClass}
						onClick={handleStopGenerate}
					>
						<Loading className="mb-0" timeoutMs={0} />
					</Button>
				</Tooltip.Trigger>
				<Tooltip.Content
					className={tooltipClass}
					side={tooltipSide}
					align={tooltipAlign}
					sideOffset={tooltipOffset}
				>
					Stop the process
				</Tooltip.Content>
			</Tooltip.Root>
		);
	}

	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className={buttonClass}
					onClick={handleGenerate}
				>
					<ImageIcon />
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content
				className={tooltipClass}
				side={tooltipSide}
				align={tooltipAlign}
				sideOffset={tooltipOffset}
			>
				{thumbnailsUrl ? 'Re-generate' : 'Generate Thumbnails'}
			</Tooltip.Content>
		</Tooltip.Root>
	);
}
