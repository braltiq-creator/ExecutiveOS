import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FinalCtaBand } from "@/components/marketing/FinalCtaBand";
import { getBlogPost } from "@/components/marketing/blog-posts";
import { BLOG_POSTS } from "@/components/marketing/content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Blog" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <>
      <article className="mk-section mk-hero">
        <p className="mk-kicker">{post.category}</p>
        <h1 className="mk-display">{post.title}</h1>
        <p className="mk-lead">{post.excerpt}</p>
        <div className="mk-section-narrow" style={{ marginTop: "2.5rem" }}>
          {post.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="mk-body">
              {paragraph}
            </p>
          ))}
          <div className="mk-actions">
            <Link href="/blog" className="mk-btn mk-btn-secondary">
              All articles
            </Link>
          </div>
        </div>
      </article>
      <FinalCtaBand />
    </>
  );
}
