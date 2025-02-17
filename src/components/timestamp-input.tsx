import * as React from 'react';
import { useMaskito } from '@maskito/react';
import { maskitoTimeOptionsGenerator } from '@maskito/kit';

import { cn } from '@/lib/utils';

const timestampMask = maskitoTimeOptionsGenerator({
	mode: 'HH:MM:SS',
});
const TimestampInput = React.forwardRef<
	HTMLInputElement,
	React.ComponentProps<'input'>
>(({ className, type = 'text', onInput, ...props }, ref) => {
	const maskitoRef = useMaskito({ options: timestampMask });
	const handleInput: React.FormEventHandler<HTMLInputElement> = e => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		onInput && onInput(e);
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		props.onChange && props.onChange(e as any);
	};

	return (
		<input
			type={type}
			className={cn(
				'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
				className,
			)}
			onInput={handleInput}
			ref={el => {
				maskitoRef(el);
				if (typeof ref === 'function') {
					ref(el);
				} else if (ref) {
					(
						ref as React.MutableRefObject<HTMLInputElement | null>
					).current = el;
				}
			}}
			{...props}
		/>
	);
});

TimestampInput.displayName = 'TimestampInput';
export { TimestampInput };
