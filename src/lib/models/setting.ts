import { dbWrapper, type RawModel } from '@/lib/db';

export class Setting {
	id!: number;
	name: string;
	value: string;
	description?: string;
	created_at!: string;
	updated_at!: string;

	private constructor(
		id: number,
		name: string,
		value: string,
		description: string,
		created_at: string,
		updated_at: string,
	) {
		this.id = id;
		this.name = name;
		this.value = value;
		this.description = description;
		this.created_at = created_at;
		this.updated_at = updated_at;
	}

	static async save(name: string, value: string): Promise<Setting> {
		let setting = await Setting.get(name);
		if (!setting) {
			setting = await Setting.insert({
				name,
				value,
				description: '',
			});
		} else {
			setting.value = value;
			setting.update();
		}

		return setting;
	}

	static async get(name: string): Promise<Setting | undefined> {
		const result = await dbWrapper.db.select<RawModel<Setting>[]>(
			'SELECT * FROM settings WHERE name = ?',
			[name],
		);

		if (result[0]) {
			return new Setting(
				result[0].id,
				result[0].name,
				result[0].value,
				result[0].description ?? '',
				result[0].created_at,
				result[0].updated_at,
			);
		}
	}

	static async insert(
		data: Pick<Setting, 'name' | 'value' | 'description'>,
	): Promise<Setting> {
		const result = await dbWrapper.db.execute(
			'INSERT INTO settings (name, value, description) VALUES (?, ?, ?)',
			[data.name, data.value, data.description],
		);

		if (result.lastInsertId) {
			const data = await dbWrapper.db.select<RawModel<Setting>[]>(
				'SELECT * FROM settings WHERE id = ?',
				[result.lastInsertId],
			);
			return new Setting(
				data[0].id,
				data[0].name,
				data[0].value,
				data[0].description ?? '',
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
			'UPDATE settings SET name = ?, value = ?, description = ? WHERE id = ?',
			[this.name, this.value, this.description, this.id],
		);
	}
}
