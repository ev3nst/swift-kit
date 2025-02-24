import { convertFileSrc } from '@tauri-apps/api/core';

import { dbWrapper } from '@/lib/db';

import { BaseModel, BaseModelProps } from './base';

export interface Movie extends BaseModelProps {
	scraped_url: string;
	title: string;
	franchise: string | null;
	description: string | null;
	keywords: string | null;
	release_date: string | null;
	year: number | null;
	duration: string | null;
	genre: string | null;
	actors: string | null;
	writers: string | null;
	directors: string | null;
	cover: string | null;
	cover_local: string | null;
	imdb_rating: number | null;
	country: string | null;
	language: string | null;
	other_images: string | null;
	other_images_local: string | null;
	personal_rating: number | null;
	trailer: string | null;
	trailer_local: string | null;
	poster: string | null;
	poster_local: string | null;
	approved: number;
}

export class MovieModel extends BaseModel<Movie> {
	constructor(props: Movie) {
		super(props);
	}

	static async getByScrapedUrl(
		scraped_url: string,
	): Promise<Movie | undefined> {
		const result = await dbWrapper.db.select(
			`SELECT * FROM movies WHERE scraped_url = ?`,
			[scraped_url],
		);

		return result && result[0] ? result[0] : undefined;
	}

	get scraped_url(): string {
		return this.props.scraped_url;
	}
	get title(): string {
		return this.props.title;
	}
	get franchise(): string | null {
		return this.props.title;
	}
	get description(): string | null {
		return this.props.description;
	}
	get keywords(): string | null {
		return this.props.keywords;
	}
	get release_date(): string | null {
		return this.props.release_date;
	}
	get year(): number | null {
		return this.props.year;
	}
	get duration(): string | null {
		return this.props.duration;
	}
	get genre(): string | null {
		return this.props.genre;
	}
	get actors(): string | null {
		return this.props.actors;
	}
	get writers(): string | null {
		return this.props.writers;
	}
	get directors(): string | null {
		return this.props.directors;
	}
	get imdb_rating(): number | null {
		return this.props.imdb_rating;
	}
	get country(): string | null {
		return this.props.country;
	}
	get language(): string | null {
		return this.props.language;
	}
	get personal_rating(): number | null {
		return this.props.personal_rating;
	}
	get cover(): string | null {
		if (this.props.cover_local) {
			return convertFileSrc(this.props.cover_local);
		}
		return this.props.cover;
	}
	get cover_local(): string | null {
		return this.props.cover_local;
	}
	get poster(): string | null {
		if (this.props.poster_local) {
			return convertFileSrc(this.props.poster_local);
		}
		return this.props.poster;
	}
	get poster_local(): string | null {
		return this.props.poster_local;
	}
	get other_images(): string | null {
		if (this.props.other_images_local) {
			return this.props.other_images_local;
		}
		return this.props.other_images;
	}
	get other_images_local(): string | null {
		return this.props.other_images_local;
	}
	get trailer(): string | null {
		if (this.props.trailer_local) {
			return convertFileSrc(this.props.trailer_local);
		}
		return this.props.trailer;
	}
	get trailer_local(): string | null {
		return this.props.trailer_local;
	}
	get approved(): number {
		return this.props.approved;
	}
}
