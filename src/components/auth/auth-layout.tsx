import Link from "next/link";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-white font-sans text-zinc-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-zinc-100/80 via-white to-transparent blur-3xl" />
        <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-gradient-to-bl from-zinc-50 to-transparent blur-3xl" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center px-6 py-6 lg:px-8">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-zinc-900"
        >
          ExecutiveOS
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-12 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm sm:p-8">
            {children}
          </div>

          <div className="mt-6 text-center text-sm text-zinc-600">{footer}</div>
        </div>
      </main>
    </div>
  );
}
