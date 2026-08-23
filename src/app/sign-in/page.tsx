import Link from "next/link";
import { redirectIfAuthenticated } from "@/lib/auth/actions";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignInForm } from "@/components/auth/sign-in-form";

export default async function SignInPage() {
  await redirectIfAuthenticated();

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to your ExecutiveOS account."
      footer={
        <>
          By continuing, you agree to ExecutiveOS&apos;s terms of service and
          privacy policy.
        </>
      }
    >
      <SignInForm />
      <p className="mt-5 text-center text-sm text-zinc-600">
        New to ExecutiveOS?{" "}
        <Link
          href="/get-started"
          className="font-medium text-zinc-900 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
