import Link from "next/link";
import { LedgerMark } from "@/components/layout/LedgerMark";
import { MarketingNavLinks } from "@/components/marketing/MarketingNavLinks";
import { NAV, SITE } from "@/components/marketing/content";
import "./marketing.css";
import "./marketing-v2.css";
import "./marketing-v3.css";

type MarketingShellProps = {
  children: React.ReactNode;
};

export function MarketingShell({ children }: MarketingShellProps) {
  return (
    <div className="mk-root mk-atmosphere mk-shell">
      <header className="mk-nav">
        <div className="mk-nav-inner">
          <Link href="/" className="mk-brand" aria-label="ExecutiveOS home">
            <LedgerMark className="size-6 text-[var(--mk-ink)]" />
            <span className="mk-brand-name">{SITE.product}</span>
          </Link>

          <MarketingNavLinks />

          <div className="mk-nav-actions">
            <Link href="/sign-in" className="mk-btn mk-btn-ghost">
              Sign in
            </Link>
            <Link
              href={SITE.primaryCta.href}
              className="mk-btn mk-btn-primary"
            >
              {SITE.primaryCta.label}
            </Link>
          </div>
        </div>
        <div className="mk-mobile-links" aria-label="Mobile">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="mk-nav-link">
              {item.label}
            </Link>
          ))}
        </div>
      </header>

      <main className="mk-main">{children}</main>

      <footer className="mk-footer">
        <div className="mk-footer-inner">
          <div>
            <Link href="/" className="mk-brand">
              <LedgerMark className="size-5 text-[var(--mk-ink)]" />
              <span className="mk-brand-name">{SITE.product}</span>
            </Link>
            <p className="mk-footer-note" style={{ marginTop: "1rem" }}>
              The Executive Intelligence Platform — built by {SITE.company}.{" "}
              {SITE.philosophy}.
            </p>
          </div>
          <div className="mk-footer-col">
            <h3>Product</h3>
            <Link href="/product">Product</Link>
            <Link href="/profiles">Executive Profiles</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/security">Security</Link>
          </div>
          <div className="mk-footer-col">
            <h3>Resources</h3>
            <Link href="/resources">Resources</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/support">Support</Link>
            <Link href="/about">About</Link>
          </div>
          <div className="mk-footer-col">
            <h3>Start</h3>
            <Link href="/start-trial">Start Free Trial</Link>
            <Link href="/sign-in">Sign in</Link>
            <Link href="/support#contact">Contact Sales</Link>
          </div>
        </div>
        <div className="mk-footer-bar">
          <span>
            © {new Date().getFullYear()} {SITE.company}
          </span>
          <span>{SITE.philosophy}</span>
        </div>
      </footer>
    </div>
  );
}
