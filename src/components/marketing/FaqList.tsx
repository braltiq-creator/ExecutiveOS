import { FAQS } from "@/components/marketing/content";

export function FaqList() {
  return (
    <div className="mk-faq">
      {FAQS.map((item) => (
        <details key={item.q}>
          <summary>{item.q}</summary>
          <p>{item.a}</p>
        </details>
      ))}
    </div>
  );
}
