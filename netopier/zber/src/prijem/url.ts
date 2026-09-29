// Kanonická URL pre deduplikáciu: rovnaký článok z rubriky, hlavného kanála aj zo zdieľania = jedna URL.

const SLEDOVACIE = /^(utm_[a-z_]+|fbclid|gclid|dclid|msclkid|mc_cid|mc_eid|igshid|yclid|_ga|ref_src|ref_url|at_medium|at_campaign|xtor|rss_source)$/i;

/** Normalizuje URL: https, malý host bez `www.`, bez fragmentu, sledovacích parametrov a koncovej lomky; zoradené parametre. */
export function kanonUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  let u: URL;
  try {
    u = new URL(url.trim());
  } catch {
    return null;
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  const host = u.hostname.toLowerCase().replace(/^www\./, '');
  const params = [...u.searchParams.entries()].filter(([k]) => !SLEDOVACIE.test(k)).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const query = params.length ? `?${new URLSearchParams(params).toString()}` : '';
  let path = u.pathname.replace(/\/{2,}/g, '/');
  if (path.length > 1) path = path.replace(/\/+$/, '');
  const port = u.port && u.port !== '80' && u.port !== '443' ? `:${u.port}` : '';
  return `https://${host}${port}${path}${query}`;
}

export function hostZUrl(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}
