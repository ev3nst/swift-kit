import { convertFileSrc } from '@tauri-apps/api/core';

import { dbWrapper } from '@/lib/db';

import { BaseModel, BaseModelProps } from './base';

export interface Game extends BaseModelProps {
	scraped_url: string;
	franchise: string | null;
	title: string;
	genre: string | null;
	description: string | null;
	about: string | null;
	release_date: string | null;
	year: number | null;
	developers: string | null;
	publishers: string | null;
	cover: string | null;
	cover_local: string | null;
	poster: string | null;
	poster_local: string | null;
	trailer: string | null;
	trailer_local: string | null;
	other_images: string | null;
	other_images_local: string | null;
	personal_rating: number | null;
	approved: number;
}

export class GameModel extends BaseModel<Game> {
	constructor(props: Game) {
		super(props);
	}

	static async getByScrapedUrl(
		scraped_url: string,
	): Promise<Game | undefined> {
		const result = await dbWrapper.db.select(
			`SELECT * FROM games WHERE scraped_url = ?`,
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
	get genre(): string | null {
		return this.props.genre;
	}
	get description(): string | null {
		return this.props.description;
	}
	get about(): string | null {
		return this.props.about;
	}
	get release_date(): string | null {
		return this.props.release_date;
	}
	get year(): number | null {
		return this.props.year;
	}
	get developers(): string | null {
		return this.props.developers;
	}
	get publishers(): string | null {
		return this.props.publishers;
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
		if (
			this.props.other_images_local !== null &&
			this.props.other_images_local !== ''
		) {
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
	get personal_rating(): number | null {
		return this.props.personal_rating;
	}
	get approved(): number {
		return this.props.approved;
	}
}
