import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import {
	Controller,
	ControllerProps,
	FieldPath,
	FieldValues,
	FormProvider,
} from 'react-hook-form';

import { Label } from '@/components/label';
import { FormItemContext, FormFieldContext } from '@/contexts/form-context';
import { useFormField } from '@/hooks/use-form-field';
import { cn } from '@/lib/utils';

const Form = FormProvider;

const FormField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	...props
}: ControllerProps<TFieldValues, TName>) => {
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller {...props} />
		</FormFieldContext.Provider>
	);
};

const FormItem = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
	const id = React.useId();

	return (
		<FormItemContext.Provider value={{ id }}>
			<div ref={ref} className={cn('space-y-2', className)} {...props} />
		</FormItemContext.Provider>
	);
});
FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef<
	React.ElementRef<typeof LabelPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
	const { error, formItemId } = useFormField();

	return (
		<Label
			ref={ref}
			className={cn(error && 'text-destructive', className)}
			htmlFor={formItemId}
			{...props}
		/>
	);
});
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<
	React.ElementRef<typeof Slot>,
	React.ComponentPropsWithoutRef<typeof Slot> & {
		error?: string[]; // Accept error array as prop
	}
>(({ error, ...props }, ref) => {
	const { formItemId, formMessageId } = useFormField();

	return (
		<>
			<Slot ref={ref} id={formItemId} aria-invalid={!!error} {...props} />
			{error && (
				<FormMessage className="flex flex-col gap-1" id={formMessageId}>
					{error.map((err, index) => (
						<span key={`vl_err_${formItemId}_${index}`}>{err}</span>
					))}
				</FormMessage>
			)}
		</>
	);
});
FormControl.displayName = 'FormControl';

const FormDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
	const { formDescriptionId } = useFormField();

	return (
		<p
			ref={ref}
			id={formDescriptionId}
			className={cn('text-[0.8rem] text-muted-foreground', className)}
			{...props}
		/>
	);
});
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
	const { error, formMessageId } = useFormField();
	const body = error ? String(error?.message) : children;

	if (!body) {
		return null;
	}

	return (
		<p
			ref={ref}
			id={formMessageId}
			className={cn(
				'text-[0.8rem] font-medium text-destructive',
				className,
			)}
			{...props}
		>
			{body}
		</p>
	);
});
FormMessage.displayName = 'FormMessage';

export {
	Form,
	FormItem,
	FormLabel,
	FormControl,
	FormDescription,
	FormMessage,
	FormField,
};