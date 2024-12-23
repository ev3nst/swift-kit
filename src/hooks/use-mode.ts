import { useState, useEffect } from 'react';

type AvailableModes = 'light' | 'dark';

export const useMode = (): [
	AvailableModes,
	(selectedMode: AvailableModes) => void,
] => {
	const [mode, setMode] = useState(() => {
		const savedMode = localStorage.getItem('mode') as AvailableModes | null;
		return savedMode || 'dark';
	});

	useEffect(() => {
		document.documentElement.classList.remove('light', 'dark');
		document.documentElement.classList.add(mode);

		localStorage.setItem('mode', mode);
	}, [mode]);

	const setSelectedMode = selectedMode => {
		setMode(selectedMode);
	};

	return [mode, setSelectedMode];
};
