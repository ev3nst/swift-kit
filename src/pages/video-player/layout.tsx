import * as Tooltip from '@radix-ui/react-tooltip';
import { Captions, Controls, Time } from '@vidstack/react';
import { XIcon, SquareIcon, MinusIcon } from 'lucide-react';

import { getCurrentWindow } from '@tauri-apps/api/window';

import { Button } from '@/components/button';

import * as Buttons from './buttons';
import * as Menus from './menus';
import * as Sliders from './sliders';

export function TimeGroup() {
	return (
		<div className="ml-2.5 flex items-center text-sm font-medium">
			<Time className="time" type="current" />
			<div className="mx-1 text-white/80">/</div>
			<Time className="time" type="duration" />
		</div>
	);
}

// Offset tooltips/menus/slider previews in the lower controls group so they're clearly visible.
const popupOffset = 30;

export interface VideoLayoutProps {
	thumbnailsUrl?: string;
	openPlaylist: () => void;
	showSubtitlesButton: boolean;
	shouldGenerateThumbnails: () => any;
}

export function VideoLayout({
	thumbnailsUrl,
	openPlaylist,
	showSubtitlesButton,
	shouldGenerateThumbnails,
}: VideoLayoutProps) {
	const appWindow = getCurrentWindow();

	const handleMinimize = async () => {
		await appWindow.minimize();
	};

	const handleMaximize = async () => {
		const isFullscreen = await appWindow.isFullscreen();
		await appWindow.unmaximize();
		if (isFullscreen) {
			await appWindow.setFullscreen(false);
		} else {
			await appWindow.setFullscreen(true);
		}
	};

	const handleClose = async () => {
		await appWindow.close();
	};

	return (
		<>
			<Captions className="vds-captions media-preview:opacity-0 media-controls:bottom-[85px] media-captions:opacity-100 absolute inset-0 bottom-2 z-10 select-none break-words opacity-0 transition-[opacity,bottom] duration-300" />
			<Controls.Root className="media-controls:opacity-100 absolute inset-0 z-10 flex h-full w-full flex-col bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity">
				<Tooltip.Provider>
					<div className="flex-1" />
					<Controls.Group className="flex w-full items-center px-2">
						<Sliders.Time thumbnails={thumbnailsUrl} />
					</Controls.Group>
					<Controls.Group className="-mt-0.5 flex w-full items-center px-2 pb-2 gap-1">
						<Buttons.Play
							tooltipAlign="start"
							tooltipOffset={popupOffset}
						/>
						<Buttons.Mute tooltipOffset={popupOffset} />
						<Sliders.Volume />
						<TimeGroup />
						<div className="flex-1" />
						<Buttons.AlwaysOnTop tooltipOffset={popupOffset} />
						<Buttons.PlaylistToggle
							openPlaylist={openPlaylist}
							tooltipOffset={popupOffset}
						/>
						<Buttons.GenerateThumbnails
							shouldGenerateThumbnails={shouldGenerateThumbnails}
							tooltipOffset={popupOffset}
							thumbnailsUrl={thumbnailsUrl}
						/>
						{showSubtitlesButton && (
							<Menus.Captions
								offset={popupOffset}
								tooltipOffset={popupOffset}
							/>
						)}
						<Buttons.AspectRatio tooltipOffset={popupOffset} />
						<div className="flex gap-1 absolute top-2 right-2 w-full justify-end items-center">
							<Button
								variant="ghost"
								size="icon"
								className={Buttons.buttonClass}
								onClick={handleMinimize}
							>
								<MinusIcon />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className={Buttons.buttonClass}
								onClick={handleMaximize}
							>
								<SquareIcon />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className={Buttons.buttonClass}
								onClick={handleClose}
							>
								<XIcon />
							</Button>
						</div>
					</Controls.Group>
				</Tooltip.Provider>
			</Controls.Root>
		</>
	);
}
