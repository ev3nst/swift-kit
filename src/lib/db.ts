import Database from '@tauri-apps/plugin-sql';

const sqliteDbName = 'sqlite:swiftkit.db';
export const db = await Database.load(sqliteDbName);

export type RawModel<T> = {
	[K in keyof T]: T[K] extends (...args: any[]) => any ? never : T[K];
};
