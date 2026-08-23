"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type AuthActionState } from "@/lib/auth/actions";
import { AuthAlert } from "@/components/auth/auth-alert";
import { AuthButton } from "@/components/auth/auth-button";
import { AuthInput } from "@/components/auth/auth-input";

const initialState: AuthActionState = {
  error: null,
  success: null,
};

export function SignInForm() {
  const [state, formAction, isPending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? <AuthAlert message={state.error} /> : null}

      <AuthInput
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@company.com"
        required
        disabled={isPending}
      />

      <AuthInput
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        required
        disabled={isPending}
      />

      <AuthButton loading={isPending}>Sign In</AuthButton>

      <p className="text-center text-sm text-zinc-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/get-started"
          className="font-medium text-zinc-900 hover:underline"
        >
          Get started
        </Link>
      </p>
    </form>
  );
}
