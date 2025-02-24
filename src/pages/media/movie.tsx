import movieStore from '@/lib/store/movie';
import { MovieModel } from '@/lib/models/movie';

import createMediaComponent from './media';

const MovieComponent = createMediaComponent<MovieModel>(movieStore, MovieModel);

export const MovieWrapper = () => {
	return <MovieComponent />;
};

export default MovieWrapper;
