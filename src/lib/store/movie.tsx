import { MovieModel } from '@/lib/models/movie';
import { genericModelStore } from './generic';

const movieStore = genericModelStore<MovieModel>();

export default movieStore;
