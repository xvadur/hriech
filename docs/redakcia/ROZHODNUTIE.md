# AI redakcia XVADUR: platné rozhodnutie (27. 9. 2026)

Adamove rozhodnutia z 27. 9. 2026, ktoré prebíjajú `navrh-architektury.md` (cloudový variant) tam, kde si odporujú. Register toho, čo má redakcia robiť, je v `register-funkcii.md` (124 funkcií, 7 slučiek, so zdrojmi; časť 7 nesie opravy z kritiky). Čo v návrhu chýba, je v `medzery-navrhu.md` (33 pokrytých, 50 čiastočne, 41 chýba).

## Kde čo beží

| | Rozhodnutie |
|---|---|
| Backend | všetko lokálne na Macu (beží stále): zber každých 2–5 minút, odvodenie udalostí, EKG, registre, redakčná linka agentov, terminál na `localhost`. Ten istý TypeScript kód ako v cloudovom návrhu, pracovná databáza SQLite s rovnakou schémou |
| Web | hriech.xvadur.com, Cloudflare zadarmo: Worker Free číta zobrazovaciu D1 Free; Mac tam posiela iba verejné riadky (posty, udalosti, zvody, skóre, vydania) hneď po schválení; Minúta je na webe do sekúnd, bez buildu a bez edge cache |
| Platené služby | žiadne, kým to nie je zabehnuté (Workers Paid, Access, World Monitor, Neon, Fly: nie) |
| Nasadenie kódu | z Macu na pokyn (`pnpm run deploy`), GitHub Actions nie; dáta idú hore priebežne bez nasadzovania |
| Agenti | Claude Code na Macu (agent `hriech` + subagenti triáž, reportér, overovateľ, redaktor, archivár), denný beh cez skill `/redakcia`; cloud routine a Paperclip nie |
| Notifikácie pre Adama | Telegram bot (nie macOS notifikácia, nie mail) |
| Meno | „Hriech“ je dočasné; meno, wordmark aj logo (odvodené z písmen slova) sa zmenia pri builde; v kóde ako `data/znacka.json` |

## Jadro pred Živé 30. 11. (nie moduly na Vianoce)

1. **Kalendár a anticipácia**: kalendáre inštitúcií (NR SR, vláda, prezident, súdy, OSN, EÚ, ŠÚ SR, voľby, výročia) + detekcia ohlásených udalostí zo zmienok („Danko zvolá tlačovku o 14:00“ je v systéme o 13:50 s príčinou a založeným prípadom).
2. **Filter relevancie pre Slovensko**: lokálna udalosť ostáva v archíve, eskaluje sa pri ministrovi, verejných peniazoch, systémovom vzorci alebo sledovanom pravidle; každá vynorená udalosť nesie čitateľný dôvod.
3. **Kauzy a paralelný výskum**: trvalý dossier kauzy, ohraničený research prípad s otázkou, falzifikátormi a rozpočtom; nulový výsledok sa tiež zapíše.
4. **Prepisy**: YouTube aj audio podcasty (Apple Podcasts, Spotify RSS), tlačovky (Ficove víkendové), relácie; prepis → segmenty → výroky pri aktérovi → databáza. Pipeline z Fikiho korpusu.
5. **Aktéri a sociálne siete**: tabuľka aktérov a ich účtov, kontrola dvakrát denne (Facebook, Instagram, Telegram), profil politika s líniou v čase; hranica: súkromné osoby nikdy.
6. **Meranie médií ako korpusová práca**: aktivita redakcií, tém, autorov a ich preferencie, rámovanie, sentiment, vata (meraná umiestnením), nepresnosti proti registrom, porovnanie záznam ↔ podanie, preklad ako degradácia; dezinfo weby a Telegram ako kategória zdrojov s dosahom v čase; Meta Ad Library (metóda postavená 11. 9.).
7. **Stroj, ktorý číta štát**: CRZ, TED, kataster, ŠÚ SR (postavené) + NR SR hlasovania, program vlády, ITMS eurofondy, rozpočet, RPO, RÚZ, RPVS; alert je lead pre človeka, nikdy obvinenie.
8. **Worldview a zvody**: línia ako kanonický dokument, zvody ako merateľná podoba, EKG dvoch kriviek (čo sa stalo verzus o čom sa píše), ledger predikcií a opráv (vlastných aj mediálnych), verejné `/opravy`.
9. **Výstupy**: Minúta bez meškania, stránka udalosti, denné vydanie, články cez writing engine (contract → evidence pack → claim map → draft → audity → Adam uzamkne), reaction docket, otázka týždňa, explainer, klipy; oslovenie dotknutých redakcií pred investigatívou.
10. **Princípy**: fakt, interpretácia a medzera vždy rozlíšené; každé tvrdenie s citáciou a archívom; AI autorstvo priznané z behov; kritika kritikov prechádza tou istou dôkazovou schémou; nič nejde von bez Adamovho slova.

## Regionálny rozsah

Slovensko prvé; CZ, PL, HU a vojna na Ukrajine ako samostatné prúdy s vlastnými zdrojmi; svetové kanály iba ako kontext (World Monitor katalóg, kategórie europe a gov).

## Prvý krok (lokálne, bez rozhodnutí)

Balík `@netopier/redakcia` so skóre (paritný test proti openclaw `scoring.js`), migrácia základu (normalizácia dátumov, entity podľa IČO, fulltext, kartičky zdrojov) nad lokálnymi 14 299 záznamami; lokálny plánovač namiesto cloudového cronu. Dôkaz: testy zelené, ≥ 13 400 normalizovaných dátumov, ≥ 4 000 väzieb entít, fulltext funguje.

## Otvorené pre Adama

Prvá sada zvodov (agent navrhne, Adam škrtne a zamkne), rozšírenie slovenských zdrojov (SME, TASR, HN, TA3, Markíza, JOJ, STVR, Postoj, Štandard, Refresher, Startitup, Trend), či Claude smie čítať verejné texty médií (STACK Netopiera to zatiaľ zakazuje), nové meno, Paperclip (XDR-226: navrhnuté pozastaviť).
