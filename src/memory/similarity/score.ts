/**
 * Similarity helpers for memory recall (portable, tenant-local).
 */

function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2),
  );
}

export function textSimilarity(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let overlap = 0;
  for (const t of ta) {
    if (tb.has(t)) overlap += 1;
  }
  const union = new Set([...ta, ...tb]).size;
  return Math.round((overlap / union) * 100);
}

export function bestSimilarity(
  query: string,
  candidates: string[],
): number {
  if (candidates.length === 0) return 0;
  return Math.max(...candidates.map((c) => textSimilarity(query, c)));
}
