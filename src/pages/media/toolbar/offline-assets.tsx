import { useState } from 'react';
import { GlobeIcon } from 'lucide-react';
import { toast } from 'sonner';

import { appConfigDir } from '@tauri-apps/api/path';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/dialog';
import { Button } from '@/components/button';
import { Loading } from '@/components/loading';
import { Checkbox } from '@/components/checkbox';
import { Progress } from '@/components/progress';
import { Input } from '@/components/input';

import api from '@/lib/api';
import { dbWrapper } from '@/lib/db';
import { MovieModel } from '@/lib/models/movie';
import { AnimeModel } from '@/lib/models/anime';
import { GameModel } from '@/lib/models/game';
import { sleep } from '@/lib/utils';

async function checkTotalAsset(
	tableName: string,
	columnName: string,
): Promise<number> {
	const result = await dbWrapper.db.select(
		`SELECT COUNT(*) as total FROM ${tableName} WHERE ${columnName} IS NOT NULL AND ${columnName} != '' AND (${columnName}_local IS NULL OR ${columnName}_local = '')`,
	);

	return result && result[0] ? Number(result[0].total) : 0;
}

export function OfflineAssets() {
	const [isOpen, setIsOpen] = useState(false);
	const [throttle, setThrottle] = useState(true);
	const [kbLimit, setKbLimit] = useState('');
	const [cover, setCover] = useState(false);
	const [coverProgress, setCoverProgress] = useState({
		completed: 0,
		total: 0,
	});
	const [poster, setPoster] = useState(false);
	const [posterProgress, setPosterProgress] = useState({
		completed: 0,
		total: 0,
	});
	const [otherImages, setOtherImages] = useState(false);
	const [otherImagesProgress, setOtherImagesProgress] = useState({
		completed: 0,
		total: 0,
	});

	const [processLoading, setProcessLoading] = useState(false);

	async function progressInit(columnName: string) {
		let totalAsset = 0;
		const mediaTableNames = ['movies', 'games'];
		if (columnName !== 'other_images') {
			mediaTableNames.push('animes');
		}

		for (let mi = 0; mi < mediaTableNames.length; mi++) {
			const mediaTableName = mediaTableNames[mi];
			const rowTotal = await checkTotalAsset(mediaTableName, columnName);
			totalAsset += rowTotal;
		}

		if (columnName === 'cover') {
			setCoverProgress({
				completed: 0,
				total: totalAsset,
			});
		}

		if (columnName === 'poster') {
			setPosterProgress({
				completed: 0,
				total: totalAsset,
			});
		}

		if (columnName === 'other_images') {
			setOtherImagesProgress({
				completed: 0,
				total: totalAsset,
			});
		}
	}

	const handleCoverChange = async checkedValue => {
		setCover(checkedValue);
		if (!checkedValue) return;
		await progressInit('cover');
	};

	const handlePosterChange = async checkedValue => {
		setPoster(checkedValue);
		if (!checkedValue) return;
		await progressInit('poster');
	};

	const handleOtherImageChange = async checkedValue => {
		setOtherImages(checkedValue);
		if (!checkedValue) return;
		await progressInit('other_images');
	};

	const handleStart = async () => {
		setProcessLoading(true);
		try {
			toast.info('Movie: Cover image process started...');
			await processMedia(MovieModel, 'movies');
			toast.success('Movie: assets are complete.');

			toast.info('Anime: Cover image process started...');
			await processMedia(AnimeModel, 'animes');
			toast.success('Anime: assets are complete.');

			toast.info('Game: Cover image process started...');
			await processMedia(GameModel, 'games');
			toast.success('Game: assets are complete.');

			setCover(false);
			setPoster(false);
			setOtherImages(false);
		} catch (error) {
			try {
				toast.error(String(error));
			} catch (_e) {}
		} finally {
			setProcessLoading(false);
		}
	};

	async function processMedia(model: any, folderPrefix: string) {
		const data = await model.paginate(1, 999999999);
		const appConfigPath = await appConfigDir();
		for (let mi = 0; mi < data.data.length; mi++) {
			const media = data.data[mi];
			const singleImageTypes = ['cover', 'poster'];
			for (let sti = 0; sti < singleImageTypes.length; sti++) {
				const stiType = singleImageTypes[sti];
				if (
					media[stiType] !== null &&
					media[stiType] !== '' &&
					(media[`${stiType}_local`] === null ||
						media[`${stiType}_local`] === '')
				) {
					try {
						if (!throttle) await sleep(500);
						const timestamp = Date.now();
						const extension =
							media[stiType].split('.').pop() ?? 'jpg';
						const downloadedFilePath = await api.download_file(
							media[stiType],
							`${appConfigPath}\\${folderPrefix}\\${stiType}\\${media.id}_${timestamp}.${extension}`,
							Number(kbLimit),
						);
						await api.image_compress(downloadedFilePath, 75);
						media.setProperty(
							`${stiType}_local` as any,
							downloadedFilePath,
						);
						await media.save();

						if (stiType === 'cover') {
							setCoverProgress(prevState => ({
								...prevState,
								completed: prevState.completed + 1,
							}));
						} else {
							setPosterProgress(prevState => ({
								...prevState,
								completed: prevState.completed + 1,
							}));
						}
					} catch (error) {
						toast.error(
							`Media: ${media.title} has encountered an error. Skipping...`,
						);
						console.error(error);
					}
				}
			}

			if (
				folderPrefix !== 'animes' &&
				media.other_images !== null &&
				media.other_images !== '' &&
				(media.other_images_local === null ||
					media.other_images_local === '')
			) {
				const otherImagesArr = media.other_images.split(',');
				const local_otherImages: string[] = [];
				for (let oia = 0; oia < otherImagesArr.length; oia++) {
					const imgEl = otherImagesArr[oia];
					try {
						if (!throttle) await sleep(500);
						const timestamp = Date.now();
						const extension = imgEl.split('.').pop() ?? 'jpg';
						const downloadedFilePath = await api.download_file(
							imgEl,
							`${appConfigPath}\\${folderPrefix}\\other_images\\${media.id}_${oia}_${timestamp}.${extension}`,
							Number(kbLimit),
						);
						await api.image_compress(downloadedFilePath, 75);
						local_otherImages.push(downloadedFilePath);
					} catch (error) {
						toast.error(
							`Media: ${media.title} has encountered an error for other_images. Skipping...`,
						);
						console.error(error);
					}
				}
				media.setProperty(
					'other_images_local',
					local_otherImages.join(','),
				);
				await media.save();
				setOtherImagesProgress(prevState => ({
					...prevState,
					completed: prevState.completed + 1,
				}));
			}
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					variant="secondary"
					size="icon"
					className="text-blue-500 hover:text-blue-600"
				>
					<GlobeIcon className="w-4 h-4" />
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
					<DialogTitle>Make Assets Local</DialogTitle>
					<DialogDescription className="flex gap-1">
						This process will make the selected asset types saved
						locally in your filesystem for movies, animes and games.
						Images will be automatically compressed to save space.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-3 min-h-[210px]">
					<div className="flex gap-4">
						<Input
							type="text"
							placeholder="Download Limit (kbps)"
							value={kbLimit}
							spellCheck={false}
							onChange={e => {
								const inputVal = e.target.value;
								if (!Number.isNaN(Number(inputVal))) {
									setKbLimit(inputVal);
								}
							}}
							className={processLoading ? 'disabled' : ''}
							disabled={processLoading}
						/>
						<div className="flex items-center space-x-2">
							<label
								htmlFor="cover"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-primary select-none"
							>
								Throttle
							</label>
							<Checkbox
								id="throttle"
								checked={throttle}
								onCheckedChange={checkedValue => {
									setThrottle(checkedValue as any);
								}}
								className={processLoading ? 'disabled' : ''}
								disabled={processLoading}
							/>
						</div>
					</div>
					<div className="flex justify-between gap-3">
						<div className="flex items-center space-x-2">
							<label
								htmlFor="cover"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-primary select-none"
							>
								Cover Image
							</label>
							<Checkbox
								id="cover"
								checked={cover}
								onCheckedChange={handleCoverChange}
								className={processLoading ? 'disabled' : ''}
								disabled={processLoading}
							/>
						</div>
						<div className="flex items-center space-x-2">
							<label
								htmlFor="poster"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-primary select-none"
							>
								Poster Image
							</label>
							<Checkbox
								id="poster"
								checked={poster}
								onCheckedChange={handlePosterChange}
								className={processLoading ? 'disabled' : ''}
								disabled={processLoading}
							/>
						</div>
						<div className="flex items-center space-x-2">
							<label
								htmlFor="otherImages"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-primary select-none"
							>
								Other Images
							</label>
							<Checkbox
								id="otherImages"
								checked={otherImages}
								onCheckedChange={handleOtherImageChange}
								className={processLoading ? 'disabled' : ''}
								disabled={processLoading}
							/>
						</div>
					</div>

					{cover && coverProgress.total > 0 && (
						<div className="flex items-center gap-3 my-2">
							<div className="text-sm whitespace-nowrap w-[200px] flex justify-between">
								<div className="text-orange-400">
									Cover Images:
								</div>
								<div className="flex gap-1">
									<span>{coverProgress.completed}</span>
									<span>/</span>
									<span>{coverProgress.total}</span>
								</div>
							</div>
							<Progress
								value={
									(coverProgress.completed /
										coverProgress.total) *
									100
								}
							/>
						</div>
					)}

					{poster && posterProgress.total > 0 && (
						<div className="flex items-center gap-3 my-2">
							<div className="text-sm whitespace-nowrap w-[200px] flex justify-between">
								<div className="text-orange-400">
									Poster Images:
								</div>
								<div className="flex gap-1">
									<span>{posterProgress.completed}</span>
									<span>/</span>
									<span>{posterProgress.total}</span>
								</div>
							</div>
							<Progress
								value={
									(posterProgress.completed /
										posterProgress.total) *
									100
								}
							/>
						</div>
					)}

					{otherImages && otherImagesProgress.total > 0 && (
						<div>
							<div className="flex items-center gap-3 my-2">
								<div className="text-sm whitespace-nowrap w-[200px] flex justify-between">
									<div className="text-orange-400">
										Other Images:
									</div>
									<div className="flex gap-1">
										<span>
											{otherImagesProgress.completed}
										</span>
										<span>/</span>
										<span>{otherImagesProgress.total}</span>
									</div>
								</div>
								<Progress
									value={
										(otherImagesProgress.completed /
											otherImagesProgress.total) *
										100
									}
								/>
							</div>
							<div className="text-sm">
								Total image count is different for this column,
								this is actually record count where this
								particular value is not empty.
							</div>
						</div>
					)}
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
