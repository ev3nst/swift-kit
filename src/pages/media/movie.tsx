import movieStore from '@/lib/store/movie';
import { MovieModel } from '@/lib/models/movie';

import createMediaComponent from './media';

const MovieComponent = createMediaComponent<MovieModel>(
	'movie',
	movieStore,
	MovieModel,
);

export const MovieWrapper = () => {
	return <MovieComponent />;
};

export default MovieWrapper;
