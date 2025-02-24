import { GameModel } from '@/lib/models/game';
import { genericModelStore } from './generic';

const gameStore = genericModelStore<GameModel>();

export default gameStore;
