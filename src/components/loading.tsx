import { Loader } from 'lucide-react';

const Loading = () => {
	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-center animate-pulse">
				<Loader className="animate-spin w-10 h-10 text-foreground mx-auto mb-4" />
			</div>
		</div>
	);
};

export { Loading };
