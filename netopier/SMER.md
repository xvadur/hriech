# SMER — Netopier (od 5. 10. 2026)

Hlavný smer projektu. Všetko, čo bolo o Netopierovi napísané do 5. 10., je v
`docs/archiv-2026-10-05/` (história a dátumy rozhodnutí ostávajú tam a v gite).
Dáta (`data/netopier.sqlite`, prepisy, merania) sa nemenia, projekt pokračuje.

## Čo je Netopier

Verejný prístroj na vyšetrenie Slovenska. Robí Adamovu metódu nepretržite a v rozsahu,
ktorý jeden človek neprejde: podnet → námietka → doslovný výrok → počítanie → kto je to →
porovnanie v čase → pôvodný zdroj. Adam dáva úsudok, stroj počíta.

Pomer (merané 5. 10.): Adam napíše denne mediánovo 2 603 slov a prejde niekoľko primárnych
zdrojov do hĺbky; Netopier prijme denne okolo 7 000 dokumentov, z toho asi 1 750 slovenských.

Dve veci (rozhodnutie 2. 10.):
- **Páka:** longitudinálne meranie médií po ľuďoch, reláciách a redakciách. Hriech
  nekomentuje, zverejňuje merania vlastnej produkcie médií a politikov.
- **Hlas:** Adamovo vysvetlenie sveta cez päť otázok, na ktoré médiá neodpovedajú:
  za koho peniaze, prečo teraz, kde je Slovensko, odkiaľ to ide, kam to vedie.

Verejný povrch je Hriech: moderný OSINT dashboard o Slovensku na úrovni SaaS 2027
(vzor World Monitor: mapa krajov, príbehy dňa s pokrytím, slepé miesta, živý príjem,
voľby, Národná rada, barometre). Ľudia sú v záznamoch merania pod titulkou, nie na nej.

## Princípy

1. Pri každom verejnom čísle: zdroj, uložený dotaz, verzia algoritmu, snímka dát a stav
   overenia (register metrík). Číslo, ktoré sa nedá zopakovať, nejde von.
2. Úsudok je ľudský: model zaraďuje, Adam overuje vzorku na overovacom pulte; zhoda sa
   zverejňuje pri čísle.
3. Každé číslo má porovnávaciu základňu (žáner, skupina médií, objem skupiny).
4. Navonok neutrálne názvy nálezov. Fyzické osoby z registrov verejne nie; ľudia z médií
   iba v záznamoch merania s možnosťou reakcie. Pred zverejnením časových radov pri menách
   overiť právny rámec (GDPR, novinárska výnimka § 78 zákona 18/2018).
5. Hotové open source pred vlastným kódom. Kód pod AGPL do tohto verejného repozitára
   bez licencie nepreberáme (World Monitor iba ako vzor rozloženia).
6. Všetko beží lokálne na Macu; verejne iba výber. Nasadenie, platené služby a nové
   kľúče iba na Adamov pokyn.

## Čo vieme mať (moduly, stav 5. 10. 2026)

Poradie a MVP určuje Adam (rozhodnutie 3. 10.). Čísla overené dotazom proti databáze 5. 10.

| # | Modul | Na čom stojí (MÁME) | Čo chýba |
|---|---|---|---|
| 1 | **Verejný dashboard Slovenska**: mapa krajov a okresov s vrstvami, pulz príjmu | hranice 8 krajov a 79 okresov; príjem 425 kanálov každých 5 min (`data/log/prijem.jsonl`) | slovník obcí s polohou (GeoNames SK, ZBGIS) na priradenie správ k miestu; filter športu |
| 2 | **Overovací pult**: Adam slepo zaraďuje vzorku, systém počíta zhodu s modelom | barometer AI: 108 titulkov zaradených modelom | Adamova vzorka; druhý nezávislý hodnotiteľ |
| 3 | **Príbehy dňa**: kto písal, kto bol prvý, kto mlčal | `zber/scripts/pokrytie-node.mjs`: 48 h = 111 príbehov, prví agentúry v 53 | normalizácia slepých miest na objem skupiny; beh po každom príjme |
| 4 | **Matica nálezov v prevádzke** po autoroch, reláciách a redakciách v čase | 40 vzorcov (lokálne `data/matica/`); 10 666 SK článkov a minút s textom za týždeň | 12 vzorcov ide bez modelu, 28 potrebuje čítanie modelom (kľúč) |
| 5 | **Prepisy relácií** s rozlíšením, kto hovorí | `podcasty/prepis.py` (mlx-whisper), 8 prepisov; Klik 383 dielov ≈ 37 h stroja | rozlíšenie rečníkov (pyannote); YouTube blokuje sťahovanie (PO token), Eden iba v session |
| 6 | **Kartotéka relácií a hostí** v čase | 12 520 popisov epizód 24 relácií od 2019 | epizódy Klik, Index, Na telo, Dobré ráno; spárovanie mien |
| 7 | **Národná rada proti médiám**: čo prešlo a kto o tom písal | 4 532 hlasovaní, 670 998 hlasov, 1 540 tlačí, 6 354 vystúpení | denný zber (nrsr.sk vracia 403 bez prehliadačového UA) |
| 8 | **Voľby 24. 10.** | 104 kandidatúr, 16 prieskumov, 14 termínov | centrálne XLSX MV SR (poslanci krajov ~2 470, starostovia ~6 560); prieskumy smú von iba do 9. 10. |
| 9 | **Reťaz peňazí a moci**: zmluva → firma → konečný užívateľ → vlastník média → štátna reklama | výrez CRZ (25. 9.), 674 firiem s IČO | denný CRZ, RPO API, RPVS OData (68 063 partnerov, 147 258 KUV), RÚZ, evidencia médií MK SR |
| 10 | **Svet proti Slovensku**: pozornosť sveta a slovenských médií po témach | 35 621 svetových titulkov zo 155 kanálov; Eurostat API | udalosti (tabuľka je prázdna), témy a váhy určí Adam |
| 11 | **Päť otázok nad príbehom**: či na ňu médium odpovedalo, čo k nej majú registre | príbehy (3), NR SR (7), CRZ (9) | závisí od modulov 3, 4, 9 |

## Čo drží všetko späť

- **Záloha archívu:** `data/netopier.sqlite` (637 MB) je jediná kópia; Time Machine zlyháva.
- **Celé texty hlavného prúdu:** SME 0 zo 170, Korzár 0 zo 117 (Cloudflare), Denník N 7 zo 144
  (predplatné rozhodnuté, nezapojené), Štandard 0 zo 64 (zlý extraktor).
- **História:** hustý slovenský archív až od polovice septembra 2026; dozadu sitemapy redakcií a Wayback.
- **Odvodenie po príjme nebeží:** udalosti 0, väzby dokument – entita 0.
- **Kľúče a náklady:** OpenRouter (rozpočet 10 €/mes.), Workers Paid a zobrazovacia D1 (Free 500 MB),
  platené API tretích strán; rozhoduje Adam.

Úplná inventúra (182 položiek: Adamove vstupy, aktíva Netopiera, verejné dáta SK, OSINT open
source, metódy merania) a overenie skeptikom: `data/navrh/co-vieme-mat-2026-10-05.json` (lokálne).
