import { cn } from "@/lib/utils/cn";

/** Premium type roles — scanning over density. */
export const exType = {
  display: "ex-display",
  heading: "ex-heading",
  body: "ex-body",
  caption: "ex-caption",
  supporting: "text-[length:var(--ex-body-size)] leading-relaxed text-[var(--ex-text-secondary)]",
} as const;

export function exTypeClass(
  role: keyof typeof exType,
  className?: string,
): string {
  return cn(exType[role], className);
}
