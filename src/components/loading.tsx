import { useEffect, useState } from 'react';
import { LoaderIcon } from 'lucide-react';

const Loading = () => {
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		const timeout = setTimeout(() => {
			setLoading(false);
		}, 500);

		return () => {
			clearTimeout(timeout);
		};
	}, []);

	if (loading) {
		return <></>;
	}

	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-center animate-pulse">
				<LoaderIcon className="animate-spin w-10 h-10 text-foreground mx-auto mb-4" />
			</div>
		</div>
	);
};

export { Loading };
