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

## Počty

Stav: 2026-09-29. „RSS“ = zdroj má aspoň jeden živý feed overený dotazom (platné XML, čerstvá položka).
„Celý text“ = text v RSS zodpovedá aspoň ~75 % textu článku (test na 3 článkoch); „API“ = zdroj má API alebo export.

| typ | zdrojov | s RSS | celý text v RSS | s API | overené živým dotazom |
|---|---|---|---|---|---|
| medium | 108 | 68 | 14 | 22 | 91 |
| agentura | 2 | 1 | 0 | 1 | 2 |
| tv | 11 | 5 | 2 | 1 | 10 |
| radio | 9 | 3 | 0 | 0 | 8 |
| podcast | 62 | 50 | 0 | 0 | 62 |
| statny_zdroj | 57 | 25 | 4 | 8 | 49 |
| register | 14 | 0 | 0 | 9 | 12 |
| ine | 9 | 6 | 0 | 0 | 9 |
| **spolu** | 272 | 158 | 20 | 41 | 243 |

Podľa kategórie:

| kategória | zdrojov | s RSS |
|---|---|---|
| podcast_relacia | 37 | 26 |
| youtube_kanal | 25 | 24 |
| regionalne | 19 | 9 |
| celostatne | 18 | 12 |
| samsprava | 16 | 10 |
| ministerstvo | 15 | 6 |
| zahranicne | 11 | 11 |
| ekonomicke | 10 | 7 |
| tv | 10 | 2 |
| alternativne | 9 | 4 |
| tyzdennik | 8 | 3 |
| radio | 8 | 2 |
| politik_youtube | 8 | 6 |
| register | 7 | 0 |
| bulvar | 6 | 4 |
| investigativa | 6 | 5 |
| financie | 6 | 4 |
| agentury | 5 | 4 |
| odborne | 5 | 2 |
| regulator | 5 | 1 |
| technologie | 4 | 4 |
| sudy | 4 | 1 |
| nazorove | 3 | 2 |
| sport | 3 | 3 |
| blogy | 3 | 3 |
| vlada | 3 | 1 |
| overovanie | 2 | 0 |
| kontrola | 2 | 2 |
| obstaravanie | 2 | 0 |
| zdravotnictvo | 2 | 0 |
| statistika | 2 | 0 |
| anglicke | 1 | 0 |
| parlament | 1 | 0 |
| policia | 1 | 0 |
| zmluvy | 1 | 0 |
| otvorene-data | 1 | 0 |
| legislativa | 1 | 0 |
| eurofondy | 1 | 0 |
| ine | 1 | 0 |

## Mediaboard — zmluva Úradu vlády SR

| zdroj v zmluve | bod prílohy č. 1 | RSS v registri | celý text v RSS |
|---|---|---|---|
| SME | 1 denníky; 5 weby | áno | nie |
| Denník N | 1 denníky; 5 weby | áno | nie |
| Pravda | 1 denníky; 5 weby | áno | nie |
| Hospodárske noviny (HNonline) | 1 denníky; 5 weby | áno | áno |
| Nový Čas | 1 denníky; 5 weby | nie | nie |
| Pluska.sk (Plus jeden deň) | 1 denníky; 5 weby | áno | nie |
| Aktuality.sk | 5 weby | áno | nie |
| Topky.sk | 5 weby | áno | nie |
| Postoj | 5 weby | áno | nie |
| Štandard | 5 weby | áno | nie |
| Hlavné správy | 5 weby | áno | nie |
| Hlavný denník | 5 weby | nie | nie |
| Denník E (dennike.sk) | 5 weby | áno | nie |
| eReport | 5 weby | áno | nie |
| iDEN | 5 weby | áno | áno |
| Marker | 5 weby | áno | nie |
| Extra plus | 4 týždenníky/mesačníky (Extra plus); 5 weby | áno | nie |
| Noviny.sk (TV JOJ) | 5 weby | nie | nie |
| TN LIVE / TVNoviny.sk (Markíza) | 5 weby | nie | nie |
| TA3.com | 2 spravodajstvo (Hlavné správy 18.30); 3.1 (V politike, Téma dňa); 5 weby | áno | nie |
| Týždeň | 4 týždenníky/mesačníky; 5 weby | áno | nie |
| Plus 7 dní | 4 týždenníky/mesačníky | nie | nie |
| Index (týždenník) | 4 týždenníky/mesačníky (Index) | nie | nie |
| Trend (etrend.sk / trend.sk) | 4 týždenníky/mesačníky (Trend); 5 weby | nie | nie |
| Život (týždenník) | 4 týždenníky/mesačníky (Život) | áno | nie |
| Slovenka | 4 týždenníky/mesačníky (Slovenka) | áno | áno |
| STVR Správy | 2 spravodajstvo (STVR Správy 19.00, STVR 24 Komentáre); 3.1 (O 5 minút 12) | áno | áno |
| Rádio Slovensko / Rádiožurnál (STVR) | 2 spravodajstvo (Rádiožurnál 12.00, 18.00); 3.1 (Sobotné dialógy) | nie | nie |
| TV Markíza | 2 spravodajstvo (Televízne noviny 19.00); 3.1 (Na telo) | nie | nie |
| TV JOJ | 2 spravodajstvo (Noviny 19.30) | nie | nie |
| JOJ 24 | 3.1 (Politika 24, Analýzy 24) | nie | nie |
| Rádio Expres | 2 spravodajstvo (Infoexpres 12.00, 17.00); 3.1 (Braňo Závodský Naživo) | áno | nie |
| TA3 (YouTube) | 2 spravodajstvo; 3.1 (V politike, Téma dňa) | áno | nie |
| STVR – Diskusie a politika (YouTube) | 3.1 (O 5 minút 12, Sobotné dialógy); 2 (STVR 24 Komentáre) | áno | nie |
| Televízia JOJ (YouTube) | 2 spravodajstvo (Noviny); 3.1 (Politika 24, Analýzy 24) | áno | nie |
| Televízia Markíza (YouTube) | 2 spravodajstvo; 3.1 (Na telo) | áno | nie |
| Braňo Závodský Naživo (Rádio Expres) | 3.1 (Braňo Závodský Naživo) | áno | nie |
| Podcast TA3 | 3.1 (V politike, Téma dňa) | áno | nie |
| Analýzy 24 (JOJ 24) | 3.1 (Analýzy 24) | áno | nie |
| Politika 24 (JOJ 24) | 3.1 (Politika 24) | áno | nie |
| O 5 minút 12 (STVR) | 3.1 (O 5 minút 12) | áno | nie |
| Sobotné dialógy (STVR) | 3.1 (Sobotné dialógy) | áno | nie |
| Rádiožurnál o 18:00 (STVR) | 2 spravodajstvo (Rádiožurnál 18.00) | áno | nie |
| Na telo s Michalom Kovačičom (Markíza) | 3.1 (Na telo) | nie | nie |
| Právo (CZ) | 2024: príloha č. 1, bod 5 zahraničné médiá | áno | nie |
| iDNES.cz (MF Dnes) | 2024: príloha č. 1, bod 5 zahraničné médiá | áno | nie |
| Lidovky.cz (Lidové noviny) | 2024: príloha č. 1, bod 5 zahraničné médiá | áno | nie |
| Hospodářské noviny (CZ) | 2024: príloha č. 1, bod 5 zahraničné médiá | áno | nie |
| ČT24 / Česká televize | 2024: príloha č. 1, bod 5 zahraničné médiá (ČT 1, ČT 24) | áno | nie |
| CNN Prima News (TV Prima) | 2024: príloha č. 1, bod 5 zahraničné médiá (TV Prima) | áno | áno |
| TN.cz (TV Nova) | 2024: príloha č. 1, bod 5 zahraničné médiá (TV Nova) | áno | nie |
| ČRo Radiožurnál | 2024: príloha č. 1, bod 5 zahraničné médiá (ČRo Rádiožurnál) | áno | nie |
| The Economist | 2024: príloha č. 1, bod 6 zahraničné webstránky | áno | nie |
| Financial Times | 2024: príloha č. 1, bod 6 zahraničné webstránky | áno | nie |
| The Wall Street Journal | 2024: príloha č. 1, bod 6 zahraničné webstránky | áno | nie |

Zdroje zo zmluvy s RSS: 43 z 55 položiek zaradených do registra.

### Zmluva

- **Rámcová dohoda o poskytovaní služieb č. 130/2026** (CEZ ÚV SR), Úrad vlády SR (IČO 00151513) a Mediaboard Slovakia s. r. o. (IČO 47242396, Konventná 6, Bratislava; historický názov Monitora s. r. o.). Uzavretá 15. 6. 2026, zverejnená v CRZ 14. 8. 2026 (ID záznamu 12685460), účinná 16. 8. 2026 – 15. 8. 2027, **48 073,32 €**. Zákazka „podľa § 1 ods. 14 zákona o verejnom obstarávaní“. Text a príloha: <https://www.crz.gov.sk/data/att/6932927.pdf> (19 strán, stiahnuté a prečítané 29. 9. 2026).
- Predmet: monitoring printových a elektronických médií. Súhrnný ranný monitoring podľa kľúčových slov „premiér“, „predseda vlády“, „meno predsedu vlády“ (dodávka do 5:30, cez víkend do 8:00), databáza plných textov denníkov a týždenníkov, prepisy spravodajských a publicistických relácií a tlačových konferencií, výstup vo formáte jednoduchého XML a mobilná aplikácia s upozorneniami.
- **Príloha č. 1 (zoznam monitorovaných médií), 2026:** 1. denníky — SME, Pravda, Hospodárske noviny, Nový čas, Plus jeden deň, Denník N. 2. spravodajstvo — Rádiožurnál SRo (12.00, 18.00), Infoexpres Rádia Expres (12.00, 17.00), STVR Správy (19.00), STVR 24 Komentáre (cca 20.20), Televízne noviny Markíza (19.00), Noviny JOJ (19.30), TA3 Hlavné správy (18.30). 3.1 publicistika — O 5 minút 12 (STVR), V politike (TA3), Na telo (Markíza), Sobotné dialógy (SRo), Braňo Závodský Naživo (Expres), Téma dňa (TA3), Politika 24 a Analýzy 24 (JOJ 24). 3.2 prepisy tlačových besied na TA3, JOJ 24, STVR 24 a online. 3.3 na vyžiadanie prepis iných relácií a podcastov (najviac 20 mesačne). 4. týždenníky — Týždeň, Plus 7 dní, Index, Trend, Život, Slovenka; mesačník Extra plus. 5. **21 webov:** aktuality.sk, cas.sk, dennikn.sk (vrátane dennike.sk), ereport.sk, etrend.sk, extraplus.sk, hlavnydennik.sk, hlavnespravy.sk, hnonline.sk (vrátane mediweb.hnonline.sk), iden.sk, marker.sk, noviny.sk, pluska.sk, pravda.sk, sme.sk, standard.sk, topky.sk, tvnoviny.sk, tyzden.sk, postoj.sk, ta3.com.
- **Predchádzajúca zmluva 821/2024** (ÚV SR – Mediaboard, 54 720 €, účinná 16. 8. 2024 – 15. 8. 2025, zverejnená v CRZ 9. 8. 2024, „zákazka podľa § 117 ods. 1 ZVO bez zverejnenia“, príloha <https://www.crz.gov.sk/data/att/5140931.pdf>) mala širší rozsah: navyše zahraničné médiá (Právo, MF Dnes, Lidové noviny, Hospodářské noviny, ČT 1, ČT 24, TV Prima, TV Nova, ČRo Rádiožurnál; weby economist.com, ft.com, wsj.com), týždenníky Šarm a Nový čas pre ženy a iba 15 webov. Oproti nej pribudli v 2026 weby ereport.sk, extraplus.sk, hlavnydennik.sk, hlavnespravy.sk, iden.sk a marker.sk a odpadli zahraničné zdroje. Zahraničné zdroje sú v registri s poznámkou o zmluve 821/2024.
- Medzi 15. 8. 2025 a 16. 8. 2026 som v CRZ nenašiel pre Úrad vlády zverejnenú zmluvu s Mediaboardom (prehľadané denné exporty CRZ od 1. 6. 2024 do 28. 9. 2026 podľa protistrany a slova „monitoring“). Či to bolo predĺženie, dodatok mimo CRZ alebo iný dodavateľ, z dát nevyplýva.
- Mediaboard má v tom istom období v CRZ ďalších 33 zmlúv s verejnými inštitúciami (Ministerstvo zdravotníctva, dopravy, investícií a práce, Kancelária NR SR, Rada pre mediálne služby, LESY SR, TIPOS, SAV, univerzity, divadlá, nemocnica, mestské časti a i.); ich zoznamy médií sa nesťahovali.
- Nezaradené položky zo zmluvy: „Index“ (týždenník; zmluva doménu neuvádza), Šarm a Nový čas pre ženy (iba 2024), tlačené vydania ako také (v registri sú ich weby), relácie bez samostatného webu sú pokryté kanálmi v kategórii `podcast_relacia` a `youtube_kanal`.

## Čo sa nedá (alebo nedá bez ďalšieho) zbierať

### Web alebo feed blokuje boty / je nedostupný
- **Aktuálne.sk** (`aktualne`) — web nedostupný (ERR_TLS_CERT_ALTNAME_INVALID). RSS: nenájdený platný feed (žiadny kandidát).
- **Literárny týždenník** (`literarnytyzdennik`) — web nedostupný (UND_ERR_CONNECT_TIMEOUT). RSS: nenájdený platný feed (žiadny kandidát).
- **Forbes Slovensko** (`forbes`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (žiadny kandidát).
- **Ekonomika SME** (`ekonomika-sme`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (ekonomika.sme.sk/rss → HTTP 429).
- **Zdravotnícke noviny** (`zdravotnickenoviny`) — web nedostupný (ERR_SSL_SSL/TLS_ALERT_HANDSHAKE_FAILURE). RSS: nenájdený platný feed (žiadny kandidát).
- **Učiteľské noviny** (`ucitelskenoviny`) — web nedostupný (ERR_TLS_CERT_ALTNAME_INVALID). RSS: nenájdený platný feed (žiadny kandidát).
- **Euractiv Slovensko** (`euractiv`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (žiadny kandidát).
- **Slobodný vysielač** (`slobodnyvysielac`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (žiadny kandidát).
- **GLOBSEC** (`globsec`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (žiadny kandidát).
- **The Slovak Spectator** (`spectator`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (žiadny kandidát).
- **Korzár (Košice, Prešov a východ)** (`korzar`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (korzar.sme.sk/rss → HTTP 429).
- **MY Nitrianske noviny** (`mynitra`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (mynitra.sme.sk/rss → HTTP 429).
- **MY Žilina** (`myzilina`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (myzilina.sme.sk/rss → HTTP 429).
- **MY Trenčianske noviny** (`mytrencin`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (mytrencin.sme.sk/rss → HTTP 429).
- **MY Trnava** (`mytrnava`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (mytrnava.sme.sk/rss → HTTP 429).
- **MY Banská Bystrica** (`mybystrica`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (mybystrica.sme.sk/rss → HTTP 429).
- **MY regionálne noviny (Petit Press, prehľad)** (`my-sme`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva).
- **Rádio Jemné** (`jemne`) — web nedostupný (UND_ERR_CONNECT_TIMEOUT). RSS: nenájdený platný feed (žiadny kandidát).
- **TV Noe** (`tvnoe`) — web nedostupný (ENOTFOUND). RSS: nenájdený platný feed (žiadny kandidát).
- **Ministerstvo zahraničných vecí a európskych záležitostí SR** (`mzv`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (žiadny kandidát).
- **Ministerstvo dopravy SR** (`mindop`) — web nedostupný (UND_ERR_CONNECT_TIMEOUT). RSS: nenájdený platný feed (žiadny kandidát).
- **Ministerstvo cestovného ruchu a športu SR** (`mcrs`) — web nedostupný (ENOTFOUND). RSS: nenájdený platný feed (žiadny kandidát).
- **Súdy SR – Občan a justícia (obcan.justice.sk)** (`justice-sudy`) — web nedostupný (HTTP 404). API overené (200, application/json).
- **Tlačová rada SR** (`tlacovarada`) — web nedostupný (ENOTFOUND).
- **Štatistický úrad SR (DATAcube)** (`statistics`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (žiadny kandidát). API overené (200, application/json).
- **Živnostenský register** (`zrsr`) — web nedostupný (UNABLE_TO_GET_ISSUER_CERT_LOCALLY).
- **Bratislavský samosprávny kraj** (`kraj-bsk`) — web nedostupný (ERR_TLS_CERT_ALTNAME_INVALID). RSS: nenájdený platný feed (žiadny kandidát).
- **Banskobystrický samosprávny kraj** (`kraj-bbsk`) — web nedostupný (UNABLE_TO_VERIFY_LEAF_SIGNATURE). RSS: nenájdený platný feed (žiadny kandidát).

### Web funguje, ale nenašiel sa platný feed
- **Nový Čas** (`cas`) — Ringier Axel Springer. RSS: nenájdený platný feed (www.cas.sk/rss → HTTP 404; www.cas.sk/rss/ → HTTP 404; www.cas.sk/feed → HTTP 404; www.cas.sk/feed/ → HTTP 40
- **Zoznam Správy** (`zoznam-spravy`) — Zoznam.sk (skupina Zoznam / Mafra). RSS: nenájdený platný feed (www.zoznam.sk/rss → nie je feed (text/html); www.zoznam.sk/rss/ → nie je feed (text/html); www.z
- **Dnes24.sk** (`dnes24`) — RSS: nenájdený platný feed (žiadny kandidát). neaktívny feed: https://www.dnes24.sk/rss/ (posledná položka 2020-01-06).
- **Dôležité.sk** (`dolezite`) — RSS: nenájdený platný feed (www.dolezite.sk/rss → HTTP 404; www.dolezite.sk/rss/ → HTTP 404; www.dolezite.sk/feed → HTTP 404; www.dolezite.sk/feed/ → HTTP 404).
- **Bratislavské noviny** (`bratislavskenoviny`) — RSS: nenájdený platný feed (www.bratislavskenoviny.sk/o-nas/rss/5-rss-kanal-banoviny-sk → HTTP 404; www.bratislavskenoviny.sk/feed/rss2?category=banoviny-1 → HT
- **Hlavný denník** (`hlavnydennik`) — RSS: nenájdený platný feed (www.hlavnydennik.sk/rss → HTTP 404; www.hlavnydennik.sk/rss/ → HTTP 404; www.hlavnydennik.sk/feed → HTTP 404; www.hlavnydennik.sk/fe
- **Noviny.sk (TV JOJ)** (`noviny`) — Spravodajský web TV JOJ. RSS: nenájdený platný feed (www.noviny.sk/rss → HTTP 404; www.noviny.sk/rss/ → HTTP 404; www.noviny.sk/feed → HTTP 404; www.noviny.sk/f
- **TN LIVE / TVNoviny.sk (Markíza)** (`tvnoviny`) — Spravodajský web TV Markíza; tvnoviny.sk sa presmeruje na tnlive.sk. RSS: nenájdený platný feed (tnlive.sk/rss → HTTP 404; tnlive.sk/rss/ → HTTP 404; tnlive.sk/
- **Plus 7 dní** (`plus7dni`) — RSS: nenájdený platný feed (plus7dni.pluska.sk/rss.xml → feed bez položiek; plus7dni.pluska.sk/rss → HTTP 404; plus7dni.pluska.sk/rss/ → HTTP 404; plus7dni.plus
- **Index (týždenník)** (`index`) — V zmluve je uvedený iba názov týždenníka „Index“, doménu zmluva neuvádza; index.sk je kandidát, nepotvrdené. RSS: nenájdený platný feed (www.index.sk/rss → HTTP
- **Trend (etrend.sk / trend.sk)** (`etrend`) — Týždenník Trend; etrend.sk a trend.sk vracajú ten istý web (News and Media Holding). RSS: nenájdený platný feed (www.trend.sk/rss → HTTP 404; www.trend.sk/rss/ 
- **Katolícke noviny** (`katolickenoviny`) — RSS: nenájdený platný feed (www.katolickenoviny.sk/rss → HTTP 404; www.katolickenoviny.sk/rss/ → HTTP 404; www.katolickenoviny.sk/feed → HTTP 404; www.katolicke
- **Vsieti.sk** (`vsieti`) — RSS: nenájdený platný feed (žiadny kandidát). neaktívny feed: https://www.vsieti.sk/rss.xml (posledná položka 2015-04-25).
- **Infovojna** (`infovojna`) — Doména sa menila (infovojna.sk → infovojna.bz); overiť. RSS: nenájdený platný feed (www.infovojna.com/rss → nie je feed (text/html); www.infovojna.com/rss/ → ni
- **Báječné ženy** (`bajecnezeny`) — RSS: nenájdený platný feed (bajecnezeny.sk/rss → HTTP 404; bajecnezeny.sk/rss/ → HTTP 404; bajecnezeny.sk/feed → HTTP 404; bajecnezeny.sk/feed/ → HTTP 404).
- **Demagog.sk** (`demagog`) — Overovanie výrokov politikov. RSS: nenájdený platný feed (demagog.sk/rss → nie je feed (text/html); demagog.sk/rss/ → nie je feed (text/html); demagog.sk/feed →
- **Konšpirátori.sk** (`konspiratori`) — Verejná databáza webov s nedôveryhodným obsahom; sledovací zoznam, nie spravodajstvo.
- **Slobodná Európa (RFE/RL)** (`slobodnaeuropa`) — RSS: nenájdený platný feed (www.slobodnaeuropa.sk/rss → nie je feed (text/html); www.slobodnaeuropa.sk/rss/ → nie je feed (text/html); www.slobodnaeuropa.sk/fee
- **Trnavský hlas** (`trnavskyhlas`) — RSS: nenájdený platný feed (www.trnavskyhlas.sk/rss/rss-trnavsky-hlas.php → nie je feed (text/html); www.trnavskyhlas.sk/rss/rss-trnavsky-hlas-sport.php → nie j
- **Azet.sk** (`azet`) — Ringier Slovakia Media; v IAB top 10 (2025). RSS: nenájdený platný feed (www.azet.sk/rss → ECONNRESET; www.azet.sk/rss/ → ECONNRESET; www.azet.sk/feed → HTTP 40
- **Új Szó** (`ujszo`) — Maďarský denník na Slovensku. RSS: nenájdený platný feed (ujszo.com/rss → nie je feed (text/html); ujszo.com/rss/ → nie je feed (text/html); ujszo.com/feed → HT
- **Vasárnap** (`vasarnap`) — Maďarský týždenník na Slovensku. RSS: nenájdený platný feed (vasarnap.com/rss → nie je feed (text/html); vasarnap.com/rss/ → nie je feed (text/html); vasarnap.c
- **Regionpress** (`regionpress`) — Sieť 34 regionálnych redakcií (Prešovsko, Košicko, Trnavsko, …). RSS: nenájdený platný feed (www.regionpress.sk/rss → HTTP 404; www.regionpress.sk/rss/ → HTTP 4
- **STVR (Slovenská televízia a rozhlas)** (`stvr`) — RSS: nenájdený platný feed (www.stvr.sk/rss → HTTP 404; www.stvr.sk/rss/ → HTTP 404; www.stvr.sk/feed → HTTP 404; www.stvr.sk/feed/ → HTTP 404).
- **Rádio Slovensko / Rádiožurnál (STVR)** (`stvr-slovensko`) — Rádiožurnál 12.00 a 18.00, Sobotné dialógy. RSS: nenájdený platný feed (slovensko.stvr.sk/rss → HTTP 404; slovensko.stvr.sk/rss/ → HTTP 404; slovensko.stvr.sk/f
- **Rádio Regina (STVR)** (`stvr-regina`) — Regionálne vysielanie STVR. RSS: nenájdený platný feed (regina.stvr.sk/rss → HTTP 404; regina.stvr.sk/rss/ → HTTP 404; regina.stvr.sk/feed → HTTP 404; regina.st
- **Rádio Slovakia International (STVR)** (`stvr-rsi`) — RSS: nenájdený platný feed (rsi.stvr.sk/rss → HTTP 404; rsi.stvr.sk/rss/ → HTTP 404; rsi.stvr.sk/feed → HTTP 404; rsi.stvr.sk/feed/ → HTTP 404).
- **TV Markíza** (`markiza`) — Televízne noviny 19.00. RSS: nenájdený platný feed (www.markiza.sk/rss → HTTP 404; www.markiza.sk/rss/ → HTTP 404; www.markiza.sk/feed → HTTP 404; www.markiza.s
- **TV JOJ** (`joj`) — Noviny 19.30. RSS: nenájdený platný feed (www.joj.sk/rss → HTTP 404; www.joj.sk/rss/ → HTTP 404; www.joj.sk/feed → HTTP 404; www.joj.sk/feed/ → HTTP 404). Media
- **JOJ 24** (`joj24`) — Politika 24, Analýzy 24. RSS: nenájdený platný feed (joj24.noviny.sk/rss → HTTP 404; joj24.noviny.sk/rss/ → HTTP 404; joj24.noviny.sk/feed → HTTP 404; joj24.nov
- **Fun Rádio** (`funradio`) — RSS: nenájdený platný feed (www.funradio.sk/rss → HTTP 404; www.funradio.sk/rss/ → HTTP 404; www.funradio.sk/feed → HTTP 404; www.funradio.sk/feed/ → HTTP 404).
- **Rádio Lumen** (`lumen`) — RSS: nenájdený platný feed (www.lumen.sk/rss → HTTP 404; www.lumen.sk/rss/ → HTTP 404; www.lumen.sk/feed → HTTP 404; www.lumen.sk/feed/ → HTTP 404).
- **TV LUX** (`tvlux`) — Katolícka televízia. RSS: nenájdený platný feed (www.tvlux.sk/rss → nie je feed (text/html); www.tvlux.sk/rss/ → nie je feed (text/html); www.tvlux.sk/feed → ni
- **TASR – Tlačová agentúra SR** (`tasr`) — Verejnoprávna agentúra; spravodajské produkty platené, tlačové správy a teraz.sk čiastočne verejné. RSS: nenájdený platný feed (www.tasr.sk/rss → nie je feed (t
- **Rokovania vlády SR (rokovania.gov.sk)** (`rokovania-vlady`) — Materiály, zápisnice a uznesenia z rokovaní vlády. RSS: nenájdený platný feed (žiadny kandidát). neaktívny feed: https://rokovania.gov.sk/rss?id=rpo_material (p
- **Prezident SR** (`prezident`) — RSS: nenájdený platný feed (www.prezident.sk/rss → nie je feed (text/html); www.prezident.sk/rss/ → nie je feed (text/html); www.prezident.sk/feed → nie je feed
- **Ministerstvo vnútra SR** (`minv`) — RSS: nenájdený platný feed (www.minv.sk/rss → HTTP 404; www.minv.sk/rss/ → HTTP 404; www.minv.sk/feed → HTTP 404; www.minv.sk/feed/ → HTTP 404).
- **Ministerstvo zdravotníctva SR** (`health`) — RSS: nenájdený platný feed (www.health.gov.sk/RSS → nie je feed (text/html); www.health.gov.sk/rss → nie je feed (text/html); www.health.gov.sk/rss/ → nie je fe
- **Ministerstvo životného prostredia SR** (`minzp`) — RSS: nenájdený platný feed (minzp.sk/rss → nie je feed (text/html); minzp.sk/rss/ → nie je feed (text/html); minzp.sk/feed → HTTP 404; minzp.sk/feed/ → HTTP 404
- **Ministerstvo kultúry SR** (`culture`) — RSS: nenájdený platný feed (www.culture.gov.sk/rss → HTTP 404; www.culture.gov.sk/rss/ → HTTP 404; www.culture.gov.sk/feed → HTTP 404; www.culture.gov.sk/feed/ 
- **Ministerstvo spravodlivosti SR** (`justice`) — RSS: nenájdený platný feed (www.justice.gov.sk/?feed=rss2 → feed bez položiek; www.justice.gov.sk/rss → feed bez položiek; www.justice.gov.sk/rss/ → feed bez po
- **Ministerstvo investícií, regionálneho rozvoja a informatizácie SR** (`mirri`) — RSS: nenájdený platný feed (mirri.gov.sk/rss → feed bez položiek; mirri.gov.sk/rss/ → feed bez položiek; mirri.gov.sk/feed → feed bez položiek; mirri.gov.sk/fee
- **Polícia SR (sekcia na minv.sk)** (`policia`) — Web polície je sekcia webu Ministerstva vnútra; samostatný RSS sa nenašiel.
- **Generálna prokuratúra SR** (`genpro`) — RSS: nenájdený platný feed (www.genpro.gov.sk/rss → nie je feed (text/html); www.genpro.gov.sk/rss/ → nie je feed (text/html); www.genpro.gov.sk/feed → nie je f
- **Najvyšší súd SR** (`nsud`) — RSS: nenájdený platný feed (www.nsud.sk/rss → HTTP 404; www.nsud.sk/rss/ → HTTP 404; www.nsud.sk/feed → HTTP 404; www.nsud.sk/feed/ → HTTP 404).
- **Úrad pre verejné obstarávanie** (`uvo`) — Vestník verejného obstarávania; podlimitné zákazky bez otvoreného API. RSS: nenájdený platný feed (www.uvo.gov.sk/rss → nie je feed (text/html); www.uvo.gov.sk/
- **Úrad pre reguláciu sieťových odvetví** (`urso`) — RSS: nenájdený platný feed (www.urso.gov.sk/rss → HTTP 404; www.urso.gov.sk/rss/ → HTTP 404; www.urso.gov.sk/feed → HTTP 404; www.urso.gov.sk/feed/ → HTTP 404).
- **Rada pre vysielanie a retransmisiu** (`rvr`) — Regulátor vysielania; relevantné pre médiá. RSS: nenájdený platný feed (www.rvr.sk/rss → HTTP 404; www.rvr.sk/rss/ → HTTP 404; www.rvr.sk/feed → HTTP 404; www.r
- **Úrad na ochranu osobných údajov** (`dataprotection`) — RSS: nenájdený platný feed (dataprotection.gov.sk/rss → HTTP 404; dataprotection.gov.sk/rss/ → HTTP 404; dataprotection.gov.sk/feed → HTTP 404; dataprotection.g
- **Inštitút finančnej politiky (MF SR)** (`ifp`) — 
- **ÚPSVR (ústredie práce, sociálnych vecí a rodiny)** (`upsvr`) — RSS: nenájdený platný feed (www.upsvr.gov.sk/rss.html?page_id=189 → nie je feed (text/html); www.upsvr.gov.sk/rss → nie je feed (text/html); www.upsvr.gov.sk/rs
- **Úrad verejného zdravotníctva SR** (`uvzsr`) — RSS: nenájdený platný feed (www.uvzsr.sk/rss → HTTP 404; www.uvzsr.sk/rss/ → HTTP 404; www.uvzsr.sk/feed → HTTP 404; www.uvzsr.sk/feed/ → HTTP 404).
- **Štátny ústav pre kontrolu liekov** (`sukl`) — RSS: nenájdený platný feed (www.sukl.sk/rss → HTTP 404; www.sukl.sk/rss/ → HTTP 404; www.sukl.sk/feed → HTTP 404; www.sukl.sk/feed/ → HTTP 404).
- **Slovenský hydrometeorologický ústav (výstrahy)** (`shmu`) — 
- **Trenčiansky samosprávny kraj** (`kraj-tsk`) — Voľby 24. 10. 2026 (predseda kraja). RSS: nenájdený platný feed (www.tsk.sk/rss → nie je feed (text/html); www.tsk.sk/rss/ → nie je feed (text/html); www.tsk.sk
- **Košický samosprávny kraj** (`kraj-ksk`) — Voľby 24. 10. 2026 (predseda kraja). RSS: nenájdený platný feed (www.kosickazupa.sk/rss → HTTP 404; www.kosickazupa.sk/rss/ → HTTP 404; www.kosickazupa.sk/feed 
- **Mesto Bratislava** (`mesto-ba`) — Voľby 24. 10. 2026 (primátor). RSS: nenájdený platný feed (bratislava.sk/rss → HTTP 404; bratislava.sk/rss/ → HTTP 404; bratislava.sk/feed → HTTP 404; bratislav
- **Mesto Prešov** (`mesto-po`) — Voľby 24. 10. 2026 (primátor). RSS: nenájdený platný feed (www.presov.sk/rss → HTTP 404; www.presov.sk/rss/ → HTTP 404; www.presov.sk/feed → HTTP 404; www.preso
- **Hlavné správy (YouTube)** (`yt-hlavnespravy`) — RSS: nenájdený platný feed (žiadny kandidát). neaktívny feed: https://www.youtube.com/feeds/videos.xml?channel_id=UCs3NaeO10RxshJVWdcEN_Iw (posledná položka 202
- **Dobré ráno (SME)** (`pod-dobre-rano`) — Zvukový podcast (feed z Apple Podcasts, country=SK). Denný podcast denníka SME. RSS: nenájdený platný feed (www.omnycontent.com/d/playlist/67682ce6-d1e9-437d-bd
- **Ranný brífing SME** (`pod-ranny-brifing`) — Zvukový podcast (feed z Apple Podcasts, country=SK). RSS: nenájdený platný feed (www.omnycontent.com/d/playlist/67682ce6-d1e9-437d-bd7e-b12201270fe1/fdf64332-de
- **NAHLAS (Aktuality.sk)** (`pod-nahlas`) — Zvukový podcast (feed z Apple Podcasts, country=SK). RSS: nenájdený platný feed (feeds.captivate.fm/nahlas-aktualitysk/ → nie je feed (application/xml)).
- **Fair Play Michala Kovačiča (Aktuality.sk)** (`pod-fair-play`) — Zvukový podcast (feed z Apple Podcasts, country=SK). RSS: nenájdený platný feed (žiadny kandidát). neaktívny feed: https://anchor.fm/s/114fc3cfc/podcast/rss (po
- **Podcasty Aktuality.sk** (`pod-aktuality`) — Zvukový podcast (feed z Apple Podcasts, country=SK). RSS: nenájdený platný feed (feeds.captivate.fm/podcasty-aktualitysk/ → nie je feed (application/xml)).
- **Eduard Chmelár Podcast** (`pod-chmelar`) — Zvukový podcast (feed z Apple Podcasts, country=SK). RSS: nenájdený platný feed (žiadny kandidát). neaktívny feed: https://feed.podbean.com/eduardchmelarpodcast
- **Podcasty a rozhovory Hlavné správy** (`pod-hlavnespravy`) — Zvukový podcast (feed z Apple Podcasts, country=SK). RSS: nenájdený platný feed (žiadny kandidát). neaktívny feed: https://feed.podbean.com/hlavnespravy/feed.xm
- **Na telo s Michalom Kovačičom (Markíza)** (`pod-na-telo`) — Zvukový podcast (feed z Apple Podcasts, country=SK). RSS: nenájdený platný feed (žiadny kandidát). neaktívny feed: https://feeds.soundcloud.com/users/soundcloud
- **Dnes večer s Michalom Šimečkom (Štúdio Štúrova)** (`pod-dnes-vecer-simecka`) — Zvukový podcast (feed z Apple Podcasts, country=SK). Štúdio Štúrova je spojené s PS; zdroj stranícky. RSS: nenájdený platný feed (žiadny kandidát). neaktívny fe
- **Bod Varu (Štúdio Štúrova)** (`pod-bod-varu`) — Zvukový podcast (feed z Apple Podcasts, country=SK). Štúdio Štúrova je spojené s PS; zdroj stranícky. RSS: nenájdený platný feed (žiadny kandidát). neaktívny fe
- **Plán pre budúcnosť (Progresívne Slovensko)** (`pod-ps-plan`) — Zvukový podcast (feed z Apple Podcasts, country=SK). Stranícky podcast. RSS: nenájdený platný feed (žiadny kandidát). neaktívny feed: https://www.spreaker.com/s
- **Igor Matovič (YouTube)** (`yt-matovic`) — RSS: nenájdený platný feed (žiadny kandidát). neaktívny feed: https://www.youtube.com/feeds/videos.xml?channel_id=UCsZbmwDA4qNkIvntsPlYRpg (posledná položka 202
- **Ľuboš Blaha (YouTube)** (`yt-blaha`) — RSS: nenájdený platný feed (žiadny kandidát). neaktívny feed: https://www.youtube.com/feeds/videos.xml?channel_id=UCQoZFnw0SF-f2aLUPm0V_WQ (posledná položka 202

### Neoverené (web neodpovedal)
- **Aktuálne.sk** (`aktualne`) — web nedostupný (ERR_TLS_CERT_ALTNAME_INVALID). RSS: nenájdený platný feed (žiadny kandidát).
- **Literárny týždenník** (`literarnytyzdennik`) — web nedostupný (UND_ERR_CONNECT_TIMEOUT). RSS: nenájdený platný feed (žiadny kandidát).
- **Forbes Slovensko** (`forbes`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (žiadny kandidát).
- **Ekonomika SME** (`ekonomika-sme`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (ekonomika.sme.sk/rss → HTTP 429).
- **Zdravotnícke noviny** (`zdravotnickenoviny`) — web nedostupný (ERR_SSL_SSL/TLS_ALERT_HANDSHAKE_FAILURE). RSS: nenájdený platný feed (žiadny kandidát).
- **Učiteľské noviny** (`ucitelskenoviny`) — web nedostupný (ERR_TLS_CERT_ALTNAME_INVALID). RSS: nenájdený platný feed (žiadny kandidát).
- **Euractiv Slovensko** (`euractiv`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (žiadny kandidát).
- **Slobodný vysielač** (`slobodnyvysielac`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (žiadny kandidát).
- **GLOBSEC** (`globsec`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (žiadny kandidát).
- **The Slovak Spectator** (`spectator`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (žiadny kandidát).
- **Korzár (Košice, Prešov a východ)** (`korzar`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (korzar.sme.sk/rss → HTTP 429).
- **MY Nitrianske noviny** (`mynitra`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (mynitra.sme.sk/rss → HTTP 429).
- **MY Žilina** (`myzilina`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (myzilina.sme.sk/rss → HTTP 429).
- **MY Trenčianske noviny** (`mytrencin`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (mytrencin.sme.sk/rss → HTTP 429).
- **MY Trnava** (`mytrnava`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (mytrnava.sme.sk/rss → HTTP 429).
- **MY Banská Bystrica** (`mybystrica`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (mybystrica.sme.sk/rss → HTTP 429).
- **MY regionálne noviny (Petit Press, prehľad)** (`my-sme`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva).
- **Rádio Jemné** (`jemne`) — web nedostupný (UND_ERR_CONNECT_TIMEOUT). RSS: nenájdený platný feed (žiadny kandidát).
- **TV Noe** (`tvnoe`) — web nedostupný (ENOTFOUND). RSS: nenájdený platný feed (žiadny kandidát).
- **Národná rada SR (nrsr.sk)** (`nrsr`) — Rieši iný agent (XDR – Národná rada); tu iba zaznačená. RSS: nenájdený platný feed (žiadny kandidát).
- **Ministerstvo zahraničných vecí a európskych záležitostí SR** (`mzv`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (žiadny kandidát).
- **Ministerstvo dopravy SR** (`mindop`) — web nedostupný (UND_ERR_CONNECT_TIMEOUT). RSS: nenájdený platný feed (žiadny kandidát).
- **Ministerstvo cestovného ruchu a športu SR** (`mcrs`) — web nedostupný (ENOTFOUND). RSS: nenájdený platný feed (žiadny kandidát).
- **Súdy SR – Občan a justícia (obcan.justice.sk)** (`justice-sudy`) — web nedostupný (HTTP 404). API overené (200, application/json).
- **Tlačová rada SR** (`tlacovarada`) — web nedostupný (ENOTFOUND).
- **Štatistický úrad SR (DATAcube)** (`statistics`) — web nedostupný (HTTP 403). web odmieta boty (403/výzva). RSS: nenájdený platný feed (žiadny kandidát). API overené (200, application/json).
- **Živnostenský register** (`zrsr`) — web nedostupný (UNABLE_TO_GET_ISSUER_CERT_LOCALLY).
- **Bratislavský samosprávny kraj** (`kraj-bsk`) — web nedostupný (ERR_TLS_CERT_ALTNAME_INVALID). RSS: nenájdený platný feed (žiadny kandidát).
- **Banskobystrický samosprávny kraj** (`kraj-bbsk`) — web nedostupný (UNABLE_TO_VERIFY_LEAF_SIGNATURE). RSS: nenájdený platný feed (žiadny kandidát).

### Paywall (signály v HTML článkov)
- **Denník N** (`dennikn`) — 
- **Denník E (dennike.sk)** (`dennike`) — 
- **Týždeň** (`tyzden`) — 
- **Finweb (HN)** (`finweb`) — 
- **Energie-portal.sk** (`energie-portal`) — 
- **Emefka** (`emefka`) — 
- **Hospodářské noviny (CZ)** (`hn-cz`) — 

### Odmietajú UA Netopier, ale pustia prehliadačový UA
_žiadne_

## Poznámky k zberu

- **Poctivý user-agent.** Overenie aj príjem majú používať `Netopier/2 (+https://hriech.xvadur.com; zber verejnych zdrojov)`. Kde web tento UA odmietne a pustí prehliadačový, je to v `poznamka`; Cloudflare výzvy („Just a moment“, „Security Verification“) sa neobchádzajú.
- **TLS.** Niektoré štátne a regionálne weby posielajú neúplný reťazec certifikátov (Node ich neoverí, prehliadač áno). Také zdroje majú `overene_at = null` a chybu v `poznamka`; pri príjme treba rozhodnúť, či sa pripojiť s doplneným reťazcom.
- **SME / Petit Press.** Web je za Cloudflare výzvou; pri väčšom tempe vracia 429/403. Overené sú iba feedy, ktoré prešli pri pokuse; príjem musí byť pomalý (rozostup rádovo sekúnd) alebo cez iný kanál.
- **Zdroje, ktoré už zbiera existujúci konektor** (`crz`, `ted`, `kataster`, `statistika`) sú v registri kvôli úplnosti; ich API sú overené alebo označené ako overené konektorom.
- **Národná rada SR** je v registri iba zaznačená (rieši ju iný agent).
- Súvisiace: rozbor webov redakcií (news sitemapy, JSON-LD, live) v `docs/redakcie-weby.md` (XDR-298), kartičky zdrojov v D1 (`zdroje`, `zdroj_kanaly`) sa plnia z `register.json`.
