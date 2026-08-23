import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type SnapshotCtaProps = {
  href: string;
  children: string;
  className?: string;
};

/** Every snapshot card ends with a clear path out of Today. */
export function SnapshotCta({ href, children, className }: SnapshotCtaProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-8 items-center text-sm font-medium text-[var(--ex-accent)]",
        "underline-offset-4 hover:underline",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--eos-ring)] rounded-sm",
        className,
      )}
    >
      {children}
      <span aria-hidden="true" className="ml-1">
        →
      </span>
    </Link>
  );
}
