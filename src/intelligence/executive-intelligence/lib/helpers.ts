export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function clampScore(value: number): number {
  return clamp(Math.round(value), 0, 100);
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function ensureSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

export function shortLine(text: string, maxWords = 10): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}…`;
}

export function clipNarrative(text: string, maxWords = 60): string {
  const sentences = text
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, 3);
  let result = sentences.join(" ");
  const words = result.split(/\s+/).filter(Boolean);
  if (words.length > maxWords) {
    result = words.slice(0, maxWords).join(" ");
    if (!/[.!?…]$/.test(result)) result = `${result}…`;
  } else if (result && !/[.!?]$/.test(result)) {
    result = `${result}.`;
  }
  return result;
}

export function formatRefresh(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "Just now";
  }
}

export function shortOwner(owner: string): string {
  const beforeComma = owner.split(",")[0]?.trim() ?? owner;
  const parts = beforeComma.split(/\s+/);
  if (parts.length <= 2) return beforeComma;
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

export function shortOutcomeName(id: string, name: string): string {
  const known: Record<string, string> = {
    "outcome-enterprise-arr": "Enterprise ARR",
    "outcome-retention": "Net Retention",
    "outcome-board": "Board Pack",
    "outcome-efficiency": "Meeting Load",
  };
  if (known[id]) return known[id];
  if (name.length <= 24) return name;
  return `${name.slice(0, 22).trim()}…`;
}

export function isOpenDecision(status: string): boolean {
  return status !== "approved" && status !== "decided" && status !== "archived";
}

export function isUrgentDecision(status: string, deadline: string): boolean {
  return (
    status === "due_today" || deadline.toLowerCase().includes("today")
  );
}

export function movementPercentLabel(
  movement: number,
  healthScore: number,
): string {
  if (movement === 0) return "0%";
  const base = Math.max(1, healthScore - movement);
  const pct = Math.round((movement / base) * 100);
  if (pct === 0) return movement > 0 ? "+1%" : "−1%";
  return pct > 0 ? `+${pct}%` : `−${Math.abs(pct)}%`;
}
