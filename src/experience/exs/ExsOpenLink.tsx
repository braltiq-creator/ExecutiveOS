import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type Props = {
  href: string;
  children?: string;
  className?: string;
};

/** Standard drill-down language. */
export function ExsOpenLink({
  href,
  children = "Open →",
  className,
}: Props) {
  return (
    <Link href={href} className={cn("exs-open", className)}>
      {children}
    </Link>
  );
}
