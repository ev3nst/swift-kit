import { dbWrapper } from '@/lib/db';

export interface BaseModelProps {
	id: number;
	created_at: string;
	updated_at: string;
}

export abstract class BaseModel<T extends BaseModelProps> {
	protected constructor(protected props: T) {}

	setProperty<K extends keyof T>(key: K, value: T[K]): void {
		this.props[key] = value;
	}

	get id(): number {
		return this.props.id;
	}

	get created_at(): string {
		return this.props.created_at;
	}

	get updated_at(): string {
		return this.props.updated_at;
	}

	public static async get<M extends BaseModel<any>>(
		this: { new (props: any): M },
		id: number,
	): Promise<M | undefined> {
		const tableName = this.name.toLowerCase().replace('model', 's');
		const result = await dbWrapper.db.select(
			`SELECT * FROM ${tableName} WHERE id = ?`,
			[id],
		);

		return result && result[0] ? new this(result[0]) : undefined;
	}

	public static async paginate<M extends BaseModel<any>>(
		this: { new (props: any): M },
		page: number,
		limit: number,
	): Promise<{ data: M[]; total: number }> {
		const tableName = this.name.toLowerCase().replace('model', 's');
		const offset = (page - 1) * limit;
		const totalResult: any = await dbWrapper.db.select(
			`SELECT COUNT(*) AS total FROM ${tableName}`,
		);
		const total = totalResult[0]?.total ?? 0;
		const result: any = await dbWrapper.db.select(
			`SELECT * FROM ${tableName} LIMIT ? OFFSET ?`,
			[limit, offset],
		);

		const data = result.map((item: any) => new this(item));
		return { data, total };
	}

	public async save(): Promise<this> {
		const tableName = this.constructor.name
			.toLowerCase()
			.replace('model', 's');

		if (this.id) {
			const columns = Object.keys(this.props)
				.map(key => `${key} = ?`)
				.join(', ');
			const values = Object.values(this.props);
			const result = await dbWrapper.db.execute(
				`UPDATE ${tableName} SET ${columns} WHERE id = ?`,
				[...values, this.id], // Append id to the end
			);

			if (result.rowsAffected > 0) {
				const updated = await this.constructor['get'](this.id);
				return updated as this;
			} else {
				throw new Error('Failed to update the record');
			}
		} else {
			const columns = Object.keys(this.props).join(', ');
			const values = Object.values(this.props);

			const result = await dbWrapper.db.execute(
				`INSERT INTO ${tableName} (${columns}) VALUES (${columns
					.split(',')
					.map(() => '?')
					.join(', ')})`,
				values,
			);

			if (result.lastInsertId) {
				this.props.id = result.lastInsertId;
				return this;
			} else {
				throw new Error('Error while inserting the record');
			}
		}
	}

	async delete(): Promise<void> {
		const tableName = this.constructor.name
			.toLowerCase()
			.replace('model', 's');

		const result = await dbWrapper.db.execute(
			`DELETE FROM ${tableName} WHERE id = ?`,
			[this.id],
		);

		if (result.rowsAffected === 0) {
			throw new Error('Record not found or deletion failed');
		}
	}
}
