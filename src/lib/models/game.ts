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
	poster: string | null;
	trailer: string | null;
	other_images: string | null;
	personal_rating: number | null;
}

export class GameModel extends BaseModel<Game> {
	constructor(props: Game) {
		super(props);
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
		return this.props.cover;
	}
	get poster(): string | null {
		return this.props.poster;
	}
	get trailer(): string | null {
		return this.props.trailer;
	}
	get other_images(): string | null {
		return this.props.other_images;
	}
	get personal_rating(): number | null {
		return this.props.personal_rating;
	}
}
