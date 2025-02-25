import animeStore from '@/lib/store/anime';
import { AnimeModel } from '@/lib/models/anime';

import createMediaComponent from './media';

const AnimeComponent = createMediaComponent<AnimeModel>(
	'anime',
	animeStore,
	AnimeModel,
);

export const AnimeWrapper = () => {
	return <AnimeComponent />;
};

export default AnimeWrapper;
