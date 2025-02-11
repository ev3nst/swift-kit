import Database from '@tauri-apps/plugin-sql';

const sqliteDbName = 'sqlite:swiftkit.db';
class DbWrapper {
	db!: Database;
	async initialize() {
		if (!this.db) {
			this.db = await Database.load(sqliteDbName);
		}
	}
}

export const dbWrapper = new DbWrapper();

export type RawModel<T> = {
	[K in keyof T]: T[K] extends (...args: any[]) => any ? never : T[K];
};
