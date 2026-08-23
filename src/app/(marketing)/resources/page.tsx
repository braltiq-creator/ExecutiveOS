import type { Metadata } from "next";
import Link from "next/link";
import { FinalCtaBand } from "@/components/marketing/FinalCtaBand";
import { BLOG_POSTS, RESOURCES_PAGE } from "@/components/marketing/content";

export const metadata: Metadata = {
  title: "Resources",
  description: RESOURCES_PAGE.subheadline,
};

export default function ResourcesPage() {
  return (
    <>
      <section className="mk-section mk-hero">
        <p className="mk-kicker">Resources</p>
        <h1 className="mk-display">{RESOURCES_PAGE.headline}</h1>
        <p className="mk-lead">{RESOURCES_PAGE.subheadline}</p>
      </section>

      <section className="mk-section mk-section-tight">
        <p className="mk-kicker">Featured reading</p>
        <div className="mk-grid-3">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="mk-card"
            >
              <p className="mk-card-meta">{post.category}</p>
              <h2 className="mk-h3">{post.title}</h2>
              <p className="mk-body">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mk-band">
        <div className="mk-section mk-section-tight">
          <div className="mk-grid-3">
            {["Judgement", "Operating rhythm", "Industry"].map((category) => (
              <article key={category} className="mk-card">
                <p className="mk-card-meta">Category</p>
                <h2 className="mk-h3">{category}</h2>
                <p className="mk-body">
                  Essays at executive altitude — evidence-based, never hype.
                </p>
                <Link href="/blog" className="mk-btn mk-btn-ghost">
                  Browse blog →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FinalCtaBand />
    </>
  );
}
