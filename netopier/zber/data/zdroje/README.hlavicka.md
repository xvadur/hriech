# Register zdrojov Netopiera

Jeden zoznam všetkých zdrojov, ktoré Netopier sleduje alebo môže sledovať: slovenské médiá (denníky, portály, agentúry, TV, rádiá, týždenníky, názorové a alternatívne weby, regionálne a mestské portály, ekonomické médiá, bulvár), zdroje zo zmluvy Mediaboardu s Úradom vlády SR, verejné dáta štátu, slovenské podcasty a YouTube kanály. Úloha XDR-296, stav overený živými dotazmi (dátum nižšie).

Súbory:

- `register.json` — výstup, ktorý číta príjem. Pole objektov `{id, nazov, typ, url_web, rss[], api, cely_text_v_rss, jazyk, kategoria, overene_at, poznamka}`, `typ` ∈ `medium | agentura | tv | radio | podcast | statny_zdroj | register | ine`.
- `seed.json` — vstup: ručne kurátorovaný zoznam (adresa webu, tipy na feedy, adresa API a jej testovací dotaz, prepojenie na zmluvu Mediaboardu).
- `README.md` — tento súhrn; generuje ho `node scripts/zdroje-readme.mjs` z `register.json` a `seed.json` (ručné časti sú v `README.hlavicka.md`, `README.mediaboard.md`, `README.pata.md`).
- Prepočet registra: `cd netopier/zber && node scripts/zdroje-overit.mjs` (všetko, cca 10 min; pre vybrané `--only=id1,id2`), potom `node scripts/zdroje-readme.mjs`. Skript robí iba GET, s odstupom medzi dotazmi na tú istú doménu, a nezapisuje mimo `data/zdroje/`.

Čo znamenajú polia:

- `rss` — iba feedy, ktoré vrátili platné XML s aspoň jednou položkou a aspoň jednou položkou mladšou ako 30 dní. Feed, ktorý sa nepodarilo overiť, v poli nie je (dôvod je v `poznamka`).
- `cely_text_v_rss` — `true`, ak text položky vo feede zodpovedá aspoň 75 % textu článku na 3 vzorkách a medián dĺžky textu vo feede je aspoň 600 znakov. Inak `false` (perex, alebo nepotvrdené). Časť položiek s celým textom pri feede s prevažne perexami je v `poznamka`.
- `api` — adresa API alebo exportu (viac hodnôt oddelených ` | `); `null`, ak žiadne nie je. Pri štátnych zdrojoch je API overené testovacím GET dotazom (kód a typ odpovede sú v `poznamka`). WordPress REST (`/wp-json/wp/v2/posts`) sa uvádza, len ak vrátil JSON s článkami.
- `overene_at` — čas posledného úspešného dotazu na web alebo feed zdroja; `null` = zdroj neodpovedal (nič sa nedomýšľa).
- `poznamka` — frekvencia (položky za deň podľa okna feedu), posledná položka, dĺžky textu, signály paywallu, blokovanie botov, súvislosť so zmluvou Mediaboardu.
