"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { COMPLETION_SEQUENCE_ITEMS } from "@/types/onboarding";

type CompletionSequenceProps = {
  onFinished?: () => void;
};

const ITEM_DELAY_MS = 700;
const FINAL_DELAY_MS = 1200;

export function CompletionSequence({ onFinished }: CompletionSequenceProps) {
  const router = useRouter();
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    COMPLETION_SEQUENCE_ITEMS.forEach((_item, index) => {
      timers.push(
        setTimeout(() => {
          setVisibleCount(index + 1);
        }, (index + 1) * ITEM_DELAY_MS),
      );
    });

    timers.push(
      setTimeout(() => {
        onFinished?.();
        router.push("/dashboard");
        router.refresh();
      }, COMPLETION_SEQUENCE_ITEMS.length * ITEM_DELAY_MS + FINAL_DELAY_MS),
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [onFinished, router]);

  return (
    <div className="relative min-h-full bg-white font-sans text-zinc-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-zinc-100/80 via-white to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-xl items-center px-6 py-16 lg:px-8">
        <div className="w-full rounded-2xl border border-zinc-200/80 bg-white/90 p-8 shadow-sm backdrop-blur-sm">
          <p className="text-sm font-semibold tracking-tight text-zinc-900">
            ExecutiveOS
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">
            Building your Executive Intelligence...
          </h1>

          <ul className="mt-8 space-y-4">
            {COMPLETION_SEQUENCE_ITEMS.map((item, index) => {
              const isVisible = index < visibleCount;

              return (
                <li
                  key={item}
                  className={`flex items-center gap-3 text-sm transition-all duration-500 ${
                    isVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-1 opacity-0"
                  }`}
                >
                  <span
                    className={`inline-flex size-5 items-center justify-center rounded-full border text-xs ${
                      isVisible
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-white text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span className={isVisible ? "text-zinc-900" : "text-zinc-400"}>
                    {item}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
