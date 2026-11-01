import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { clsx } from 'clsx';

const FIELD =
	'w-full rounded-[10px] border border-line bg-white px-4 text-[1rem] text-ink placeholder:text-dim transition-[border-color,box-shadow] focus:border-violet focus:shadow-[0_0_0_3px_rgba(106,75,255,0.15)] focus:outline-none aria-[invalid=true]:border-danger';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
	return <input ref={ref} className={clsx(FIELD, 'h-12', className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
	return <textarea ref={ref} className={clsx(FIELD, 'min-h-28 py-3', className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...props }, ref) {
	return (
		<select
			ref={ref}
			className={clsx(FIELD, 'h-12 appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10', className)}
			style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%23120E1A' stroke-width='1.6'/%3E%3C/svg%3E\")" }}
			{...props}
		>
			{children}
		</select>
	);
});

export function FieldLabel({ htmlFor, children, hint, required }: { htmlFor?: string; children: ReactNode; hint?: ReactNode; required?: boolean }) {
	return (
		<label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between gap-3">
			<span className="text-[0.9rem] font-medium text-ink-2">
				{children}
				{required ? <span className="text-pink"> *</span> : null}
			</span>
			{hint ? <span className="text-xs text-muted">{hint}</span> : null}
		</label>
	);
}

/** The API's (or the form's own) messages for one field, right under it. `id` is what the input's aria-describedby points at. */
export function FieldError({ id, messages }: { id: string; messages?: readonly string[] }) {
	if (!messages?.length) return null;
	return (
		<p id={id} className="mt-1.5 text-xs font-medium text-danger">
			{messages.join(' ')}
		</p>
	);
}
