// Klient: vykreslí tri oblasti z /api/teraz.json a obnovuje ich každú minútu.
import type { Oblast, OblastId, Polozka, Teraz } from '../lib/netopier';

const OBNOVA_MS = 60_000;
const TZ = 'Europe/Bratislava';
const hodMin = new Intl.DateTimeFormat('sk-SK', { hour: '2-digit', minute: '2-digit', timeZone: TZ });
const den = new Intl.DateTimeFormat('sk-SK', { day: 'numeric', month: 'numeric', timeZone: TZ });
const cislo = new Intl.NumberFormat('sk-SK');

const videne = new Set<number>();
const filter = new Map<OblastId, string | null>();
let prvyRaz = true;

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function cas(isoCas: string): string {
  const d = new Date(isoCas);
  const dnes = den.format(new Date());
  return den.format(d) === dnes ? hodMin.format(d) : `${den.format(d)} ${hodMin.format(d)}`;
}

function predChvilou(isoCas: string): string {
  const min = Math.round((Date.now() - Date.parse(isoCas)) / 60_000);
  if (min < 1) return 'práve teraz';
  if (min < 60) return `pred ${min} min`;
  return `pred ${Math.floor(min / 60)} h ${min % 60} min`;
}

/** Článok cez Google Prekladač (proxy translate.goog), pre jazyky okrem slovenčiny, češtiny a angličtiny. */
function prekladUrl(url: string | null, jazyk: string | null): string | null {
  if (!url || !jazyk || ['sk', 'cs', 'en'].includes(jazyk)) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('news.google.')) return null;
    const host = u.hostname.replace(/-/g, '--').replace(/\./g, '-');
    u.searchParams.set('_x_tr_sl', 'auto');
    u.searchParams.set('_x_tr_tl', 'sk');
    u.searchParams.set('_x_tr_hl', 'sk');
    return `https://${host}.translate.goog${u.pathname}${u.search}`;
  } catch {
    return null;
  }
}

function polozkaHtml(p: Polozka, oblast?: string): string {
  const jazyk = p.jazyk && !['sk', 'en'].includes(p.jazyk) ? `<span class="rounded border border-[var(--border)] px-1 text-[10px] font-bold uppercase">${esc(p.jazyk)}</span>` : '';
  const preklad = prekladUrl(p.url, p.jazyk);
  const prelozit = preklad
    ? `<a href="${esc(preklad)}" target="_blank" rel="noopener noreferrer" class="font-bold text-[var(--fg)] underline decoration-[var(--color-pink)] decoration-2 underline-offset-2">po slovensky</a>`
    : '';
  const tag = oblast ? `<span class="rounded-full bg-[var(--color-pink)] px-2 text-[11px] font-bold text-[var(--color-ink)]">${esc(oblast)}</span>` : '';
  const titulok = p.url
    ? `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer" lang="${esc(p.jazyk ?? 'sk')}" class="font-display text-[17px] font-bold leading-snug tracking-[-0.01em] hover:underline decoration-[var(--color-pink)] decoration-[3px] underline-offset-2">${esc(p.titulok)}</a>`
    : `<span class="font-display text-[17px] font-bold leading-snug">${esc(p.titulok)}</span>`;
  const perex = p.perex ? `<p lang="${esc(p.jazyk ?? 'sk')}" class="mt-1 line-clamp-2 text-[15px] leading-snug text-[var(--fg-muted)]">${esc(p.perex)}</p>` : '';
  const nova = !prvyRaz && !videne.has(p.id) ? ' nova' : '';
  return `<li class="polozka px-4 py-3${nova}" data-id="${p.id}" data-kluce="${esc(p.kluce.join(' '))}">
    <div class="mb-0.5 flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--fg-muted)]">
      <time datetime="${esc(p.cas)}" class="tabular-nums text-[var(--fg)]">${cas(p.cas)}</time><span>${esc(p.zdroj)}</span>${jazyk}${prelozit}${tag}
    </div>${titulok}${perex}</li>`;
}

function vykresliOblast(o: Oblast) {
  const el = document.querySelector<HTMLElement>(`[data-oblast="${o.id}"]`);
  if (!el) return;
  el.querySelector('[data-za-hodinu]')!.textContent = cislo.format(o.zaHodinu);
  el.querySelector('[data-popis]')!.textContent = `${o.popis} · ${o.zdrojov24h} zdrojov za 24 h`;

  const skok = el.querySelector<HTMLElement>('[data-skok]')!;
  const pomer = o.priemerHodina > 0 ? o.zaHodinu / o.priemerHodina : 0;
  skok.classList.toggle('hidden', pomer < 1.5 || o.zaHodinu < 10);
  skok.textContent = `${pomer.toLocaleString('sk-SK', { maximumFractionDigits: 1 })}× nad priemerom`;

  const max = Math.max(1, ...o.hodiny);
  const odHodin = Math.floor((Date.now() - Date.parse(o.sledujeOd)) / 3600_000);
  const neuplne = odHodin < 24;
  const popisEl = el.querySelector('[data-popis]')!;
  if (neuplne) popisEl.textContent += ` · sleduje od ${cas(o.sledujeOd)}, priebeh je zatiaľ neúplný`;
  el.querySelector('[data-hodiny]')!.innerHTML = o.hodiny
    .map((n, i) => {
      const posledna = i === o.hodiny.length - 1;
      const predSledovanim = 23 - i > odHodin;
      const farba = posledna ? 'bg-[var(--color-pink)]' : predSledovanim ? 'bg-[var(--fg)] opacity-20' : 'bg-[var(--fg)] opacity-80';
      return `<div title="${n} správ" class="flex-1 rounded-t-[2px] border-[var(--border)] ${farba} ${posledna ? 'border-2' : ''}" style="height:${Math.max(4, (n / max) * 100)}%"></div>`;
    })
    .join('');

  const aktivny = filter.get(o.id) ?? null;
  if (aktivny && !o.temy.some((t) => t.kluc === aktivny)) filter.set(o.id, null);
  const temyEl = el.querySelector('[data-temy]')!;
  temyEl.innerHTML = o.temy.length
    ? o.temy
        .map(
          (t) =>
            `<button type="button" class="bk-chip bg-[var(--card)] px-2.5 py-0.5 text-sm font-bold" data-tema="${esc(t.kluc)}" aria-pressed="${filter.get(o.id) === t.kluc}" title="${t.zdrojov} redakcií, ${t.sprav} správ">${esc(t.slovo)} <span class="tabular-nums opacity-60">${t.zdrojov}</span></button>`,
        )
        .join('')
    : '<span class="text-sm text-[var(--fg-muted)]">zatiaľ nič, čo by opakovalo viac redakcií</span>';

  const zoznam = el.querySelector<HTMLElement>('[data-zoznam]')!;
  const scroll = zoznam.scrollTop;
  const k = filter.get(o.id);
  const polozky = k ? o.polozky.filter((p) => p.kluce.includes(k)) : o.polozky;
  zoznam.innerHTML = polozky.map((p) => polozkaHtml(p)).join('') || '<li class="px-4 py-6 text-[var(--fg-muted)]">Za 24 hodín nič.</li>';
  zoznam.scrollTop = scroll;
}

let posledne: Teraz | null = null;

function vykresli(t: Teraz) {
  posledne = t;
  for (const o of t.oblasti) vykresliOblast(o);
  for (const o of t.oblasti) for (const p of o.polozky) videne.add(p.id);
  prvyRaz = false;
  vykresliStav();
}

function vykresliStav() {
  const t = posledne;
  if (!t) return;
  const spolu = t.oblasti.reduce((a, o) => a + o.zaHodinu, 0);
  const p = t.prijem;
  const text = p
    ? `príjem ${predChvilou(p.koniec)} · ${p.kanalovOk}/${p.kanalov} kanálov · +${cislo.format(p.novych)} nových · ${cislo.format(spolu)} správ za hodinu`
    : `${cislo.format(spolu)} správ za hodinu`;
  document.getElementById('stav-text')!.textContent = text;
}

async function obnov() {
  try {
    const r = await fetch('/api/teraz.json', { cache: 'no-store' });
    if (r.ok) vykresli(await r.json());
  } catch {
    document.getElementById('stav-text')!.textContent = 'Netopier neodpovedá, skúšam znova…';
  }
}

async function hladaj(q: string) {
  const box = document.getElementById('vysledky')!;
  if (!q.trim()) {
    box.classList.add('hidden');
    return;
  }
  box.classList.remove('hidden');
  box.innerHTML = '<p class="text-[var(--fg-muted)]">Hľadám…</p>';
  const r = await fetch(`/api/hladaj.json?q=${encodeURIComponent(q)}`);
  const vysledky: Array<Polozka & { oblast: OblastId }> = r.ok ? await r.json() : [];
  const nazvy: Record<OblastId, string> = { svet: 'Svet', europa: 'Európa', slovensko: 'Slovensko' };
  box.innerHTML = `<div class="mb-2 flex items-center justify-between gap-3">
      <h2 class="font-display text-2xl font-extrabold">„${esc(q)}“ <span class="text-base font-semibold text-[var(--fg-muted)]">${vysledky.length === 120 ? '120+' : vysledky.length} správ, najnovšie hore</span></h2>
      <button type="button" id="zrus" class="bk-chip px-3 py-0.5 font-bold">Zavrieť</button>
    </div>
    <ol class="max-h-[60vh] divide-y-2 divide-[var(--color-line)] overflow-y-auto">${vysledky.map((p) => polozkaHtml(p, nazvy[p.oblast])).join('') || '<li class="py-4 text-[var(--fg-muted)]">Nič.</li>'}</ol>`;
  document.getElementById('zrus')!.addEventListener('click', () => {
    box.classList.add('hidden');
    (document.getElementById('hladaj-q') as HTMLInputElement).value = '';
  });
}

export function spusti() {
  const data = JSON.parse(document.getElementById('data')!.textContent!) as Teraz;
  vykresli(data);
  setInterval(obnov, OBNOVA_MS);
  setInterval(vykresliStav, 15_000);

  document.getElementById('oblasti')!.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-tema]');
    if (!b) return;
    const oblast = b.closest<HTMLElement>('[data-oblast]')!.dataset.oblast as OblastId;
    filter.set(oblast, filter.get(oblast) === b.dataset.tema ? null : b.dataset.tema!);
    const o = posledne?.oblasti.find((x) => x.id === oblast);
    if (o) vykresliOblast(o);
  });

  document.getElementById('karty')!.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-karta]');
    if (!b) return;
    document.querySelectorAll<HTMLButtonElement>('[data-karta]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    document.querySelectorAll<HTMLElement>('[data-oblast]').forEach((s) => s.classList.toggle('max-lg:hidden', s.dataset.oblast !== b.dataset.karta));
  });

  document.getElementById('hladaj')!.addEventListener('submit', (e) => {
    e.preventDefault();
    hladaj((document.getElementById('hladaj-q') as HTMLInputElement).value);
  });
}
