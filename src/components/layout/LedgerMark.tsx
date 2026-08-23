import { cn } from "@/lib/utils/cn";

type LedgerMarkProps = {
  className?: string;
  title?: string;
};

/** Workshop Ledger Line mark — two parallel horizontal rules. */
export function LedgerMark({
  className,
  title = "ExecutiveOS",
}: LedgerMarkProps) {
  return (
    <svg
      className={cn("text-foreground", className)}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <path
        d="M4 9.5h16M4 14.5h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
}
