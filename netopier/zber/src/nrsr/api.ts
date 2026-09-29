// Oficiálne otvorené údaje NR SR: JSON API https://www.nrsr.sk/opendata/1/sk/ (Kancelária NR SR, katalóg data.slovensko.sk).
// Ponúka zoznamy poslancov, ich členstvo v kluboch a výboroch s dátumami, schôdze, parlamentné tlače a zoznam hlasovaní
// s výsledkami. Hlasy jednotlivých poslancov ani prepisy vystúpení API nemá — tie sú iba na HTML stránkach (parse.ts).
// Tento súbor obsahuje čisté mapovanie JSON → riadky tabuliek, bez siete a bez DB.

import { bratislavaToIso } from '../util';

export const API_BASE = 'https://www.nrsr.sk/opendata/1/sk/';

export function apiUrl(cesta: string, params: Record<string, string | number> = {}): string {
  const q = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&');
  return `${API_BASE}${cesta}${q ? `?${q}` : ''}`;
}

/** Miestny čas bez pásma („2023-12-07T17:13:41“, čas v Bratislave) → ISO 8601 UTC. */
export function miestnyCasNaUtc(s: string | null | undefined): string | null {
  if (!s) return null;
  const iso = bratislavaToIso(s.replace('T', ' ').slice(0, 19));
  return iso ? new Date(iso).toISOString() : null;
}

/** „2023-12-07T17:13:41“ → 2023-12-07 (deň zapísaný v zdroji). */
export function denZ(s: string | null | undefined): string | null {
  return s && /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : null;
}

const prazdne = (s: string | null | undefined): string | null => (s && s.trim() ? s.trim() : null);

// --- poslanci -------------------------------------------------------------------------------------------------------

export interface MpJson {
  mpId: number;
  personKey?: string | null;
  firstname: string;
  lastName: string;
  titleBefore?: string | null;
  titleAfter?: string | null;
  birthDate?: string | null;
  nationality?: string | null;
  partyDepartmentKey?: string | null;
  partyDepartmentName?: string | null;
  lastClubAbbr?: string | null;
  addressCity?: string | null;
  addressRegion?: string | null;
  termNr: number;
  email?: string | null;
  photoUrl?: string | null;
  isMale?: boolean | null;
}

export interface Poslanec {
  id: number;
  meno: string;
  priezvisko: string;
  titul: string | null;
  titulZa: string | null;
  narodeny: string | null;
  narodnost: string | null;
  pohlavie: 'M' | 'Z' | null;
  kluc: string | null;
  fotoUrl: string | null;
  obdobie: number;
  kandidovalZa: string | null;
  kandidovalZaKluc: string | null;
  bydlisko: string | null;
  kraj: string | null;
  email: string | null;
  poslednyKlub: string | null;
}

export function mapPoslanec(j: MpJson): Poslanec {
  return {
    id: j.mpId,
    meno: j.firstname.trim(),
    priezvisko: j.lastName.trim(),
    titul: prazdne(j.titleBefore),
    titulZa: prazdne(j.titleAfter),
    narodeny: denZ(j.birthDate),
    narodnost: prazdne(j.nationality),
    pohlavie: j.isMale === true ? 'M' : j.isMale === false ? 'Z' : null,
    kluc: prazdne(j.personKey),
    fotoUrl: prazdne(j.photoUrl),
    obdobie: j.termNr,
    kandidovalZa: prazdne(j.partyDepartmentName),
    kandidovalZaKluc: prazdne(j.partyDepartmentKey),
    bydlisko: prazdne(j.addressCity),
    kraj: prazdne(j.addressRegion),
    email: prazdne(j.email),
    poslednyKlub: prazdne(j.lastClubAbbr),
  };
}

export interface MembershipJson {
  postKey: string;
  postName?: string | null;
  departmentKey: string;
  departmentName?: string | null;
  validFrom: string;
  validTo?: string | null;
  termNr: number;
  mpId: number;
}

export interface Funkcia {
  poslanecId: number;
  obdobie: number;
  organKluc: string;
  organ: string;
  druh: 'klub' | 'vybor' | 'ine';
  funkciaKluc: string;
  funkcia: string | null;
  od: string;
  do: string | null;
}

/** Druh orgánu podľa kľúča oddelenia (NRSR.Kluby.*, NRSR.Vybory.*). */
export function druhOrganu(departmentKey: string): Funkcia['druh'] {
  if (/^NRSR\.Kluby\b/i.test(departmentKey)) return 'klub';
  if (/^NRSR\.Vybory\b/i.test(departmentKey)) return 'vybor';
  return 'ine';
}

/** Členstvo poslanca v orgánoch (kluby, výbory, delegácie …) s dátumami od–do: história. Časy sú miestne (Bratislava). */
export function mapFunkcie(memberships: MembershipJson[]): Funkcia[] {
  return memberships.map((m) => ({
    poslanecId: m.mpId,
    obdobie: m.termNr,
    organKluc: m.departmentKey,
    organ: m.departmentName?.trim() || m.departmentKey,
    druh: druhOrganu(m.departmentKey),
    funkciaKluc: m.postKey,
    funkcia: prazdne(m.postName),
    od: miestnyCasNaUtc(m.validFrom)!,
    do: miestnyCasNaUtc(m.validTo),
  }));
}

// --- kluby a výbory -------------------------------------------------------------------------------------------------

export interface KlubJson {
  id: number;
  departmentKey: string;
  dateFinished?: string | null;
  termNr: number;
  name: string;
  validFrom?: string | null;
  email?: string | null;
  membersCount?: number | null;
  currentMembersCount?: number | null;
  colorRgb?: string | null;
}

export interface VyborJson {
  id: number;
  departmentKey: string;
  validFrom?: string | null;
  validTo?: string | null;
  termNr: number;
  email?: string | null;
  shortcut?: string | null;
  name: string;
  membersCount?: number | null;
  currentMembersCount?: number | null;
}

export interface Organ {
  id: string;
  druh: 'klub' | 'vybor';
  obdobie: number;
  kluc: string;
  nazov: string;
  skratka: string | null;
  od: string | null;
  do: string | null;
  email: string | null;
  clenovCelkom: number | null;
  clenovAktualne: number | null;
  farba: string | null;
}

export function mapKlub(j: KlubJson): Organ {
  return {
    id: `klub:${j.id}`,
    druh: 'klub',
    obdobie: j.termNr,
    kluc: j.departmentKey,
    nazov: j.name.trim(),
    skratka: prazdne(j.departmentKey.split('.').pop()),
    od: miestnyCasNaUtc(j.validFrom),
    do: miestnyCasNaUtc(j.dateFinished),
    email: prazdne(j.email),
    clenovCelkom: j.membersCount ?? null,
    clenovAktualne: j.currentMembersCount ?? null,
    farba: prazdne(j.colorRgb),
  };
}

export function mapVybor(j: VyborJson): Organ {
  return {
    id: `vybor:${j.id}`,
    druh: 'vybor',
    obdobie: j.termNr,
    kluc: j.departmentKey,
    nazov: j.name.trim(),
    skratka: prazdne(j.shortcut),
    od: miestnyCasNaUtc(j.validFrom),
    do: miestnyCasNaUtc(j.validTo),
    email: prazdne(j.email),
    clenovCelkom: j.membersCount ?? null,
    clenovAktualne: j.currentMembersCount ?? null,
    farba: null,
  };
}

// --- schôdze, tlače, hlasovania ---------------------------------------------------------------------------------------

export interface SchodzaJson {
  termNr: number;
  meetingNr: number;
  beginDate?: string | null;
  endDate?: string | null;
  meetingProgramId?: number | null;
  description?: string | null;
}

export interface Schodza {
  obdobie: number;
  cislo: number;
  popis: string | null;
  od: string | null;
  do: string | null;
  programId: number | null;
}

export function mapSchodza(j: SchodzaJson): Schodza {
  return {
    obdobie: j.termNr,
    cislo: j.meetingNr,
    popis: prazdne(j.description),
    od: denZ(j.beginDate),
    do: denZ(j.endDate),
    programId: j.meetingProgramId ?? null,
  };
}

export interface TlacJson {
  id: number;
  termNr: number;
  deliveryDate?: string | null;
  assignmentDate?: string | null;
  billNr: string;
  description?: string | null;
  typeId?: number | null;
  typeName?: string | null;
}

export interface Tlac {
  obdobie: number;
  cpt: number;
  idNrsr: number;
  typId: number | null;
  typ: string | null;
  nazov: string | null;
  doruceny: string | null;
  pridelena: string | null;
}

export function mapTlac(j: TlacJson): Tlac | null {
  const cpt = Number.parseInt(j.billNr, 10);
  if (!Number.isFinite(cpt) || cpt <= 0) return null;
  return {
    obdobie: j.termNr,
    cpt,
    idNrsr: j.id,
    typId: j.typeId ?? null,
    typ: prazdne(j.typeName),
    nazov: prazdne(j.description),
    doruceny: denZ(j.deliveryDate),
    pridelena: denZ(j.assignmentDate),
  };
}

export interface HlasovanieJson {
  id: number;
  date: string;
  votingNr: number;
  meetingNr: number;
  name: string;
  billNr?: string | null;
  typeName?: string | null;
  isConstitutionalLaw?: boolean | null;
  stateName?: string | null;
  termNr: number;
  isSecretVoting?: boolean | null;
  countPresent?: number | null;
  countAgreed?: number | null;
  countDisagreed?: number | null;
  countAbstained?: number | null;
  countNotVoting?: number | null;
  countNotPresent?: number | null;
}

export interface HlasovanieMeta {
  id: number;
  obdobie: number;
  schodza: number;
  cislo: number;
  casUtc: string;
  nazov: string;
  cpt: number | null;
  typ: string | null;
  tajne: boolean;
  ustavne: boolean;
  vysledok: string | null;
  pritomni: number | null;
  hlasujuci: number | null;
  za: number | null;
  proti: number | null;
  zdrzali: number | null;
  nehlasovali: number | null;
  nepritomni: number | null;
}

const VYSLEDKY = new Set(['Návrh prešiel', 'Návrh neprešiel', 'Parlament nebol uznášaniaschopný']);

/** Hlasovanie zo zoznamu API; `stateName` „Zverejnené hlasovanie“ (tajné voľby) nie je výsledok. */
export function mapHlasovanie(j: HlasovanieJson): HlasovanieMeta | null {
  const casUtc = miestnyCasNaUtc(j.date);
  if (!casUtc) return null;
  const cpt = Number.parseInt(j.billNr ?? '', 10);
  const za = j.countAgreed ?? null;
  const proti = j.countDisagreed ?? null;
  const zdrzali = j.countAbstained ?? null;
  return {
    id: j.id,
    obdobie: j.termNr,
    schodza: j.meetingNr,
    cislo: j.votingNr,
    casUtc,
    nazov: j.name.trim(),
    cpt: Number.isFinite(cpt) && cpt > 0 ? cpt : null,
    typ: prazdne(j.typeName),
    tajne: j.isSecretVoting === true,
    ustavne: j.isConstitutionalLaw === true,
    vysledok: j.stateName && VYSLEDKY.has(j.stateName) ? j.stateName : null,
    pritomni: j.countPresent ?? null,
    hlasujuci: za !== null && proti !== null && zdrzali !== null ? za + proti + zdrzali : null,
    za,
    proti,
    zdrzali,
    nehlasovali: j.countNotVoting ?? null,
    nepritomni: j.countNotPresent ?? null,
  };
}
