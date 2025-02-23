import { dbWrapper, type RawModel } from '@/lib/db';

export class MediaCache {
	private constructor(
		public id: number,
		public media_type: string,
		public search_query: string,
		public search_result: string,
		public result_json: any[],
	) {}

	static async save(
		media_type: string,
		search_query: string,
		search_result: string,
	): Promise<MediaCache> {
		const checkExisting = await this.get(media_type, search_query);
		if (checkExisting) {
			await dbWrapper.db.execute(
				'UPDATE media_caches SET search_result = ? WHERE id = ?',
				[search_result, checkExisting.id],
			);

			const data = await dbWrapper.db.select<RawModel<MediaCache>[]>(
				'SELECT * FROM media_caches WHERE id = ?',
				[checkExisting.id],
			);
			let result_json = [];
			try {
				if (search_result) result_json = JSON.parse(search_result);
			} catch (_e) {}
			return new MediaCache(
				data[0].id,
				data[0].media_type,
				data[0].search_query,
				data[0].search_result,
				result_json,
			);
		} else {
			const result = await dbWrapper.db.execute(
				'INSERT INTO media_caches (media_type, search_query, search_result) VALUES (?, ?, ?)',
				[media_type, search_query, search_result],
			);

			if (result.lastInsertId) {
				const data = await dbWrapper.db.select<RawModel<MediaCache>[]>(
					'SELECT * FROM media_caches WHERE id = ?',
					[result.lastInsertId],
				);
				let result_json = [];
				try {
					if (result[0].search_result)
						result_json = JSON.parse(result[0].search_result);
				} catch (_e) {}
				return new MediaCache(
					data[0].id,
					data[0].media_type,
					data[0].search_query,
					data[0].search_result,
					result_json,
				);
			} else {
				console.error(result);
				throw new Error('Error while insertion');
			}
		}
	}

	static async get(
		media_type: string,
		search_query: string,
	): Promise<MediaCache | undefined> {
		const result = await dbWrapper.db.select<RawModel<MediaCache>[]>(
			'SELECT * FROM media_caches WHERE media_type = ? AND search_query = ?',
			[media_type, search_query],
		);

		let result_json = [];
		try {
			if (result[0].search_result)
				result_json = JSON.parse(result[0].search_result);
		} catch (_e) {}
		if (result[0]) {
			return new MediaCache(
				result[0].id,
				result[0].media_type,
				result[0].search_query,
				result[0].search_result,
				result_json,
			);
		}
	}
}
