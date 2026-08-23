import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";
import { UDG_CANONICAL_FIELD_LABELS } from "../contracts";
import type { UdgMappingDefinition } from "../contracts";

type MappingPreviewProps = {
  mapping: UdgMappingDefinition;
  className?: string;
};

export function MappingPreview({ mapping, className }: MappingPreviewProps) {
  return (
    <section
      className={cn(
        "rounded-[var(--exds-card-radius)] border border-[var(--exds-card-border)]",
        "bg-[var(--exds-card-bg)] p-[var(--eos-space-lg)]",
        className,
      )}
    >
      <p className={ds.type.label}>Mapping preview</p>
      <p className="eos-type-subheading mt-1 text-[var(--eos-color-text)]">
        {mapping.name}
      </p>
      <ul className="mt-[var(--eos-space-md)] space-y-2">
        {mapping.fields.map((field) => {
          const label =
            UDG_CANONICAL_FIELD_LABELS[field.canonicalField] ??
            field.canonicalField;
          return (
            <li
              key={`${field.sourceColumn}-${field.canonicalField}`}
              className="flex flex-wrap items-center gap-2"
            >
              <span className="eos-type-supporting rounded-[var(--eos-radius-sm)] border border-[var(--exds-card-border)] px-2 py-1">
                {field.sourceColumn}
              </span>
              <span className="eos-type-caption text-[var(--eos-color-text-muted)]">
                →
              </span>
              <span
                className="eos-type-supporting px-1"
                style={{ color: "var(--exds-intelligence)" }}
              >
                {label}
              </span>
              {field.required ? (
                <span className="eos-type-caption">Required</span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
