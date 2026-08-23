import type { Metadata } from "next";
import Link from "next/link";
import { FinalCtaBand } from "@/components/marketing/FinalCtaBand";
import { BLOG_POSTS } from "@/components/marketing/content";

export const metadata: Metadata = {
  title: "Blog",
  description: "Thought leadership at executive altitude.",
};

export default function BlogPage() {
  return (
    <>
      <section className="mk-section mk-hero">
        <p className="mk-kicker">Blog</p>
        <h1 className="mk-display">Clarity for leaders</h1>
        <p className="mk-lead">
          Evidence-based essays on Executive Intelligence. Never hype. Soft trial
          CTA when the story earns it.
        </p>
      </section>

      <section className="mk-section mk-section-tight">
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

      <FinalCtaBand />
    </>
  );
}
