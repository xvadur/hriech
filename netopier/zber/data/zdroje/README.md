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
| medium | 137 | 96 | 30 | 38 | 120 |
| agentura | 5 | 4 | 0 | 3 | 5 |
| tv | 11 | 5 | 2 | 1 | 10 |
| radio | 9 | 3 | 0 | 0 | 8 |
| podcast | 62 | 50 | 0 | 0 | 62 |
| statny_zdroj | 83 | 41 | 5 | 12 | 77 |
| register | 14 | 0 | 0 | 9 | 12 |
| ine | 9 | 6 | 0 | 0 | 9 |
| **spolu** | 330 | 205 | 37 | 63 | 303 |

Podľa kategórie:

| kategória | zdrojov | s RSS |
|---|---|---|
| samsprava | 43 | 26 |
| podcast_relacia | 37 | 26 |
| alternativne | 35 | 29 |
| regionalne | 26 | 15 |
| youtube_kanal | 25 | 24 |
| celostatne | 18 | 12 |
| ministerstvo | 15 | 6 |
| zahranicne | 11 | 11 |
| tv | 10 | 2 |
| ekonomicke | 9 | 7 |
| tyzdennik | 8 | 3 |
| radio | 8 | 2 |
| politik_youtube | 8 | 6 |
| register | 7 | 0 |
| bulvar | 6 | 4 |
| investigativa | 6 | 5 |
| financie | 6 | 4 |
| agentury | 5 | 4 |
| odborne | 5 | 2 |
| technologie | 4 | 4 |
| sudy | 4 | 1 |
| regulator | 4 | 1 |
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

## Zdroje s celým textom v RSS

- **Hospodárske noviny (HNonline)** (`hnonline`) — https://hnonline.sk/feed
- **iDEN** (`iden`) — https://iden.sk/rss
- **Slovenka** (`slovenka`) — https://zenskyweb.sk/feed/
- **Finweb (HN)** (`finweb`) — https://hnonline.sk/finweb/feed
- **Podnikam.sk (SITA)** (`podnikam`) — https://podnikam.sk/rss
- **Transparency International Slovensko** (`transparency`) — https://transparency.sk/sk/feed/
- **Slovensko.Digital** (`slovensko-digital`) — https://slovensko.digital/feed/
- **Via Iuris** (`viaiuris`) — https://viaiuris.sk/feed/
- **Bratislavaden.sk** (`bratislavaden`) — https://bratislavaden.sk/rss
- **Nitraden.sk** (`nitraden`) — https://nitraden.iden.sk/rss
- **Košice Dnes** (`kosicednes`) — https://kosicednes.sk/feed
- **Emefka** (`emefka`) — https://emefka.sk/rss
- **Odzadu** (`odzadu`) — https://www.odzadu.sk/feed/
- **Paraméter** (`parameter`) — https://parameter.sk/feed
- **sho.sk** (`k-sho`) — https://sho.sk/feed/
- **inenoviny.sk** (`k-inenoviny`) — https://www.inenoviny.sk/feed/
- **slovanskenoviny.sk** (`k-slovanskenoviny`) — https://slovanskenoviny.sk/feed/
- **snn.sk** (`k-snn`) — https://snn.sk/feed/
- **srspol.sk** (`k-srspol`) — https://www.srspol.sk/feed/
- **akw.sk** (`k-akw`) — https://akw.sk/feed/
- **odznova.sk** (`k-odznova`) — https://www.odznova.sk/feed/
- **plenum.sk** (`k-plenum`) — https://plenum.sk/feed/
- **aktuality24.sk** (`k-aktuality24`) — https://aktuality24.sk/feed/
- **tvotv.sk** (`k-tvotv`) — https://www.tvotv.sk/feed/
- **skspravy.sk** (`k-skspravy`) — https://skspravy.sk/feed/
- **christianitas.sk** (`k-christianitas`) — https://christianitas.sk/rss
- **dennikvv.sk** (`k-dennikvv`) — https://www.dennikvv.sk/feed/
- **bystricoviny.sk** (`k-bystricoviny`) — https://www.bystricoviny.sk/feed/
- **institutisop.sk** (`k-institutisop`) — https://www.institutisop.sk/rss/
- **veci-verejne.sk** (`k-veci-verejne`) — https://veci-verejne.sk/feed/
- **Mesto Poprad** (`mesto-poprad`) — https://www.poprad.sk/rss/news
- **STVR Správy** (`stvr-spravy`) — https://spravy.stvr.sk/feed/
- **Rada pre rozpočtovú zodpovednosť** (`rrz`) — https://www.rrz.sk/rss
- **Žilinský samosprávny kraj** (`kraj-zsk`) — https://www.zilinskazupa.sk/rss
- **Mesto Trnava** (`mesto-tt`) — https://www.trnava.sk/rss/news
- **Mesto Košice** (`mesto-ke`) — https://www.kosice.sk/rss/aktuality
- **CNN Prima News (TV Prima)** (`prima-cnn`) — https://cnn.iprima.cz/rss

## API a exporty

- **Startitup** (`startitup`) — https://www.startitup.sk/wp-json/wp/v2/posts
- **Vosveteit.sk** (`vosveteit`) — https://vosveteit.zoznam.sk/wp-json/wp/v2/posts
- **Techbox.sk** (`techbox`) — https://www.techbox.sk/wp-json/wp/v2/posts
- **Hlavné správy** (`hlavnespravy`) — https://www.hlavnespravy.sk/wp-json/wp/v2/posts
- **eReport** (`ereport`) — https://ereport.sk/wp-json/wp/v2/posts
- **iDEN** (`iden`) — https://iden.sk/wp-json/wp/v2/posts
- **Webnoviny.sk (SITA)** (`webnoviny`) — https://sita.sk/wp-json/wp/v2/posts
- **SITA.sk** (`sita`) — https://sita.sk/wp-json/wp/v2/posts
- **Slovenka** (`slovenka`) — https://zenskyweb.sk/wp-json/wp/v2/posts
- **Zem a vek** (`zemavek`) — https://zemavek.sk/wp-json/wp/v2/posts
- **Podnikam.sk (SITA)** (`podnikam`) — https://podnikam.sk/wp-json/wp/v2/posts
- **Poľnoinfo** (`polnoinfo`) — https://polnoinfo.sk/wp-json/wp/v2/posts
- **ZVTV** (`zvtv`) — https://zvtv.sk/wp-json/wp/v2/posts
- **Armádny magazín** (`armadnymagazin`) — https://www.armadnymagazin.sk/wp-json/wp/v2/posts
- **Transparency International Slovensko** (`transparency`) — https://transparency.sk/wp-json/wp/v2/posts
- **Via Iuris** (`viaiuris`) — https://viaiuris.sk/wp-json/wp/v2/posts
- **Blogy Pravda** (`pravda-blog`) — https://blog.pravda.sk/wp-json/wp/v2/posts
- **Nitraden.sk** (`nitraden`) — https://nitraden.iden.sk/wp-json/wp/v2/posts
- **Zoznam Regióny** (`regiony-zoznam`) — https://regiony.zoznam.sk/wp-json/wp/v2/posts
- **Trnava LIVE** (`trnava-live`) — https://www.trnava-live.sk/wp-json/wp/v2/posts
- **Interez** (`interez`) — https://www.interez.sk/wp-json/wp/v2/posts
- **Odzadu** (`odzadu`) — https://www.odzadu.sk/wp-json/wp/v2/posts
- **Moja Žilina** (`moja-zilina`) — https://www.moja-zilina.sk/wp-json/wp/v2/posts
- **sho.sk** (`k-sho`) — https://sho.sk/wp-json/wp/v2/posts
- **chcemeslobodu.sk** (`k-chcemeslobodu`) — https://www.chcemeslobodu.sk/wp-json/wp/v2/posts
- **inenoviny.sk** (`k-inenoviny`) — https://www.inenoviny.sk/wp-json/wp/v2/posts
- **oral.sk** (`k-oral`) — https://oral.sk/wp-json/wp/v2/posts
- **slovanskenoviny.sk** (`k-slovanskenoviny`) — https://slovanskenoviny.sk/wp-json/wp/v2/posts
- **silavedomia.sk** (`k-silavedomia`) — https://silavedomia.sk/wp-json/wp/v2/posts
- **srspol.sk** (`k-srspol`) — https://www.srspol.sk/wp-json/wp/v2/posts
- **akw.sk** (`k-akw`) — https://akw.sk/wp-json/wp/v2/posts
- **belobog.sk** (`k-belobog`) — https://www.belobog.sk/wp-json/wp/v2/posts
- **odznova.sk** (`k-odznova`) — https://www.odznova.sk/wp-json/wp/v2/posts
- **slovenskeslovo.sk** (`k-slovenskeslovo`) — https://slovenskeslovo.sk/wp-json/wp/v2/posts
- **tvotv.sk** (`k-tvotv`) — https://www.tvotv.sk/wp-json/wp/v2/posts
- **skspravy.sk** (`k-skspravy`) — https://skspravy.sk/wp-json/wp/v2/posts
- **christianitas.sk** (`k-christianitas`) — https://christianitas.sk/wp-json/wp/v2/posts
- **dennikvv.sk** (`k-dennikvv`) — https://www.dennikvv.sk/wp-json/wp/v2/posts
- **slovenskoaktualne.sk** (`k-slovenskoaktualne`) — https://slovenskoaktualne.sk/wp-json/wp/v2/posts
- **veci-verejne.sk** (`k-veci-verejne`) — https://veci-verejne.sk/wp-json/wp/v2/posts
- **Mesto Prievidza** (`mesto-prievidza`) — https://prievidza.sk/wp-json/wp/v2/posts
- **Mesto Komárno** (`mesto-komarno`) — https://www.komarno.sk/wp-json/wp/v2/posts
- **Mesto Ružomberok** (`mesto-ruzomberok`) — https://www.ruzomberok.sk/wp-json/wp/v2/posts
- **Mesto Senec** (`mesto-senec`) — https://www.senec.sk/wp-json/wp/v2/posts
- **STVR Správy** (`stvr-spravy`) — https://spravy.stvr.sk/wp-json/wp/v2/posts
- **SITA – Slovenská informačná a tlačová agentúra** (`sita-agentura`) — https://sita.sk/wp-json/wp/v2/posts
- **Súdy SR – Občan a justícia (obcan.justice.sk)** (`justice-sudy`) — https://obcan.justice.sk/pilot/api/ress-isu-service/v1 (JSON: rozhodnutie, sudca, sud; stránkovanie page/size)
- **Rada pre rozpočtovú zodpovednosť** (`rrz`) — https://www.rrz.sk/wp-json/wp/v2/posts
- **Štatistický úrad SR (DATAcube)** (`statistics`) — https://data.statistics.sk/api/v2 (JSON-stat, DATAcube)
- **Centrálny register zmlúv (CRZ)** (`crz`) — https://www.crz.gov.sk/export/YYYY-MM-DD.zip (XML, denný export)
- **TED – Tenders Electronic Daily (SR)** (`ted`) — https://api.ted.europa.eu/v3/notices/search (POST, JSON)
- **Register právnických osôb (RPO, ŠÚ SR)** (`rpo`) — https://api.statistics.sk/rpo/v1 (REST JSON: /search, /entity/{id})
- **Register účtovných závierok** (`registeruz`) — https://www.registeruz.sk/cruz-public/api (JSON: uctovne-jednotky, uctovne-zavierky, …)
- **Register partnerov verejného sektora (RPVS)** (`rpvs`) — https://rpvs.gov.sk/opendatav2 (OData v4)
- **Kataster nehnuteľností (ÚGKK, INSPIRE WFS)** (`katastera`) — https://inspirews.skgeodesy.sk/geoserver/cp/ows (WFS, parcely CP)
- **Národný katalóg otvorených dát (data.slovensko.sk)** (`data-slovensko`) — https://data.slovensko.sk/api/sparql (SPARQL 1.1)
- **Eurostat (dáta za SR)** (`eurostat`) — https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{dataset}?geo=SK (JSON-stat)
- **Trnavský samosprávny kraj** (`kraj-ttsk`) — https://trnava-vuc.sk/wp-json/wp/v2/posts
- **Prešovský samosprávny kraj** (`kraj-psk`) — https://psk.sk/wp-json/wp/v2/posts
- **Mesto Trenčín** (`mesto-tn`) — https://trencin.sk/wp-json/wp/v2/posts
- **Mesto Nitra** (`mesto-nr`) — https://nitra.sk/wp-json/wp/v2/posts
- **Mesto Žilina** (`mesto-za`) — https://zilina.sk/wp-json/wp/v2/posts
- **Mesto Banská Bystrica** (`mesto-bb`) — https://www.banskabystrica.sk/wp-json/wp/v2/posts

## Čo sa nedá (alebo nedá bez ďalšieho) zbierať

### Web alebo feed blokuje boty (Cloudflare výzva, 403/429)
- **Forbes Slovensko** (`forbes`) — web: HTTP 403; web odmieta boty (403/výzva)
- **Euractiv Slovensko** (`euractiv`) — web: HTTP 403; web odmieta boty (403/výzva)
- **Slobodný vysielač** (`slobodnyvysielac`) — web: HTTP 403; web odmieta boty (403/výzva)
- **GLOBSEC** (`globsec`) — web: HTTP 403; web odmieta boty (403/výzva)
- **The Slovak Spectator** (`spectator`) — web: HTTP 403; web odmieta boty (403/výzva)
- **MY Nitrianske noviny** (`mynitra`) — web: HTTP 403; web odmieta boty (403/výzva); feed vracia 429 (limit dotazov)
- **MY Žilina** (`myzilina`) — web: HTTP 403; web odmieta boty (403/výzva); feed vracia 429 (limit dotazov)
- **MY Trenčianske noviny** (`mytrencin`) — web: HTTP 403; web odmieta boty (403/výzva); feed vracia 429 (limit dotazov)
- **MY Trnava** (`mytrnava`) — web: HTTP 403; web odmieta boty (403/výzva); feed vracia 429 (limit dotazov)
- **MY Banská Bystrica** (`mybystrica`) — web: HTTP 403; web odmieta boty (403/výzva); feed vracia 429 (limit dotazov)
- **MY regionálne noviny (Petit Press, prehľad)** (`my-sme`) — web: HTTP 403; web odmieta boty (403/výzva)
- **MY Horná Nitra** (`myhornanitra`) — web: HTTP 403; web odmieta boty (403/výzva); feed vracia 429 (limit dotazov)
- **Ministerstvo zahraničných vecí a európskych záležitostí SR** (`mzv`) — web: HTTP 403; web odmieta boty (403/výzva)
- **Štatistický úrad SR (DATAcube)** (`statistics`) — web: HTTP 403; web odmieta boty (403/výzva)

### Chyba certifikátu (neúplný reťazec, nesedí názov)
- **Aktuálne.sk** (`aktualne`) — web: ERR_TLS_CERT_ALTNAME_INVALID
- **Zdravotnícke noviny** (`zdravotnickenoviny`) — web: ERR_SSL_SSL/TLS_ALERT_HANDSHAKE_FAILURE
- **Učiteľské noviny** (`ucitelskenoviny`) — web: ERR_TLS_CERT_ALTNAME_INVALID
- **Živnostenský register** (`zrsr`) — web: UNABLE_TO_GET_ISSUER_CERT_LOCALLY
- **Bratislavský samosprávny kraj** (`kraj-bsk`) — web: ERR_TLS_CERT_ALTNAME_INVALID
- **Banskobystrický samosprávny kraj** (`kraj-bbsk`) — web: UNABLE_TO_VERIFY_LEAF_SIGNATURE

### Web neodpovedal (timeout, DNS)
- **Literárny týždenník** (`literarnytyzdennik`) — web: UND_ERR_CONNECT_TIMEOUT
- **napalete.sk** (`k-napalete`) — web: The operation was aborted due to timeout
- **Rádio Jemné** (`jemne`) — web: UND_ERR_CONNECT_TIMEOUT
- **TV Noe** (`tvnoe`) — web: ENOTFOUND
- **Ministerstvo dopravy SR** (`mindop`) — web: UND_ERR_CONNECT_TIMEOUT
- **Súdy SR – Občan a justícia (obcan.justice.sk)** (`justice-sudy`) — web: HTTP 404

### Web funguje, ale nenašiel sa platný feed
- **Nový Čas** (`cas`) — RSS nenájdený
- **Zoznam Správy** (`zoznam-spravy`) — RSS nenájdený
- **Dôležité.sk** (`dolezite`) — RSS nenájdený
- **Bratislavské noviny** (`bratislavskenoviny`) — RSS nenájdený
- **Hlavný denník** (`hlavnydennik`) — RSS nenájdený
- **Noviny.sk (TV JOJ)** (`noviny`) — RSS nenájdený
- **TN LIVE / TVNoviny.sk (Markíza)** (`tvnoviny`) — RSS nenájdený
- **Plus 7 dní** (`plus7dni`) — RSS nenájdený; feed bez položiek
- **Index (týždenník)** (`index`) — RSS nenájdený
- **Trend (etrend.sk / trend.sk)** (`etrend`) — RSS nenájdený
- **Infovojna** (`infovojna`) — RSS nenájdený
- **Báječné ženy** (`bajecnezeny`) — RSS nenájdený
- **Demagog.sk** (`demagog`) — RSS nenájdený
- **Konšpirátori.sk** (`konspiratori`) — iba web, feed sa nehľadal (bez RSS)
- **Slobodná Európa (RFE/RL)** (`slobodnaeuropa`) — RSS nenájdený
- **Trnavský hlas** (`trnavskyhlas`) — RSS nenájdený
- **Azet.sk** (`azet`) — RSS nenájdený
- **Új Szó** (`ujszo`) — RSS nenájdený
- **Vasárnap** (`vasarnap`) — RSS nenájdený
- **Regionpress** (`regionpress`) — RSS nenájdený
- **Netky (regióny)** (`netky`) — RSS nenájdený
- **Mesto Zvolen** (`mesto-zvolen`) — RSS nenájdený
- **Mesto Spišská Nová Ves** (`mesto-snv`) — RSS nenájdený
- **Mesto Levice** (`mesto-levice`) — RSS nenájdený
- **Mesto Liptovský Mikuláš** (`mesto-lm`) — RSS nenájdený
- **Mesto Lučenec** (`mesto-lucenec`) — RSS nenájdený
- **Mesto Topoľčany** (`mesto-topolcany`) — RSS nenájdený
- **Mesto Trebišov** (`mesto-trebisov`) — RSS nenájdený
- **Mesto Rimavská Sobota** (`mesto-rimavskasobota`) — RSS nenájdený
- **Mesto Partizánske** (`mesto-partizanske`) — RSS nenájdený
- **Mesto Pezinok** (`mesto-pezinok`) — RSS nenájdený
- **Mesto Hlohovec** (`mesto-hlohovec`) — RSS nenájdený
- **STVR (Slovenská televízia a rozhlas)** (`stvr`) — RSS nenájdený
- **Rádio Slovensko / Rádiožurnál (STVR)** (`stvr-slovensko`) — RSS nenájdený
- **Rádio Regina (STVR)** (`stvr-regina`) — RSS nenájdený
- **Rádio Slovakia International (STVR)** (`stvr-rsi`) — RSS nenájdený
- **TV Markíza** (`markiza`) — RSS nenájdený
- **TV JOJ** (`joj`) — RSS nenájdený
- **JOJ 24** (`joj24`) — RSS nenájdený
- **Fun Rádio** (`funradio`) — RSS nenájdený
- **Rádio Lumen** (`lumen`) — RSS nenájdený
- **TV LUX** (`tvlux`) — RSS nenájdený
- **TASR – Tlačová agentúra SR** (`tasr`) — RSS nenájdený
- **Prezident SR** (`prezident`) — RSS nenájdený
- **Ministerstvo vnútra SR** (`minv`) — RSS nenájdený
- **Ministerstvo zdravotníctva SR** (`health`) — RSS nenájdený
- **Ministerstvo životného prostredia SR** (`minzp`) — RSS nenájdený
- **Ministerstvo kultúry SR** (`culture`) — RSS nenájdený
- **Ministerstvo spravodlivosti SR** (`justice`) — RSS nenájdený; feed bez položiek
- **Ministerstvo investícií, regionálneho rozvoja a informatizácie SR** (`mirri`) — RSS nenájdený; feed bez položiek
- **Ministerstvo cestovného ruchu a športu SR** (`mcrs`) — RSS nenájdený
- **Polícia SR (sekcia na minv.sk)** (`policia`) — iba web, feed sa nehľadal (bez RSS)
- **Generálna prokuratúra SR** (`genpro`) — RSS nenájdený
- **Najvyšší súd SR** (`nsud`) — RSS nenájdený
- **Úrad pre verejné obstarávanie** (`uvo`) — RSS nenájdený
- **Úrad pre reguláciu sieťových odvetví** (`urso`) — RSS nenájdený
- **Rada pre vysielanie a retransmisiu** (`rvr`) — RSS nenájdený
- **Úrad na ochranu osobných údajov** (`dataprotection`) — RSS nenájdený
- **Inštitút finančnej politiky (MF SR)** (`ifp`) — iba web, feed sa nehľadal (bez RSS)
- **ÚPSVR (ústredie práce, sociálnych vecí a rodiny)** (`upsvr`) — RSS nenájdený
- **Úrad verejného zdravotníctva SR** (`uvzsr`) — RSS nenájdený
- **Štátny ústav pre kontrolu liekov** (`sukl`) — RSS nenájdený
- **Slovenský hydrometeorologický ústav (výstrahy)** (`shmu`) — iba web, feed sa nehľadal (bez RSS)
- **Trenčiansky samosprávny kraj** (`kraj-tsk`) — RSS nenájdený
- **Košický samosprávny kraj** (`kraj-ksk`) — RSS nenájdený
- **Mesto Bratislava** (`mesto-ba`) — RSS nenájdený
- **Mesto Prešov** (`mesto-po`) — RSS nenájdený
- **Dobré ráno (SME)** (`pod-dobre-rano`) — RSS nenájdený
- **Ranný brífing SME** (`pod-ranny-brifing`) — RSS nenájdený
- **NAHLAS (Aktuality.sk)** (`pod-nahlas`) — RSS nenájdený
- **Podcasty Aktuality.sk** (`pod-aktuality`) — RSS nenájdený

### Feedy neaktívne dlhšie ako 30 dní
- **Dnes24.sk** (`dnes24`) — feed neaktívny (posledná položka 2020-01-06); RSS nenájdený
- **Katolícke noviny** (`katolickenoviny`) — feed neaktívny (posledná položka 2023-01-30); RSS nenájdený
- **Vsieti.sk** (`vsieti`) — feed neaktívny (posledná položka 2015-04-25); RSS nenájdený
- **ZVTV** (`zvtv`) — feed neaktívny (posledná položka 2025-03-28); RSS nenájdený
- **Rokovania vlády SR (rokovania.gov.sk)** (`rokovania-vlady`) — feed neaktívny (posledná položka 2012-06-21); RSS nenájdený
- **Hlavné správy (YouTube)** (`yt-hlavnespravy`) — feed neaktívny (posledná položka 2026-08-05); RSS nenájdený
- **Fair Play Michala Kovačiča (Aktuality.sk)** (`pod-fair-play`) — feed neaktívny (posledná položka 2023-04-17); RSS nenájdený
- **Eduard Chmelár Podcast** (`pod-chmelar`) — feed neaktívny (posledná položka 2020-03-25); RSS nenájdený
- **Podcasty a rozhovory Hlavné správy** (`pod-hlavnespravy`) — feed neaktívny (posledná položka 2026-08-01); RSS nenájdený
- **Na telo s Michalom Kovačičom (Markíza)** (`pod-na-telo`) — feed neaktívny (posledná položka 2024-05-26); RSS nenájdený
- **Dnes večer s Michalom Šimečkom (Štúdio Štúrova)** (`pod-dnes-vecer-simecka`) — feed neaktívny (posledná položka 2026-07-05); RSS nenájdený
- **Bod Varu (Štúdio Štúrova)** (`pod-bod-varu`) — feed neaktívny (posledná položka 2026-05-29); RSS nenájdený
- **Plán pre budúcnosť (Progresívne Slovensko)** (`pod-ps-plan`) — feed neaktívny (posledná položka 2023-09-25); RSS nenájdený
- **Igor Matovič (YouTube)** (`yt-matovic`) — feed neaktívny (posledná položka 2024-06-03); RSS nenájdený
- **Ľuboš Blaha (YouTube)** (`yt-blaha`) — feed neaktívny (posledná položka 2022-09-08); RSS nenájdený

### Paywall (signály v HTML článkov; chýbajúci signál nie je dôkaz, že paywall neexistuje)
- **Denník N** (`dennikn`) — paywall: signály u 3/3 článkov (ld+json isAccessibleForFree=false; text o predplatnom)
- **Denník E (dennike.sk)** (`dennike`) — paywall: signály u 3/3 článkov (ld+json isAccessibleForFree=false; text o predplatnom)
- **Týždeň** (`tyzden`) — paywall: signály u 3/3 článkov (trieda paywall/locked)
- **Finweb (HN)** (`finweb`) — paywall: signály u 2/3 článkov (ld+json isAccessibleForFree=false)
- **Energie-portal.sk** (`energie-portal`) — paywall: signály u 3/3 článkov (trieda paywall/locked; text o predplatnom)
- **Emefka** (`emefka`) — paywall: signály u 1/3 článkov (ld+json isAccessibleForFree=false; trieda paywall/locked)
- **Hospodářské noviny (CZ)** (`hn-cz`) — paywall: signály u 1/3 článkov (ld+json isAccessibleForFree=false; trieda paywall/locked)

### Odmietajú UA Netopier, ale pustia prehliadačový UA
_žiadne_

## Poznámky k zberu

- **Poctivý user-agent.** Overenie aj príjem majú používať `Netopier/2 (+https://hriech.xvadur.com; zber verejnych zdrojov)`. Kde web tento UA odmietne a pustí prehliadačový, je to v `poznamka`; Cloudflare výzvy („Just a moment“, „Security Verification“) sa neobchádzajú.
- **TLS.** Niektoré štátne a regionálne weby posielajú neúplný reťazec certifikátov (Node ich neoverí, prehliadač áno). Také zdroje majú `overene_at = null` a chybu v `poznamka`; pri príjme treba rozhodnúť, či sa pripojiť s doplneným reťazcom.
- **SME / Petit Press.** Web je za Cloudflare výzvou; pri väčšom tempe vracia 429/403. Overené sú iba feedy, ktoré prešli pri pokuse; príjem musí byť pomalý (rozostup rádovo sekúnd) alebo cez iný kanál.
- **Zdroje, ktoré už zbiera existujúci konektor** (`crz`, `ted`, `kataster`, `statistika`) sú v registri kvôli úplnosti; ich API sú overené alebo označené ako overené konektorom.
- **Národná rada SR** je v registri iba zaznačená (rieši ju iný agent).
- Súvisiace: rozbor webov redakcií (news sitemapy, JSON-LD, live) v `docs/redakcie-weby.md` (XDR-298), kartičky zdrojov v D1 (`zdroje`, `zdroj_kanaly`) sa plnia z `register.json`.
