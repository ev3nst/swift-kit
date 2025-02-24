import { ViewTypes } from './view-types';
import { Create } from './create';
import { Import } from './import';

export function Toolbar() {
	return (
		<div className="flex gap-2">
			<ViewTypes />
			<Import />
			<Create />
		</div>
	);
}
