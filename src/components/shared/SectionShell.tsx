import { cn } from "@/lib/utils/cn";

type SectionShellProps = {
  id: string;
  label: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
};

/**
 * Calm section frame for Today shell placeholders.
 * Not a dense card grid — institutional spacing only.
 */
export function SectionShell({
  id,
  label,
  description,
  children,
  className,
}: SectionShellProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-label`}
      className={cn(
        "border-b border-border py-8 first:pt-0 last:border-b-0 last:pb-0",
        className,
      )}
    >
      <div className="mb-4 max-w-2xl">
        <p
          id={`${id}-label`}
          className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted"
        >
          {label}
        </p>
        <p className="mt-2 text-sm leading-6 text-secondary">{description}</p>
      </div>
      {children}
    </section>
  );
}
