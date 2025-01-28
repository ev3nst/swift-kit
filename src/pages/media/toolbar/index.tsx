import { ViewTypes } from './view-types';
import { Create } from './create';

export function Toolbar() {
	return (
		<div className="flex gap-2">
			<ViewTypes />
			<Create />
		</div>
	);
}
