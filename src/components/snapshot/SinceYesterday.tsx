"use client";

import Link from "next/link";
import type { SinceYesterdayUpdate } from "@/lib/snapshot/types";
import { ds } from "@/design-system";
import { cn } from "@/lib/utils/cn";

type SinceYesterdayProps = {
  updates: SinceYesterdayUpdate[];
};

export function SinceYesterday({ updates }: SinceYesterdayProps) {
  return (
    <ul className={ds.spaceY.sm}>
      {updates.map((update) => (
        <li key={update.id}>
          <Link
            href={update.href}
            className={cn("group block", ds.focusRing)}
          >
            <span
              className={cn(
                ds.type.supporting,
                "opacity-80 group-hover:opacity-100 group-hover:text-[var(--eos-color-text)] group-hover:underline group-hover:decoration-[var(--eos-color-divider)] group-hover:underline-offset-4",
              )}
            >
              {update.sentence}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
