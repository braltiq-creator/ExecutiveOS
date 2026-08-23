import { Reveal } from "@/components/marketing/v2/Reveal";

/** Placeholders only — never invent customers or logos. */
export function SocialProof() {
  return (
    <div className="mk-v2-proof">
      <Reveal>
        <p className="mk-v2-council-label">Design Partners</p>
        <div className="mk-v2-proof-row">
          {["Partner logo", "Partner logo", "Partner logo", "Partner logo"].map(
            (label, index) => (
              <span key={`${label}-${index}`} className="mk-v2-proof-slot">
                {label}
              </span>
            ),
          )}
        </div>
      </Reveal>

      <div className="mk-v2-proof-grid">
        <Reveal delayMs={80}>
          <blockquote className="mk-v2-quote">
            <p>
              “Executive testimonial placeholder — published only with approval.”
            </p>
            <footer>Design Partner · Role · Industry</footer>
          </blockquote>
        </Reveal>
        <Reveal delayMs={140}>
          <article className="mk-v2-case">
            <p className="mk-card-meta">Case study</p>
            <h3 className="mk-h3">Outcome story reserved</h3>
            <p className="mk-body">
              Named logos and metrics appear when measured and approved — never
              invented.
            </p>
          </article>
        </Reveal>
      </div>
    </div>
  );
}
