import { ReactNode } from 'react';

import { Nav } from './partials/nav';
import { Toolbar } from './toolbar';

const Media = ({ children }: { children: ReactNode }) => {
	return (
		<div>
			<div className="flex items-center justify-between mb-4 gap-2">
				<Nav />
				<Toolbar />
			</div>
			{children}
		</div>
	);
};

export default Media;
