import type { AnchorHTMLAttributes, ReactNode } from "react";

type NextLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children?: ReactNode;
  replace?: boolean;
  scroll?: boolean;
  prefetch?: boolean;
};

/** Storybook stand-in for next/link — renders a plain anchor. */
export default function Link({ href, children, ...props }: NextLinkProps) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
