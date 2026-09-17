"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function passwordInputType(visible: boolean): "text" | "password" {
  return visible ? "text" : "password";
}

type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: string;
};

export function PasswordInput({
  label,
  required = true,
  id,
  className = "",
  ...props
}: PasswordInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <label htmlFor={inputId} className="block text-sm font-semibold text-slate-700">
      {label}
      <span className="relative mt-1 block">
        <input
          {...props}
          id={inputId}
          required={required}
          minLength={8}
          type={passwordInputType(visible)}
          className={`block min-h-11 w-full rounded-lg border border-slate-300 bg-surface px-3 py-2 pr-12 text-foreground ${className}`.trim()}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 inline-flex min-h-11 min-w-11 items-center justify-center rounded-r-lg text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <Icon className="size-4.5" aria-hidden="true" />
        </button>
      </span>
    </label>
  );
}
