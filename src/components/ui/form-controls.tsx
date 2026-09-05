import {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
  forwardRef,
  useId,
} from "react";

export interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  error,
  helpText,
  required,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`.trim()}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-xs font-bold uppercase tracking-wider text-foreground-secondary"
        >
          {label}
          {required && <span className="ml-1 text-danger">*</span>}
        </label>
      )}
      {children}
      {helpText && !error && (
        <p className="text-xs text-foreground-muted leading-relaxed">{helpText}</p>
      )}
      {error && <p className="text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`block w-full rounded-lg border bg-surface px-3.5 py-2 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 disabled:bg-surface-muted ${
          error ? "border-danger focus-visible:outline-danger" : "border-border-strong"
        } ${className}`.trim()}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`block w-full rounded-lg border bg-surface px-3.5 py-2 text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 disabled:bg-surface-muted ${
          error ? "border-danger focus-visible:outline-danger" : "border-border-strong"
        } ${className}`.trim()}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`block w-full rounded-lg border bg-surface px-3.5 py-2 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 disabled:bg-surface-muted ${
          error ? "border-danger focus-visible:outline-danger" : "border-border-strong"
        } ${className}`.trim()}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", label, description, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className={`flex items-start gap-3 ${className}`.trim()}>
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          className="mt-0.5 size-4 rounded border-border-strong text-brand focus:ring-brand accent-brand cursor-pointer shrink-0"
          {...props}
        />
        {(label || description) && (
          <div className="text-sm leading-tight">
            {label && (
              <label htmlFor={inputId} className="font-semibold text-foreground cursor-pointer block">
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-foreground-secondary mt-0.5">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";
