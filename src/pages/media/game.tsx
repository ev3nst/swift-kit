import gameStore from '@/lib/store/game';
import { GameModel } from '@/lib/models/game';

import createMediaComponent from './media';

const GameComponent = createMediaComponent<GameModel>(gameStore, GameModel);

export const GameWrapper = () => {
	return <GameComponent />;
};

export default GameWrapper;
