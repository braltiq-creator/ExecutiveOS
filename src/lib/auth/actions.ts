"use server";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  createProfile,
  getAuthRedirectPath,
  getProfile,
} from "@/lib/auth/profile";
import { isMockMode } from "@/lib/mock/mode";
import { MOCK_AUTH_USER } from "@/lib/mock/session";

export type AuthActionState = {
  error: string | null;
  success: string | null;
};

function getFormString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function validateCredentials(
  email: string,
  password: string,
): string | null {
  if (!email || !password) {
    return "Email and password are required.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Enter a valid email address.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  return null;
}

export async function signUp(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = getFormString(formData, "email");
  const password = getFormString(formData, "password");

  const validationError = validateCredentials(email, password);
  if (validationError) {
    return { error: validationError, success: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message, success: null };
  }

  if (!data.user) {
    return {
      error: "Unable to create account. Please try again.",
      success: null,
    };
  }

  if (!data.session) {
    return {
      error: null,
      success: "Check your email to confirm your account before signing in.",
    };
  }

  const existingProfile = await getProfile(data.user.id);

  if (!existingProfile) {
    try {
      await createProfile(data.user.id);
    } catch (profileError) {
      return {
        error:
          profileError instanceof Error
            ? profileError.message
            : "Unable to create profile.",
        success: null,
      };
    }
  }

  redirect(await getAuthRedirectPath(data.user.id));
}

export async function signIn(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = getFormString(formData, "email");
  const password = getFormString(formData, "password");

  const validationError = validateCredentials(email, password);
  if (validationError) {
    return { error: validationError, success: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message, success: null };
  }

  if (!data.user) {
    return { error: "Unable to sign in. Please try again.", success: null };
  }

  redirect(await getAuthRedirectPath(data.user.id));
}

export async function signOut(): Promise<void> {
  if (isMockMode()) {
    redirect("/today");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function getAuthenticatedUser(): Promise<User | null> {
  if (isMockMode()) {
    return MOCK_AUTH_USER as unknown as User;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export async function redirectIfAuthenticated(): Promise<void> {
  if (isMockMode()) {
    return;
  }

  const user = await getAuthenticatedUser();

  if (!user) {
    return;
  }

  redirect(await getAuthRedirectPath(user.id));
}

export async function requireAuth(): Promise<User> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}
