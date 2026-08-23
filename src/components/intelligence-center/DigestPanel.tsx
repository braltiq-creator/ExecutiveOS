"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { DIGEST_TYPE_LABELS } from "@/lib/intelligence-center/types";
import type { DigestType, ExecutiveDigest } from "@/lib/intelligence-center/types";

type DigestPanelProps = {
  digest: ExecutiveDigest;
  activeDigest: DigestType;
};

const DIGEST_TYPES = Object.keys(DIGEST_TYPE_LABELS) as DigestType[];

export function DigestPanel({ digest, activeDigest }: DigestPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchDigest(type: DigestType) {
    startTransition(() => {
      router.push(type === activeDigest ? "/dashboard" : `/dashboard?digest=${type}`);
    });
  }

  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            {digest.typeLabel}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
            {digest.headline}
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{digest.summary}</p>
        </div>

        <div className="flex flex-wrap gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1">
          {DIGEST_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              disabled={isPending}
              onClick={() => switchDigest(type)}
              className={[
                "rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors disabled:opacity-50",
                activeDigest === type
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900",
              ].join(" ")}
            >
              {DIGEST_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {digest.sections.map((section) => (
          <div key={section.id} className="rounded-xl border border-zinc-100 bg-zinc-50/40 p-4">
            <h3 className="text-sm font-semibold text-zinc-900">{section.title}</h3>
            <ul className="mt-3 space-y-3">
              {section.items.map((item) => (
                <li key={item.id}>
                  <p className="text-sm font-medium text-zinc-800">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-zinc-600">{item.summary}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
