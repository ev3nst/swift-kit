import { dbWrapper } from '@/lib/db';

import { BaseModel, BaseModelProps } from './base';

export interface Anime extends BaseModelProps {
	scraped_url: string;
	franchise: string | null;
	title: string;
	original_title: string;
	year: number | null;
	genre: string | null;
	description: string | null;
	episodes: number | null;
	cover: string | null;
	cover_local: string | null;
	poster: string | null;
	poster_local: string | null;
	trailer: string | null;
	trailer_local: string | null;
	duration: string | null;
	studios: string | null;
	mal_rating: number | null;
	personal_rating: number | null;
	approved: number;
}

export class AnimeModel extends BaseModel<Anime> {
	constructor(props: Anime) {
		super(props);
	}

	static async getByScrapedUrl(
		scraped_url: string,
	): Promise<Anime | undefined> {
		const result = await dbWrapper.db.select(
			`SELECT * FROM animes WHERE scraped_url = ?`,
			[scraped_url],
		);

		return result && result[0] ? result[0] : undefined;
	}

	get scraped_url(): string {
		return this.props.scraped_url;
	}
	get franchise(): string | null {
		return this.props.franchise;
	}
	get title(): string {
		return this.props.title;
	}
	get original_title(): string {
		return this.props.original_title;
	}
	get year(): number | null {
		return this.props.year;
	}
	get genre(): string | null {
		return this.props.genre;
	}
	get description(): string | null {
		return this.props.description;
	}
	get episodes(): number | null {
		return this.props.episodes;
	}
	get cover(): string | null {
		return this.props.cover;
	}
	get cover_local(): string | null {
		return this.props.cover_local;
	}
	get poster(): string | null {
		return this.props.poster;
	}
	get poster_local(): string | null {
		return this.props.poster_local;
	}
	get trailer(): string | null {
		return this.props.trailer;
	}
	get trailer_local(): string | null {
		return this.props.trailer_local;
	}
	get duration(): string | null {
		return this.props.duration;
	}
	get studios(): string | null {
		return this.props.studios;
	}
	get mal_rating(): number | null {
		return this.props.mal_rating;
	}
	get personal_rating(): number | null {
		return this.props.personal_rating;
	}
	get approved(): number {
		return this.props.approved;
	}
}
