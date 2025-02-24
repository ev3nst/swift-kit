import { ViewTypes } from './view-types';
import { Create } from './create';
import { OfflineAssets } from './offline-assets';
import { Import } from './import';

export function Toolbar() {
	return (
		<div className="flex gap-2">
			<ViewTypes />
			<OfflineAssets />
			<Import />
			<Create />
		</div>
	);
}
