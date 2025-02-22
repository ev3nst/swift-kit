import { dbWrapper, type RawModel } from '@/lib/db';
import { convertFileSrc } from '@tauri-apps/api/core';
import { appConfigDir } from '@tauri-apps/api/path';

export class VideoThumbnails {
	id!: number;
	video_path: string;
	thumbnail_folder: string;
	thumbnails_file: string;
	created_at!: string;
	updated_at!: string;

	private constructor(
		id: number,
		video_path: string,
		thumbnail_folder: string,
		thumbnails_file: string,
		created_at: string,
		updated_at: string,
	) {
		this.id = id;
		this.video_path = video_path;
		this.thumbnail_folder = thumbnail_folder;
		this.thumbnails_file = thumbnails_file;
		this.created_at = created_at;
		this.updated_at = updated_at;
	}

	static async save(
		video_path: string,
		thumbnail_folder: string,
	): Promise<VideoThumbnails> {
		const appConfigPath = await appConfigDir();
		let videoThumbnails = await VideoThumbnails.get(video_path);
		if (!videoThumbnails) {
			videoThumbnails = await VideoThumbnails.insert({
				video_path,
				thumbnail_folder,
			});
		} else {
			videoThumbnails.thumbnail_folder = thumbnail_folder;
			videoThumbnails.update();
		}

		videoThumbnails.thumbnails_file = convertFileSrc(
			`${appConfigPath}/${videoThumbnails.thumbnail_folder}/thumbnails.vtt`,
		);
		return videoThumbnails;
	}

	static async get(video_path: string): Promise<VideoThumbnails | undefined> {
		const appConfigPath = await appConfigDir();
		const result = await dbWrapper.db.select<RawModel<VideoThumbnails>[]>(
			'SELECT * FROM video_thumbnails WHERE video_path = ?',
			[video_path],
		);

		if (result[0]) {
			return new VideoThumbnails(
				result[0].id,
				result[0].video_path,
				result[0].thumbnail_folder,
				convertFileSrc(
					`${appConfigPath}/${result[0].thumbnail_folder}/thumbnails.vtt`,
				),
				result[0].created_at,
				result[0].updated_at,
			);
		}
	}

	static async insert(
		data: Pick<VideoThumbnails, 'video_path' | 'thumbnail_folder'>,
	): Promise<VideoThumbnails> {
		const appConfigPath = await appConfigDir();
		const result = await dbWrapper.db.execute(
			'INSERT INTO video_thumbnails (video_path, thumbnail_folder) VALUES (?, ?)',
			[data.video_path, data.thumbnail_folder],
		);

		if (result.lastInsertId) {
			const data = await dbWrapper.db.select<RawModel<VideoThumbnails>[]>(
				'SELECT * FROM video_thumbnails WHERE id = ?',
				[result.lastInsertId],
			);
			return new VideoThumbnails(
				data[0].id,
				data[0].video_path,
				data[0].thumbnail_folder,
				convertFileSrc(
					`${appConfigPath}/${data[0].thumbnail_folder}/thumbnails.vtt`,
				),
				data[0].created_at,
				data[0].updated_at,
			);
		} else {
			console.error(result);
			throw new Error('Error while insertion');
		}
	}

	async update(): Promise<void> {
		await dbWrapper.db.execute(
			'UPDATE video_thumbnails SET video_path = ?, thumbnail_folder = ? WHERE id = ?',
			[this.video_path, this.thumbnail_folder, this.id],
		);
	}

	async delete(): Promise<void> {
		await dbWrapper.db.execute(
			'DELETE FROM video_thumbnails WHERE id = ?',
			[this.id],
		);
	}
}
