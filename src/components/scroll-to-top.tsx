import { useEffect, useState } from 'react';
import { ArrowUpIcon } from 'lucide-react';

import { Button } from '@/components/button';

import { cn } from '@/lib/utils';

export const ScrollToTop = ({ className }: { className?: string }) => {
	const [showButton, setShowButton] = useState(false);

	const handleScroll = () => {
		if (window.scrollY >= 400) {
			setShowButton(true);
		} else {
			setShowButton(false);
		}
	};

	useEffect(() => {
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	return showButton ? (
		<Button
			className={cn('fixed bottom-5 right-5', className)}
			type="button"
			variant="outline"
			size="icon"
			onClick={() =>
				window.scrollTo({
					top: 0,
					left: 0,
					behavior: 'smooth',
				})
			}
		>
			<ArrowUpIcon />
		</Button>
	) : undefined;
};
