"use client";

import { useFormStatus } from "react-dom";
import { signOut } from "@/lib/auth/actions";
import { AuthButton } from "@/components/auth/auth-button";

type SignOutButtonProps = {
  variant?: "primary" | "secondary";
};

function SignOutSubmit({ variant }: { variant: "primary" | "secondary" }) {
  const { pending } = useFormStatus();

  return (
    <AuthButton
      type="submit"
      variant={variant}
      loading={pending}
      className="w-auto"
    >
      Sign Out
    </AuthButton>
  );
}

export function SignOutButton({ variant = "secondary" }: SignOutButtonProps) {
  return (
    <form action={signOut}>
      <SignOutSubmit variant={variant} />
    </form>
  );
}
