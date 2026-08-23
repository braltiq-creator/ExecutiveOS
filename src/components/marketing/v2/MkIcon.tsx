import {
  EXECUTIVE_ICONS,
  type ExecutiveIconId,
} from "@/experience/icons/executiveIcons";

type MkIconProps = {
  id: ExecutiveIconId;
  className?: string;
  size?: number;
};

/** Marketing icon language — same Lucide set as Command Centre. */
export function MkIcon({ id, className = "", size = 20 }: MkIconProps) {
  const Icon = EXECUTIVE_ICONS[id];
  return (
    <span className={`mk-v2-icon ${className}`} aria-hidden="true">
      <Icon size={size} strokeWidth={1.75} />
    </span>
  );
}
