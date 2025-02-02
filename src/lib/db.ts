import Database from '@tauri-apps/plugin-sql';

const sqliteDbName = 'sqlite:swiftkit.db';
export const db = await Database.load(sqliteDbName);

type RawModel<T> = {
	[K in keyof T]: T[K] extends (...args: any[]) => any ? never : T[K];
};

export class Note {
	id!: number;
	title: string;
	content: string;
	created_at!: string;
	updated_at!: string;

	private constructor(
		id: number,
		title: string,
		content: string,
		created_at: string,
		updated_at: string,
	) {
		this.id = id;
		this.content = content;
		this.title = title;
		this.created_at = created_at;
		this.updated_at = updated_at;
	}

	static async get(id: number): Promise<Note | null> {
		const result = await db.select<RawModel<Note>[]>(
			'SELECT * FROM notes WHERE id = ?',
			[id],
		);
		return result.length
			? new Note(
					result[0].id,
					result[0].title,
					result[0].content,
					result[0].created_at,
					result[0].updated_at,
				)
			: null;
	}

	static async getAll(searchTerm: string = ''): Promise<Note[]> {
		const query = searchTerm
			? `SELECT id, title, created_at FROM notes WHERE id IN (SELECT docid FROM notes_fts WHERE notes_fts MATCH ?) ORDER BY created_at DESC`
			: 'SELECT id, title, created_at FROM notes ORDER BY created_at DESC';

		const results = await db.select<RawModel<Note>[]>(query, [searchTerm]);
		return results.map(
			rs =>
				new Note(
					rs.id,
					rs.title,
					rs.content,
					rs.created_at,
					rs.updated_at,
				),
		);
	}

	static async insert(data: RawModel<Note>): Promise<Note> {
		const result = await db.execute(
			'INSERT INTO notes (title, content) VALUES (?, ?)',
			[data.title, data.content],
		);

		if (result.lastInsertId) {
			return (await Note.get(result.lastInsertId)) as Note;
		} else {
			console.error(result);
			throw new Error('Error while insertion');
		}
	}

	async update(): Promise<void> {
		await db.execute(
			'UPDATE notes SET title = ?, content = ? WHERE id = ?',
			[this.title, this.content, this.id],
		);
	}

	async delete(): Promise<void> {
		await db.execute('DELETE FROM notes WHERE id = ?', [this.id]);
	}
}
