export type SourceId = 'rss' | 'worldmonitor' | 'crz' | 'ted' | 'kataster' | 'statistika';

export const SOURCE_IDS: readonly SourceId[] = ['rss', 'worldmonitor', 'crz', 'ted', 'kataster', 'statistika'];

/** Správa vo fronte: jeden konektor, jeden kanál alebo dávka. */
export interface Job {
  source: SourceId;
  /** rss: sada kanálov (media | worldmonitor); crz: dátum exportu; kataster/statistika: id oblasti/datasetu */
  channel?: string;
  /** rss: poradové číslo dávky v sade */
  batch?: number;
}

export interface Env {
  DB: D1Database;
  RAW?: R2Bucket;
  JOBS: Queue<Job>;
  USER_AGENT?: string;
  /** Bearer token pre ručné spustenie zberu cez POST /run (secret). */
  ZBER_TOKEN?: string;
}

/** Jeden záznam zo zdroja v normalizovanom tvare. */
export interface CollectedRecord {
  externalId: string;
  url?: string | null;
  title?: string | null;
  publishedAt?: string | null;
  upstreamVersion?: string | null;
  data: Record<string, unknown>;
}

export interface RawPayload {
  body: Uint8Array | string;
  contentType: string;
  ext: string;
}

/** Výsledok zberu jedného kanála. */
export interface ChannelResult {
  channel: string;
  records: CollectedRecord[];
  raw?: RawPayload;
  /** nový kurzor kanála (napr. posledný spracovaný dátum) */
  cursor?: string | null;
  /** chyba kanála; ostatné kanály v dávke bežia ďalej */
  error?: string;
  /** ďalšie úlohy, ktoré má zber zaradiť (napr. dobehnutie zmeškaných dní) */
  followUps?: Job[];
}

/** Kontext konektora: všetko externé ide cez neho, aby sa dalo testovať bez siete. */
export interface CollectContext {
  fetch: typeof fetch;
  now: Date;
  userAgent: string;
  /** kurzor kanála z predchádzajúceho behu */
  getCursor: (channel: string) => Promise<string | null>;
}

export type Connector = (job: Job, ctx: CollectContext) => Promise<ChannelResult[]>;
