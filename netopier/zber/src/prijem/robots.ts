// robots.txt: skupiny User-agent, Allow/Disallow s * a $, najdlhšia zhoda vyhráva, Crawl-delay.

export interface RobotsPravidla {
  pravidla: Array<{ allow: boolean; vzor: string }>;
  crawlDelay: number | null;
}

/** Vyberie skupinu pre náš agent (`netopier`), inak `*`. Prázdny alebo chýbajúci robots.txt = bez obmedzení. */
export function parseRobots(txt: string | null, agent = 'netopier'): RobotsPravidla {
  if (!txt) return { pravidla: [], crawlDelay: null };
  type Skupina = { agenti: string[]; pravidla: RobotsPravidla['pravidla']; crawlDelay: number | null };
  const skupiny: Skupina[] = [];
  let aktualna: Skupina | null = null;
  let posledneBoloUa = false;
  for (const riadok of txt.split(/\r?\n/)) {
    const bez = riadok.replace(/#.*$/, '').trim();
    const m = bez.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const kluc = m[1]!.toLowerCase();
    const hodnota = m[2]!.trim();
    if (kluc === 'user-agent') {
      if (!posledneBoloUa || !aktualna) {
        aktualna = { agenti: [], pravidla: [], crawlDelay: null };
        skupiny.push(aktualna);
      }
      aktualna.agenti.push(hodnota.toLowerCase());
      posledneBoloUa = true;
      continue;
    }
    posledneBoloUa = false;
    if (!aktualna) continue;
    if (kluc === 'allow' || kluc === 'disallow') {
      if (hodnota) aktualna.pravidla.push({ allow: kluc === 'allow', vzor: hodnota });
    } else if (kluc === 'crawl-delay') {
      const n = Number(hodnota);
      if (Number.isFinite(n) && n >= 0) aktualna.crawlDelay = n;
    }
  }
  const a = agent.toLowerCase();
  const vlastna = skupiny.filter((s) => s.agenti.some((x) => x !== '*' && a.includes(x)));
  const vybrane = vlastna.length ? vlastna : skupiny.filter((s) => s.agenti.includes('*'));
  return {
    pravidla: vybrane.flatMap((s) => s.pravidla),
    crawlDelay: vybrane.map((s) => s.crawlDelay).find((c) => c !== null) ?? null,
  };
}

function vzorNaRegex(vzor: string): RegExp {
  const koniec = vzor.endsWith('$');
  const telo = (koniec ? vzor.slice(0, -1) : vzor)
    .split('*')
    .map((c) => c.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');
  return new RegExp(`^${telo}${koniec ? '$' : ''}`);
}

/** Smie sa cesta (s query) stiahnuť? Najdlhší zhodný vzor rozhoduje, pri rovnosti Allow. */
export function robotsPovoluje(r: RobotsPravidla, url: string): boolean {
  let cesta: string;
  try {
    const u = new URL(url);
    cesta = `${u.pathname}${u.search}`;
  } catch {
    return false;
  }
  let najlepsi: { allow: boolean; dlzka: number } | null = null;
  for (const p of r.pravidla) {
    if (!vzorNaRegex(p.vzor).test(cesta)) continue;
    const dlzka = p.vzor.length;
    if (!najlepsi || dlzka > najlepsi.dlzka || (dlzka === najlepsi.dlzka && p.allow)) najlepsi = { allow: p.allow, dlzka };
  }
  return najlepsi ? najlepsi.allow : true;
}
