# STATUS — netopier

Smer od 5. 10. 2026: `SMER.md`. Staré texty (STATUS, architektúra, rozhodnutia, návrhy redakcie
z 27. 9.) sú v `docs/archiv-2026-10-05/`.

## Živé (overené 5. 10. 2026)
- **Archív:** `data/netopier.sqlite` (637 MB, mimo gitu): 68 179 dokumentov, z toho 14 104 slovenských
  článkov, 35 621 svetových titulkov a perexov, 12 520 popisov epizód relácií (24 relácií od 2019),
  3 920 tlačových správ, 1 417 videí. Slovenské články a minúty s celým textom za týždeň: 10 666.
- **Príjem:** LaunchAgent `com.xvadur.netopier` každých 5 min, 425 kanálov (register 330 zdrojov
  + 155 svetových), za 24 h okolo 8 500 nových dokumentov; log `data/log/prijem.jsonl`.
- **Národná rada:** 194 poslancov, 4 532 hlasovaní, 670 998 hlasov, 1 540 tlačí, 6 354 vystúpení
  (zber 29. 9., denný beh nezapojený).
- **Voľby 24. 10.:** 104 kandidatúr, 16 prieskumov, 14 termínov, hranice 8 krajov a 79 okresov.
- **Štátne registre:** výrez CRZ (25. 9.: 2 788 zmlúv), TED, kataster (2 pilotné oblasti), ŠÚ SR.
- **Pokrytie príbehov** (`zber/scripts/pokrytie-node.mjs`, `pokrytie-strana.mjs`): príbehy, skupiny médií,
  prvé médium, slepé miesta; výstup `data/pokrytie/`.
- **Prepisy relácií** (`podcasty/prepis.py`, mlx-whisper lokálne): 8 dielov (Klik 3, Tridsiatnik 4,
  V redakcii 1) v `data/podcasty/`.
- **Matica nálezov v1** (lokálne `data/matica/matica-v1.md`): 40 vzorcov v štyroch rovinách.
- **Barometer AI:** 599 titulkov Denníka N o AI (10/2019 – 9/2026) a 108 titulkov zaradených modelom.

## Rozhodnutia (dátumy z celej histórie projektu)
- 2026-10-06 — **Netopier = samostatný produkt**, Adamova analytická schopnosť v kóde. Adam je
  intelektuál, ktorý študuje médiá (nezávislý výskumník); Netopier vydáva snapshoty médií, Adam je
  autor, výstup visí na jeho webe ako dôkaz. Shitmeter = meno matice hovien. BrokerOS ostáva biznis build [A]
- 2026-10-05 — **Hlavný smer = `SMER.md`** (prístroj na vyšetrenie Slovenska, 11 modulov); všetko staré
  o Netopierovi do archívu, projekt a dáta pokračujú [A]
- 2026-10-04 — verejný web Hriech = moderný OSINT dashboard o Slovensku na úrovni SaaS 2027 (vzor
  World Monitor); nie ružový, nie titulky o jednotlivcoch [A]
- 2026-10-04 — model sveta: jednotka je udalosť, nie článok; témy (uzly) a ich váhy určuje Adam [A]
- 2026-10-03 — vzťah médií a AI k spoločnosti, nie výsmech relácií; najprv AI, potom celé médiá,
  politika a NR SR; MVP určuje Adam [A]
- 2026-10-02 — páka (meranie médií v čase) a hlas (päť otázok); Hriech nekomentuje, zverejňuje merania [A]
- 2026-10-02 — Denník N cez Adamovo predplatné, texty iba lokálne; SME bez obchádzania Cloudflare [A]
- 2026-10-02 — Jev nerozumie po slovensky; frontend populárny stack, nie Evidence [A]
- 2026-10-01 — nie čítačka správ; jadro je meranie v číslach; open source pred vlastným kódom [A]
- 2026-10-01 — svet a Európa v príjme (155 kanálov, iba titulky a perexy) [A]
- 2026-09-30 — príjem ako služba na Macu každých 5 min [A]
- 2026-09-29 — úložisko je jeden SQLite súbor cez `node:sqlite`, schéma kompatibilná s D1 [A]
- 2026-09-29 — čítanie modelom cez OpenRouter, rozpočet do 10 € mesačne, do cloudu iba verejné texty [A]
- 2026-09-28 — Claude smie čítať verejné texty médií celé [A]
- 2026-09-28 — termín: voľby 24. 10. 2026, kandidáti verejne menom [A]
- 2026-09-27 — Netopier lokálne na Macu; zadarmo v cloude iba zobrazovacia vrstva [A]
- 2026-09-25 — v0 zmazaný, Netopier je backend Hriechu vo workspace [A]
- 2026-09-07 — Hriech = autorstvo a publikácia, Netopier = monitoring a dôkazy [A]

## Ďalší krok
- **Adam vyberie**, ktorý modul zo `SMER.md` sa stavia prvý.
- **Záloha archívu** (637 MB, jediná kópia; Time Machine hlási „Failed to mount destination“).
- **Termín:** prieskumy pred voľbami smú byť zverejnené iba do 9. 10.

## Blokované
- OpenRouter kľúč do `netopier/.env` — na Adamovi (čítanie modelom pre 28 zo 40 vzorcov).
- Nasadenie a zobrazovacia D1 (Workers Paid) — iba na Adamov pokyn.
- YouTube od 1. 10. vyžaduje PO token (yt-dlp neprejde); prepisy cez Eden iba v session.
- Rozlíšenie rečníkov: pyannote potrebuje súhlas s podmienkami na Hugging Face (Adamov účet).
- SME a Korzár za Cloudflare (bez obchádzania).
- Necommitnuté súbory inej session v `zber/` (`src/temy`, `scripts/temy-node.mjs`, `data/temy`,
  `src/citacie`); `pokrytie-node.mjs` z `src/temy` používa — o ich osude rozhodne Adam.
