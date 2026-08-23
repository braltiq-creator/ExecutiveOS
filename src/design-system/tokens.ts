import { cn } from "@/lib/utils/cn";

/** Design System class helpers — always token-backed. */
export const ds = {
  type: {
    displayXl: "eos-type-display-xl",
    displayL: "eos-type-display-l",
    heading: "eos-type-heading",
    subheading: "eos-type-subheading",
    body: "eos-type-body",
    supporting: "eos-type-supporting",
    caption: "eos-type-caption",
    metric: "eos-type-metric",
    label: "eos-type-label",
  },
  elevation: {
    canvas: "eos-elevation-canvas",
    surface: "eos-elevation-surface",
    floating: "eos-elevation-floating",
    focus: "eos-elevation-focus",
    modal: "eos-elevation-modal",
  },
  gap: {
    xs: "gap-[var(--eos-space-xs)]",
    sm: "gap-[var(--eos-space-sm)]",
    md: "gap-[var(--eos-space-md)]",
    lg: "gap-[var(--eos-space-lg)]",
    xl: "gap-[var(--eos-space-xl)]",
    "2xl": "gap-[var(--eos-space-2xl)]",
    "3xl": "gap-[var(--eos-space-3xl)]",
  },
  spaceY: {
    xs: "space-y-[var(--eos-space-xs)]",
    sm: "space-y-[var(--eos-space-sm)]",
    md: "space-y-[var(--eos-space-md)]",
    lg: "space-y-[var(--eos-space-lg)]",
    xl: "space-y-[var(--eos-space-xl)]",
    "2xl": "space-y-[var(--eos-space-2xl)]",
    "3xl": "space-y-[var(--eos-space-3xl)]",
  },
  p: {
    xs: "p-[var(--eos-space-xs)]",
    sm: "p-[var(--eos-space-sm)]",
    md: "p-[var(--eos-space-md)]",
    lg: "p-[var(--eos-space-lg)]",
    xl: "p-[var(--eos-space-xl)]",
    "2xl": "p-[var(--eos-space-2xl)]",
    "3xl": "p-[var(--eos-space-3xl)]",
  },
  focusRing:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--eos-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--eos-color-canvas)]",
  motion: {
    hover: "transition-[transform,background-color,color,opacity] duration-[var(--eos-duration-fast)] ease-[var(--eos-ease-out)]",
    cards: "transition-[transform,background-color] duration-[var(--eos-duration-normal)] ease-[var(--eos-ease-out)]",
    navigation: "transition-[background-color,color,box-shadow] duration-[var(--eos-duration-normal)] ease-[var(--eos-ease-soft)]",
  },
} as const;

export type DsType = keyof typeof ds.type;
export type DsElevation = keyof typeof ds.elevation;
export type DsSpace = keyof typeof ds.gap;

export function dsType(variant: DsType, className?: string) {
  return cn(ds.type[variant], className);
}

export function dsElevation(level: DsElevation, className?: string) {
  return cn(ds.elevation[level], className);
}
