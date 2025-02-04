import { db, type RawModel } from '@/lib/db';

export class Credential {
	id!: number;
	platform: string;
	username: string;
	password: string;
	secret_question: string;
	secret_question_answer: string;
	note: string;
	created_at!: string;
	updated_at!: string;

	private constructor(
		id: number,
		platform: string,
		username: string,
		password: string,
		secret_question: string = '',
		secret_question_answer: string = '',
		note: string = '',
		created_at: string,
		updated_at: string,
	) {
		this.id = id;
		this.platform = platform;
		this.username = username;
		this.password = password;
		this.secret_question = secret_question;
		this.secret_question_answer = secret_question_answer;
		this.note = note;
		this.created_at = created_at;
		this.updated_at = updated_at;
	}

	static async get(id: number): Promise<Credential> {
		const result = await db.select<RawModel<Credential>[]>(
			'SELECT * FROM credentials WHERE id = ?',
			[id],
		);

		return new Credential(
			result[0].id,
			result[0].platform,
			result[0].username,
			result[0].password,
			result[0].secret_question,
			result[0].secret_question_answer,
			result[0].note,
			result[0].created_at,
			result[0].updated_at,
		);
	}

	static async getAll(searchTerm: string = ''): Promise<Credential[]> {
		const query = searchTerm
			? `SELECT id, platform, username, password, created_at FROM credentials WHERE id IN (SELECT docid FROM credentials_fts WHERE credentials_fts MATCH ?) ORDER BY id ASC`
			: 'SELECT id, platform, username, password, created_at FROM credentials ORDER BY id ASC';

		const results = await db.select<RawModel<Credential>[]>(query, [
			searchTerm,
		]);
		return results.map(
			rs =>
				new Credential(
					rs.id,
					rs.platform,
					rs.username,
					rs.password,
					'',
					'',
					'',
					rs.created_at,
					rs.updated_at,
				),
		);
	}

	static async insert(
		data: Pick<Credential, 'platform' | 'username' | 'password'> &
			Partial<
				Pick<
					Credential,
					'secret_question' | 'secret_question_answer' | 'note'
				>
			>,
	): Promise<Credential> {
		const result = await db.execute(
			'INSERT INTO credentials (platform, username, password, secret_question,secret_question_answer, note) VALUES (?, ?, ?, ?, ?, ?)',
			[
				data.platform,
				data.username,
				data.password,
				data.secret_question,
				data.secret_question_answer,
				data.note,
			],
		);

		if (result.lastInsertId) {
			return (await Credential.get(result.lastInsertId)) as Credential;
		} else {
			console.error(result);
			throw new Error('Error while insertion');
		}
	}

	async update(): Promise<void> {
		await db.execute(
			'UPDATE credentials SET platform = ?, username = ?, password = ?, secret_question = ?, secret_question_answer = ?, note = ? WHERE id = ?',
			[
				this.platform,
				this.username,
				this.password,
				this.secret_question,
				this.secret_question_answer,
				this.note,
				this.id,
			],
		);
	}

	async delete(): Promise<void> {
		await db.execute('DELETE FROM credentials WHERE id = ?', [this.id]);
	}
}
