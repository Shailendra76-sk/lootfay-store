// Tiny Levenshtein distance + fuzzy match helper for search-as-you-type.

export function lev(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const v0 = new Array(b.length + 1);
  const v1 = new Array(b.length + 1);
  for (let i = 0; i <= b.length; i++) v0[i] = i;
  for (let i = 0; i < a.length; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < b.length; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (let j = 0; j <= b.length; j++) v0[j] = v1[j];
  }
  return v1[b.length];
}

/** Score lower = better match. Returns null if no plausible match. */
export function fuzzyScore(query: string, text: string): number | null {
  if (!query) return null;
  const q = query.toLowerCase().trim();
  const t = text.toLowerCase();
  if (t.includes(q)) return 0; // substring = best
  // Compare against each word in text
  const tokens = t.split(/[\s,.\-_/()]+/).filter(Boolean);
  let best = Infinity;
  for (const tok of tokens) {
    if (!tok) continue;
    if (tok.startsWith(q)) best = Math.min(best, 0.5);
    const d = lev(q, tok.slice(0, q.length + 2));
    const ratio = d / Math.max(q.length, 1);
    if (ratio <= 0.5) best = Math.min(best, 1 + ratio);
  }
  return Number.isFinite(best) ? best : null;
}

export function fuzzySuggest<T extends { title: string }>(query: string, items: T[], limit = 4): T[] {
  if (!query.trim()) return [];
  const scored: { item: T; score: number }[] = [];
  for (const it of items) {
    const s = fuzzyScore(query, it.title);
    if (s != null) scored.push({ item: it, score: s });
  }
  scored.sort((a, b) => a.score - b.score);
  // de-dupe by lowercase title
  const seen = new Set<string>();
  const out: T[] = [];
  for (const s of scored) {
    const k = s.item.title.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(s.item);
    if (out.length >= limit) break;
  }
  return out;
}
