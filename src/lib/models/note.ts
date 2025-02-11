import { dbWrapper, type RawModel } from '@/lib/db';

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

	static async get(id: number): Promise<Note> {
		const result = await dbWrapper.db.select<RawModel<Note>[]>(
			'SELECT * FROM notes WHERE id = ?',
			[id],
		);

		return new Note(
			result[0].id,
			result[0].title,
			result[0].content,
			result[0].created_at,
			result[0].updated_at,
		);
	}

	static async getAll(searchTerm: string = ''): Promise<Note[]> {
		const query = searchTerm
			? `SELECT id, title, created_at FROM notes WHERE id IN (SELECT docid FROM notes_fts WHERE notes_fts MATCH ?) ORDER BY id ASC`
			: 'SELECT id, title, created_at FROM notes ORDER BY id ASC';

		const results = await dbWrapper.db.select<RawModel<Note>[]>(query, [
			searchTerm,
		]);
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

	static async insert(data: Pick<Note, 'title' | 'content'>): Promise<Note> {
		const result = await dbWrapper.db.execute(
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
		await dbWrapper.db.execute(
			'UPDATE notes SET title = ?, content = ? WHERE id = ?',
			[this.title, this.content, this.id],
		);
	}

	async delete(): Promise<void> {
		await dbWrapper.db.execute('DELETE FROM notes WHERE id = ?', [this.id]);
	}
}
