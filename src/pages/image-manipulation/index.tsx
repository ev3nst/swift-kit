import { ReactNode } from 'react';

import { Nav } from './partials/nav';

const ImageManipulation = ({ children }: { children: ReactNode }) => {
	return (
		<div>
			<div className="flex items-center justify-between mb-4 gap-2">
				<Nav />
			</div>
			{children}
		</div>
	);
};

export default ImageManipulation;
