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

## Prvý krok (lokálne, bez rozhodnutí) — hotové 28. 9. 2026 (XDR-275)

Balík `@netopier/redakcia` so skóre (paritný test proti openclaw `scoring.js`), migrácia základu (normalizácia dátumov, entity podľa IČO, fulltext, kartičky zdrojov) nad lokálnymi 14 299 záznamami; lokálny plánovač namiesto cloudového cronu (samostatne XDR-279). Dôkaz splnený: testy zelené (redakcia 23, zber 34), 13 479 normalizovaných dátumov, 4 700 väzieb entít, fulltext funguje (`MATCH 'zmluva'` = 2 296); navyše meranie médií (lexika, titulky, poplašné slová) nad 3 SK redakciami. Stav v `netopier/STATUS.md`.

## Spresnenie 28. 9. 2026

„Skóre“ nie je jedno číslo, ale meranie médií podľa registra funkcií: lexika a skladba slov každej redakcie a autora, stavba titulkov, čomu sa venujú verzus čo sa stalo, aké otázky kladú, naratívy, sentiment, vata, nepresnosti, poplašné správy. Openclaw je jedna kontrola (mechanika zvodov), nie definícia; serverové skóre openclaw.sk sa z verejných dát nedá reprodukovať, parita platí pre klientsky `scoring.js`. Zdroje sú texty akéhokoľvek druhu vrátane prepisov (YouTube, podcasty): prepis sa nečíta celý, entitný a fulltextový filter (známe osoby, témy, kauzy) označí, o čom sa hovorí a kto tam je; celé sa číta iba označené. Claude smie čítať verejné texty médií celé (rozhodnuté 28. 9., `netopier/STACK.md`).

## Rozhodnutie 29. 9. 2026: Jev ako brána, čítací model iba nad označeným (XDR-283)

- **Brána Netopiera je Jev** (TypeSafe AI, model typovaných rozhodnutí) cez OpenRouter (`typesafe/jev-1.13`, 0,042 $ za milión vstupných tokenov, výstup zadarmo). Každý vstup (článok, úsek prepisu, výrok, post) prejde **vstupným filtrom XVADUR**: maticou otázok typu výber (až 255 štítkov), skóre (2–10 úrovní) a áno/nie. Osi matice v1: typ javu, doména, relevancia pre Slovensko, dôkaz, vata, poplašnosť, sentiment voči aktérovi, naratív, kauza (živý register štítkov), otázka novinára. Matica je verzovaný súbor, Adam škrtá a dopĺňa.
- **Čítací model** (zatiaľ Gemini 2.5 Flash-Lite cez OpenRouter) číta iba to, čo brána označila: vytiahne výrok s citáciou a časom, číslo, pomenuje jev, zhrnie úsek prepisu, porovná titulok s textom. Citácia sa overuje zhodou s originálom.
- **Lokálny model** (M4, 16 GB: Gemma 3 12B alebo Qwen 3 8B) ostáva ako možnosť podľa rozsahu; zatiaľ sa nenasadzuje.
- **Rozpočet:** do 10 € mesačne na celú prevádzku (odhad: Jev ~4,70 $, čítanie ~2 $). Hostinger GPU a Hermes agent v cloude zamietnuté (29. 9.).
- **Hranica:** do cloudu idú iba verejné texty médií a verejné prepisy. Súkromné dáta nikdy.
- **Overenie:** test na 50 slovenských textoch rozhodne, či Jev slovenčine rozumie; ak nie, bránu robí lacný alebo lokálny model.
- Návrh AI (nerozhodnuté): jev ako typovaná jednotka dátového modelu, kde chyba typu je meranie (tvrdenie bez udalosti = vata, číslo bez registra = nepresnosť, hrozba bez zdroja = poplašná správa).

## Otvorené pre Adama

OpenRouter kľúč a kredit 10 $ do `netopier/.env` (XDR-284), matica filtra v1 na škrtnutie (XDR-283), prvá sada zvodov (agent navrhne, Adam škrtne a zamkne; XDR-278 zatiaľ nedobehol), rozšírenie slovenských zdrojov (SME, TASR, HN, TA3, Markíza, JOJ, STVR, Postoj, Štandard, Refresher, Startitup, Trend), nové meno, Paperclip (XDR-226: navrhnuté pozastaviť), či stačí parita s klientskym `scoring.js` openclaw (serverové čísla sa nedajú reprodukovať), politika merania v1 (`netopier/redakcia/data/politika-merania.json`: stop slová, poplašné, vata — Adam škrtá a dopĺňa), ktoré funkcie registra idú do I2–I4 (B9 filter relevancie, B10 tri skóre, C1–C5 meranie po udalostiach).
