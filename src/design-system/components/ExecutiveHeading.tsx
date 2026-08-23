import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";

type ExecutiveHeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "h3";
  size?: "xl" | "l" | "heading";
  children: ReactNode;
};

/** Display / heading — hierarchy without decoration. */
export function ExecutiveHeading({
  as,
  size = "heading",
  className,
  children,
  ...props
}: ExecutiveHeadingProps) {
  const Tag = as ?? (size === "xl" ? "h1" : size === "l" ? "h2" : "h2");
  const typeClass =
    size === "xl"
      ? ds.type.displayXl
      : size === "l"
        ? ds.type.displayL
        : ds.type.heading;

  return (
    <Tag className={cn(typeClass, className)} {...props}>
      {children}
    </Tag>
  );
}
