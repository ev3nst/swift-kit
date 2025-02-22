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
	imdb_rating: number | null;
	country: string | null;
	language: string | null;
	other_images: string | null;
	personal_rating: number | null;
	trailer: string | null;
	poster: string | null;
}

export class MovieModel extends BaseModel<Movie> {
	constructor(props: Movie) {
		super(props);
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
	get cover(): string | null {
		return this.props.cover;
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
	get other_images(): string | null {
		return this.props.other_images;
	}
	get personal_rating(): number | null {
		return this.props.personal_rating;
	}
	get trailer(): string | null {
		return this.props.trailer;
	}
	get poster(): string | null {
		return this.props.poster;
	}
}
