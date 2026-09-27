# AI redakcia XVADUR — výsledný návrh (Hriech + Netopier ako jeden celok)
> **Stav 27. 9. 2026:** tento návrh je cloudový variant (Workers Paid, Access, cloud routine, GitHub Actions). Adam rozhodol inak: všetko beží lokálne na Macu, na Cloudflare zadarmo je iba zobrazovacia databáza a web hriech.xvadur.com, Minúta nesmie meškať, GitHub Actions nie, meno Hriech je dočasné. Platné rozhodnutie je v `ROZHODNUTIE.md`; dátový model, EKG, desk, tvrdenia, plochy a print vzhľad z tohto návrhu platia ďalej. Čo v návrhu chýba oproti registru funkcií, je v `medzery-navrhu.md`.


Základ: backend **B1-cloudflare** (víťaz všetkých troch porôt), frontend **F2-astro-ssr** (víťaz dvoch porôt) s graftmi z F3-two-surfaces (víťaz tretej), B2, B3 a F1 presne podľa zoznamov poroty. Rozpory vyriešené takto:

| Rozpor | Rozhodnutie | Dôvod |
|---|---|---|
| Jeden Worker (F2) vs. dva Workery (B1, F3) | **Dva Workery: `netopier-zber` (zber, odvodenie, API) a `hriech-web` (verejný web aj terminál)**, spoločná D1 | porota F2 sama žiadala poistku „pri incidente rozdeliť“; B1 a F3 ju majú od začiatku; chybný deploy webu nezhodí zber |
| Terminál ako template stringy vo Workeri (B1) vs. SPA (F3) vs. Astro SSR (F2) | **Astro SSR `/t/*` v `hriech-web` na hoste `netopier.hriech.xvadur.com`; každá terminálová odpoveď `Cache-Control: private, no-store`, lebo Workers Caching nekľúčuje podľa hostu** | graft porôt F3 aj B; jeden typový systém, žiadny sync tokenov, žiadna druhá aplikácia; vyčlenenie terminálu do vlastného Workera ostáva ako záloha (časť 9, časť 11) |
| Čítanie dát cez Service Binding (B1) vs. priamo z D1 (F2) | **Čítanie priamo z D1 cez spoločný balík `@netopier/redakcia` (rovnaké dopyty pre stránky, verejný JSON aj API); zápis iba cez `netopier-zber /api/*`** | jeden zdroj tvarov = „rovnaké tabuľky, rovnaké JSON“; jeden autoritatívny zapisovateľ = stavový stroj sa nedá obísť |
| Premenovanie `zber/`→`worker/`, D1 → `netopier` (B1) | **Nič sa nepremenúva** (`netopier/zber`, D1 `netopier-zber`, Worker `hriech-web`) | graft B3; premenovanie `hriech-web` by vyžadovalo presun domény |
| Vlastný `REDAKCIA_TOKEN` (B1) vs. Access Service Token (F3) | **Cloudflare Access na celom API hoste; Service Token na spúšťač (`netopier-routine`, `netopier-hlavna-session`, `netopier-adam-cli`), Adam e-mail OTP; identita v JWT (`email` alebo `common_name`) je aktér; `ZBER_TOKEN` zaniká po I6** | jeden mechanizmus, o jeden secret menej; JWT po Service Tokene nesie iba `common_name`, preto mapovanie tokenov v `data/aktori.json` |
| Verejné JSON API na `api.hriech` (B1) | **Verejný JSON iba z `hriech-web` (`/api/*.json` cez tie isté dopyty); `api.hriech.xvadur.com` je celé za Access** | web nič verejné nepotrebuje z API; menej plôch na ochranu |

Overené v repozitári 27. 9. 2026: root `wrangler.jsonc` má iba `assets` + custom domain, `astro.config.mjs` je `output: "static"`, `astro 7.2.2`, `ajv` v devDependencies; root `pnpm-workspace.yaml` obsahuje iba `allowBuilds` (žiadne `packages`); `netopier/zber` je samostatný pnpm balík s vlastným lockfile, `wrangler.jsonc` s `database_id` placeholder a `workers_dev: true`, `src/index.ts` má `/health`, `POST /run`, `scheduled`, `queue`, `runJob`, `CONNECTORS`; `Job = {source, channel?, batch?}`; jediná migrácia `0001_archiv.sql`. Súbory openclaw (`scoring.js`, `status.js`, `evidence.json`, `signal.json`, `predictions.json`, `narrative.json`, `threat.json`, `api.js`, `config.js`) sú iba v dočasnom scratchpade.

Revízia 27. 9. (večer): zapracované námietky štyroch porôt (technické limity, prevádzka a náklady, redakčná kvalita a proveniencia, úplnosť). Každá blocker a major námietka je vyriešená zmenou návrhu v častiach A–9; časti fixov, ktoré návrh neprijal, sú s dôvodom a dôkazom v časti 11. Najväčšie zmeny: Workers Caching zapnuté a terminál mimo cache; FTS5 s externým obsahom a záloha `records`; fronta `netopier-derive` s `max_concurrency: 1`; adaptér `@astrojs/cloudflare` 14 (`main: "@astrojs/cloudflare/entrypoints/server"`, `cloudflare:workers`, `session: false`); routine z súkromného repozitára `hriech-redakcia` a cloud environmentu `hriech`; surový RSS médií do R2 a overenie výrezu proti archívnemu textu; každá verejná veta je claim; agentúrne kópie a „prvý zo sledovaných kanálov“; registre verejne iba počty do overenia sémantiky; verejné vyhľadávanie, sitemapa živého obsahu, archív podľa D15, Fiki záloha, GitHub Actions deploy, dokumentácia a Linear (projekt „Hriech + Netopier“).

---

## A. Rozhodnutia, ktoré musí urobiť Adam (východisková voľba tučne)

| # | Rozhodnutie | Východisko | Blokuje |
|---|---|---|---|
| D1 | Workers Paid (5 $/mes.), `wrangler d1 create netopier-zber`, R2, fronty (`netopier-zber-jobs` existuje, nová `netopier-derive`), Access, deploy `netopier-zber` (XDR-258, XDR-228) | **áno, teraz** | I1 a všetko po ňom |
| D2 | Smie Claude Code (agenti) spracúvať **verejné** texty médií a registrov (RSS titulky a súhrny, CRZ, TED, ŠÚ SR)? Zákaz v `netopier/STACK.md` sa písal pre súkromie. | **áno pre verejné texty (ADR-011); zákaz ostáva pre Fiki raw, `xvadur_core`, realitný trh, zdravie; Worker LLM nikdy nevolá; embeddingy sa nepoužívajú** | Z4 (linka); do rozhodnutia beží režim bez LLM |
| D3 | Kde beží denný beh agentov: Claude Code cloud routine / ručne z hlavnej session / Paperclip (XDR-226) / Mac. Routine je izolovaná cloud session, ktorá klonuje iba GitHub repozitáre; koreň workspace remote nemá, predvolené prostredie blokuje `api.hriech.xvadur.com`, env premenné prostredia sú čitateľné, cron iba v UTC. | **cloud routine v troch krokoch [A]: (1) súkromný GitHub repozitár `xvadur/hriech-redakcia` (prompty agentov, skill `redakcia`, `docs/HLAS.md`, kontrakty, `validate.mjs`), lokálne vyklonovaný do `projekty/hriech-redakcia/`, `_claude/agents/hriech-*.md` a `_claude/skills/redakcia` sú symlinky doň; (2) cloud environment `hriech` so sieťovým prístupom Custom iba na `api.hriech.xvadur.com` a API credential, ktorý proxy dopĺňa ako hlavičky `CF-Access-Client-Id/Secret` (secret nie je v env premennej); (3) routiny `hriech-redakcia-rano` `30 6 * * *` UTC, `-vecer` `30 16 * * *` UTC, `-tyzden` `0 7 * * 0` UTC (08:30 / 18:30 / nedeľa 09:00 letného času; od 26. 10. o hodinu skôr miestneho času, prijaté; rollup `20 6 UTC` ostáva pred oboma). Prvé dva týždne ručne `/redakcia` z hlavnej session; Paperclip nie, Mac nie. Kým repozitár a environment neexistujú, D3 = ručne z hlavnej session.** | Z8 (routine), I9 (dry-run aj z routine) |
| D4 | Domény `api.hriech.xvadur.com` (API, Access) a `netopier.hriech.xvadur.com` (terminál, Access) — tretia úroveň, Universal SSL ju nekryje; Workers Custom Domain vystaví Advanced certifikát pre daný hostname automaticky, overí sa v I6 (`curl -sI`), záloha prvá úroveň `api-hriech.xvadur.com` a `netopier-hriech.xvadur.com` | **áno obe** | I6 |
| D5 | Print vizuál v2: Source Serif 4 (titulky, čítanie) + Source Sans 3 (text, UI) + IBM Plex Mono (čísla, časy, terminál), papier `#f8f5ef`, ružová iba wordmark a pripnutý stav; DESIGN.md v2. Alternatíva B: Rubik ostáva na titulkoch, pribudne iba IBM Plex Mono. | **v2 so serifom** | Z7 |
| D6 | Sada zvodov v1: 6 kategórií (VLA vláda a zmluvy, PEN peniaze štátu a obstarávania, MED médiá a vlastníctvo, SUD súdy a polícia, EU/BEZ zahraničie a bezpečnosť, EKO ekonomika a demografia) + SWAN; 4–6 hypotéz na kategóriu; po zverejnení zamknuté | **agent navrhne 30 do 15. 10., Adam škrtne a zamkne pred Z3** | Z3 |
| D7 | Rozšíriť `sources/slovak-core.yaml` o SME, TASR, SITA, HN, TA3, Markíza, JOJ, STVR, Postoj, Štandard, .týždeň, Startitup, Refresher, Trend. Každý kanál najprv overí `scripts/overit-kanaly.mjs` (fetch + `parseFeed`, `verified_at` v YAML); médium bez verejného RSS (pravdepodobne TASR, SITA) sa zapíše ako medzera (`zdroje.sledovany=0`, na kartičke „bez RSS“, v `hodnotenie_zdroje` dôvod). Zúžiť World Monitor RSS na `category ∈ {europe, gov}` ∧ `lang ∈ {sk, cs, hu, pl, de, en}` (104 zo 155 kanálov, −33 %) | **áno obidve; D7 ide do Linearu až s výstupom `overit-kanaly.mjs`** | I2 |
| D8 | Kartička zdroja: v1 iba fakty (typ, rozsah, vlastník z mapy alebo „vlastník: nezistené“, pokrytie 30 dní ako „x z N sledovaných redakcií“, prvý zo sledovaných kanálov); `bias`/`faktickost` ostávajú `neurcene`, kým nevznikne `docs/METODIKA-ZDROJE.md`, potom označené ako interpretácia so zdrojmi hodnotenia | **áno** | Z6 |
| D9 | Schvaľovateľ `schvalil` je iba Adam Rudavský. V termináli = Access identita s e-mailom (OTP). Z príkazového riadka (`pnpm desk approve <id>`) iba samostatný Service Token `netopier-adam-cli`: jeho Client ID je vo `vars.ACCESS_ADAM_CLIENT_ID`, `pristup.ts` mapuje `common_name` tohto jedného tokenu na `Aktor {typ:'adam', id:'adam:cli'}`, secret žije iba na Macu v `~/.config/hriech/adam-cli.env` (nikdy v routine, environmente ani repozitári), riadok `schvalenia.kto='adam:cli'`. Agent nikdy, ani pri oprave preklepu; automatické vydanie bez redaktora nesmie ísť von do Živé | **áno** | Z1 |
| D10 | Python vrstva `netopier/src/netopier/` + Alembic + Docker: archivovať do `xvadur_core/zdroje/hriech/archiv-2026-09/netopier-python/` a zmazať z verejného repozitára po porte čistých modulov (ADR-010 v `netopier/docs/DECISIONS.md`) | **áno, po I3** | I10 |
| D11 | Kataster: ostať pri 2 pilotných oblastiach do Vianoc; konektor prerobiť tak, že jedna stránka WFS = jedna správa fronty (`Job.batch` = `startIndex`), geometria po stránkach do R2 (`raw/kataster/<oblast>/<den>/<strana>.json`), v D1 iba `geometria_hash` + `referencny_bod` (pamäť izolátu 128 MB, dnes 533 parciel v jednej správe) | **áno** | V7 |
| D12 | World Monitor API Starter (99,99 $/mes.) | **nie** | — |
| D13 | Cloudflare Web Analytics na Hriechu (bez cookies, malý JS beacon) | **zapnúť** | Z7 |
| D14 | Mená fyzických osôb z CRZ: interne v termináli áno, verejne nikdy (`entity.verejne=0`) | **áno** | — |
| D15 | Archív citovaných URL verejne (`/archiv/[sha]`): iba metadáta (URL, kanonická URL, sha256, `captured_at`, status, veľkosť, titulok), citovaný výrez ≤ 300 znakov z `claims.citacia_vyrez`, odkaz na originál a na Wayback (`web.archive.org/save/<url>` volá `api/archiv.ts`, uloží `archiv.wayback_url`); celá kópia cudzieho textu iba v termináli `/t/archiv`. Dôvod: R2 je súkromný, verejné servírovanie celých kópií článkov by porušilo hranicu z `README.md` („celé chránené texty sa nepublikujú“) | **áno** | Z5 |
| D16 | Fiki korpus (`data/fiki/fiki.sqlite`, 93 videí, 3 630 odsekov, `raw/`) existuje iba na disku Macu: týždenná záloha do R2 `zalohy/fiki/RRRR-MM-DD/` z týždenného behu (I11, `wrangler r2 object put`); sync nových videí (XDR-254) ako LaunchAgent na Macu vs. ručne v týždennom behu; raw prepisy nikdy do D1, API ani promptu | **záloha áno; sync ručne v týždennom behu; LaunchAgent až keď YouTube prestane blokovať IP Macu** | I11 |
| D17 | XDR-230 je blokovaná XDR-213 (šablóna XVADUR, „ružový plastický vizuál podľa loga“); print vizuál Hriechu (D5) nie je šablóna XVADUR. Buď závislosť zrušiť, alebo ju zachovať a odložiť Z7 za XDR-213 | **zrušiť závislosť; XDR-230 uzavrieť až keď úlohy I0–V10 existujú v projekte „Hriech + Netopier“ (P-XDR-6)** | Z7, zápis úloh do Linearu |
| D18 | Prevádzka bez Macu: `.github/workflows/deploy.yml` iba s `workflow_dispatch` (joby `migrate` → `deploy-zber` → `deploy-web`, samostatný job `rollback` s parametrom Workera a verzie); secret `CLOUDFLARE_API_TOKEN` (Workers Scripts Edit + D1 Edit) v GitHub Secrets verejného repozitára, nikdy v kóde. Pravidlo „deploy iba na pokyn“ platí ďalej: workflow spúšťa Adam kliknutím alebo hlavná session na jeho pokyn | **áno** | I12 |

D1 blokuje všetko okrem prvého kroku. D2 a D3 sú potrebné do Z4/Z8 (november). D15–D18 pribudli z revízie námietok; D17 treba pred zápisom úloh do Linearu.

## B. Prvý krok, ktorý sa dá začať hneď lokálne, a jeho dôkaz

**Scope:** základná migrácia a deterministická normalizácia nad lokálnou D1 (14 299 záznamov z 26. 9.), bez Paid, bez rozhodnutí Adama.

Kroky:
1. Skopírovať openclaw súbory zo scratchpadu do `netopier/redakcia/test/fixtures/openclaw/` (scratchpad je dočasný).
2. Root `pnpm-workspace.yaml`: `packages: ["netopier/zber", "netopier/redakcia"]`; nový balík `netopier/redakcia` (`@netopier/redakcia`, TypeScript, vitest); zmazať `netopier/zber/pnpm-workspace.yaml` a `pnpm-lock.yaml` (jeden lockfile v koreni).
3. `netopier/redakcia/src/skore.ts` = port `scoring.js` + `status.js`; test `skore.test.ts` spustí pôvodný `scoring.js` z fixtures nad `evidence.json` (SEC-05, 143 položiek) a porovná skóre, istotu a odporúčaný stav 1:1.
4. `netopier/zber/migrations/0002_zaklad.sql` (časť 2): `records.published_at_utc` + index, `entity`, `entity_alias`, `record_entity`, `records_fts` ako FTS5 s **externým obsahom** (`content='records', content_rowid='id'`) a triggermi INSERT/UPDATE/DELETE (kontentless tabuľka nedovolí DELETE a rozbije export), `zdroje`, `zdroj_kanaly`, `zdroj_pokrytie_denne`, `pocty`, `crz_ciselniky`.
5. `netopier/zber/src/derive/normalize.ts` (5 formátov dátumu → UTC) a `derive/entity.ts` (IČO z CRZ/TED do `record_entity`), typ `DeriveJob`, `scripts/derive-node.mjs` na lokálny beh; `scripts/check-d1-id.mjs` v `pnpm qa` (obe `wrangler.jsonc` musia mať rovnaké `database_id`, lebo miniflare odvodzuje súbor lokálnej D1 z `database_id`, nie z `database_name`).
6. `scripts/overit-kanaly.mjs`: fetch + `parseFeed` každého kandidáta z D7, výsledok do `sources/slovak-core.yaml` (`verified_at`, `stav: ok|chyba|bez_rss`), aby D7 mala dôkaz skôr, než sa zapíše do Linearu.

**Hotové keď (dôkaz):**
- `npx -y pnpm@11.19.0 -r test` zelené (zber 27 + nové; redakcia parity test);
- `npx wrangler d1 execute netopier-zber --local --command "SELECT count(*) FROM records WHERE published_at_utc IS NOT NULL"` ≥ 13 400 (všetko okrem 820 bez dátumu);
- `SELECT count(*) FROM record_entity` ≥ 4 000; `SELECT count(*) FROM records_fts WHERE records_fts MATCH 'zmluva'` > 0 a `MATCH 'školstv*'` > 0 (prefixové dopyty pre `entity-media`); po testovacom `DELETE FROM records WHERE id = ?` v transakcii (rollback) je riadok preč aj z `records_fts` a `INSERT INTO records_fts(records_fts) VALUES('integrity-check')` prejde — FTS5 s externým obsahom v miniflare overené;
- `scripts/check-d1-id.mjs` prejde; `scripts/overit-kanaly.mjs` vypíše tabuľku kandidátov D7;
- commit v `hriech` s číslom úlohy v Lineari (nová úloha v projekte „Hriech + Netopier“: „0002 základ a normalizácia nad lokálnou D1“, štítok Agent, míľnik Infra).

---

## 1. Stack a kde čo beží

| Vrstva | Služba | Názov / súbor | Plán, cena (mesačne) |
|---|---|---|---|
| Zber, odvodenie, API | Cloudflare Worker | `netopier-zber` (`netopier/zber/`), host `api.hriech.xvadur.com` | Workers Paid 5 $ ≈ 4,6 € (jediná platba; kryje oba Workery) |
| Verejný web + terminál | Cloudflare Worker | `hriech-web` (koreň repozitára), Astro 7.2.2 + `@astrojs/cloudflare` 14.x (peer `astro ^7.2.0`, `wrangler ^4.125.0`; repo má wrangler 4.128.0); hosty `hriech.xvadur.com`, `netopier.hriech.xvadur.com`; Workers Caching zapnuté (`cache.enabled`) | v cene |
| Databáza | D1 | `netopier-zber` (jedna DB, binding `DB` v oboch Workeroch, rovnaké `database_id` v oboch `wrangler.jsonc`) | v Paid: 5 GB v cene, +0,75 $/GB-mes. nad to, strop 10 GB/DB, 25 mld. čítaní, 50 mil. zapísaných riadkov |
| Surové dáta, archív URL, zálohy, snapshoty | R2 | `netopier-archiv`, prefixy `raw/` (aj RSS médií, lifecycle 90 dní na `raw/rss/`), `archiv/` (kópie + extrahovaný text), `zalohy/` (tabuľky aj `records` prírastok, `fiki/`), `export/records/` (uzavreté mesiace), `snapshots/`, `redakcia/` | free 10 GB-mes., nad to 0,015 $/GB-mes., egress 0 |
| Fronty | Queues | `netopier-zber-jobs` (zber, paralelne ako dnes) + **nová `netopier-derive`** (odvodenie, konzument `max_concurrency: 1`) + DLQ `netopier-zber-dlq` | v cene |
| Plánovanie | Cron Triggers | `*/30 * * * *`, `20 5 * * *` (existujú), nové `20 6 * * *` (denné odvodenie a rollup), `10 3 * * 0` (záloha), `10 3 1 * *` (export uzavretého mesiaca). `scheduled` iba zaraďuje správy do front (cron < 1 h má 30 s CPU) | v cene |
| Prístup | Cloudflare Access (Zero Trust Free) | aplikácia `Netopier terminál` (`netopier.hriech.xvadur.com`, politika e-mail OTP Adam); aplikácia `Netopier API` (`api.hriech.xvadur.com`, politiky: Adam OTP + Service Tokeny `netopier-routine`, `netopier-hlavna-session`, `netopier-adam-cli`); aplikácia `Netopier health` (`api.hriech.xvadur.com/health`, politika Bypass). Tokeny s dĺžkou 2 roky (`17520h`), notifikácia „Expiring Access Service Token Alert“ na Adamov e-mail | 0 € |
| Spoločný kód | pnpm balík | `@netopier/redakcia` (`netopier/redakcia/`): typy, dopyty, stavový stroj, skóre, autorstvo, validátor draftu, overenie JWT, kontrakty | — |
| Redakčná linka (LLM) | Claude Code | súkromný repozitár `xvadur/hriech-redakcia` (agenti `hriech-*.md`, skill `redakcia`, `docs/HLAS.md`, `contracts/`, `validate.mjs`), lokálne `projekty/hriech-redakcia/` so symlinkami z `_claude/`; cloud environment `hriech` (allowlist `api.hriech.xvadur.com`, API credential = Service Token `netopier-routine`); routiny `hriech-redakcia-rano|vecer|tyzden` v UTC | v Adamovom predplatnom |
| Deploy bez Macu | GitHub Actions | `.github/workflows/deploy.yml` (`workflow_dispatch`: `migrate` → `deploy-zber` → `deploy-web`; `rollback`), secret `CLOUDFLARE_API_TOKEN` (D18) | 0 € (verejný repozitár) |
| Fonty | npm | existujúce `@fontsource-variable/rubik`, `source-sans-3`; nové `@fontsource-variable/source-serif-4`, `@fontsource/ibm-plex-mono` | 0 € |
| Analytika | Cloudflare Web Analytics | beacon v `BaseLayout.astro` (D13) | 0 € |

Spolu ≈ 5 €/mes. (D1 nad 5 GB +0,75 $/GB, viď časť 9). Mimo: World Monitor (D12, nie), Workers AI/Vectorize (až po vyhodnotení kvality udalostí, nie do Vianoc).

Kde čo beží:
- **`netopier-zber`**: `fetch` (`/health`, `/run*`, `/api/*`), `scheduled` (iba `sendBatch` do front: plán zberu, `DeriveJob` po krokoch a dávkach), `queue` (konzument `netopier-zber-jobs` = zber; konzument `netopier-derive` = `derive`, `archiv`, `zaloha`, `export` úlohy, `max_concurrency: 1`). Žiadne HTML, žiadne LLM. Workers Caching zapnuté iba pre `GET /health` (`public, max-age=60`), všetko ostatné `private, no-store`.
- **`hriech-web`**: statické stránky (články, prípady, mapy, O Hriechu) z buildu; živé stránky (`/`, `/minuta*`, `/udalosti*`, `/zvody*`, `/vydanie*`, `/zdroje*`, `/seizmograf`, `/hladaj`, `/archiv/*`, `/api/*.json`, `/sitemap-zive.xml`, `/*.xml`) s `export const prerender = false` čítajú D1 cez `import { env } from 'cloudflare:workers'` (`src/lib/db.ts`); terminál `/t/*` na druhom hoste za Access; zápisy posiela cez Service Binding `NETOPIER` na `netopier-zber /api/*` s preposlaným `Cf-Access-Jwt-Assertion`.
- **Cache** (`src/middleware.ts`): Workers Caching sa kontroluje pred spustením Workera a kľúč je cesta + query + entrypoint + verzia, **nie hostname**. Preto: verejný host, GET, SSR trasa → `Cache-Control: public, max-age=60, stale-while-revalidate=300`; terminálový host na každej ceste a `/t/*` na ktoromkoľvek hoste (aj 404, aj 303) → `private, no-store`; `Set-Cookie` iba na `POST /t/nastavenia`; `/api/*.json` ako verejné SSR; statické assety spravuje `ASSETS`. Runtime Cache API (`caches.default`) sa nepoužíva (za Accessom nie je dostupné a nie je potrebné).
- **Claude Code routine** (cloud environment `hriech`): číta a píše iba `https://api.hriech.xvadur.com/api/*`; Service Token `netopier-routine` dopĺňa proxy environmentu ako `CF-Access-Client-Id/Secret`, telo nesie `X-Beh: <beh_id>`; prompty a skill z repozitára `hriech-redakcia` (naklonovaný pri štarte behu), `prompt_version` = jeho commit hash.
- **Hlavná session** (Mac, ručný beh `/redakcia` prvé dva týždne a kedykoľvek na pokyn): ten istý skill, Service Token `netopier-hlavna-session` z `~/.config/hriech/`.
- **Mac**: Fiki korpus (`netopier/fiki/`, so zálohou do R2 podľa D16) a ručné `wrangler` príkazy na pokyn; každý prevádzkový zásah má alternatívu v GitHub Actions (D18). Nič trvalé.

Lokálny vývoj: `hriech-web` `astro dev` s adaptérom `cloudflare({ configPath: 'wrangler.jsonc', persistState: { path: './netopier/zber/.wrangler/state' } })`, takže web aj zber čítajú tú istú lokálnu D1 s reálnymi dátami. Podmienka: rovnaké `database_id` v oboch `wrangler.jsonc` (placeholder `00000000-…` teraz, reálne id po `d1 create` commitnúť do oboch naraz), kontroluje `scripts/check-d1-id.mjs` v `pnpm qa`. Tvar možností adaptéra (`configPath`, `persistState`, `remoteBindings`, `sessionKVBindingName`) sa overí pri inštalácii proti `node_modules/@astrojs/cloudflare/dist/index.d.ts`, nie z pamäti.

`astro.config.mjs` po zmene:

```js
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://hriech.xvadur.com',
  output: 'static',                                   // statické stránky ostávajú prerender; živé majú `export const prerender = false`
  adapter: cloudflare({
    configPath: 'wrangler.jsonc',
    persistState: { path: './netopier/zber/.wrangler/state' },
    imageService: 'compile',                          // žiadny IMAGES binding
  }),
  session: false,                                     // adaptér nezaloží KV binding SESSION (dokumentácia adaptéra: session: false)
});
```

`wrangler.jsonc` (koreň, `hriech-web`) po zmene:

```jsonc
{
  "name": "hriech-web",
  "main": "@astrojs/cloudflare/entrypoints/server",
  "compatibility_date": "2026-09-03",
  "compatibility_flags": ["nodejs_compat"],
  "assets": { "directory": "./dist", "binding": "ASSETS", "html_handling": "drop-trailing-slash", "not_found_handling": "404-page" },
  "cache": { "enabled": true },                      // Workers Caching (wrangler ≥ 4.69); bez toho sa Cache-Control na hrane nehonoruje
  "routes": [
    { "pattern": "hriech.xvadur.com", "custom_domain": true },
    { "pattern": "netopier.hriech.xvadur.com", "custom_domain": true }
  ],
  "d1_databases": [{ "binding": "DB", "database_name": "netopier-zber", "database_id": "<rovnaké ako netopier/zber/wrangler.jsonc>" }],
  "services": [{ "binding": "NETOPIER", "service": "netopier-zber" }],
  "vars": { "PUBLIC_HOST": "hriech.xvadur.com", "TERMINAL_HOST": "netopier.hriech.xvadur.com",
            "ACCESS_TEAM": "<team>.cloudflareaccess.com", "ACCESS_AUD_TERMINAL": "<aud>" },
  "observability": { "enabled": true }
}
```

Žiadny KV namespace: `wrangler deploy --dry-run` v I7 musí vypísať bindingy iba `DB`, `ASSETS`, `NETOPIER` a vars; ak by adaptér napriek `session: false` žiadal KV `SESSION`, zapíše sa to ako chyba I7 a rieši sa podľa dokumentácie nainštalovanej verzie (nie tichým založením KV pri deployi).

`src/lib/db.ts`:

```ts
import { env } from 'cloudflare:workers';
import type { D1Database } from '@cloudflare/workers-types';
export const db = (): D1Database => env.DB;          // typy z `wrangler types` → src/worker-configuration.d.ts
```

`netopier/zber/wrangler.jsonc` pribudne: `"routes": [{ "pattern": "api.hriech.xvadur.com", "custom_domain": true }]`, `"workers_dev": false`, cron `20 6 * * *`, `10 3 * * 0`, `10 3 1 * *`, `"cache": { "enabled": true }` (iba `/health` vracia cacheovateľnú odpoveď), producenti `JOBS` (`netopier-zber-jobs`) a `DERIVE` (`netopier-derive`), druhý konzument:

```jsonc
"consumers": [
  { "queue": "netopier-zber-jobs", "max_batch_size": 1, "max_batch_timeout": 5, "max_retries": 3, "dead_letter_queue": "netopier-zber-dlq" },
  { "queue": "netopier-derive",    "max_batch_size": 1, "max_batch_timeout": 5, "max_retries": 3, "max_concurrency": 1, "dead_letter_queue": "netopier-zber-dlq" }
]
```

vars `ACCESS_TEAM`, `ACCESS_AUD_API`, `ACCESS_AUD_TERMINAL`, `ACCESS_ADAM_CLIENT_ID`, `"limits": { "cpu_ms": 60000 }` (platí pre `fetch` a `queue`; cron má vlastný strop, preto iba zaraďuje). Secrets: `ZBER_TOKEN` ostáva iba do I6 (Bearer pre `/run*`, kým nie je Access); po I6 sa `/run*` autorizuje z JWT (aktér `adam` alebo `hlavna-session`) a `ZBER_TOKEN` sa zmaže (`wrangler secret delete`). Potom žiadny secret vo Workeroch.

Príkazy (koreň): `pnpm dev`, `pnpm check`, `pnpm test` (node --test + `pnpm -r test`), `pnpm build` (`astro build && node scripts/verify-public-build.mjs`), `pnpm smoke` (`node scripts/smoke-live.mjs`, `wrangler dev` nad lokálnou D1; s `--live` proti produkcii), `pnpm qa` (check + test + build + smoke + `check-d1-id`), `pnpm run deploy` (iba na pokyn; alternatíva GitHub Actions `workflow_dispatch`), `pnpm db:migrate:local|remote` (deleguje do `netopier/zber`; `remote` najprv vypíše `wrangler d1 time-travel info netopier-zber` a bookmark ide do komentára úlohy v Lineari), `pnpm seed` (`node netopier/zber/scripts/seed.mjs --local|--remote`), `pnpm desk approve|return|reject <id>` (Service Token `netopier-adam-cli`). pnpm nie je v PATH: `npx -y pnpm@11.19.0`.

---

## 2. Dátový model (D1, SQLite dialekt, migrácie `netopier/zber/migrations/`)

Zásady: JSON iba ako TEXT (`json_extract`), bez polí a vektorov; **CHECK na každom enum stĺpci** (graft B2); každý odvodený riadok má `vytvoril` (`pravidlo:<názov>` | `algoritmus:<verzia>` | `agent:<meno>` | `adam` | `system`) a `beh_id` (→ `runs.id` alebo `behy_redakcie.id`); zmena stavu = riadok v `desk_prechody` alebo `zvod_stav_historia`; zmena obsahu = riadok v `revizie`; nikdy UPDATE bez revízie. `records`, `runs`, `source_state` ostávajú bez zmeny.

### 0002_zaklad.sql

```sql
ALTER TABLE records ADD COLUMN published_at_utc TEXT;            -- ISO UTC, plní derive:normalize (5 formátov, 820 NULL ostáva NULL)
CREATE INDEX records_published_utc ON records(published_at_utc);

CREATE TABLE zdroje (                                            -- kartička zdroja (Ground News/NewsGuard), v1 iba fakty
  id TEXT PRIMARY KEY,                                           -- 'dennikn' | 'wm-bbc-world' | 'crz' | 'ted' | 'kataster' | 'statistika'
  nazov TEXT NOT NULL,
  typ TEXT NOT NULL CHECK (typ IN ('medium','agentura','register','institucia','thinktank','agregator')),
  rozsah TEXT NOT NULL CHECK (rozsah IN ('lokalny','narodny','medzinarodny')),
  krajina TEXT, jazyk TEXT, url TEXT,                            -- kanály (aj viac na redakciu, napr. Denník N + Minúta) sú v zdroj_kanaly
  outlet_id TEXT,                                                -- src/data/editorial-organization-map.json outlets[].id (10 médií)
  vlastnik TEXT, vlastnik_ico TEXT,
  bias TEXT NOT NULL DEFAULT 'neurcene' CHECK (bias IN ('lavy','stred_lavy','stred','stred_pravy','pravy','neurcene')),
  faktickost TEXT NOT NULL DEFAULT 'neurcene' CHECK (faktickost IN ('vysoka','zmiesana','nizka','neurcene')),
  hodnotenie_zdroje TEXT NOT NULL DEFAULT '[]',                  -- JSON [{url, poznamka}] – bez zdroja ostáva neurcene (D8)
  hodnotil TEXT, hodnotene_at TEXT,
  wm_tier INTEGER, wm_risk TEXT,                                 -- z inventára World Monitor
  sledovany INTEGER NOT NULL DEFAULT 1,                          -- 1 = počíta sa do pokrytia SK redakcií
  pozastaveny_at TEXT,                                           -- kanál s 3 chybami po sebe
  verejny INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE zdroj_pokrytie_denne (                              -- attention over time (Media Cloud) + kto priniesol prvý
  zdroj_id TEXT NOT NULL REFERENCES zdroje(id), den TEXT NOT NULL,
  zaznamov INTEGER NOT NULL, udalosti INTEGER NOT NULL, prvy INTEGER NOT NULL,
  podiel REAL NOT NULL,                                          -- zaznamov / Σ zaznamov sledovaných SK redakcií (DISTINCT zdroj_id, nie kanál) v ten deň; verejne „x z N“, nikdy %
  PRIMARY KEY (zdroj_id, den)
);
CREATE TABLE entity (
  id TEXT PRIMARY KEY,                                           -- 'ico:00156752' | 'osoba:<slug>' | 'organ:<slug>'
  druh TEXT NOT NULL CHECK (druh IN ('statny_organ','obec','firma','fyzicka_osoba','neznamy')),
  nazov TEXT NOT NULL, ico TEXT,
  verejne INTEGER NOT NULL DEFAULT 1,                            -- fyzicka_osoba = 0; verejné dopyty filtrujú verejne=1 (D14)
  map_person_id TEXT, map_outlet_id TEXT,                        -- väzba na mapu redakcií
  sledovane INTEGER NOT NULL DEFAULT 0, sledovane_dovod TEXT,
  prvy_vyskyt TEXT NOT NULL, posledny_vyskyt TEXT NOT NULL
);
CREATE INDEX entity_ico ON entity(ico);
CREATE TABLE record_entity (
  record_id INTEGER NOT NULL REFERENCES records(id), entity_id TEXT NOT NULL REFERENCES entity(id),
  rola TEXT NOT NULL CHECK (rola IN ('strana_a','strana_b','objednavatel','dodavatel','obstaravatel','vitaz','akter','zmienka')),
                                                                 -- CRZ: strana_a/strana_b až do overenia sémantiky objednávateľ/dodávateľ (V1); zmienka = z entity-media
  PRIMARY KEY (record_id, entity_id, rola)
);
CREATE INDEX record_entity_entity ON record_entity(entity_id);
CREATE VIRTUAL TABLE records_fts USING fts5(                   -- externý obsah: DELETE funguje, riadky sa nezdvojujú
  title, summary, content='records', content_rowid='id', tokenize='unicode61 remove_diacritics 2'
);
CREATE TRIGGER records_fts_ai AFTER INSERT ON records BEGIN
  INSERT INTO records_fts(rowid, title, summary) VALUES (new.id, new.title, json_extract(new.data, '$.summary'));
END;
CREATE TRIGGER records_fts_ad AFTER DELETE ON records BEGIN
  INSERT INTO records_fts(records_fts, rowid, title, summary) VALUES ('delete', old.id, old.title, json_extract(old.data, '$.summary'));
END;
CREATE TRIGGER records_fts_au AFTER UPDATE OF title, data ON records BEGIN
  INSERT INTO records_fts(records_fts, rowid, title, summary) VALUES ('delete', old.id, old.title, json_extract(old.data, '$.summary'));
  INSERT INTO records_fts(rowid, title, summary) VALUES (new.id, new.title, json_extract(new.data, '$.summary'));
END;
-- kontentless tabuľka (content='') by nedovolila DELETE bez contentless_delete=1 a rozbila by `wrangler d1 export`;
-- overené v I0 v miniflare vrátane DELETE a 'integrity-check'; fallback LIKE nad title; každý zápis do FTS sa účtuje ako zapísané riadky
CREATE TABLE zdroj_kanaly (                                      -- redakcia má viac kanálov; podiel a „prvý“ sa počítajú per zdroj_id
  zdroj_id TEXT NOT NULL REFERENCES zdroje(id), feed_id TEXT NOT NULL,   -- data/media-feeds.json / worldmonitor-feeds.json id
  family TEXT, verified_at TEXT, PRIMARY KEY (zdroj_id, feed_id)
);
CREATE UNIQUE INDEX zdroj_kanaly_feed ON zdroj_kanaly(feed_id);
CREATE TABLE entity_alias (                                      -- vstup pre derive/entity-media.ts
  entity_id TEXT NOT NULL REFERENCES entity(id), alias TEXT NOT NULL,
  zdroj TEXT NOT NULL CHECK (zdroj IN ('crz','klucove_slova','rpo','rucne')), PRIMARY KEY (entity_id, alias)
);
CREATE TABLE pocty (                                             -- celkové počty bez plného skenu records (pre /t a /health)
  source TEXT NOT NULL, channel TEXT NOT NULL, riadkov INTEGER NOT NULL, posledny_at TEXT, PRIMARY KEY (source, channel)
);
CREATE TABLE crz_ciselniky (                                     -- rezort, typ, druh, stav (kódy bez číselníka v exporte)
  druh TEXT NOT NULL CHECK (druh IN ('rezort','typ','druh','stav')), kod TEXT NOT NULL, nazov TEXT NOT NULL,
  zdroj_url TEXT NOT NULL, PRIMARY KEY (druh, kod)               -- povinný zdroj (číselník v CRZ XML schéme alebo Slovensko.Digital); kód bez riadku sa vypíše ako kód
);
```

`record_entity` sa plní v `archiveChannel` hneď pri INSERT (crz: `data.objednavatel_ico`, `data.dodavatel_ico`; ted: `data.obstaravatel_id[0]`, `data.vitaz_id[]`), pre existujúce riadky jednorazovo `derive:entity`. `entity.druh='fyzicka_osoba'` sa nastaví, keď IČO chýba a názov nie je organizácia (heuristika + ručná oprava v termináli).

### 0003_udalosti.sql

```sql
CREATE TABLE udalosti (
  id INTEGER PRIMARY KEY, slug TEXT NOT NULL UNIQUE,             -- '2026-11-05-ms-sr-dodatok-plan-obnovy'
  verzia INTEGER NOT NULL DEFAULT 1,
  titulok TEXT NOT NULL, zhrnutie_md TEXT,                       -- zhrnutie s citáciami [^c<claim_id>], píše redaktor
  akteri TEXT NOT NULL DEFAULT '[]', organizacie TEXT NOT NULL DEFAULT '[]', entity_ids TEXT NOT NULL DEFAULT '[]',
  miesto TEXT, miesto_presnost TEXT NOT NULL DEFAULT 'neznama' CHECK (miesto_presnost IN ('adresa','obec','okres','kraj','stat','neznama')),
  cas_od TEXT, cas_do TEXT, cas_presnost TEXT NOT NULL DEFAULT 'neznama' CHECK (cas_presnost IN ('minuta','hodina','den','tyzden','mesiac','neznama')),
  typy_akcie TEXT NOT NULL DEFAULT '[]',                         -- schvalil|oslobodil|obvinil|vysetruje|povedal|zautocil|vymenoval|odvolal|reported_development|…
  institucionalny_stav TEXT,
  istota REAL NOT NULL DEFAULT 0,
  novost TEXT NOT NULL DEFAULT 'new' CHECK (novost IN ('new','update')),
  sila_dokazov TEXT NOT NULL DEFAULT 'single_source' CHECK (sila_dokazov IN ('single_source','corroborated','register')),
  pocet_zaznamov INTEGER NOT NULL DEFAULT 0, pocet_zdrojov INTEGER NOT NULL DEFAULT 0, pocet_nezavislych INTEGER NOT NULL DEFAULT 0,
                                                                 -- pocet_zdrojov = DISTINCT zdroj_id (redakcia); nezávislé = bez dokazov s agentura
  prvy_record_id INTEGER REFERENCES records(id), prvy_zdroj_id TEXT REFERENCES zdroje(id), prvy_at TEXT,
  prvy_at_presnost TEXT NOT NULL DEFAULT 'hodina' CHECK (prvy_at_presnost IN ('sekunda','minuta5','hodina')),   -- z formátu času kanála
  pokrytie_podiel REAL NOT NULL DEFAULT 0,                       -- sledované SK redakcie, ktoré pokryli / všetky sledované
  blindspot TEXT CHECK (blindspot IN ('bez_pokrytia','bez_udalosti','asymetria')),
  blindspot_skore REAL NOT NULL DEFAULT 0,                       -- |pokrytie_registre − pokrytie_media| / max(1, …)
  rozsah TEXT NOT NULL DEFAULT 'narodny' CHECK (rozsah IN ('lokalny','narodny','medzinarodny')),
  krivka TEXT NOT NULL DEFAULT 'media' CHECK (krivka IN ('media','registre','obe')),
  algoritmus TEXT NOT NULL,                                      -- 'udalosti-ts-v1'
  stav_zivota TEXT NOT NULL DEFAULT 'active' CHECK (stav_zivota IN ('active','superseded','split_source')),
  verejna INTEGER NOT NULL DEFAULT 0,                            -- 1 = desk položka typu udalost je vydane
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX udalosti_cas ON udalosti(cas_od); CREATE INDEX udalosti_verejna ON udalosti(verejna, cas_od);
CREATE TABLE udalost_dokazy (
  id INTEGER PRIMARY KEY, udalost_id INTEGER NOT NULL REFERENCES udalosti(id), record_id INTEGER NOT NULL REFERENCES records(id),
  zdroj_id TEXT REFERENCES zdroje(id),
  vztah TEXT NOT NULL CHECK (vztah IN ('syndicated_copy','same_event','event_update','same_topic','unrelated')),
  vyrez TEXT, vyrez_od INTEGER, vyrez_do INTEGER, typ_akcie TEXT, cas TEXT,
  agentura TEXT,                                                 -- 'TASR' | 'SITA' | 'ČTK' | 'Reuters' | 'AP' | 'AFP' | 'DPA' z data.author alebo začiatku summary; nepočíta sa do nezávislých ani do prvý_*
  skore REAL, priznaky TEXT, dovod TEXT,
  povod TEXT NOT NULL DEFAULT 'algorithm' CHECK (povod IN ('algorithm','human')),
  stav TEXT NOT NULL DEFAULT 'accepted' CHECK (stav IN ('accepted','rejected','suggested')),
  verzia_prahov TEXT NOT NULL, decided_at TEXT NOT NULL,
  UNIQUE (udalost_id, record_id)
);
CREATE INDEX udalost_dokazy_record ON udalost_dokazy(record_id);
CREATE TABLE udalost_pokrytie (                                  -- základ pre „kto priniesol prvý“, podiel, porovnanie titulkov, rebríček
  udalost_id INTEGER NOT NULL REFERENCES udalosti(id), zdroj_id TEXT NOT NULL REFERENCES zdroje(id),
  prvy_record_id INTEGER NOT NULL, prvy_at TEXT NOT NULL, pocet INTEGER NOT NULL, titulok TEXT,
  prvy_at_presnost TEXT NOT NULL CHECK (prvy_at_presnost IN ('sekunda','minuta5','hodina')), agentura INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (udalost_id, zdroj_id)
);
CREATE TABLE udalost_rodokmen (
  rodic_id INTEGER NOT NULL, dieta_id INTEGER NOT NULL,
  operacia TEXT NOT NULL CHECK (operacia IN ('merge','split','event_update')),
  dovod TEXT, povod TEXT NOT NULL CHECK (povod IN ('algorithm','human')), kto TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE register_udalosti (                                 -- „čo sa stalo“ – typované, deterministické (graft B2)
  id INTEGER PRIMARY KEY, record_id INTEGER NOT NULL UNIQUE REFERENCES records(id),
  druh TEXT NOT NULL CHECK (druh IN ('crz_zmluva','crz_dodatok','crz_zmena','ted_vyhlasenie','ted_vysledok','ted_zmena','kataster_nova_verzia','statistika_aktualizacia')),
  entity_ids TEXT NOT NULL DEFAULT '[]',
  suma REAL,                                                     -- NULL, keď suma_spolu = 0 ∧ suma_zmluva = 0 (dnes 50 % CRZ: neuvedené aj skutočná nula naraz)
  stav TEXT NOT NULL DEFAULT 'navrh' CHECK (stav IN ('navrh','potvrdeny')),   -- potvrdeny iba pre druh s overenou sémantikou (data/register-druhy.json, overene_at)
  nastalo_at TEXT NOT NULL,
  cas_presnost TEXT NOT NULL CHECK (cas_presnost IN ('minuta','den','mesiac','neznama')),
  miesto TEXT, miesto_presnost TEXT NOT NULL CHECK (miesto_presnost IN ('parcela','obec','okres','kraj','stat','neznama')),
  popis TEXT NOT NULL, pravidlo TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE INDEX register_udalosti_cas ON register_udalosti(nastalo_at);
CREATE TABLE udalost_registre (                                  -- spojenie mediálnej udalosti s registrom = krivka 'obe'
  udalost_id INTEGER NOT NULL REFERENCES udalosti(id), register_udalost_id INTEGER NOT NULL REFERENCES register_udalosti(id),
  vztah TEXT NOT NULL CHECK (vztah IN ('rovnake_ico','rovnaka_zmluva','rovnaka_parcela','zmienka_entity','rucne')),   -- zmienka_entity z derive/entity-media.ts
  vytvoril TEXT NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY (udalost_id, register_udalost_id)
);
```

### 0004_zvody.sql (EKG podľa openclaw `scoring.js` / `status.js`, dve krivky)

```sql
CREATE TABLE zvody (
  id TEXT PRIMARY KEY,                                           -- 'VLA-01'
  kategoria TEXT NOT NULL CHECK (kategoria IN ('VLA','PEN','MED','SUD','EU','EKO','SWAN')),
  nazov TEXT NOT NULL, hypoteza TEXT NOT NULL, popis TEXT, plain_popis TEXT,
  stav TEXT NOT NULL DEFAULT 'nepotvrdene' CHECK (stav IN ('nepotvrdene','vznikajuce','potvrdene','vyvratene')),
  stav_zmeneny_at TEXT, zamknute_at TEXT, verejny INTEGER NOT NULL DEFAULT 0,
  skore INTEGER NOT NULL DEFAULT 0, istota TEXT NOT NULL DEFAULT 'insufficient' CHECK (istota IN ('insufficient','low','medium','high')),
  pocet_signalov INTEGER NOT NULL DEFAULT 0,
  vytvoril TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TRIGGER zvody_zamok BEFORE UPDATE OF hypoteza, nazov, kategoria ON zvody
  WHEN OLD.zamknute_at IS NOT NULL BEGIN SELECT RAISE(ABORT, 'zvod je zamknuty'); END;
CREATE TABLE zvod_stav_historia (
  zvod_id TEXT NOT NULL REFERENCES zvody(id), zo_stavu TEXT, do_stavu TEXT NOT NULL, skore INTEGER, istota TEXT, dovod TEXT,
  povod TEXT NOT NULL CHECK (povod IN ('algorithm','human')), kto TEXT NOT NULL, at TEXT NOT NULL
);
CREATE TABLE signaly (
  id TEXT PRIMARY KEY,                                           -- 'YYYYMMDD-KAT-NNN'
  titulok TEXT NOT NULL, popis TEXT,
  source_fact TEXT NOT NULL, implication TEXT,                   -- fakt oddelený od výkladu (Semafor)
  zdroj_id TEXT REFERENCES zdroje(id), zdroj_nazov TEXT NOT NULL, zdroj_url TEXT NOT NULL,
  zdroj_typ TEXT NOT NULL CHECK (zdroj_typ IN ('primarny','sekundarny','agregator')),
  zdroj_published_date TEXT, zdroj_rozsah TEXT CHECK (zdroj_rozsah IN ('lokalny','narodny','medzinarodny')),
  scan_date TEXT NOT NULL, event_date TEXT, event_date_known INTEGER NOT NULL DEFAULT 0,
  cas_presnost TEXT CHECK (cas_presnost IN ('minuta','hodina','den','tyzden','mesiac','neznama')),
  miesto TEXT, miesto_presnost TEXT CHECK (miesto_presnost IN ('adresa','obec','okres','kraj','stat','neznama')),
  krivka TEXT NOT NULL CHECK (krivka IN ('registre','media')),
  record_id INTEGER REFERENCES records(id), udalost_id INTEGER REFERENCES udalosti(id), register_udalost_id INTEGER REFERENCES register_udalosti(id),
  archiv_id INTEGER,
  istota TEXT NOT NULL CHECK (istota IN ('high','medium','low')),
  tagy TEXT NOT NULL DEFAULT '[]',
  stav TEXT NOT NULL DEFAULT 'navrh' CHECK (stav IN ('navrh','potvrdeny','zamietnuty')),   -- registre: potvrdeny iba ak register_udalosti.stav='potvrdeny', inak navrh
  vytvoril TEXT NOT NULL, overil TEXT, beh_id TEXT, created_at TEXT NOT NULL,
  UNIQUE (record_id, vytvoril)
);
CREATE INDEX signaly_scan ON signaly(scan_date, krivka);
CREATE TABLE signal_zvody (                                      -- prediction_links
  signal_id TEXT NOT NULL REFERENCES signaly(id), zvod_id TEXT NOT NULL REFERENCES zvody(id),
  relevancia TEXT NOT NULL CHECK (relevancia IN ('direct','supporting','tangential')),      -- 2 / 1 / 0.3
  smer TEXT NOT NULL CHECK (smer IN ('confirming','contradicting','neutral')),              -- +1 / −1 / 0
  sila TEXT NOT NULL CHECK (sila IN ('strong','moderate','weak')),                          -- 3 / 1.5 / 0.5
  odovodnenie TEXT, klasifikoval TEXT NOT NULL,
  PRIMARY KEY (signal_id, zvod_id)
);
CREATE TABLE zvod_skore_denne (                                  -- EKG rad; jeden riadok na zvod × deň × krivka
  zvod_id TEXT NOT NULL REFERENCES zvody(id), den TEXT NOT NULL,
  krivka TEXT NOT NULL CHECK (krivka IN ('spolu','registre','media')),
  skore INTEGER NOT NULL, pocet INTEGER NOT NULL, confirming INTEGER NOT NULL, contradicting INTEGER NOT NULL, neutral INTEGER NOT NULL,
  raw_weighted_sum REAL NOT NULL, total_weight REAL NOT NULL,
  istota TEXT NOT NULL CHECK (istota IN ('insufficient','low','medium','high')),
  odporucany_stav TEXT NOT NULL, pohyb TEXT NOT NULL CHECK (pohyb IN ('up','down','flat')),
  algoritmus TEXT NOT NULL,                                      -- 'openclaw-scoring-v1'
  PRIMARY KEY (zvod_id, den, krivka)
);
CREATE TABLE rollup_denne (                                      -- signal.json + narrative.json + threat + momentum
  den TEXT PRIMARY KEY,
  category_scores TEXT NOT NULL,                                 -- JSON {KAT:{score,movement,signal_count}} pre spolu/registre/media
  summary TEXT NOT NULL,                                         -- JSON {total_signals, by_category, by_direction, predictions_affected, headline}
  narrative TEXT,                                                -- JSON {headline, summary, claims:[{statement,type,signal_ids}], confidence}; redaktor, po schválení
  threat_level TEXT NOT NULL CHECK (threat_level IN ('calm','elevated','high')), threat_reason TEXT,
  momentum TEXT NOT NULL,                                        -- JSON per zvod {this_week, previous_week, trend: spike|rising|stable|falling}
  nalezy TEXT NOT NULL DEFAULT '[]', verzia TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE nalezy (                                            -- rozdiel dvoch kriviek + skoky = vstup triáže
  id INTEGER PRIMARY KEY, den TEXT NOT NULL,
  typ TEXT NOT NULL CHECK (typ IN ('blindspot','pokrytie_bez_udalosti','skok','prva_zmienka','zmena_registra','asymetria_pokrytia')),
  udalost_id INTEGER, register_udalost_id INTEGER, zvod_id TEXT, entity_id TEXT,
  popis TEXT NOT NULL, skore REAL NOT NULL, dokaz TEXT NOT NULL,   -- JSON {record_ids, pocty}
  stav TEXT NOT NULL DEFAULT 'novy' CHECK (stav IN ('novy','v_triazi','zamietnuty','spracovany')),
  created_at TEXT NOT NULL
);
CREATE INDEX nalezy_den ON nalezy(den, stav);
```

Vzorec (`@netopier/redakcia/src/skore.ts`, port `scoring.js`): `w = sila × relevancia × istota`; ak `scan_date` starší než 30 dní, `w ×= 0,5`; `d = w × smer`; `skore = round(clamp(Σd / (9 × n) × 100, −100, 100))`; `istota`: `n ≥ 10 ∧ (confirming+contradicting) ≥ 5 → high`, `n ≥ 5 → medium`, `n ≥ 1 → low`, inak `insufficient`; odporúčaný stav: `n < 3 → bez zmeny`, `≥ 50 ∧ istota ≠ low → potvrdene`, `≤ −50 → vyvratene`, `|skore| ≥ 20 → vznikajuce`; povolené prechody presne ako `status.js`. Krivka `spolu` = všetky potvrdené signály, `registre` = `krivka='registre'`, `media` = `krivka='media'`. Nálezy: `blindspot` = zvod alebo entita so signálom `registre` za 7 dní a 0 dokazov `media` k tej istej entite; `pokrytie_bez_udalosti` = opačne; `skok` = zmena `spolu` o ≥ 15 bodov za deň; `prva_zmienka` = entita z `sledovane` prvý raz v RSS; `zmena_registra` = `register_udalosti` so sledovanou entitou.

### 0005_redakcia.sql (desk ako stavový stroj, tvrdenia, archív, Minúta, vydania, behy)

```sql
CREATE TABLE archiv (                                            -- Auto Archiver: každé citované URL
  id INTEGER PRIMARY KEY, url TEXT NOT NULL, kanonicka_url TEXT NOT NULL,
  sha256 TEXT NOT NULL, r2_key TEXT NOT NULL,                    -- archiv/RRRR/MM/DD/<sha16>.<ext>
  content_type TEXT, status_code INTEGER, velkost INTEGER, titulok TEXT,
  captured_at TEXT NOT NULL, record_id INTEGER, prva_verzia_id INTEGER, vytvoril TEXT NOT NULL,
  text_r2_key TEXT, text_znakov INTEGER,                         -- extrahovaný text (archiv/<sha16>.txt); proti nemu overovateľ hľadá citacia_vyrez
  paywall INTEGER NOT NULL DEFAULT 0,                            -- text < 800 znakov alebo markery „predplatné“, „Prihláste sa“, „Odomknúť“ → claim najviac nerozhodnute
  zdroj_typ TEXT NOT NULL DEFAULT 'sekundarny' CHECK (zdroj_typ IN ('primarny','sekundarny','agregator')),
  wayback_url TEXT, verejny_vyrez INTEGER NOT NULL DEFAULT 1,    -- D15: verejne metadáta + výrez ≤ 300 znakov + Wayback; kópia iba v termináli
  UNIQUE (kanonicka_url, sha256)
);
CREATE TABLE claims (
  id INTEGER PRIMARY KEY, desk_id INTEGER NOT NULL, poradie INTEGER NOT NULL,
  text TEXT NOT NULL,
  typ TEXT NOT NULL CHECK (typ IN ('fakt','interpretacia','medzera')),
  udalost_id INTEGER, signal_id TEXT,
  zdroj_record_id INTEGER REFERENCES records(id), zdroj_url TEXT, archiv_id INTEGER REFERENCES archiv(id),
  zdroj_typ TEXT CHECK (zdroj_typ IN ('primarny','sekundarny','agregator')),   -- jedna taxonómia so signaly.zdroj_typ
  citacia_vyrez TEXT, citacia_od INTEGER, citacia_do INTEGER,   -- presný výrez zo zdroja (graft B2/F3)
  stav TEXT NOT NULL DEFAULT 'neoverene' CHECK (stav IN ('neoverene','overene_primarne','overene_sekundarne','nerozhodnute','nepravda')),
                                                                 -- overene_primarne: výrez je podreťazcom archívneho textu so zdroj_typ='primarny';
                                                                 -- overene_sekundarne: podreťazcom textu média alebo records.data.summary + overenie.podla (názov média);
                                                                 -- typ 'fakt' v neoverene blokuje prechod desk položky do overene
  overenie TEXT,                                                 -- JSON {metoda, primarna_url, podla, citat, poznamka}
  overil TEXT, overene_at TEXT, vytvoril TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE INDEX claims_desk ON claims(desk_id, stav);
CREATE TABLE desk (                                              -- Superdesk desk/stage
  id INTEGER PRIMARY KEY,
  typ TEXT NOT NULL CHECK (typ IN ('udalost','zvod','minuta','clanok','vydanie','narativ')),
  ref_id TEXT NOT NULL,                                          -- udalosti.slug | zvody.id | minuta_posty.slug | slug článku | vydania.den | rollup_denne.den
  stav TEXT NOT NULL DEFAULT 'ingest' CHECK (stav IN ('ingest','kandidat','overene','napisane','schvalene','vydane','zamietnute','stiahnute')),
  dovod_triaze TEXT, priorita INTEGER NOT NULL DEFAULT 5,
  podklad TEXT,                                                  -- JSON od reportéra {fakty:[claim_id], signaly:[id], registre:[register_udalost_id], porovnanie_titulkov:[…], otvorene_otazky:[…]}
  draft_md TEXT, ai_autorstvo TEXT,
  autor_agent TEXT, model TEXT, prompt_version TEXT,             -- povinné pri stave napisane; API ich prevezme z behu (X-Beh), model iba z data/modely.json
  schvalil TEXT, schvalene_at TEXT, vydane_at TEXT, vydane_url TEXT,
  beh_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  UNIQUE (typ, ref_id)
);
CREATE INDEX desk_stav ON desk(stav, updated_at);
CREATE TABLE desk_prechody (desk_id INTEGER NOT NULL, z TEXT NOT NULL, do TEXT NOT NULL, kto TEXT NOT NULL, poznamka TEXT, beh_id TEXT, at TEXT NOT NULL);
CREATE TABLE schvalenia (                                        -- Adamovo rozhodnutie dohľadateľné jedným dopytom (graft B3)
  id INTEGER PRIMARY KEY, desk_id INTEGER NOT NULL, typ TEXT NOT NULL, ref_id TEXT NOT NULL,
  rozhodnutie TEXT NOT NULL CHECK (rozhodnutie IN ('schvalene','vratene','zamietnute')),
  kto TEXT NOT NULL, poznamka TEXT, at TEXT NOT NULL
);
CREATE TABLE revizie (                                           -- generické verzie (graft F3): udalost | minuta | vydanie | zvod | claim | narativ
  entita_typ TEXT NOT NULL, entita_id TEXT NOT NULL, verzia INTEGER NOT NULL,
  snapshot TEXT NOT NULL, kto TEXT NOT NULL, dovod TEXT NOT NULL, at TEXT NOT NULL,
  PRIMARY KEY (entita_typ, entita_id, verzia)
);
CREATE TABLE minuta_posty (                                      -- Live Blog: post = atomická jednotka
  id INTEGER PRIMARY KEY, slug TEXT NOT NULL UNIQUE,             -- '2026-11-05-1432-ms-sr-dodatok'
  cas TEXT NOT NULL,                                             -- ISO s posunom Europe/Bratislava
  prva_veta TEXT NOT NULL, text TEXT NOT NULL, text_dalej TEXT, slova INTEGER NOT NULL,
  stitky TEXT NOT NULL DEFAULT '[]', pripnuty INTEGER NOT NULL DEFAULT 0, pripnuty_do TEXT,
  udalost_id INTEGER, zvod_ids TEXT NOT NULL DEFAULT '[]', desk_id INTEGER NOT NULL,
  claim_ids TEXT NOT NULL DEFAULT '[]',                          -- každá veta textu = jeden claim (validátor draft.ts); fakt musí byť overene_*
  autor TEXT NOT NULL, ai_autorstvo TEXT NOT NULL, schvalil TEXT,
  stav TEXT NOT NULL DEFAULT 'draft' CHECK (stav IN ('draft','schvalene','vydane','stiahnute')),
  vydane_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX minuta_stav_cas ON minuta_posty(stav, cas);
CREATE VIRTUAL TABLE minuta_fts USING fts5(prva_veta, text, text_dalej, content='minuta_posty', content_rowid='id', tokenize='unicode61 remove_diacritics 2');
CREATE VIRTUAL TABLE udalosti_fts USING fts5(titulok, zhrnutie_md, content='udalosti', content_rowid='id', tokenize='unicode61 remove_diacritics 2');
-- triggery ako pri records_fts; verejné /hladaj filtruje stav='vydane' / verejna=1 spojením na obsahovú tabuľku
CREATE TABLE vydania (                                           -- denná titulka ako vydanie
  den TEXT PRIMARY KEY, cislo INTEGER NOT NULL, titulok TEXT NOT NULL, uvodnik_md TEXT, suhrn_md TEXT,
  hlavna_udalost_id INTEGER, polozky TEXT NOT NULL,              -- JSON [{typ, ref_id, poradie, rubrika}]
  rollup_den TEXT REFERENCES rollup_denne(den),
  stav TEXT NOT NULL DEFAULT 'draft' CHECK (stav IN ('draft','schvalene','vydane')),
  schvalil TEXT, vydane_at TEXT, uzavierka_at TEXT, ai_autorstvo TEXT NOT NULL,
  snapshot_r2_key TEXT, snapshot_sha256 TEXT,                    -- nemenný snapshot vydania v R2 (graft F1)
  created_at TEXT NOT NULL
);
CREATE TABLE behy_redakcie (                                     -- proveniencia agentov
  id TEXT PRIMARY KEY,                                           -- 'redakcia-2026-11-05-0830-triaz'
  agent TEXT NOT NULL CHECK (agent IN ('triaz','reporter','overovatel','redaktor','archivar','orchestrator')),
  model TEXT NOT NULL, prompt_version TEXT NOT NULL,             -- model z allowlistu data/modely.json; prompt_version = commit hash repozitára hriech-redakcia (píše orchestrátor, nie subagent)
  spustil TEXT NOT NULL,                                         -- 'routine:rano' | 'routine:vecer' | 'routine:tyzden' | 'adam' | 'hlavna-session'
  vstup_r2_key TEXT, vystup_r2_key TEXT,                         -- redakcia/<den>/<agent>-vstup.json / -vystup.json
  vstup_ids TEXT, vystup_ids TEXT, tokens_in INTEGER, tokens_out INTEGER,
  pokusy INTEGER NOT NULL DEFAULT 1,                             -- validácia schémy: max 2 opakovania
  started_at TEXT NOT NULL, finished_at TEXT,
  stav TEXT NOT NULL CHECK (stav IN ('bezi','ok','chyba','dry_run')), chyba TEXT
);
CREATE TABLE archiv_mesiace (mesiac TEXT PRIMARY KEY, r2_key TEXT NOT NULL, records INTEGER NOT NULL, sha256 TEXT NOT NULL, exported_at TEXT NOT NULL, zmazane_at TEXT);
CREATE TABLE zalohy (id INTEGER PRIMARY KEY, r2_prefix TEXT NOT NULL, tabulky TEXT NOT NULL, riadkov INTEGER NOT NULL, created_at TEXT NOT NULL, overene_at TEXT);
```

### Neskôr (Vianoce)

- `0006_moduly.sql`: `kalendar(id, nazov, datum, typ CHECK IN ('volby','rozpocet','sud','nrsr','eu','lehota_ted','ucinnost_crz','statistika','iny'), zdroj_url, zdroj_record_id, vytvoril)`, `statistika_rady(kod, dimenzie TEXT JSON, obdobie, hodnota REAL, update, PRIMARY KEY(kod, dimenzie, obdobie))` (rozbalený JSON-stat), `prieskumy(id, agentura, datum_zberu, datum_publikacie, strana, percento REAL, vzorka INTEGER, zdroj_url, archiv_id, vytvoril)`.
- `0007_ftm.sql`: `ftm_entity(id, schema CHECK IN ('Person','Company','PublicBody','Organization','Event','Document'), props TEXT JSON, zdroj_record_ids TEXT)`, `ftm_vztah(id, schema CHECK IN ('Ownership','Directorship','Payment','Membership','Mention'), subjekt_id, objekt_id, props TEXT, zdroj_record_id)`, `sledovane(zoznam, entity_id, dovod, pridal, at)`.

### Verzie a proveniencia (reťaz)

verejná veta → `claims` (`typ`, `citacia_vyrez`, `stav`, `zdroj_typ`) → `archiv` (sha256, čas, extrahovaný text s `paywall`, `wayback_url`, R2 objekt s `customMetadata`) a `records` (`content_hash`, `data.raw_item`, `raw_key` → surový payload v R2, od I2 aj pre RSS médií) → `runs`. Overenie claimu je overiteľný podreťazec, nie tvrdenie agenta. Každý odvodený riadok: `vytvoril`, `beh_id`; každá zmena obsahu: `revizie`; každý prechod: `desk_prechody` + `schvalenia`; každý beh agenta: `behy_redakcie` s plným vstupom a výstupom v R2.

Seedy v gite (zdroj pravdy, `netopier/zber/data/`): `zvody-seed.json` (`{version, locked_at, kategorie, zvody:[{id, kategoria, nazov, hypoteza, plain_popis, klucove_slova, entity_ids, registre}]}`), `zdroje-seed.json` (SK médiá podľa výstupu `overit-kanaly.mjs` — dnes 3 redakcie so 4 kanálmi, po D7 až 17 vrátane tých bez RSS so `sledovany=0`; 6 registrov; 104 WM kanálov; každý z 10 outletov mapy má riadok s `outlet_id`), `zdroj-kanaly-seed.json`, `aktori.json` (Client ID Service Tokenu → aktér), `agenti.json` (agent → povolené cesty API), `modely.json` (allowlist), `register-druhy.json` (druh → `overene_at`, `zdroj_overenia`), `entity-alias-seed.json`, `derive-kanaly.json` (svetové kanály pre udalosti: `lang ∈ {sk, cs, hu, pl, de, en}`, `category ∈ {europe, gov}`), `crz-ciselniky.json`, `klucove-slova.json`. `scripts/seed.mjs` zapíše `INSERT OR REPLACE` lokálne aj remote.

---

## 3. API a dáta

### 3.1 Spoločný balík `@netopier/redakcia` (`netopier/redakcia/src/`)

| Modul | Obsah | Používa |
|---|---|---|
| `schema.ts` | TS typy všetkých tabuliek a JSON tvarov (`Udalost`, `Post`, `Zvod`, `Signal`, `Vydanie`, `Zdroj`, `Claim`, `DeskPolozka`, `Nalez`) | oba Workery, testy |
| `dopyty/*.ts` | `getMinuta(db, {limit, before, stitok, verejne})`, `getPost(db, slug)`, `getUdalosti(db, filtre)`, `getUdalost(db, slug)`, `getZvody(db)`, `getZvod(db, id, dni)`, `getEkg(db, dni)`, `getVydanie(db, den)`, `getZdroj(db, id, dni)`, `getRollup(db, den)`, `getNalezy`, `getZaznamy`, `getEntity`, `getDesk` — parameter `verejne: true` vynúti `stav='vydane'`, `verejna=1`, `verejny=1`, `entity.verejne=1` v SQL | stránky, `/api/*.json`, API |
| `stavovy-stroj.ts` | povolené prechody desk (ingest→kandidat→overene→napisane→schvalene→vydane; zamietnute; stiahnute), pravidlá aktérov, pravidlo „0 claims typu fakt so stavom ≠ overene“ pre `overene`, prechody zvodov podľa `status.js` | API |
| `skore.ts` | vzorec, istota, odporúčaný stav, momentum, category_scores | derive, terminál |
| `autorstvo.ts` | `aiAutorstvo(claims, behy, schvalenie)` → text z počtov `claims` po `typ` × `stav` (primárne / podľa médií / výklad / nevieme), behy iba ako čísla; slovo „primárny“ iba pri `overenie.primarna_url` + `archiv.zdroj_typ='primarny'`; pevná formula ako fallback | API, stránky, smoke |
| `draft.ts` | validátor draftu: rozdelí text na vety; každá končí `[^cN]` s N ∈ claims položky alebo začína „Výklad:“ / „Nevieme:“ (založí claim `interpretacia`/`medzera`); inak `{chyba:422, veta:n}`; výstup = zoznam viet s väzbou na claim, z ktorého renderuje `Tvrdenie.astro` | API (`POST /api/desk/:id/draft`), `/t/desk/novy`, `validate.mjs` |
| `inline.ts` | escape HTML, potom iba `**tučné**` a `[text](https://…)`; `[^cN]` → `<sup><a href="#cN">N</a></sup>`; test na XSS a na väzbu čísla na claim | stránky |
| `pristup.ts` | overenie `Cf-Access-Jwt-Assertion` (jose, JWKS `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs`, cache 1 h), akceptované AUD: API aj terminál; `email` → `{typ:'adam', id:'adam:<email>'}`; `common_name` → riadok v `data/aktori.json` (`netopier-routine` → `agent`/`routine`, `netopier-hlavna-session` → `agent`/`hlavna-session`, `ACCESS_ADAM_CLIENT_ID` → `{typ:'adam', id:'adam:cli'}`), neznámy Client ID → 403; výsledok `Aktor = {typ:'adam'|'agent'|'system', id, spustac, email?}` | oba Workery |
| `format.ts` | `formatDate`, `formatTime` (HH:MM, Europe/Bratislava), `formatNumber` (sk-SK), `slug()` | stránky, terminál |
| `kontrakty/*.schema.json` | JSON Schema 2020-12 pre všetky tvary v 3.2 a 3.3 a pre výstupy agentov (`triaz`, `reporter`, `overovatel`, `redaktor`), validácia Ajv v testoch oboch Workerov a v `scripts/redakcia/validate.mjs` | všetci |

### 3.2 Verejný JSON (`hriech-web`, `src/pages/api/*.ts`, `prerender = false`, `Cache-Control: public, max-age=60, stale-while-revalidate=300` cez Workers Caching, iba `verejne: true`)

| Endpoint | Tvar |
|---|---|
| `GET /api/minuta.json?before=<cas>&limit=50&stitok=` | `{ pripnute:[Post], items:[Post], next }`; `Post = {slug, cas, prva_veta, text, text_dalej, slova, stitky, pripnuty, udalost_slug, zvod_ids, autor, ai_autorstvo, schvalil, url}` |
| `GET /api/udalosti/<slug>.json` | `Udalost` = stĺpce + `dokazy:[{record_id, zdroj_id, vztah, vyrez, cas, url, published_at, archiv_sha}]`, `pokrytie:[{zdroj_id, nazov, pocet, prvy_at, titulok}]`, `podiel:{pokryli, zo}`, `blindspot`, `porovnanie_titulkov`, `casova_os:[{cas, typ_akcie, record_id}]`, `claims:[{id, typ, text, citacia_vyrez, zdroj_url, archiv_sha, stav}]`, `registre:[RegisterUdalost]`, `proveniencia:{behy:[{agent, model, finished_at}], schvalil, schvalene_at}` |
| `GET /api/zvody.json`, `GET /api/zvody/<id>.json?dni=90` | katalóg / zvod + `historia:[{den, krivka, skore, pocet, istota}]`, `signaly:[{id, scan_date, krivka, smer, sila, relevancia, zdroj_nazov, zdroj_url, odovodnenie}]`, `stav_historia` |
| `GET /api/ekg.json?dni=30` | `{dni:[{den, category_scores, threat_level}], momentum, nalezy_verejne}` |
| `GET /api/vydanie/<den>.json`, `/api/vydanie/latest.json` | vydanie + rozbalené položky + `snapshot_sha256` |
| `GET /api/zdroje/<id>.json?dni=30` | kartička + `pokrytie_denne` + `rebricek:{poradie, prvy, podiel}` |
| `GET /api/hladaj.json?q=&typ=minuta|udalost|zvod|publikacia&limit≤50` | `{q, items:[{typ, titulok, url, cas, vyrez}]}` nad `minuta_fts`, `udalosti_fts` (iba `vydane`/`verejna=1`), `zvody` (LIKE nad názvom a hypotézou) a `search.json` publikácií; prefixové dopyty (`q*`), `remove_diacritics 2` |
| `GET /api/udalosti/<slug>.json` → `podiel:{pokryli, zo}`, `prvy:{zdroj_id, at, presnost, formulacia}` | `formulacia` je vždy „prvý zo sledovaných kanálov“; „o N min skôr“ iba ak obe strany majú `presnost='sekunda'`, inak „v tú istú hodinu/deň“; `pokryli`/`zo` sú redakcie, nie kanály |
| `GET /minuta.xml`, `GET /vydanie.xml`, `GET /udalosti.xml` | RSS 2.0 (`src/lib/xml.ts`), `<dc:creator>` = `autor`, `<category>ai-asistovane</category>`; všetky tri v `<link rel="alternate">` v `BaseLayout` |
| `GET /sitemap.xml` (index, prerender) → `GET /sitemap-static.xml` (prerender, z gitu) + `GET /sitemap-zive.xml` (SSR, cache 1 h) | živá sitemapa z `getMinuta`, `getUdalosti`, `getZvody`, `getVydania`, `getZdroje` iba `verejne:true`; `smoke-live.mjs` overí, že každá URL zo všetkých sitemáp vracia 200 |

### 3.3 Interné API (`netopier-zber`, `src/api/*.ts`, host `api.hriech.xvadur.com`, za Access; `Cache-Control: private, no-store`)

Aktér z JWT (`pristup.ts`): `adam:<email>` (OTP v termináli, preposlaný cez Service Binding s AUD terminálu), `adam:cli` (Service Token `netopier-adam-cli`, D9), `agent` so spúšťačom `routine` alebo `hlavna-session` (Service Tokeny `netopier-routine`, `netopier-hlavna-session`). Každá zápisová požiadavka agenta nesie `X-Beh: <beh_id>`; API overí, že beh existuje, je `bezi` a `behy_redakcie.agent` smie danú cestu (`data/agenti.json`); `X-Agent` sa iba porovná s behom (nesúlad 403). Odpovede a telá validujú kontrakty z 3.1. Všetky odpovede `private, no-store` okrem `GET /health`.

| Metóda a cesta | Telo → odpoveď | Smie |
|---|---|---|
| `GET /health` | ako dnes, ale `records` iba za 24 h (`WHERE collected_at >= ?`, index `records_source_collected`) + celkové počty z `pocty` + `derive:{udalosti, register_udalosti, signaly, nalezy_novy, desk_by_stav, posledny_rollup}`, `d1_velkost` z `PRAGMA page_count * page_size`; `Cache-Control: public, max-age=60` (jediná cacheovaná odpoveď API) | verejné (Access aplikácia `Netopier health`, politika Bypass) |
| `POST /run`, `POST /run/<zdroj>`, `POST /run/derive?krok=&den=` | ako dnes; do I6 Bearer `ZBER_TOKEN`, od I6 iba JWT (`ZBER_TOKEN` zmazaný); README uvádza curl s `CF-Access-Client-Id/Secret` | adam, hlavná session |
| `GET /api/zaznamy?source=&channel=&after=<id>&since=&q=&entity=&limit≤200` · `GET /api/zaznamy/:id` | `{items:[Zaznam s data JSON], next}` · záznam + `verzie[]` + `entity[]` + `raw_url` | adam, agent |
| `GET /api/raw/:key` | stream z R2 | adam, agent |
| `GET /api/entity/:id` | `{entity, zaznamy, udalosti, register_udalosti, signaly}` (aj `verejne=0`) | adam, agent |
| `GET /api/udalosti?since=&stav=&krivka=&min_nezavislych=&blindspot=&limit` · `GET /api/udalosti/:slug` | tvar ako 3.2, bez filtra `verejna` + `dokazy.stav`, `priznaky`, `suggested[]`, `revizie[]` | adam, agent |
| `GET /api/register-udalosti?since=&druh=&entity=` | `{items:[RegisterUdalost]}` | adam, agent |
| `GET /api/zvody`, `/api/zvody/:id`, `GET /api/signaly?den=&krivka=&stav=`, `GET /api/rollup/:den|latest`, `GET /api/nalezy?den=&stav=&typ=` | ako 3.2 bez verejného filtra | adam, agent |
| `GET /api/desk?stav=&typ=` · `GET /api/desk/:id` | `{items:[DeskPolozka]}` · položka + `claims` + `prechody` + `behy` | adam, agent |
| `GET /api/desk/triaz-vstup?den=` | `{nalezy, skoky, prve_zmienky, zmeny_registrov, udalosti_24h:[{slug, titulok, pocet_zdrojov, pokrytie_podiel, prvy_zdroj}], rollup}` — jeden vstup pre triáž, spočítaný v TS | agent:triaz, adam |
| `POST /api/signaly` | `{signal, zvody:[{zvod_id, relevancia, smer, sila, odovodnenie}]}` → `{id}` (`stav='navrh'`, `vytvoril='agent:…'`) | agent, adam |
| `POST /api/signaly/:id/stav` | `{stav:'potvrdeny'|'zamietnuty', dovod}` | agent:overovatel, adam |
| `POST /api/desk` | `{typ, ref_id, dovod_triaze, priorita}` → `kandidat` (≤ 10 na deň pre agenta) | agent:triaz, adam |
| `POST /api/desk/:id/podklad` | `{podklad, claims:[{text, typ, zdroj_url, zdroj_record_id, zdroj_typ, citacia_vyrez}]}`; claim bez zdroja alebo výrezu → 422 | agent:reporter, adam |
| `POST /api/archiv` | `{url, record_id?, zdroj_typ}` → Worker stiahne, sha256, R2 `archiv/<sha16>.<ext>` + extrahovaný text `archiv/<sha16>.txt` (`text_znakov`, `paywall`), zavolá `web.archive.org/save/<url>` (chyba Waybacku nezastaví), riadok → `{id, sha256, r2_key, text_znakov, paywall, wayback_url}` | agent, adam |
| `GET /api/archiv/:id`, `GET /api/archiv/:id/text` | metadáta · extrahovaný text (iba za Access; verejne ide iba výrez podľa D15) | agent, adam |
| `POST /api/claims/:id/overenie` | `{stav, overenie:{metoda, primarna_url, podla, citat, poznamka}, archiv_id, typ?, dovod_zmeny_typu?}`; API prijme `overene_primarne` iba ak `citacia_vyrez` je po NFD-folde a zjednotení medzier podreťazcom textu `archiv.text_r2_key` so `zdroj_typ='primarny'`; `overene_sekundarne` iba ak je podreťazcom textu média alebo `records.data.summary` a `podla` je vyplnené; pri `archiv.paywall=1` najviac `nerozhodnute`; výrez mimo textu → 422; zmena `typ` (fakt → interpretacia) s dôvodom → `revizie` | agent:overovatel, adam |
| `POST /api/desk/:id/draft` | `{draft_md, minuta_post?, udalost_zhrnutie_md?, vydanie?, narativ?}` + `X-Beh` → validátor `draft.ts` (každá veta s `[^cN]` alebo „Výklad:“/„Nevieme:“, inak 422 s číslom vety), `autor_agent`/`model`/`prompt_version` sa prevezmú z behu → `napisane` (odmietne aj s claimom typu `fakt` v `neoverene`) | agent:redaktor, adam |
| `POST /api/desk/:id/prechod` | `{do:'schvalene'|'vratene'|'zamietnute'|'vydane'|'stiahnute', poznamka}` → `desk_prechody` + `schvalenia` (`kto` = `adam:<email>` alebo `adam:cli`); `schvalene`/`vydane` iba aktér `typ='adam'` (tokeny `netopier-routine`/`netopier-hlavna-session` dostanú 403, test v I5); `vydane` nastaví `minuta_posty.stav`, `udalosti.verejna`, `vydania.stav` a zapíše snapshot vydania do R2 | adam |
| `POST /api/udalosti/:id/merge`, `/split`, `PATCH /api/udalosti/:id` | ľudská korekcia → `udalost_rodokmen povod='human'`, `revizie` | adam |
| `POST /api/zvody`, `POST /api/zvody/:id/stav`, `POST /api/zvody/:id/zamknut` | nový zvod, ľudský override stavu (`povod='human'`), zamknutie | adam |
| `PATCH /api/zdroje/:id`, `PATCH /api/entity/:id` | hodnotenie so zdrojmi, `sledovane`, `druh` | adam |
| `POST /api/behy` · `PATCH /api/behy/:id` | založí beh (`agent`, `model` iba z `data/modely.json`, `prompt_version` = commit hash `hriech-redakcia`, `spustil` podľa Client ID) → `{beh_id}`; zápis vstup/výstup kľúčov, tokenov, stavu; volá iba orchestrátor (skill), nie subagent | agent (orchestrátor), adam |

Terminálové formuláre: `hriech-web` `src/pages/t/api/[...cesta].ts` prijme `application/x-www-form-urlencoded` POST, prevedie na JSON a zavolá `env.NETOPIER.fetch(new Request('https://netopier-zber/api/' + cesta, {headers:{'Cf-Access-Jwt-Assertion': pôvodná}}))`; po odpovedi 303 späť na stránku. Bez JS.

---

## 4. Redakčná linka

Deterministické kroky bežia vo Workeri (fronta a cron), jazykové kroky v Claude Code. Worker nikdy nevolá LLM; táto veta ide do `netopier/STACK.md` a ADR-011.

### 4.1 Deterministická časť (`netopier/zber/src/derive/`)

Spoločné pravidlá odvodenia (vynútené typom `DeriveJob` a testom `derive-sucasnost.test.ts`):
- Všetko odvodenie beží v konzumente fronty **`netopier-derive`** s `max_concurrency: 1` (konzument bez `max_concurrency` autoškáluje až na 250 súbežných invokácií a dve dávky by čítali ten istý kurzor). `scheduled` iba zaraďuje (`env.DERIVE.sendBatch`), lebo cron `*/30` má 30 s CPU a 15 min wall-clock; konzument má `cpu_ms` 60 000.
- Každá správa nesie pevný rozsah `{ krok, after, until }` podľa `records.id`, nie iba „od kurzora“. Zápisy sú idempotentné: `INSERT OR IGNORE` podľa jedinečných kľúčov (`udalost_dokazy (udalost_id, record_id)`, `record_entity (record_id, entity_id, rola)`, `signaly (record_id, vytvoril)`), kurzor `source_state('derive', krok)` sa posúva v tom istom `db.batch` ako výsledky. Test: dve súbežné derive správy nad tou istou dávkou → 0 duplicít.
- Strop dopytov na jednu správu: ≤ 200 volaní `db.batch`/`run` (limit D1 je 1 000 dopytov na invokáciu a lokálny workerd ho nevynucuje). Pri prekročení sa zvyšok zaradí ako pokračovanie `{ after: posledné id }`. Backfilly (`derive:entity` nad 14 299 riadkami, `entity-media`) idú po 500 záznamoch. V I1 sa hneď po nasadení spustí `POST /run/crz?sync=1` a `wrangler tail` sleduje chybu „Too many API requests by single worker invocation“; ak sa `batch` počíta po statementoch, `archiveChannel` delí deň CRZ na viac správ (nie väčšie dávky).

| Krok | Súbor | Spúšťač | Vstup | Výstup |
|---|---|---|---|---|
| zber | `src/sources/*.ts`, `archive.ts` | cron `*/30`, `20 5` (fronta `netopier-zber-jobs`) | zdroje | `records`, `runs`, `source_state`, R2 raw. **Zmena:** `raw` sa ukladá aj pre sadu `media` (`raw/rss/<kanal>/<RRRR-MM-DD>/<beh>.xml`, lifecycle 90 dní; 4–18 kanálov × 48 behov/deň, rádovo MB/deň) a každá položka nesie `records.data.raw_item` (XML položky ≤ 8 KB), takže `records.raw_key` pre médiá prestane byť NULL (dnes 9 109 zo 9 109); `record_entity` z IČO, `records_fts` cez triggery, `pocty` (+1 na zdroj) v tom istom `db.batch` |
| normalize | `derive/normalize.ts` | po každom behu zberu (`runJob` zaradí `{kind:'derive', krok:'normalize', after, until}` do `DERIVE`) | nové `records` | `published_at_utc` |
| entity | `derive/entity.ts` | v `archiveChannel`; jednorazovo backfill po 500 | `data.*_ico` | `entity`, `record_entity` (`objednavatel|dodavatel` až po overení sémantiky, dovtedy `strana_a|strana_b`) |
| entity v médiách | `derive/entity-media.ts` (nový) | po normalize, iba SK záznamy | `entity_alias` (názov z CRZ, skrátené tvary, `klucove-slova.json`, neskôr RPO), `records_fts` prefixové dopyty (`"ministerstv*" NEAR "školstv*"`, `remove_diacritics 2`) | `record_entity rola='zmienka'`; presnosť sa meria na 50 ručne označených pároch v `test/fixtures/entity-media-vzorka.json` a zapíše do `docs/METODIKA-ZDROJE.md`; blindspot ide verejne až pri presnosti ≥ 0,8 |
| udalosti | `derive/udalosti.ts` (port `events.py`: `ACTION_RULES` rozšírené z 8 na ≥ 30 slovies, `STATUS_RULES`, kandidáti s presnými offsetmi, `RelationshipDecider` bez embeddingu: `skore = 0,35·lex + 0,30·entity + 0,15·cas + 0,10·akcia + 0,05·miesto + 0,05·titulok`; `same_event` prijaté ≥ 0,85, `suggested` ≥ 0,62 nikdy nezlučuje; syndikát pri zhode URL/hash; okno ±72 h, ≤ 20 klastrov), `derive/text.ts` (port `text.py`) | po každej RSS dávke médií, dávky po 100 záznamov, pevný rozsah id | SK RSS + kanály z `derive-kanaly.json` | `udalosti`, `udalost_dokazy` (+ `agentura` z regexu `TASR|SITA|ČTK|Reuters|AP|AFP|DPA` nad `data.author` a začiatkom `summary`; dnes 75 % položiek Pravdy je TASR), `udalost_pokrytie` (+ `prvy_at_presnost` z formátu času kanála: `sekunda|minuta5|hodina`), `revizie`, `prvy_*`, `pokrytie_podiel`. Položky s `agentura` sa nerátajú do `pocet_nezavislych` ani do `prvy_*`, kým agentúra nie je sama v `zdroje` (`typ='agentura'`); `pocet_zdrojov` a podiel sa počítajú per `zdroj_id` (redakcia) cez `zdroj_kanaly`, nie per kanál |
| registre | `derive/registre.ts` | cron `20 6` → `DERIVE` | nové crz/ted/kataster/statistika | `register_udalosti` (`stav` z `register-druhy.json`: `potvrdeny` iba pre druhy s overenou sémantikou, inak `navrh`; `suma` NULL, keď `suma_spolu = 0 ∧ suma_zmluva = 0` — dnes 50 % CRZ), `udalost_registre` (zhoda IČO/zmluvy s mediálnymi udalosťami za 14 dní + `zmienka_entity` z `entity-media`), `udalosti.krivka` |
| signály z pravidiel | `derive/pravidla.ts`: `crz_suma_nad_limit` (≥ 1 M €), `crz_dodatok_navysenie`, `ted_vitaz_jediny`, `ted_bez_sutaze`, `kataster_nova_verzia`, `statistika_aktualizacia`, `sledovana_entita`, `klucove_slovo` (per zvod) | cron `20 6` → `DERIVE` | `register_udalosti`, `records` | `signaly` (`krivka='registre'`, `vytvoril='pravidlo:…'`; `stav='potvrdeny'` iba ak `register_udalosti.stav='potvrdeny'`, inak `navrh` — `crz_*` pravidlá do overenia sémantiky na 20 zmluvách proti crz.gov.sk), `signal_zvody` iba s pevným zvodom |
| skóre a rollup | `derive/rollup.ts` + `@netopier/redakcia/skore.ts` | cron `20 6` a po každom `POST /api/signaly/:id/stav` | `signaly` potvrdené za 90 dní | `zvod_skore_denne` (3 krivky), `zvody.skore/istota` + `zvod_stav_historia povod='algorithm'`, `rollup_denne` (bez `narrative`), `zdroj_pokrytie_denne` (per redakcia) |
| nálezy | `derive/nalezy.ts` | cron `20 6` → `DERIVE` | dve krivky, pokrytie | `nalezy`; typ `blindspot` iba do terminálu a triáže, kým `entity-media` nemá zmeranú presnosť |
| archív URL | `api/archiv.ts` | `POST /api/archiv` | URL | R2 `archiv/<sha16>.<ext>` (kópia) + `archiv/<sha16>.txt` (extrahovaný text), `archiv` riadok s `text_znakov`, `paywall` (text < 800 znakov alebo markery „predplatné“, „Prihláste sa“, „Odomknúť“), `zdroj_typ`, `wayback_url` (`web.archive.org/save/<url>`, chyba Waybacku beh nezastaví) |
| záloha | `derive/zaloha.ts` | cron `10 3 * * 0` → `DERIVE` | všetky tabuľky okrem `runs`, `source_state`; `records` **prírastkovo** (`WHERE id > posledný zálohovaný id`, po 5 000 riadkov) | R2 `zalohy/RRRR-MM-DD/<tabulka>.jsonl.gz` + `records.jsonl.gz`, `zalohy` riadok. D1 Time Travel (30 dní) je iba núdzová brzda na mieste, nie záloha: obnovuje deštruktívne celú DB, do kópie nevie |
| export mesiaca | `derive/archiv-mesiac.ts` | cron `10 3 1 * *` → `DERIVE` | každý uzavretý mesiac `records` hneď (nie až > 6 mesiacov) | R2 `export/records/RRRR-MM.jsonl.gz`, `archiv_mesiace` so sha256; DELETE z `records` až pre mesiace staršie než 6 a po overení sha256, s výnimkou záznamov naviazaných na `udalost_dokazy`/`signaly`/`claims`; FTS riadok mizne triggerom |

`wrangler d1 export` nefunguje pre databázy s virtuálnymi tabuľkami, preto je zálohou vlastný JSONL export; ak treba SQL dump, postup je `DROP TABLE records_fts` → export → znovu vytvoriť + `INSERT INTO records_fts(records_fts) VALUES('rebuild')` (zapísané v `netopier/zber/README.md`). Pred každou `migrations apply --remote` sa zapíše `wrangler d1 time-travel info netopier-zber` bookmark do komentára úlohy v Lineari. Migrácie sú iba aditívne (žiadny DROP/RENAME existujúcich stĺpcov), aby sa dal vrátiť samotný kód; `dopyty.test.ts` beží nad schémou N aj N−1.

### 4.2 Agenti (Claude Code)

Súbory žijú v súkromnom repozitári `xvadur/hriech-redakcia` (D3): `agents/hriech-triaz.md`, `hriech-reporter.md`, `hriech-overovatel.md`, `hriech-redaktor.md`, `hriech-archivar.md` (`model: inherit`), `skills/redakcia/SKILL.md` (`/redakcia [den] [rano|vecer|tyzden] [--dry-run]`), `docs/HLAS.md`, `contracts/v1/{triaz,reporter,overovatel,redaktor}.schema.json`, `validate.mjs`, `data/agenti.json` (meno → povolené cesty API). Workspace `_claude/agents/hriech-*.md` a `_claude/skills/redakcia` sú symlinky do `projekty/hriech-redakcia/`, takže ručný beh z hlavnej session a routine používajú ten istý súbor. Verejné v `hriech` ostáva iba `docs/REDAKCIA.md` (postup, stavy, kto smie čo, rotácia tokenov) a kópia kontraktov v `contracts/redakcia/v1/` (test `kontrakty-zhoda.test.mjs` porovnáva hash). Každý výstup agenta prejde schémou; neplatný výstup sa opakuje najviac 2×, potom beh končí `stav='chyba'` v `behy_redakcie`. Plný vstup a výstup každého behu ide do R2 `redakcia/<den>/<agent>-vstup.json|vystup.json` (cez `POST /api/behy`).

Identita a proveniencia behu:
- Service Token identifikuje **spúšťač**, nie subagenta: `netopier-routine` (API credential v cloud environmente `hriech`), `netopier-hlavna-session` (Mac, `~/.config/hriech/`), `netopier-adam-cli` (D9). JWT po Service Tokene nesie iba `common_name` = Client ID a prázdny `sub`; `pristup.ts` mapuje `common_name` podľa `data/aktori.json` na `Aktor {typ:'agent'|'adam', id}`; neznámy Client ID → 403.
- Orchestrátor (skill `/redakcia`) založí beh `POST /api/behy` s `agent`, `model` (API prijme iba hodnoty zo zoznamu `data/modely.json`), `prompt_version` (commit hash repozitára `hriech-redakcia`, ktorý si routine prečíta z `git rev-parse HEAD` po klone) a `spustil` (`routine:rano|vecer|tyzden` podľa Client ID, `hlavna-session`, `adam`). Každá zápisová požiadavka subagenta nesie `X-Beh: <beh_id>`; API overí, že beh existuje, je `bezi` a jeho `agent` smie danú cestu (`agenti.json`). Hlavička `X-Agent` sa iba porovná s `behy_redakcie.agent`, nesúlad → 403. `model` a `prompt_version` nikdy neposiela subagent.
- Rotácia: token `Rotate secret` s grace 7 dní → prepísať API credential v cloud prostredí a `~/.config/hriech/` → overiť `GET /api/zvody` 200 (riadok v `docs/REDAKCIA.md`); notifikácia expirácie týždeň vopred na Adamov e-mail (I6).

Behy (D3): `hriech-redakcia-rano` `30 6 * * *` UTC (po `20 6 UTC` rollupe), `hriech-redakcia-vecer` `30 16 * * *` UTC (iba udalosti dňa → signály → posty Minúty), `hriech-redakcia-tyzden` `0 7 * * 0` UTC (momentum, threat history, návrh zmien stavov zvodov s odôvodnením → Adam, záloha Fikiho podľa D16). Routiny sú „research preview“ (minimálny interval 1 h, denný strop behov), preto je ručný beh z hlavnej session odskúšaný skôr (I9) a ostáva záložnou cestou. Vstup pre agentov delený na dávky po 200 záznamov.

| Agent | Vstup | Výstup | Podmienka postupu |
|---|---|---|---|
| **triáž** | `GET /api/desk/triaz-vstup?den=`, `GET /api/zvody` | ≤ 10 × `POST /api/desk` s `dovod_triaze` jednou vetou s číslom („CRZ 11 zmlúv, 0 z 12 sledovaných redakcií“); pre mediálne udalosti `POST /api/signaly` (`krivka='media'`, `stav='navrh'`) s klasifikáciou do zvodov a `odovodnenie` | – |
| **reportér** (1 subagent na položku, paralelne) | `GET /api/udalosti/:slug`, `/api/entity/:id`, `/api/zaznamy/:id` (vrátane `data.raw_item` a `summary`), `/api/register-udalosti`, `/api/zvody/:id` | `POST /api/desk/:id/podklad`: centrálne fakty ako `claims` (každý `zdroj_record_id` alebo `zdroj_url` + `citacia_vyrez` + `zdroj_typ`), signály po zdrojoch, „čo hovoria registre“, porovnanie titulkov, otvorené otázky | každý claim má zdroj a výrez |
| **archivár** | claims bez `archiv_id`, citované URL | `POST /api/archiv` → `archiv_id` na claim (kópia, extrahovaný text, `paywall`, Wayback); týždenne overí hash proti R2 | – |
| **overovateľ** (nezávislý kontext, nevidí draft) | claims `neoverene`, `GET /api/raw/:key`, `GET /api/archiv/:id/text`, `records.data.summary` | `POST /api/claims/:id/overenie`: `overene_primarne` iba ak `citacia_vyrez` je doslovný podreťazec (po NFD-folde a zjednotení medzier) extrahovaného textu archívu so `zdroj_typ='primarny'`; `overene_sekundarne` iba ak je podreťazcom archívneho textu média alebo `records.data.summary` a `overenie.podla` nesie názov média; pri `archiv.paywall=1` najviac `nerozhodnute`; inak `nerozhodnute`/`nepravda` s dôvodom. Smie zmeniť `claims.typ` (fakt → interpretacia) s dôvodom → `revizie`. `POST /api/signaly/:id/stav` | položka → `overene` iba ak 0 claims typu `fakt` v stave `neoverene` (vynucuje API) |
| **redaktor** | podklad, overené claims, `docs/HLAS.md` | `POST /api/desk/:id/draft`: post Minúty (čas, tučná prvá veta, 1–2 vety, zvyšok, štítky), `zhrnutie_md` udalosti, návrh `vydania` dňa (18:30 alebo ráno na predošlý deň), `narrative` rollupu, draft článku ako `research/<slug>/draft.md` iba na pokyn. **Každá veta** textu musí končiť `[^cN]` s N ∈ claims položky, alebo začínať „Výklad:“ / „Nevieme:“ (validátor `draft.ts` vtedy sám založí claim typu `interpretacia`/`medzera`); veta bez väzby → 422 s číslom vety | → `napisane` |
| **Adam** | terminál `/t/desk` alebo `pnpm desk approve` | `POST /api/desk/:id/prechod` (Access identita alebo `adam:cli`) | → `schvalene` → `vydane` automaticky Workerom |

Ako Adam schvaľuje: `/t/desk` stĺpce podľa stavu; `/t/desk/<id>` ukazuje draft po vetách s číslom claimu, každý claim (text · typ · výrez · zdroj · `zdroj_typ` · stav overenia · `podla` · hash archívu · paywall · odkaz na `/api/raw` a `/t/archiv`), porovnanie titulkov, náhľad postu; tri tlačidlá (formulár POST): Schváliť / Vrátiť s poznámkou / Zamietnuť. Adam môže text upraviť pred schválením (formulár → `revizie`, validátor viet beží znova). Alternatíva bez prehliadača: `pnpm desk approve <id>` z hlavnej session so Service Tokenom `netopier-adam-cli` (D9), zapísané ako `schvalenia.kto='adam:cli'`; token `netopier-hlavna-session` na `schvalene`/`vydane` dostane 403 (test v I5). Články ostávajú Markdown v gite: `status: published` + `approvedBy` + push/deploy na pokyn (`docs/PUBLISHING.md`).

Režim bez LLM (kým Adam nerozhodne D2): triáž = `nalezy` (deterministické), reportér a redaktor = Adam vo formulári `/t/desk/novy` (post Minúty s claims, ten istý validátor viet), overovateľ = archivár (hash + dostupnosť + podreťazec výrezu), `ai_autorstvo = "Bez AI: napísal Adam Rudavský."`.

AI autorstvo: `autorstvo.ts` generuje **z `claims`, nie z počtu behov**: „Podklad zostavil agent reportér (Claude, `<model>`, beh #418). Z 9 tvrdení: 6 overených proti primárnemu zdroju, 2 podľa médií (Denník N, Pravda), 1 výklad; 0 bez odpovede (beh #419). Text napísal agent redaktor (beh #420). Schválil Adam Rudavský 20. 11. 2026 14:02.“ Slovo „primárny“ sa vypíše iba pre claims s `overenie.primarna_url` a `archiv_id` so `zdroj_typ='primarny'`; `smoke-live.mjs` porovná čísla v `.ai-autorstvo` s `SELECT typ, stav, count(*) FROM claims WHERE desk_id=? GROUP BY typ, stav`. Byline: „Hriech — AI redakcia · schválil Adam Rudavský · 14:02“. Komponent `Autorstvo.astro` (zovšeobecnený blok z `ArticleView`) pod každým postom, udalosťou, vydaním a článkom; `Proveniencia.astro` („Ako vznikol tento text“: reťaz behov, počty tvrdení po typoch a stavoch, archívy s Wayback odkazmi). Stránka `/o-hriechu/redakcia` s číslami z `behy_redakcie` a `claims`. Fakt / interpretácia / medzera: verejný text posty, zhrnutia a vydania sa **renderuje z `claims`** (`Tvrdenie.astro`, triedy `.tvrdenie--fakt|--interpretacia|--medzera|--podla`: plná, prerušovaná, bodkovaná linka, prefixy „Výklad:“, „Nevieme:“, atribúcia „podľa Denníka N“), nie z voľného Markdownu; inline formát iba tučné a odkaz cez `src/lib/inline.ts` (najprv escape HTML, potom `**…**` a `[text](https://…)`), test `test/inline.test.mjs` na XSS vstup a na väzbu čísla poznámky na claim. `signaly.implication` nikdy nevstupuje do textu ako fakt.

Paperclip (XDR-226): nie je potrebný; uzavrieť ako „prehodnotiť po Vianociach“.

---

## 5. Plochy

### 5.1 Verejný Hriech (print)

Tokeny v2 (`src/styles/global.css`, D5): `--paper:#f8f5ef`, `--ink:#161412`, `--muted:#5f5850`, `--rule:#d9d2c5` (1 px), `--rule-thick:3px`, `--pink:#f18fa0` iba `.wordmark` a `.post--pripnuty`; `--font-serif: 'Source Serif 4 Variable'`, `--font-sans: 'Source Sans 3 Variable'`, `--font-mono: 'IBM Plex Mono'`; `font-variant-numeric: tabular-nums` na číslach; `--radius: 0`, žiadne tiene (plastické `.button`, `.chip`, `.org-node` ostávajú iba v `/mapy/*`). Mriežka `.vydanie-grid` 12 stĺpcov na ≥ 1100 px s `column-rule`, 6 na 800–1100, 1 pod 800; hierarchia veľkosťami 44/32/24/20/18/15. `src/styles/print.css` pre `@media print`. Všetko bez JS; JS iba `FilterScript` na zoznamoch, hash-otváranie `details`, voliteľný ostrov `minuta-refresh.ts` (2 KB, dopĺňa posty z `/api/minuta.json` každých 60 s) a Web Analytics beacon.

| Trasa | Súbor | Render | Komponenty (`src/components/`) | Dáta (dopyty) |
|---|---|---|---|---|
| `/` titulka = dnešné vydanie | `src/pages/index.astro` (prepis; legacy hash redirect `#outlet-…` zrušený, kotvy ostávajú na `/mapy/redakcie`) | SSR, cache 60 s | `vydanie/Zahlavie` (HRIECH, dátum, „Vydanie č. N“, uzávierka, threat level slovom), `vydanie/Mriezka` (hlavná udalosť 7/12, stĺpec Minúta 3/12, zvody 2/12), `vydanie/HlavnaUdalost`, `minuta/Stlpec` (12 postov, pripnuté hore), `zvod/EkgMini`, `vydanie/Registre` („dnes v CRZ N zmlúv, z toho M s uvedenou sumou spolu X €“ — sumy až po overení sémantiky, do V1 iba počty; TED, kataster), `vydanie/Nalezy` (blindspoty dňa), existujúce `PublicationRows`, `MapCallout` | `getVydanie(latest)`, `getMinuta`, `getZvody`, `getRollup` |
| `/vydanie`, `/vydanie/[den]` | `src/pages/vydanie/…` | SSR | tá istá mriežka; archívny deň renderuje zo snapshotu R2 (`snapshot_sha256` v tiráži) | `getVydanie(den)` |
| `/minuta`, `/minuta/strana/[n]`, `/minuta/[slug]`, `/minuta.xml` | `src/pages/minuta/…` | SSR | `minuta/Post` (čas mono, tučná prvá veta, 1–2 vety, `<details>` „čítať ďalej · N slov“, štítky, trvalý odkaz `#post-<slug>`, pripnutý pás), `minuta/Suhrn` (súhrn dňa z `vydania.suhrn_md`), `Autorstvo` | `getMinuta`, `getPost` |
| `/udalosti`, `/udalosti/[slug]` | `src/pages/udalosti/…` | SSR | `udalost/Hlavicka` (titulok, čas + presnosť, miesto + presnosť, sila dôkazov), `udalost/PrvyPriniesol` („Prvý zo sledovaných kanálov: Denník N 09:14“; „o 41 min skôr“ iba ak obe strany majú presnosť na sekundy, inak „v tú istú hodinu“; agentúrne kópie sa nerátajú), `udalost/Pokrytie` (CSS pruhy podľa redakcií, „x z N sledovaných redakcií“, skryté kým N < 8), `udalost/Blindspot` (iba po zmeranej presnosti `entity-media` ≥ 0,8; formulácia „v sledovaných kanáloch sme nenašli zmienku o <entita> (N kanálov, obdobie)“, nikdy „nikto nepísal“), `udalost/PorovnanieTitulkov` (tabuľka zdroj · titulok · čas · archív), `udalost/Tvrdenia` (`Tvrdenie` s `<sup>` → `#c<id>`), `udalost/Registre` („čo hovoria registre“), `udalost/CasovaOs` (`<ol>`), `udalost/Zdroje` (zovšeobecnený `SourceRefs`: id, publisher, url, capturedAt, sha), `Proveniencia`, `Autorstvo` | `getUdalosti`, `getUdalost` |
| `/zvody`, `/zvody/[id]` | `src/pages/zvody/…` | SSR | `zvod/Stav` (stav + zamknutie + história), `zvod/Ekg` (inline SVG: `spolu` atrament, `registre` plná tmavá, `media` ružová, pásma ±20/±50 hairline, rozdiel vyšrafovaný = nález, posledný bod s číslom mono, `<title>` popisky bez JS), `zvod/Rozklad` (n, confirming/contradicting/neutral, istota), `zvod/SignalRiadok` (dátum · smer +/−/○ · sila · relevancia · zdroj s rozsahom · odôvodnenie), `zvod/Momentum` | `getZvody`, `getZvod` |
| `/seizmograf` (XDR-232) | `src/pages/seizmograf.astro` | SSR | `seizmograf/Kategorie` (category_scores × 30 dní), `seizmograf/Threat` (úroveň, dôvod, história), `seizmograf/Narativ` (claims → signály), `vydanie/Nalezy` | `getEkg`, `getRollup` |
| `/zdroje`, `/zdroje/[id]` | `src/pages/zdroje/…` | SSR | `zdroj/Karticka` (typ, rozsah, vlastník s odkazom `/mapy/redakcie/<outlet>`, bias/faktickosť iba so zdrojmi, WM tier/risk, pokrytie 30 d, prvý N×, blindspoty), `zdroj/Sparkline` (SVG), `zdroj/Rebricek` | `getZdroj`, `getZdroje` |
| `/archiv/[sha]` | `src/pages/archiv/[sha].astro` | SSR | D15: URL, kanonická URL, sha256, `captured_at`, status, veľkosť, `paywall`, výrez ≤ 300 znakov z claims, odkaz na originál a na Wayback; celá kópia nikdy (iba `/t/archiv`) | `getArchiv` |
| `/hladaj?q=&typ=` | `src/pages/hladaj.astro` | SSR, cache 60 s | formulár GET bez JS (pole aj v `BaseLayout`), výsledky po typoch (Minúta, udalosti, zvody, publikácie), prefixové FTS | `hladaj` (nad `minuta_fts`, `udalosti_fts`, `zvody`, `search.json`) |
| `/o-hriechu/redakcia` | `src/pages/o-hriechu/redakcia.astro` | SSR | linka, vzorec EKG, čísla z `behy_redakcie` | `getBehyStatistika` |
| `/publikacie/*`, `/pripady/*`, `/mapy/*`, `/o-hriechu`, `/rss.xml`, `/sitemap.xml` (index), `/sitemap-static.xml`, `/search.json` | existujúce | prerender | `ArticleView` s `Autorstvo` a `Tvrdenia` (claims cez `claimIds` vo frontmatteri) | git |
| `/sitemap-zive.xml`, `/minuta.xml`, `/vydanie.xml`, `/udalosti.xml` | `src/pages/*.xml.ts` | SSR, cache 1 h | – | `getMinuta`, `getUdalosti`, `getZvody`, `getVydania`, `getZdroje` (iba `verejne:true`) |
| Vianoce: `/stat`, `/stat/crz|ted|kataster|su-sr`, `/kalendar`, `/mapa`, `/demografia`, `/volby`, `/chronos`, `/opus` | `src/pages/…` | SSR / prerender | `stat/Tabulka` (z `.finance-table`), `stat/Sparkline`, `stat/Stlpce` (SVG), `kalendar/Odpocet` (server-side), `chronos/Os` (SVG), `mapa/Vrstvy` (MapLibre ostrov, bez JS zoznam parciel) | `statistika_rady`, `kalendar`, `records` kataster, `prieskumy`, `udalosti` |

`BaseLayout.astro`: navigácia Vydanie · Minúta · Udalosti · Zvody · Seizmograf · Zdroje · Publikácie · Mapy · O Hriechu + formulár Hľadať (GET `/hladaj`); `<link rel="alternate">` pre `/rss.xml`, `/minuta.xml`, `/vydanie.xml`, `/udalosti.xml`; `data-theme="print"`. `Icon.astro` + `clock`, `pin`, `pulse`, `calendar`, `source`, `check`, `archive`.

### 5.2 Terminál (interný, `netopier.hriech.xvadur.com`, za Access)

Astro SSR v `hriech-web`, `src/layouts/TerminalLayout.astro`, `src/styles/terminal.css`: pozadie `#0b0b0c`, text `#e8e2d6`, amber `#f2a900` na stavy a čísla, ružová iba krivka „médiá“, IBM Plex Mono 13 px, riadok 1,3; tri hustoty `data-density="1|2|3"` cez cookie (formulár `POST /t/nastavenia`); číslo pri každej položke (id, čas, počty, skóre, vek v minútach). Všetko formulármi a `<details>` bez JS; jediný ostrov `src/islands/terminal-klavesy.ts` (j/k riadky, Enter detail, `/` hľadanie, `a` schváliť, `x` zamietnuť, `d` hustota) je voliteľné vylepšenie. `src/middleware.ts`: podľa `Host` — terminálový host vyžaduje platný JWT (`pristup.ts`), inak 403; verejný host vracia 404 na `/t/*`. Cache hlavičky sa nastavujú **na každej odpovedi**, lebo Workers Caching kľúčuje cestu bez hostu a 200 bez `Cache-Control` by sa cachovalo 2 h: terminálový host (každá cesta, každý status, aj 403/404/303) a `/t/*` na ktoromkoľvek hoste → `Cache-Control: private, no-store`; verejný host + GET + SSR trasa → `public, max-age=60, stale-while-revalidate=300`; `Set-Cookie` iba `POST /t/nastavenia`. Test `test/middleware.test.mjs` prejde všetky kombinácie host × cesta × status; `smoke-live.mjs` po hite `/t/desk` s JWT overí, že GET `hriech.xvadur.com/t/desk` vráti 404 bez `Cf-Cache-Status: HIT` a `/t/desk` má `BYPASS`.

| Trasa | Obsah |
|---|---|
| `/t` | zber `health` (records za 24 h po zdroji z indexu, celkové počty z `pocty` — žiadny plný sken, runs, `failing_channels` červeno), desk počty podľa stavu, EKG obe krivky 7 dní, threat level, posledné behy agentov, veľkosť D1 (`page_count × page_size`) s hranicou 5 GB/10 GB, expirácia Service Tokenov |
| `/t/desk`, `/t/desk/[id]`, `/t/desk/novy` | stavový stroj, položka s podkladom, claims, prechody, náhľad; formuláre Schváliť / Vrátiť / Zamietnuť; ručný post (režim bez LLM) |
| `/t/zaznamy`, `/t/zaznamy/[id]` | River: filtre zdroj/kanál/entita/FTS `q`/dátum, keyset stránkovanie, verzie, `data` ako tabuľka, raw z R2 |
| `/t/udalosti`, `/t/udalosti/[id]` | všetky stavy, `suggested` rozhodnutia so skóre, formuláre merge/split, väzby na registre |
| `/t/registre` | `register_udalosti` s číslami (sumy, CPV, výmery), číselníky CRZ |
| `/t/zvody`, `/t/zvody/[id]` | tabuľka skóre po krivkách, EKG 90 dní, signály, ručná zmena stavu s dôvodom, zamknutie |
| `/t/signaly` | denný zoznam `navrh`/`potvrdeny`, úprava `signal_zvody` |
| `/t/nalezy` | nálezy dňa podľa druhu, prijať / zamietnuť; `blindspot` iba tu a v triáži, kým `entity-media` nemá presnosť ≥ 0,8; vzorka 50 párov na ručné označenie |
| `/t/entity`, `/t/entity/[id]` | IČO/osoba, záznamy CRZ/TED/kataster, udalosti, `sledovane` prepínač, `druh` oprava (fyzická osoba viditeľná iba tu) |
| `/t/zdroje` | kartičky, editácia hodnotenia so zdrojmi, štatistika, pozastavené kanály |
| `/t/archiv`, `/t/archiv/[id]` | `archiv` riadky, overenie hashu, celá kópia a extrahovaný text (iba tu), `paywall`, Wayback odkaz, stiahnutie; ručné prepnutie `zdroj_typ` |
| `/t/behy` | `runs`, `behy_redakcie` s tokenmi a odkazmi na R2 vstup/výstup, DLQ, `zalohy`, `archiv_mesiace` |

---

## 6. Rozloženie súborov

### `hriech/` (koreň, `hriech-web`)

Pribudne:
```
pnpm-workspace.yaml            packages: [netopier/zber, netopier/redakcia]  (allowBuilds ostáva)
netopier/redakcia/             package.json (@netopier/redakcia), tsconfig, vitest.config.ts,
                               src/{schema,stavovy-stroj,skore,autorstvo,pristup,format}.ts, src/dopyty/*.ts,
                               kontrakty/*.schema.json, test/{skore,stavovy-stroj,dopyty,autorstvo}.test.ts,
                               test/fixtures/openclaw/{scoring.js,status.js,evidence.json,signal.json,predictions.json,narrative.json,threat.json}
src/worker-configuration.d.ts  (wrangler types) Env: DB, ASSETS, NETOPIER, vars
src/env.d.ts                   App.Locals { aktor?: Aktor } (bez Runtime<Env>: adaptér 14 nemá Astro.locals.runtime; ctx je Astro.locals.cfContext)
src/middleware.ts              host routing, Access JWT, cache SSR
src/lib/db.ts                  import { env } from 'cloudflare:workers'; env.DB → dopyty z @netopier/redakcia s verejne:true
src/lib/inline.ts              escape + tučné + odkaz + [^cN] (žiadna Markdown knižnica za behu)
.github/workflows/deploy.yml   workflow_dispatch: migrate → deploy-zber → deploy-web; rollback (D18)
src/lib/ekg.ts                 body → SVG path (čistá funkcia, test)
src/lib/sources.ts             zovšeobecnený SourceRef
src/layouts/TerminalLayout.astro
src/styles/print.css, src/styles/terminal.css
src/components/{Autorstvo,Proveniencia,Tvrdenie}.astro
src/components/vydanie/{Zahlavie,Mriezka,HlavnaUdalost,Registre,Nalezy}.astro
src/components/minuta/{Post,Stlpec,Suhrn}.astro
src/components/udalost/{Hlavicka,PrvyPriniesol,Pokrytie,Blindspot,PorovnanieTitulkov,Tvrdenia,Registre,CasovaOs,Zdroje}.astro
src/components/zvod/{Ekg,EkgMini,Stav,Rozklad,SignalRiadok,Momentum}.astro
src/components/seizmograf/{Kategorie,Threat,Narativ}.astro
src/components/zdroj/{Karticka,Sparkline,Rebricek}.astro
src/components/terminal/{Tabulka,DeskPolozka,Prechody,Filtre}.astro
src/pages/{vydanie,minuta,udalosti,zvody,zdroje,archiv}/…, seizmograf.astro, hladaj.astro, o-hriechu/redakcia.astro, minuta.xml.ts, vydanie.xml.ts, udalosti.xml.ts, sitemap-static.xml.ts, sitemap-zive.xml.ts
src/pages/api/{minuta.json,ekg.json,zvody.json,hladaj.json}.ts, api/udalosti/[slug].json.ts, api/zvody/[id].json.ts, api/vydanie/[den].json.ts, api/zdroje/[id].json.ts
src/pages/t/{index,desk/index,desk/[id],desk/novy,zaznamy/index,zaznamy/[id],udalosti/index,udalosti/[id],registre,zvody/index,zvody/[id],signaly,nalezy,entity/index,entity/[id],zdroje,archiv,behy,nastavenia}.astro
src/pages/t/api/[...cesta].ts
src/islands/{minuta-refresh,terminal-klavesy}.ts
contracts/redakcia/v1/{triaz,reporter,overovatel,redaktor}.schema.json   (kópia z hriech-redakcia; test kontrakty-zhoda porovnáva hash)
scripts/{smoke-live,seed-dev,desk,overit-kanaly,check-d1-id,fiki-zaloha}.mjs
test/{ekg,middleware,smoke-rules,inline,kontrakty-zhoda}.test.mjs
docs/{REDAKCIA.md,METODIKA-ZDROJE.md (kostra + vzorka entity-media + overenie CRZ),VYDANIE.md}
                               (ADR-009/010/011 idú do netopier/docs/DECISIONS.md k ADR-001…008, nie do nového docs/adr/; HLAS.md žije v hriech-redakcia)
```
Zmení sa: `astro.config.mjs` (adaptér cloudflare 14: `configPath`, `persistState`, `session: false`; tvar možností overený proti `index.d.ts` pri inštalácii), `wrangler.jsonc` (časť 1: `main: "@astrojs/cloudflare/entrypoints/server"`, `cache.enabled`), `package.json` (`@astrojs/cloudflare@14`, `jose`, fonty, skripty, `wrangler types`), `src/layouts/BaseLayout.astro` (hľadanie, rel=alternate), `src/styles/global.css` (tokeny v2), `src/pages/index.astro`, `src/pages/sitemap.xml.ts` (index), `src/lib/content.ts` (`formatTime` z `@netopier/redakcia/format`), `src/content.config.ts` (`claimIds` vo frontmatteri), `src/components/{ArticleView,SourceRefs,Icon}.astro`, `scripts/verify-public-build.mjs` (zoznam SSR prefixov `/`, `/minuta`, `/udalosti`, `/zvody`, `/vydanie`, `/zdroje`, `/seizmograf`, `/hladaj`, `/archiv`, `/api`, `/t` sa v sitemape lokálne nekontroluje — overuje ich `smoke-live.mjs` cez HTTP 200; assert `dist/index.html` nahradený kontrolou `dist/404.html` + statických stránok; limit 40 000 B pre `/` sa presúva do smoke), `docs/PUBLISHING.md` (GitHub Actions ako alternatíva k Macu), `README.md`, `CLAUDE.md`, `AGENTS.md`, `PRODUCT.md` (terminál a AI redakcia namiesto „žiadna administrácia ani monitoring“), `DESIGN.md` (v2), `STACK.md` (rozhodnuté), `STATUS.md`, `.gitignore` (`work/`).
Zmaže sa: `docs/design-direction.md`, `src/pages/__preview/` (ak prázdny), iba `<script>` legacy hash redirectu v `index.astro` (`legacyDestination` v `publication-policy.mjs` a `test/publication-policy.test.mjs` ostávajú) → archív v jadre.

### `hriech/netopier/zber/` (`netopier-zber`)

Pribudne: `migrations/0002_zaklad.sql … 0005_redakcia.sql` (0006, 0007 neskôr; iba aditívne); `src/api/{router,pristup,zaznamy,entity,udalosti,register-udalosti,zvody,signaly,rollup,nalezy,desk,claims,archiv,behy,derive}.ts`; `src/derive/{index,normalize,entity,entity-media,text,udalosti,registre,pravidla,rollup,nalezy,pokrytie,zaloha,archiv-mesiac}.ts`; `data/{zvody-seed,zdroje-seed,zdroj-kanaly-seed,derive-kanaly,crz-ciselniky,klucove-slova,aktori,agenti,modely,register-druhy,entity-alias-seed}.json`; `scripts/{seed.mjs,derive-node.mjs}`; `test/{api,derive-udalosti,derive-sucasnost,derive-registre,derive-pravidla,entity-media,rollup,archiv,zaloha}.test.ts` (fixtures z lokálnej D1, `entity-media-vzorka.json` 50 párov).
Zmení sa: `wrangler.jsonc` (routes, crons, vars, limits, `workers_dev:false`, `cache.enabled`, producent a konzument `netopier-derive` s `max_concurrency: 1`), `src/types.ts` (`Job = ZberJob | DeriveJob | ArchivJob | ZalohaJob | ExportJob`, `DeriveJob = {krok, after, until}`, `Env` + vars), `src/plan.ts` (denné odvodenie ako správy), `src/index.ts` (router `/api/*`, druhý `queue` konzument, `scheduled` iba zaraďuje, `/health` s oknom 24 h a `pocty`, `/run*` cez JWT po I6), `src/sources/rss.ts` (vracia `raw` a `raw_item`), `src/archive.ts` (`raw` pre médiá, `record_entity`, `pocty`; FTS cez triggery), `README.md` (Access hlavičky v curl, postup zálohy a obnovy, `d1 export` iba po DROP FTS), `package.json` (závislosť `@netopier/redakcia: workspace:*`, `jose`).
Zmaže sa: `pnpm-workspace.yaml`, `pnpm-lock.yaml` (lockfile v koreni).

### `hriech/netopier/` (ostatné)

Ostáva a prepíše sa v I10: `contracts/` (events-v1 ako historická referencia; `openapi.json` nahradí OpenAPI z kontraktov 3.3, starý do archívu v jadre), `sources/slovak-core.yaml` (rozšíri sa podľa `overit-kanaly.mjs`, D7), `fiki/` (+ `README.md` s postupom zálohy a obnovy, D16), `data/`, `docs/DECISIONS.md` (ADR-001…008 + nové ADR-009 dva Workery a jedna D1, ADR-010 Python archivovaný, ADR-011 verejné texty a LLM), `docs/ARCHITECTURE.md` (diagram dvoch Workerov, jednej D1, front a R2 namiesto Miniflux → Postgres → FastAPI), `STATUS.md`, `STACK.md` (hranica: Worker nikdy nevolá LLM), `AGENTS.md`, `CLAUDE.md`. Hotové keď `grep -ri 'miniflux\|pgvector\|fastapi'` v `hriech/` (mimo archívu a `node_modules`) = 0.
Presunie sa do `xvadur_core/zdroje/hriech/archiv-2026-09/netopier-python/` a zmaže z repozitára (I10, D10): `src/netopier/`, `migrations/` (Alembic), `tests/`, `alembic.ini`, `pyproject.toml`, `compose.yaml`, `Dockerfile` (rozbitý: `COPY benchmarks`), `ops/`, `bin/`, `artifacts/`, `scripts/*.py`.

### Súkromný repozitár `xvadur/hriech-redakcia` (D3) a workspace `_claude/`

`hriech-redakcia/`: `agents/hriech-{triaz,reporter,overovatel,redaktor,archivar}.md`, `skills/redakcia/SKILL.md` (`/redakcia`), `docs/HLAS.md`, `contracts/v1/*.schema.json`, `validate.mjs`, `data/agenti.json`, `README.md` (ako routine klonuje, ako sa číta `git rev-parse HEAD` do `prompt_version`). Lokálne vyklonovaný do `projekty/hriech-redakcia/` (nový priečinok projektu, D3 [A]).
Workspace `_claude/`: `agents/hriech-*.md` a `skills/redakcia` ako symlinky do `projekty/hriech-redakcia/`; úprava `agents/hriech.md` (orchestrácia denného behu, `X-Beh`, tokeny z `~/.config/hriech/`). Routine dostane ten istý obsah cez klon repozitára, takže ručný beh z hlavnej session a routine bežia z jedného súboru.

---

## 7. Poradie stavby

Každý krok = úloha v Lineari (projekt **„Hriech + Netopier“** (P-XDR-6), míľnik Infra/Živé/Vianoce, štítok Kto, „Hotové keď“, blokovania podľa tabuliek); commit s číslom úlohy. Úlohy I0–V10 v Lineari dnes neexistujú (projekt má iba XDR-265, 258, 228, 229, 254, 197, 232, 231, 230): zakladajú sa po Adamovom schválení smeru a rozhodnutí D17; XDR-232/231/197/254 ostávajú a pripájajú sa ako závislé; XDR-230 sa uzavrie, až keď úlohy existujú. Kroky [A] vyžadujú Adama.

### Míľnik Infra — 31. 10. 2026

| # | Krok | Kto | Hotové keď | Dôkaz |
|---|---|---|---|---|
| I0 | Prvý krok (časť B): workspace, `@netopier/redakcia` + `skore.ts` parity, `0002_zaklad.sql` s FTS5 externým obsahom a triggermi, normalize + entity nad lokálnou D1, `check-d1-id.mjs`, `overit-kanaly.mjs` | Agent | testy zelené, počty podľa B, DELETE odstráni riadok z FTS | výstup `pnpm -r test`, `wrangler d1 execute --local` |
| I1 [A] | D1: Workers Paid, `d1 create`, R2 (lifecycle `raw/rss/` 90 dní), fronty `netopier-zber-jobs` + `netopier-derive`, secret `ZBER_TOKEN` (dočasne), rovnaké `database_id` do oboch `wrangler.jsonc`, deploy `netopier-zber` (XDR-258, XDR-228); hneď `POST /run/crz?sync=1` pod `wrangler tail` (limit 1 000 dopytov na invokáciu); Cloudflare notifikácia na D1 storage | Adam rozhodne, agent nasadí na pokyn | `/health` 48 h po sebe (okno 24 h, nie plný sken), `runs` bez systémových chýb, žiadna chyba „Too many API requests“ | `/health` po 1/24/48 h, `wrangler tail` výpis |
| I2 | Migrácie 0003–0005 lokálne + remote (bookmark Time Travel do Linearu pred `apply --remote`); seedy `zdroje`, `zdroj_kanaly`, `crz_ciselniky` (so `zdroj_url`), `register-druhy`, `aktori`; `slovak-core.yaml` podľa výstupu `overit-kanaly.mjs` (D7), WM zúžený (104 kanálov); `DeriveJob` vo fronte `netopier-derive` | Agent | `SELECT count(*) FROM zdroje` ≥ 120; každý outlet z `editorial-organization-map.json` má riadok v `zdroje` s `outlet_id`; RSS ≥ 300 SK záznamov denne; `records.raw_key IS NULL` pre nové médiá = 0; `failing_channels` bez SK kanálov | `/health`, `wrangler d1 execute` |
| I3 | `derive/udalosti.ts` + `derive/text.ts` (port `events.py`, `text.py`, testy `test_events.py` 1:1 do vitestu, ≥ 30 slovies), `agentura`, `udalost_pokrytie` s `prvy_at_presnost`, `prvy_*` per redakcia; benchmark na archivovaných pároch z jadra; `derive-sucasnost.test.ts` (dve súbežné správy → 0 duplicít) | Agent | z 24 h SK RSS vznikne ≤ 40 % udalostí na počet záznamov; 0 falošných zlúčení na benchmark páre; Wadephul–Lavrov (Pravda/TASR 15:25 vs. Denník N) nedá „prvý Pravda“ | `derive-udalosti.test.ts`, `GET /api/udalosti?since=-24h` |
| I4 | `derive/registre.ts`, `derive/pravidla.ts`, `derive/rollup.ts`, `derive/nalezy.ts`, `derive/pokrytie.ts`, `derive/entity-media.ts` (+ vzorka 50 párov), cron `20 6` → `DERIVE` | Agent | `rollup_denne` má riadok 7 dní po sebe; `register_udalosti` > 0 pre každý zdroj; `suma` NULL pre 0∧0; presnosť `entity-media` zapísaná v `docs/METODIKA-ZDROJE.md` | `GET /api/rollup/latest`, počty |
| I5 | Interné API `/api/*` (čítanie aj zápis), `pristup.ts` (JWT, `common_name` → aktér podľa `aktori.json`, `X-Beh`), kontrakty, validátor viet `draft.ts`, overenie výrezu, `api.test.ts` (Ajv + nepovolené prechody + `netopier-routine`/`netopier-hlavna-session` dostanú 403 na `schvalene`; veta bez claimu → 422; výrez mimo textu → 422; paywall → max `nerozhodnute`) | Agent | všetky cesty z 3.3 odpovedajú a validujú; `curl` bez JWT 403 | test log, curl |
| I6 [A] | Domény `api.hriech.xvadur.com`, `netopier.hriech.xvadur.com` (D4): `wrangler deploy` → `curl -sI https://api.hriech.xvadur.com/health` (TLS handshake; ak certifikát nevznikne, prvá úroveň `api-hriech.xvadur.com`); Access aplikácie `Netopier terminál`, `Netopier API`, `Netopier health` (Bypass); Service Tokeny `netopier-routine`, `netopier-hlavna-session`, `netopier-adam-cli` na 2 roky + notifikácia expirácie; `/run*` prepnúť na JWT a zmazať `ZBER_TOKEN`; README curl s `CF-Access-Client-Id/Secret` | Adam v dashboarde, agent konfiguráciu | OTP prihlásenie funguje; každý token dostane 200 na `/api/zvody`; `adam-cli` 200 a `hlavna-session` 403 na `prechod schvalene`; `GET /health` bez hlavičiek 200 | screenshot, curl |
| I7 | `hriech-web`: `@astrojs/cloudflare@14` (`configPath`, `persistState`, `session: false`), `main: "@astrojs/cloudflare/entrypoints/server"`, `cache.enabled`, `wrangler types`, `src/lib/db.ts` cez `cloudflare:workers`, middleware (host, JWT, cache hlavičky), `TerminalLayout`, `/t`, `/t/zaznamy`, `/t/udalosti`, `/t/registre`, `/t/behy`; `verify-public-build.mjs` prepísaný (zoznam SSR prefixov sa v sitemape lokálne nekontroluje; `index.html`/`404.html` asserty idú do smoke); `legacyDestination` ostáva v `publication-policy.mjs` (test ostáva), maže sa iba `<script>` v `index.astro`; `smoke-live.mjs` v `pnpm qa` | Agent | `pnpm qa` zelené; `wrangler deploy --dry-run` bez KV bindingu; `wrangler dev` renderuje `/t/zaznamy` z lokálnej D1 cez `persistState`; 403 bez JWT; `/t/*` na verejnom hoste 404 s `Cache-Control: private, no-store`; druhý GET `/` má `Cf-Cache-Status: HIT`, `/t/desk` `BYPASS` | qa log, screenshot, curl -I |
| I8 | `derive/zaloha.ts` (aj `records` prírastok) + `derive/archiv-mesiac.ts` (export každého uzavretého mesiaca hneď) + crony; skúška obnovy: nová lokálna/test D1 `netopier-zber-test` → import `zalohy/` + `export/records/` → počty sedia; `wrangler d1 time-travel info` zapísaný | Agent | prvý `zalohy` riadok a `archiv_mesiace` riadok pre 2026-09 so sha256; obnova na test DB prešla; postup obnovy v `netopier/zber/README.md` | `/t/behy`, výpis obnovy |
| I9 [A] | Repozitár `xvadur/hriech-redakcia` + cloud environment `hriech` (D3); agenti + `/redakcia --dry-run` nad lokálnou D1 z hlavnej session a ten istý dry-run z routine (bez zápisu, JSON validuje) | Adam založí repozitár a environment, agent obsah | dry-run dá ≤ 10 kandidátov s dôvodmi a podklad s claims pre 1 udalosť; routine dostane 200 z `GET /api/zvody` cez API credential | výstup v hlavnej session, log routine, `validate.mjs` OK |
| I10 | Python vrstva archivovaná do jadra a zmazaná (D10); ADR-009/010/011 v `netopier/docs/DECISIONS.md`; prepísané `netopier/STATUS.md`, `README.md`, `STACK.md`, `docs/ARCHITECTURE.md` (dva Workery, jedna D1), `AGENTS.md`, `CLAUDE.md`, `contracts/openapi.json` (nahradený OpenAPI z 3.3, starý do archívu v jadre), `hriech/README.md`, `CLAUDE.md`, `AGENTS.md`, `PRODUCT.md` (terminál, AI redakcia) | Agent | `ls netopier` bez `src/`; `grep -ri 'miniflux\|pgvector\|fastapi' projekty/hriech --exclude-dir=node_modules` = 0 mimo archívu; `pnpm -r qa` zelené | commit |
| I11 | Fiki záloha (D16): `scripts/fiki-zaloha.mjs` (`wrangler r2 object put zalohy/fiki/<den>/fiki.sqlite` + `raw/` tar.gz), volaný z `/redakcia --tyzden`; `netopier/fiki/README.md` s postupom obnovy | Agent | prvý objekt v R2 `zalohy/fiki/` so sha256 v `zalohy` | `wrangler r2 object get` |
| I12 [A] | `.github/workflows/deploy.yml` (`workflow_dispatch`: `migrate` → `deploy-zber` → `deploy-web`; job `rollback` s parametrom Workera a verzie), secret `CLOUDFLARE_API_TOKEN` (D18); `docs/PUBLISHING.md` s alternatívou k Macu; skúška: `rollback` na `hriech-web` z GitHubu a späť | Adam vytvorí API token a secret, agent workflow | jeden deploy oboch Workerov a jeden rollback prešli z GitHubu bez Macu | log workflow, `wrangler deployments list` |

### Míľnik Živé — 30. 11. 2026

| # | Krok | Termín | Hotové keď | Dôkaz |
|---|---|---|---|---|
| Z1 | Desk API, `claims` (nové stavy), `archiv` (text, paywall, Wayback), `schvalenia`, `revizie`; `/t/desk`, `/t/desk/[id]`, `/t/desk/novy`; `pnpm desk` s `netopier-adam-cli` | 5. 11. | Adam schváli testovací post formulárom aj z CLI; `schvalenia` má riadky `kto='adam:<email>'` a `kto='adam:cli'`; `netopier-hlavna-session` dostane 403 na `schvalene` | riadky D1, test |
| Z2 | Minúta live: `minuta_posty`, `/minuta*`, `/minuta.xml`, stĺpec na titulke, `Tvrdenie` z claims, `Autorstvo` z claims, `Proveniencia`; `/hladaj` + `/api/hladaj.json` nad `minuta_fts`; `sitemap-zive.xml` | 8. 11. | prvý schválený post je na hriech.xvadur.com do 60 s bez buildu, bez JS, s bylinou z claims; `curl '/hladaj?q=zmluva'` vráti ≥ 1 výsledok z Minúty; post je v `sitemap-zive.xml` a `<link rel=alternate>` ukazuje na `/minuta.xml` | URL, `curl` s vypnutým JS |
| Z3 [A] | Zvody v1 (D6): `zvody-seed.json` schválený a zamknutý; `signal_zvody` z kľúčových slov a entít; `zvod_skore_denne` denne | 12. 11. | 7 dní po sebe riadky pre každý zvod × 3 krivky | `SELECT count(DISTINCT den)` = 7 |
| Z4 [A] | Redakčná linka (D2): agenti, `/redakcia`, `behy_redakcie` s R2 vstupom/výstupom, `X-Beh`, validácia, prvé ručné behy | 18. 11. | 5 po sebe idúcich dní beh ok a Adam schválil ≥ 1 post denne; každý vydaný text má 0 viet bez claimu | `/t/behy`, `schvalenia`, smoke `.tvrdenie` = počet viet |
| Z5 | Udalosť ako Ground News: `/udalosti/[slug]` s pokrytím („x z N sledovaných redakcií“), „prvý zo sledovaných kanálov“ s presnosťou času, porovnaním titulkov, claims s archívom a `/archiv/[sha]` podľa D15; `/udalosti.xml`; `/hladaj` aj nad `udalosti_fts` | 18. 11. | ≥ 10 udalostí `verejna=1` s ≥ 2 nezávislými redakciami (bez agentúrnych kópií); `SELECT count(*) FROM claims WHERE typ='fakt' AND stav NOT IN ('overene_primarne','overene_sekundarne') AND desk_id IN (vydane)` = 0; `/archiv/<sha>` neobsahuje viac než 300 znakov cudzieho textu | URL, SQL, smoke |
| Z6 | Prvé články (XDR-231): CRZ článok a „Fico nemusí čítať vaše články“ cez linku (claims + archív), `claimIds` vo frontmatteri, `ArticleView` s `Tvrdenia` | 20. 11. | 2 články `published` s `approvedBy`, každé tvrdenie overené alebo označené ako výklad | URL, `pnpm qa` |
| Z7 [A] | Print redizajn (D5, D13, D17): tokeny v2, mriežka, serif, mono, `print.css`, `DESIGN.md` v2; kartičky zdrojov `/zdroje/[id]` v1 fakty (D8) | 25. 11. | Adam schválil vizuál na živom webe; Lighthouse a11y ≥ 95; mobil 375 px bez horizontálneho scrollu; každý z 10 outletov mapy má kartičku s vlastníkom z mapy, kanály bez RSS označené „bez RSS“, ostatné sledované zdroje „vlastník: nezistené“ | screenshoty, Lighthouse |
| Z8 [A] | Seizmograf (XDR-232, D3): `/zvody`, `/zvody/[id]` s EKG (dve krivky), `/seizmograf`, routiny `hriech-redakcia-rano|vecer|tyzden` z environmentu `hriech` | 27. 11. | modul živý s dátami 7 dní, ≥ 1 zvod `vznikajuce` s odôvodnenými signálmi, 3 behy routine za sebou ok so `spustil='routine:*'` a `prompt_version` = commit hash | URL, `/t/behy` |
| Z9 | Denná titulka ako vydanie: `vydania`, `/`, `/vydanie/[den]`, snapshot do R2, RSS vydania; `Registre` na titulke iba počty („N zmlúv, z toho M s uvedenou sumou spolu X €“ až po overení sémantiky) | 30. 11. | 7 po sebe idúcich vydaní schválených Adamom; každý archívny deň má `snapshot_sha256`; druhý GET `/` `Cf-Cache-Status: HIT` | `/vydanie`, R2 objekty, curl -I |

### Míľnik Vianoce — 31. 12. 2026

| # | Krok | Hotové keď | Dôkaz |
|---|---|---|---|
| V1 | Štátny dashboard `/stat/*`: `statistika_rady` (rozbalený JSON-stat 6 datasetov), CRZ po rezortoch (číselník so `zdroj_url`), TED filter SK obstarávateľ, kataster verzie; overená sémantika objednávateľ/dodávateľ a súm na 20 zmluvách proti crz.gov.sk → `register-druhy.json` `overene_at`, `rola` prepnutá zo `strana_a|strana_b` na `objednavatel|dodavatel`, `crz_*` pravidlá na `potvrdeny` | 6 tabuliek live, čísla sedia s `wrangler d1 execute` kontrolou, výsledok overenia v `docs/METODIKA-ZDROJE.md` | URL, porovnanie |
| V2 | Rebríček redakcií `/zdroje` (prvý zo sledovaných, podiel „x z N“, blindspoty, normalizovaná pozornosť za 30 dní) | rebríček live s 30 dňami a N ≥ 8 sledovaných redakcií | URL |
| V3 | Kalendár a odpočet `/kalendar` (`kalendar` z TED lehôt, CRZ účinností, ručné termíny NR SR/voľby), odpočet na titulke server-side | ≥ 20 termínov so zdrojom | URL |
| V4 | Demografia `/demografia` (om2019rs, om2801ms, kz1020rs → SVG) | 3 grafy live | URL |
| V5 | Chronos `/chronos` (udalosti + kalendár + zvody + `udalost_rodokmen` na jednej SVG osi) + článok Zeitgeber (XDR-197) cez linku | os live, článok `published` | URL |
| V6 | Voľby a prieskumy `/volby`: `prieskumy` (ručný seed s URL a archívom na každý riadok, agent dopĺňa z verejných zdrojov) | ≥ 10 prieskumov s citáciou | URL |
| V7 | Mapa s vrstvami `/mapa`: kataster po stránkach WFS ako samostatné správy, GeoJSON z R2 (D11), miesta udalostí; MapLibre ako jediný JS ostrov, bez JS zoznam parciel a tabuľka; test vo vitest s 3 stránkami | 2 oblasti + vrstva udalostí live; pamäť jednej správy < 64 MB v `wrangler tail` | URL |
| V8 | Opus Major `/opus`: statická kolekcia z exportu Notionu (rozcestník) | stránka live | URL |
| V9 | OSINT vrstva: `0007_ftm.sql`, konektory `rpo.ts` (REST), `ruz.ts`, `rpvs.ts`, `sledovane`, nález `zmena_registra`, `/t/entity` rozšírený; `entity_alias` z RPO | 100 entít so vzťahmi, 1 nález z krížovej kontroly | D1 počty, terminál |
| V10 | Retencia `records` (DELETE mesiacov starších než 6 po overení sha256 exportu z I8), retencia raw, blindspot verejne (ak presnosť `entity-media` ≥ 0,8), ľudské merge/split udalostí (`/t/udalosti/[id]`) | D1 < 3 GB; 1 merge + 1 split cez formulár; blindspot na `/udalosti/[slug]` iba s formuláciou „v sledovaných kanáloch sme nenašli zmienku o <entita> (N kanálov, obdobie)“ | `/t/behy`, `udalost_rodokmen` |

### Moduly XDR-230 v poradí (hotové keď: návrh + úlohy v Lineari + Adam schválil)

| # | Modul | Dáta | Plocha | Krok |
|---|---|---|---|---|
| 1 | Mapa s vrstvami | `records` kataster (R2 GeoJSON), `udalosti.miesto` | `/mapa` | V7 |
| 2 | Štátny dashboard | `register_udalosti`, `statistika_rady`, `crz_ciselniky` | `/stat/*` | V1 |
| 3 | Voľby a prieskumy | `prieskumy` | `/volby` | V6 |
| 4 | Kalendár a odpočet | `kalendar` | `/kalendar`, titulka | V3 |
| 5 | Minúta po minúte | `minuta_posty`, `minuta_fts` | `/minuta*`, stĺpec titulky, `/hladaj` | Z2 |
| 6 | Analýza spravodajstva | `udalosti`, `udalost_pokrytie`, `nalezy`, `zdroj_pokrytie_denne` | `/udalosti*`, `/seizmograf` (blindspoty), Seizmograf/zvody XDR-232 | Z5, Z8 |
| 7 | Rebríček redakcií | `zdroje`, `zdroj_kanaly`, `zdroj_pokrytie_denne` | `/zdroje` | Z7 (kartičky), V2 (rebríček) |
| 8 | Chronos | `udalosti`, `kalendar`, `zvod_stav_historia`, `udalost_rodokmen` | `/chronos` | V5 |
| 9 | Demografia | `statistika_rady` | `/demografia` | V4 |
| 10 | Opus Major | export Notionu (git) | `/opus` | V8 |

Poradie stavby sa riadi termínmi v Lineari (XDR-231 20. 11., XDR-232 27. 11., XDR-197 31. 12.), preto Minúta, udalosti a zvody idú pred modulmi 1–4. Vyhľadávanie (`/hladaj`), sitemapa živého obsahu a archív podľa D15 nie sú moduly XDR-230, ale podmienky Z2/Z5.

---

## 8. Čo sa použije a čo zahodí

**Použije sa:**

| Kód | Ako | Dôvod |
|---|---|---|
| `netopier/zber/` celý: 6 konektorov, `archive.ts`, `plan.ts`, `util.ts`, `types.ts`, `data/*.json`, 27 testov, `zber-node.mjs`, migrácia 0001 | rozšíri sa o `derive/`, `api/`, nové migrácie; mená ostávajú | hotové, lokálne overené, lokálna D1 s 14 299 záznamami je testovací dataset |
| `src/index.ts` `runJob`, `CONNECTORS`, `/health`, `/run` | zaradí `DeriveJob` po zbere; `/health` rozšírený | vzor batch dopytov |
| Python čisté moduly: `text.py`, `events.py` (pravidlá, príznaky, prahy), `benchmark.py` (evaluate), `test_events.py` | port 1:1 do `derive/text.ts`, `derive/udalosti.ts`, `derive-udalosti.test.ts` | prenositeľné bez DB; testy sa nestrácajú |
| `contracts/events.example.json` (events-v1) | názvy polí `udalosti`, filtre API | konzistencia |
| openclaw `scoring.js`, `status.js`, tvary `signal/predictions/narrative/evidence.json` | `skore.ts`, `stavovy-stroj.ts`, tabuľky 0004, parity test | presný model EKG; scratchpad je dočasný, preto kópia v I0 |
| Hriech: `BaseLayout`, `publication-policy.mjs`, `content.config.ts`, `ArticleView`, `PublicationFeed/Rows`, `FilterScript`, `.records/.record`, `.relation-line`, `.finance-table`, `SourceRefs` (zovšeobecnený), `newsrooms.ts` (evidenceState štítky, vlastnícka reťaz), `verify-public-build.mjs`, `merge-newsroom-fragments.mjs` vzor, Ajv, `rss.xml.ts`/`xml.ts`, `nahlad/` mechanizmus, `Icon` | verejné plochy, terminál, kontrakty | brána `isPublic` ostáva pre články; ten istý princíp (jedna funkcia rozhoduje) je v `dopyty` s `verejne:true` |
| `editorial-organization-map.json` + kontrakt | `zdroje.outlet_id`, `entity.map_*`, vlastník na kartičke | jediné dáta o médiách |
| Fiki korpus | ostáva lokálny (`data/fiki/fiki.sqlite`, `raw/`), týždenná záloha do R2 `zalohy/fiki/` (I11, D16); sync nových videí ručne v týždennom behu, kým YouTube blokuje IP Macu (XDR-254) | súkromie surových prepisov: raw prepisy nikdy do D1, API ani promptu; neskôr `records` source `fiki` iba na pokyn |

**Zahodí sa (archív v jadre), dôvod:**

| Kód | Dôvod |
|---|---|
| Python runtime: `archive.py`, `embeddings.py`, `stories.py`, `feed.py`, `api.py`, `pipeline.py`, `miniflux.py`, `sources.py` (bootstrap), `database.py`, `config.py`, Alembic 0001–0006, `compose.yaml`, `Dockerfile`, `ops/`, `artifacts/` | viazané na Postgres/pgvector/Miniflux (LATERAL, advisory locky, `vector(384)`, `text[]`), nebeží od 7. 9., Python 3.12 chýba, Dockerfile nezostaví; D1 nemá vektory; prenos = prepis, nie presun; výsledok 54 udalostí z 56 článkov nedokázal hodnotu embeddingov |
| Miniflux (ADR-002) | Worker RSS ho nahradil; dva zbery = dva archívy |
| Príbehy (`stories`, centroid 0,83, `feed_snapshots` 24 h) | jednotka je udalosť; feed nahrádza vydanie a Minúta |
| `.impeccable/`, `docs/design-direction.md`, plastické tiene na verejných plochách, `<script>` legacy hash redirectu v `index.astro` | print redizajn (D5); tiene ostávajú iba v `/mapy/*`; `legacyDestination` v `publication-policy.mjs` a jeho test ostávajú |
| Kontentless `records_fts`, `platformProxy`/`Astro.locals.runtime`, `main: ./dist/_worker.js`, Service Token `netopier-agenti`, „D1 Time Travel na kópiu“ | nahradené v revízii: FTS s externým obsahom, adaptér 14 (`cloudflare:workers`), token na spúšťač, JSONL záloha + export mesiacov |
| STACK.md návrhy Neon Postgres, Fly.io, vis-timeline, NumberFlow, Tremor/visx, D3 | mimo Cloudflare alebo JS pre základný obsah; server-side SVG stačí; MapLibre iba `/mapa` |
| World Monitor platené dáta, Workers AI/Vectorize | D12; embeddingy až po vyhodnotení I3 |

---

## 9. Riziká a limity

| Riziko | Číslo | Opatrenie |
|---|---|---|
| D1 strop 10 GB | lokálna D1: 25 227 264 B / 14 299 riadkov = 1,76 KB/záznam bez FTS a `record_entity`; s FTS5, `record_entity` a indexmi ≈ 2,3 KB; 10–25 tis. denne → 23–58 MB/deň → 5 GB v cene za 3–7 mesiacov, 10 GB za 6–14 mesiacov; nad 5 GB +0,75 $/GB-mes. | WM zúžený na `europe`+`gov` a jazyky sk/cs/hu/pl/de/en (104 zo 155, −33 %), summary WM ≤ 600 znakov, `raw_item` ≤ 8 KB, kataster geometria v R2; export každého uzavretého mesiaca hneď (I8) a DELETE mesiacov > 6 po overení sha256 (V10); veľkosť D1 na `/t` a Cloudflare notifikácia na D1 storage (I1); index iba kde je dopyt (každý index = ďalší zapísaný riadok; FTS5 zápisy sa tiež účtujú — odhad 7–9 účtovaných riadkov na záznam, teda 2–7 mil. z 50 mil./mes.; premerať po prvom týždni v produkcii z `/t/behy` a zapísať sem) |
| D1 čítania a full scan | `COUNT(*) FROM records GROUP BY source` bez okna = plný sken pri každom `/t` a `/health`, pri miliónoch riadkov desiatky miliónov účtovaných riadkov na dopyt a limit 30 s | `health()` počíta iba okno 24 h (`WHERE collected_at >= ?`, index `records_source_collected`), celkové počty z tabuľky `pocty` udržiavanej v `archiveChannel`; `record_entity`, `published_at_utc`, `records_fts`; keyset stránkovanie; Workers Caching 60 s pre verejné SSR aj `/health`; `db.batch` pre titulku |
| D1 dopyty na invokáciu | 1 000 dopytov na invokáciu (Paid), lokálne sa nevynucuje; CRZ deň = 3 026 záznamov = 61 batchov + `runs` | strop ≤ 200 batchov na správu v `derive/*` a backfilloch, pokračovanie novou správou; I1 spustí `POST /run/crz?sync=1` pod `wrangler tail`; ak sa `batch` počíta po statementoch, deň CRZ sa delí na viac správ |
| Súbežnosť odvodenia | konzument bez `max_concurrency` škáluje na 250; dve dávky nad tým istým kurzorom prepisujú `udalosti`/`udalost_dokazy` | fronta `netopier-derive` s `max_concurrency: 1`; pevné rozsahy id v správe; `INSERT OR IGNORE`; kurzor v jednom `db.batch` s výsledkami; `derive-sucasnost.test.ts` |
| Workers CPU | `limits.cpu_ms` 60 000 pre `fetch`/`queue`; cron `*/30` má pevných 30 s CPU, `20 6` 15 min; CRZ 3,4 MB XML; derive O(n·k) | `scheduled` iba zaraďuje správy; derive po dávkach 100–500 v konzumente; svetové RSS do udalostí iba z `derive-kanaly.json`; test vo workerd meria čas dávky pod 60 s CPU |
| Pamäť izolátu | 128 MB; kataster dnes drží všetky stránky WFS aj geometriu v jednej správe (533 parciel, max 15 082 B/záznam) | D11: stránka WFS = správa fronty, geometria po stránkach do R2, v D1 hash + referenčný bod; do V7 iba 2 pilotné oblasti |
| FTS5 v D1 | kontentless tabuľka nedovolí DELETE (bez `contentless_delete=1`), `wrangler d1 export` nefunguje pri virtuálnych tabuľkách; bez slovenského stemmera míňa skloňované tvary | FTS5 s externým obsahom (`content='records'`) a triggermi, overené v I0 vrátane DELETE; záloha vlastným JSONL exportom, SQL dump iba po `DROP records_fts` + `rebuild`; dopyty entít prefixové (`škol*`) s `remove_diacritics 2`; fallback LIKE nad `title` + `record_entity` |
| Záloha a obnova | Time Travel obnovuje iba na mieste (deštruktívne, celú DB), 30 dní; `records` bez kópie mimo D1 by boli nevratné | týždenná záloha všetkých tabuliek vrátane `records` prírastku do R2; export každého uzavretého mesiaca hneď; obnova skúšaná importom do test D1 (I8); Time Travel iba núdzová brzda; bookmark pred každou migráciou v Lineari |
| Rollback | `wrangler rollback` vracia iba kód, nie schému ani bindingy; migrácie nemajú down | migrácie iba aditívne; `dopyty.test.ts` nad schémou N a N−1; poradie návratu: web → zber → (iba pri strate dát) Time Travel na bookmark; job `rollback` v GitHub Actions (D18) |
| Prevádzka bez Macu | deploy, migrácie, seedy, rollback existujú iba ako `wrangler` z Macu | `.github/workflows/deploy.yml` s `workflow_dispatch` a `CLOUDFLARE_API_TOKEN` v GitHub Secrets (I12); pravidlo „deploy iba na pokyn“ platí ďalej |
| Kvalita udalostí bez embeddingov | Python dával 1:1, aktér „Toto“, 9 miest natvrdo; 75 % položiek Pravdy je TASR text s vlastným titulkom, syndikát podľa URL/hash to nezachytí | ≥ 30 slovies, entity a mená z mapy ako kotvy, `same_event` ≥ 0,85, `suggested` nikdy nezlučuje, cieľ ≤ 40 % v I3; `agentura` z regexu vylučuje agentúrne kópie z nezávislých zdrojov a „prvého“; `prvy_at_presnost` (Pravda zaokrúhľuje na 5 min); verejná formulácia vždy „prvý zo sledovaných kanálov“; ľudský merge/split v termináli; verejná je udalosť až po `vydane` |
| Nepodložené tvrdenie v texte | LLM napíše vetu bez claimu; claim zo sekundárneho zdroja vystupuje ako fakt; byline z počtu behov klame | validátor viet v `draft.ts` (každá veta `[^cN]` alebo „Výklad:“/„Nevieme:“, inak 422); stavy claimu `overene_primarne|overene_sekundarne` s atribúciou „podľa …“; `overene` iba ak výrez je podreťazcom archívneho textu alebo `summary`; paywall → max `nerozhodnute`; byline z `claims` a smoke porovnáva s SQL |
| Blindspot a podiel pokrytia | médiá nemali väzbu na entity; dnes 3 redakcie a 55 SK záznamov/deň; 33 % CRZ bez `dodavatel_ico` | `entity-media.ts` (aliasy + FTS prefix) s meranou presnosťou; blindspot verejne až pri ≥ 0,8; podiel „x z N sledovaných redakcií“, skrytý kým N < 8; D7 s overenými kanálmi (`overit-kanaly.mjs`) |
| Registre ako fakt | 50 % CRZ má `suma_spolu = 0` (neuvedené aj skutočná nula), `rezort/typ` číselné kódy bez zdroja, objednávateľ/dodávateľ podozrivé (Mesto Zvolen 39× dodávateľ) | `register_udalosti.stav='navrh'` a `crz_*` pravidlá `navrh` do overenia na 20 zmluvách (V1); verejne iba počty, sumy až „N zmlúv, z toho M s uvedenou sumou“; `suma` NULL pre 0∧0; `crz_ciselniky.zdroj_url` povinné, kód bez zdroja sa vypíše ako kód; `rola` `strana_a|strana_b` do overenia |
| Astro SSR na Cloudflare | adaptér 14 nemá `platformProxy` ani `Astro.locals.runtime`; sessions by založili KV; `verify-public-build.mjs` nevidí SSR HTML; chyba D1 = 5xx | `configPath` + `persistState`, `session: false`, `cloudflare:workers` `env`; `wrangler deploy --dry-run` bez KV (I7); `verify` kontroluje iba prerender HTML a statické súbory; `smoke-live.mjs` v `pnpm qa` (200, `lang`, `canonical`, zakázané markery, `id="post-<slug>"`, blok `.ai-autorstvo` s číslami zhodnými s SQL, počet `.tvrdenie` = počet viet, žiadny stav ≠ vydane, `/t` 403 bez JWT, `/` < 40 000 B, `/neexistuje` 404 s `lang="sk"`, každá URL zo sitemáp 200, `Cf-Cache-Status`); SSR stránka pri chybe D1 vykreslí články + „dáta dočasne nedostupné“ |
| Cache na hrane | Workers Caching je opt-in (`cache.enabled`), kľúč bez hostname, 200 bez `Cache-Control` sa cachuje 2 h, 404 3 min; runtime Cache API za Accessom nie je dostupné | `cache.enabled` v `hriech-web`; middleware: verejné SSR `public, max-age=60, stale-while-revalidate=300`, terminálový host a `/t/*` na každom hoste `private, no-store` (aj 404/303), `Set-Cookie` iba na `/t/nastavenia`; Cache API sa nepoužíva; smoke: `/` HIT, `/t/desk` BYPASS, verejný host `/t/desk` 404 bez HIT; ak by smoke ukázal cachovanú terminálovú odpoveď, terminál sa vyčlení do Workera `netopier-terminal` (jedno `wrangler.jsonc` navyše) |
| Build Astro pri tisíckach stránok | udalosti, posty, vydania sú SSR → build nerastie; statických ~60 + články; sitemapa živého obsahu je SSR | Workers Static Assets limit 20 000 súborov nedosiahnuteľný |
| Dva Workery, jedna D1 | migrácie aplikuje iba `netopier-zber`; nesúlad verzií schémy a dopytov; miniflare odvodzuje súbor z `database_id` | `@netopier/redakcia` verzuje schému; `dopyty.test.ts` nad migráciami N a N−1; deploy poradie: zber (migrácie) → web; `check-d1-id.mjs` v `pnpm qa` |
| Service Binding obchádza Access | `hriech-web` musí overiť JWT sám | middleware overuje JWT na terminálovom hoste; `netopier-zber` overuje preposlaný JWT znova (AUD terminálu); test 403 v smoke; odpovede API sú `no-store`, takže cache callee nič nevráti |
| Identita agentov | Service Token JWT nesie iba `common_name`, `X-Agent` je sebadeklarácia; env premenné cloud environmentu sú čitateľné | token na spúšťač (`routine`, `hlavna-session`, `adam-cli`), mapovanie `common_name` → aktér v `aktori.json`; `X-Beh` viaže zápis na beh založený orchestrátorom; `model` z allowlistu; `prompt_version` = commit hash; secret tokenu iba v API credential environmentu, nie v env premennej |
| Expirácia Service Tokenov | predvolene 1 rok, obnova ručne v dashboarde → tiché 403 | tokeny na 2 roky, notifikácia „Expiring Access Service Token Alert“, postup rotácie v `docs/REDAKCIA.md` |
| Domény tretej úrovne | Universal SSL kryje iba `*.xvadur.com` | Custom Domain vystaví Advanced certifikát; overenie `curl -sI` v I6; záloha prvá úroveň `api-hriech.xvadur.com` |
| Cloud routine | izolovaná session klonuje iba GitHub repozitáre; workspace bez remote; predvolené prostredie blokuje `api.hriech`; iba UTC; „research preview“ | súkromný repo `hriech-redakcia`; environment `hriech` s allowlistom a API credentialom; časy v UTC; dry-run z routine v I9; prvé dva týždne ručne; ak routines zlyhajú, beh ostáva ručný z hlavnej session |
| Cache 60 s | Minúta mešká do minúty | prijaté; `pripnuty` post sa mení zriedka; ostrov `minuta-refresh` dopĺňa |
| R2 objem | surový feed SK médií (18 kanálov × 48 behov × ≤ 150 KB) ≈ do 130 MB/deň v najhoršom prípade | lifecycle 90 dní na `raw/rss/` (≤ 10 GB v cene, nad to 0,015 $/GB-mes.); `raw_item` v D1 je trvalý dôkaz položky |
| Blokovanie zdrojov | Google News proxy (AP, Reuters, CNN, Interfax), RT `internal error`, 403 Asharq/FPRI, TLS `data.statistics.sk` lokálne, YouTube IP Macu | `failing_channels` v `/t`, `zdroje.pozastaveny_at` po 3 chybách, náhrada priamymi RSS; ŠÚ SR z Cloudflare overí I1; Fiki mimo cloudu so zálohou (I11) |
| TED iba nadlimitné, ÚVO bez API, LV nie sú otvorené, TASR/SITA možno bez verejného RSS | krivka „čo sa stalo“ neúplná; „prvý“ bez agentúr | zapísané v kartičke zdroja (`hodnotenie_zdroje`) a `/o-hriechu/redakcia`; medzera je `claims.typ='medzera'`; agentúrne kópie vylúčené z „prvého“ |
| Archív a autorské právo | celá kópia článku verejne by porušila hranicu projektu; bez kópie je hash neoveriteľný | D15: verejne metadáta + sha256 + výrez ≤ 300 znakov + Wayback odkaz; kópia v termináli; smoke meria dĺžku cudzieho textu na `/archiv/<sha>` |
| Súkromie | Claude číta verejné texty; CRZ obsahuje fyzické osoby | D2 hranica; `entity.verejne=0` vo všetkých verejných dopytoch; Fiki raw, jadro, realitný trh nikdy do API ani promptu |
| LLM klasifikácia signálov | subjektívna | `odovodnenie` + `klasifikoval` na každom linku, `stav='navrh'` až do overenia, Adam prepíše v termináli, zvody zamknuté, rollup nesie `verzia` |
| Náklady tokenov | 5 agentov, ≤ 10 položiek, 2 behy denne; odhad 0,5–1,5 mil. tokenov/deň | v predplatnom; `behy_redakcie.tokens_*` na `/t/behy`; reportér iba nad `vyrez`, `raw_item` a summary, nie celé stránky |
| Verejný repozitár | prompty, drafty, secrets | prompty v súkromnom `hriech-redakcia`; drafty iba v D1/R2; `research/` sa nepushuje; `CLOUDFLARE_API_TOKEN` iba v GitHub Secrets; `smoke` a `verify` kontrolujú markery |
| Dokumentácia | `ARCHITECTURE.md`, `AGENTS.md`, `openapi.json`, `PRODUCT.md` popisujú Miniflux/Postgres/FastAPI | I10 prepíše všetky; ADR iba v `netopier/docs/DECISIONS.md`; `grep` na staré názvy = 0 |
| Linear | XDR-230 blokovaná XDR-213, úlohy I/Z/V neexistujú, projekt sa volá „Hriech + Netopier“ | D17; úlohy sa zakladajú po schválení smeru; názov projektu opravený v celom návrhu |
| Jeden človek, 13 Infra krokov do 31. 10. | tesné | I0 začína hneď; I2–I5 lineárne; I6–I12 paralelne subagentmi; terminál a agenti sú textové; Živé začína, aj keď I9–I12 preteknú |

---

## 10. Rozhodnutia pre Adama

Zoznam D1–D18 v časti A. Blokujúce hneď: D1 (Paid + deploy), D17 (závislosť XDR-230 na XDR-213, pred zápisom úloh do Linearu); do 15. 10.: D6 (zvody); do 1. 11.: D2 (verejné texty a LLM), D3 (routine: repozitár `hriech-redakcia`, environment `hriech`), D4 (domény), D5 (vizuál), D18 (GitHub Actions deploy a API token); do 5. 11.: D9 (token `adam-cli`), D15 (archív verejne), D16 (Fiki záloha a sync). Ostatné majú východisko, s ktorým návrh počíta, a menia sa iba Adamovým slovom.

---

## 11. Odmietnuté námietky

Všetky námietky označené blocker a major sú zapracované zmenou návrhu (časti A, B, 1, 2, 3, 4, 5, 6, 7 a 9). Odmietnuté alebo zmenené sú iba tieto časti návrhov na opravu:

| Námietka (časť fixu) | Rozhodnutie | Dôvod a dôkaz |
|---|---|---|
| Terminál vyčleniť do samostatného Workera `netopier-terminal`, lebo „za Accessom nie je Cache API dostupné“ | **nevyčleniť** (ostáva ako záloha v časti 9, ak smoke ukáže cachovanú terminálovú odpoveď) | Citovaná výnimka je z `workers/runtime-apis/cache/` a týka sa runtime Cache API (`caches.default`), ktoré návrh nepoužíva. Workers Caching (`workers/cache/configuration/`) sa zapína `cache.enabled` a riadi iba hlavičkami odpovede: „A response with `Cache-Control: private` or `no-store` is not stored, and `Cf-Cache-Status` is `BYPASS`“; kľúč je cesta, entrypoint, `ctx.props` a verzia, nie hostname — preto middleware dáva `private, no-store` na terminálový host aj na `/t/*` na každom hoste (aj 404), a to únik vylučuje bez tretieho Workera. Overuje `smoke-live.mjs` (`/t/desk` BYPASS, verejný host `/t/desk` 404 bez HIT). |
| Jeden Service Token na každého agenta (`netopier-triaz`, `netopier-reporter`, …) | **token na spúšťač, nie na agenta** (`netopier-routine`, `netopier-hlavna-session`, `netopier-adam-cli`) + väzba `X-Beh` | Všetci subagenti jednej routiny bežia v tej istej cloud session s jedným API credentialom na host (námietka o routine sama uvádza, že secrets v env premenných sú čitateľné a credential pridáva proxy pre vymenované hosty); päť tokenov by teda skončilo v čitateľných premenných alebo v piatich environmentoch. JWT po Service Tokene nesie iba `common_name` (Cloudflare docs, Application token: `"common_name": "<client-id>.access"`, `"sub": ""`), takže token vie dokázať spúšťač. Rola agenta sa viaže na beh, ktorý založil orchestrátor (`X-Beh` → `behy_redakcie.agent` → povolené cesty v `agenti.json`); `model` z allowlistu a `prompt_version` = commit hash sú prijaté. |
| Pridať `marked`/`markdown-it` s vlastným footnote rendererom pre `zhrnutie_md`/`draft_md` | **nepridať runtime Markdown knižnicu** | Prijatá major námietka o nepodložených vetách vyžaduje, aby verejný text bol zreťazením `claims` (každá veta = claim s typom), takže voľný Markdown sa za behu nerenderuje; `draft_md` je iba vstup validátora. Inline formát (tučné, odkaz) rieši `src/lib/inline.ts` s escapovaním HTML a testom na XSS — bez raw HTML, bez závislosti navyše (`package.json` dnes žiadny renderer nemá, ako námietka sama uvádza). |
| Pri limite dopytov na invokáciu „zvýšiť `INSERT_BATCH` na 100 statementov“ | **nezväčšovať dávky; deliť správy** | Ak D1 počíta `batch` po statementoch (námietka uvádza, že docs to nešpecifikujú), väčšia dávka počet dopytov nezníži; strop ≤ 200 volaní na správu a pokračovanie novou správou funguje v oboch výkladoch. Meria sa v I1 (`wrangler tail` pri `POST /run/crz?sync=1`). |
| `sitemap.xml.ts` prepnúť celý na `prerender = false` | **variant sitemap index**: `sitemap.xml` (prerender, index) → `sitemap-static.xml` (prerender) + `sitemap-zive.xml` (SSR, cache 1 h) | Námietka ponúka obe cesty; index nechá `verify-public-build.mjs` ďalej kontrolovať statické URL lokálne a SSR URL overuje smoke. Zvyšok fixu (rel=alternate pre `/minuta.xml`, `/vydanie.xml`, `/udalosti.xml`; každá URL zo sitemáp 200) je prijatý. |
| `ZBER_TOKEN` zrušiť hneď | **zrušiť až v I6** | I1 (deploy zberu) predchádza I6 (Access aplikácie a tokeny); do I6 je Bearer jediná autorizácia `/run*`. Po I6 sa `/run*` autorizuje z JWT a secret sa maže (`wrangler secret delete`), takže sľub „o jeden secret menej“ platí od I6. |

