import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      className = "",
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variantClasses: Record<ButtonVariant, string> = {
      primary: "bg-brand text-brand-foreground hover:bg-brand-hover shadow-sm",
      secondary: "bg-surface-muted text-foreground-secondary hover:bg-border hover:text-foreground border border-border",
      outline: "bg-surface text-foreground border border-border-strong hover:bg-surface-muted hover:border-brand",
      ghost: "bg-transparent text-foreground-secondary hover:bg-surface-muted hover:text-foreground",
      danger: "bg-danger text-white hover:bg-red-800 shadow-sm",
    };

    const sizeClasses: Record<ButtonSize, string> = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-4 py-2 text-sm gap-2",
      lg: "px-5 py-2.5 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()}
        {...props}
      >
        {isLoading && (
          <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent shrink-0" />
        )}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
