import { useEffect, useState } from 'react';
import * as Slider from '@radix-ui/react-slider';
import {
	formatTime,
	Thumbnail,
	useMediaRemote,
	useMediaState,
	useSliderPreview,
} from '@vidstack/react';

export function Volume() {
	const volume = useMediaState('volume'),
		remote = useMediaRemote();

	useEffect(() => {
		const handleWheel = event => {
			const change = event.deltaY < 0 ? 0.05 : -0.05;
			remote.changeVolume(Math.min(1, Math.max(0, volume + change)));
		};

		const volumeSliderEl = document.getElementById('volume-slider');
		volumeSliderEl!.addEventListener('wheel', handleWheel);
		return () => {
			volumeSliderEl!.removeEventListener('wheel', handleWheel);
		};
	}, [volume, remote]);

	return (
		<Slider.Root
			id="volume-slider"
			className="group relative h-10 w-full max-w-[80px] cursor-pointer touch-none select-none items-center outline-none clickable-content hidden sm:inline-flex"
			value={[volume * 100]}
			onValueChange={([value]) => {
				remote.changeVolume(value / 100);
			}}
		>
			<Slider.Track className="h-[5px] w-full rounded-sm bg-white/30 relative">
				<Slider.Range className="bg-blue-500 absolute h-full rounded-sm will-change-[width]" />
			</Slider.Track>
		</Slider.Root>
	);
}
export interface TimeSliderProps {
	thumbnails?: string;
}

export function Time({ thumbnails }: TimeSliderProps) {
	const time = useMediaState('currentTime'),
		canSeek = useMediaState('canSeek'),
		duration = useMediaState('duration'),
		seeking = useMediaState('seeking'),
		remote = useMediaRemote(),
		step = (1 / duration) * 100,
		[value, setValue] = useState(0),
		{ previewRootRef, previewRef, previewValue } = useSliderPreview({
			clamp: true,
			offset: 6,
			orientation: 'horizontal',
		}),
		previewTime = (previewValue / 100) * duration;

	useEffect(() => {
		if (seeking) return;
		setValue((time / duration) * 100);
	}, [time, duration, seeking]);

	return (
		<Slider.Root
			className="group relative inline-flex h-9 w-full cursor-pointer touch-none select-none items-center outline-none clickable-content"
			value={[value]}
			disabled={!canSeek}
			step={Number.isFinite(step) ? step : 1}
			ref={previewRootRef}
			onValueChange={([value]) => {
				setValue(value);
				remote.seeking((value / 100) * duration);
			}}
			onValueCommit={([value]) => {
				remote.seek((value / 100) * duration);
			}}
		>
			<Slider.Track className="h-[5px] w-full rounded-sm bg-white/30 relative">
				<Slider.Range className="bg-blue-500 absolute h-full rounded-sm will-change-[width]" />
			</Slider.Track>

			{/* Preview */}
			<div
				className="flex flex-col items-center absolute opacity-0 data-[visible]:opacity-100 transition-opacity duration-200 will-change-[left] pointer-events-none"
				ref={previewRef}
			>
				{thumbnails ? (
					<Thumbnail.Root
						src={thumbnails}
						time={previewTime}
						className="block mb-2 h-[var(--thumbnail-height)] max-h-[160px] min-h-[80px] w-[var(--thumbnail-width)] min-w-[120px] max-w-[180px] overflow-hidden border border-white bg-black"
					>
						<Thumbnail.Img />
					</Thumbnail.Root>
				) : null}
				<span className="text-[13px]">{formatTime(previewTime)}</span>
			</div>
		</Slider.Root>
	);
}
