type ExecPhotoProps = {
  tone: "boardroom" | "leadership" | "manufacturing" | "operations" | "factory";
  caption: string;
  className?: string;
};

/**
 * Premium executive atmosphere panels — muted, authentic, non-stock.
 * Illustrated photographic planes (not generic stock photography).
 */
export function ExecPhoto({ tone, caption, className = "" }: ExecPhotoProps) {
  return (
    <figure className={`mk-v2-photo mk-v2-photo-${tone} ${className}`}>
      <div className="mk-v2-photo-grain" aria-hidden="true" />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
