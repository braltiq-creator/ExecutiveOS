import Link from "next/link";
import { redirectIfAuthenticated } from "@/lib/auth/actions";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { GROWTH_AUTH_METHODS } from "@/growth";

export default async function GetStartedPage() {
  await redirectIfAuthenticated();

  return (
    <AuthLayout
      title="Get started in five minutes"
      description="Create your account, then continue the guided trial — Profile, organisation, connectors when ready, Discovery, and your first Executive Brief."
      footer={
        <>
          Prefer the full guided trial?{" "}
          <Link
            href="/start-trial"
            className="font-medium text-zinc-900 hover:underline"
          >
            Start Free Trial
          </Link>
          {" · "}
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-zinc-900 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <div className="mb-6 space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
        <p className="font-medium text-zinc-900">Self-service path</p>
        <ol className="list-decimal space-y-1 pl-4">
          <li>Create account</li>
          <li>Choose Executive Profile</li>
          <li>Connect Microsoft and operational systems when ready</li>
          <li>Complete Discovery</li>
          <li>Open your first Executive Brief</li>
        </ol>
        <div className="flex flex-wrap gap-3 pt-1">
          {GROWTH_AUTH_METHODS.map((method) => (
            <Link
              key={method.id}
              href={method.href}
              className="font-medium text-zinc-900 underline-offset-4 hover:underline"
            >
              {method.label}
            </Link>
          ))}
        </div>
      </div>
      <SignUpForm />
    </AuthLayout>
  );
}
