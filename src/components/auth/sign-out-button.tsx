"use client";

import { useFormStatus } from "react-dom";
import { signOut } from "@/lib/auth/actions";
import { AuthButton } from "@/components/auth/auth-button";
import { clearPilotClientState } from "@/executive-snapshot-studio/launch";

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

async function signOutAndClearPilotSession(): Promise<void> {
  clearPilotClientState();
  await signOut();
}

export function SignOutButton({ variant = "secondary" }: SignOutButtonProps) {
  return (
    <form action={signOutAndClearPilotSession}>
      <SignOutSubmit variant={variant} />
    </form>
  );
}
