"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { safeNextPath } from "@/lib/safe-redirect";
import { BrandLogo } from "@/components/brand-logo";
import { PasswordInput } from "@/components/password-input";
import { getPreferences } from "@/lib/api/user";

type Mode = "login" | "sign-up" | "forgot" | "reset";

export function AuthForm({ mode, next }: { mode: Mode; next?: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    setMessage(undefined);
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const confirmation = String(data.get("confirmPassword") ?? "");
    if ((mode === "sign-up" || mode === "reset") && password !== confirmation) {
      setError("Passwords do not match.");
      setPending(false);
      return;
    }
    try {
      const supabase = createClient();
      if (mode === "login") {
        const result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (result.error) throw result.error;
        if (result.data.session?.access_token) {
          try {
            await getPreferences(result.data.session.access_token);
          } catch {
            // Profile provisioning is non-blocking for login flow
          }
        }
        router.replace("/");
        router.refresh();
      } else if (mode === "sign-up") {
        const returnPath = safeNextPath(next, "/");
        const callback = new URL("/auth/confirm", window.location.origin);
        callback.searchParams.set("next", returnPath);
        const fullName = String(data.get("name") ?? "").trim();
        const result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: callback.toString(),
            data: fullName ? { full_name: fullName } : undefined,
          },
        });
        if (result.error) throw result.error;
        if (result.data.session) {
          if (result.data.session.access_token) {
            try {
              await getPreferences(result.data.session.access_token);
            } catch {
              // Profile provisioning is non-blocking for signup flow
            }
          }
          window.location.assign(returnPath);
        } else {
          setMessage("Check your email to confirm your account.");
        }
      } else if (mode === "forgot") {
        const result = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/confirm?next=/auth/reset-password`,
        });
        if (result.error) throw result.error;
        setMessage(
          "If an account exists for that email, a password reset message has been sent.",
        );
      } else {
        const result = await supabase.auth.updateUser({ password });
        if (result.error) throw result.error;
        setMessage(
          "Your password has been updated. You can continue to your account.",
        );
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Authentication request failed.",
      );
    } finally {
      setPending(false);
    }
  }

  const needsEmail = mode !== "reset";
  const needsPassword = mode !== "forgot";
  const needsConfirmation = mode === "sign-up" || mode === "reset";
  const title = {
    login: "Sign in",
    "sign-up": "Create account",
    forgot: "Reset password",
    reset: "Choose a new password",
  }[mode];

  return (
    <section className="mx-auto max-w-lg rounded-xl border border-border border-t-4 border-t-brand bg-surface p-5 shadow-sm sm:p-10">
      <div className="mb-6 w-36" aria-label="Ceylon News">
        <BrandLogo priority />
      </div>
      <p className="eyebrow mb-3">Your personal news desk</p>
      <h1 className="font-serif text-3xl font-semibold text-foreground">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-6 text-foreground-secondary">
        Save useful reporting, follow your interests, and make Ceylon News your
        own.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === "sign-up" && (
          <Field
            label="Display Name (Optional)"
            name="name"
            type="text"
            autoComplete="name"
            required={false}
          />
        )}
        {needsEmail && (
          <Field label="Email" name="email" type="email" autoComplete="email" />
        )}
        {needsPassword && (
          <PasswordInput
            label="Password"
            name="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
          />
        )}
        {needsConfirmation && (
          <PasswordInput
            label="Confirm password"
            name="confirmPassword"
            autoComplete="new-password"
          />
        )}
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="text-sm text-brand">
            {message}
          </p>
        )}
        <button
          disabled={pending}
          className="min-h-11 w-full rounded-lg bg-brand px-4 py-2.5 font-semibold text-white hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
        >
          {pending ? "Please wait…" : title}
        </button>
      </form>
      <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
        {mode !== "login" && (
          <Link href="/auth/login" className="underline">
            Sign in
          </Link>
        )}
        {mode === "login" && (
          <Link href="/auth/sign-up" className="underline">
            Create account
          </Link>
        )}
        {mode === "login" && (
          <Link href="/auth/forgot-password" className="underline">
            Forgot password?
          </Link>
        )}
      </div>
    </section>
  );
}

function Field({
  label,
  required = true,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <input
        required={required}
        {...props}
        className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 bg-surface px-3 py-2 text-foreground"
      />
    </label>
  );
}
