import { BLOG_POSTS } from "@/components/marketing/content";

export const BLOG_BODIES: Record<
  (typeof BLOG_POSTS)[number]["slug"],
  { paragraphs: string[] }
> = {
  "executive-intelligence-platform": {
    paragraphs: [
      "An Executive Intelligence Platform connects an executive’s strategic intent, outcomes, decisions, calendar, and organisational relationships into a proactive intelligence layer — with Council judgement and industry context — designed exclusively for leadership.",
      "It is not Business Intelligence with a nicer theme. It is not an AI chat window pointed at the enterprise. It is not a dashboard that waits for someone to interpret it every morning.",
      "ExecutiveOS exists to make that category concrete: overnight change ranked against outcomes, judgement prepared, authority left with the human who is accountable.",
    ],
  },
  "morning-before-the-meeting": {
    paragraphs: [
      "Most executives still begin the day in email and end it reconstructing context that the organisation already paid to store.",
      "The cost is not only time. It is decision latency — re-debating what should have been clear before the first meeting.",
      "When attention is ranked against committed outcomes, the morning declares what requires judgement. That is the operating rhythm ExecutiveOS is built to own.",
    ],
  },
  "manufacturing-judgement-without-custom": {
    paragraphs: [
      "Manufacturing executives see factory, inventory, demand, and capital as one problem. Software usually splits them across ERP, MES, and dealer systems.",
      "ExecutiveOS does not customise Core for manufacturing. The Manufacturing Executive Intelligence Pack brings industry context — vocabulary, outcomes, Council knowledge — while the platform remains the Executive Intelligence Platform.",
      "That is how industry depth scales without becoming a custom project for every logo.",
    ],
  },
};

export function getBlogPost(slug: string) {
  const meta = BLOG_POSTS.find((post) => post.slug === slug);
  if (!meta) return null;
  const body = BLOG_BODIES[meta.slug];
  return { ...meta, ...body };
}
