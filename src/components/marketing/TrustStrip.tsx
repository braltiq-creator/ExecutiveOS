import { TRUST } from "@/components/marketing/content";

export function TrustStrip({ items = TRUST }: { items?: readonly string[] }) {
  return (
    <div className="mk-trust" aria-label="Trust">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}
