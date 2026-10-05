# Register funkcií AI redakcie XVADUR

Stav k 27. 9. 2026 (audit citácií a doplnenie z celého knowledge Netopiera a mediálnej kritiky 27. 9. večer; doplnené položky sú označené „Doplnenie (audit 27. 9.)“). Zostavené z Adamových promptov (máj až september 2026), z jadra `xvadur_core/`, z výskumu mediálnej kritiky, z archívu Netopiera a Hriechu, z projektových súborov a Linearu, a z dnešného Adamovho vstupu. Pri každej položke je zdroj (cesta a riadok alebo dátum a id promptu) a doslovný citát, kde existuje. Adamove slová sú citované bez opravy preklepov.

**Skratky zdrojov:** `core/` = `xvadur_core/`; `R/` = `xvadur_core/zdroje/hriech/research/`; `MK/` = `R/medialna kritika/`; `ARCH-N/`, `ARCH-H/` = `xvadur_core/zdroje/hriech/archiv-2026-09/netopier/` resp. `.../hriech/`; `hriech/` = `projekty/hriech/`; `netopier/` = `projekty/hriech/netopier/`; `H1`, `D2`, `C1`, `C2`, `C3`, `M1` = dávky v `xvadur_core/_praca/02_extrakcia/davky/`; `korpus n=…` a `p-…` = `projekty/adam.xvadur/var/corpus.sqlite`, tabuľka `prompts` (rowid alebo id), s dátumom; `XDR-…` = Linear, tím Xvadur. Označenie `[A]` = rozhodnutie Adama zapísané v STATUS; „AI syntéza“ = dokument napísaný Codexom/Claude na Adamovo zadanie, nie Adamove slová.

**Stavy funkcií:** `návrh` (iba popísané), `rozhodnuté` (Adam povedal, že to má byť), `postavené` (existuje kód, dáta alebo dokument v prevádzke), `zahodené` (opustené alebo zmazané), `neurčité` (zdroje nehovoria, či sa naplnilo).

---

## 0. Čo redakcia je

XVADUR spravodajská služba je podľa Adama to, čo sa stavia: „budujeme ai redakciu a investigativny osint tool“ (korpus n=8534 / p-a4db2135e4ff282fa744d6f8, 27. 9. 2026) s dvoma vrstvami: Netopier je backend („monitoring a dôkazy“), Hriech je frontend („autorstvo a publikácia“) (`hriech/STATUS.md:11`, rozhodnutie 3. 9. 2026 [A]). Vznikla z toho, že „som zistil, že mi médiá furt klamú a nehovoria mi pravdu“ (p-5ac6a7bf60c351a3fc1e25e2, 21. 5. 2026), a z občianskeho motívu: „mňa strašne, strašne, strašne sere, že voči tomuto svetu zatiaľ nemám páku“ (C1:334, 30. 5. 2026). Jej program je negatívny voči médiám a pozitívny voči dátam: „my teda nepotrebujeme robit to iste ako oni, my budeme robit vsetko co oni nerobia“ (p-d66c017da8cc08e3a5755593, 27. 9. 2026), lebo „cely stat je na par api a endpointoch a ani jedna redakcia to nema uchopene“ (korpus n=6531 / p-53fa2468114c59c08ea077c3, 1. 9. 2026 11:21; C3:392) a „z redakcií sa stali podcastové domy“ (p-985db574f0f05266af8834a8, 1. 9. 2026). Jednotkou práce nie je článok, ale udalosť s dôkazmi a jej vývoj v čase; Adam v tom vystupuje ako kurátor: „hypotéza je taká, že ja som kurátor informácií. Informácie prichádzajú, spracúvavajú sa, čakajú na moje nejakým spôsobom komentovanie.“ (p-916e64f6df221611f7677fd4, 3. 9. 2026). Cieľom je „proste redakcia kjtorej nic neunikne, zbiera data, vyhodnocuje ich, vizualizuj ena mape, v rozynch kalkulackach volebnych a dalsich tooloch“, v ktorej „vieme tahat data na ktore oni musia mat datoveho analytika“ a ktorá má „vlastny nazor ktoremu sa moze vsetko podriadit“ (korpus n=8551 / p-d66c017da8cc08e3a5755593, 27. 9. 2026). Predmetom kritiky nie je lož, ale hriech: „kedze nerobia poresunie zakona tak ich nemozno obzalovat, a preto to nazyvam hriech lebo v podstate by sa stacilo ospravedlnit a robit to lepsie“ (p-f56166d8f8be56ab0056ff9d, 3. 8. 2026). Pozícia je tretia možnosť: „Nejsom dezinfoscéna a nejsom ani mainstream. Nenávidím obidvoch rovnako.“ (`core/04_myslenie/svetonazor.md:11`, 29. 7. 2026). Pravidlo prevádzky je „Codex píše, Adam publikuje“ (`core/02_dielo/hriech.md:86`); „Samotný stav published v dátach nenahrádza Adamov pokyn.“ (`hriech/docs/PUBLISHING.md:13`). Beží na hriech.xvadur.com, meno Hriech „sa bude este menit ked podjeme na build“, zber má bežať lokálne na Macu a „minute nemoze meskat pol hodinu, stratziula by vyznam“ (p-5c4e1f99e96ee2bc4b071b06, 27. 9. 2026).

---

## 1. Redakčná línia a princípy

### 1.1 Čo sa nesmie

| # | Princíp | Citát | Zdroj |
|---|---|---|---|
| P1 | Netvrdiť „médiá klamú“. Formulácia je „pravdivé fragmenty, chybný výsledný model“; je to hriech, nie trestný čin. | „Není to protizákonné, nedá sa to nejak napadnúť, je to hriech.“ | `core/04_myslenie/svetonazor.md:72–73` (Adam, D1); `core/09_slovnik.md:149` |
| P2 | Nepripisovať úmysel. Hodnotí sa verejný výkon a výsledný čitateľský model, nie motív. | „Úmysel redaktorov z týchto artefaktov nevyplýva. Ich verejný výkon a výsledný čitateľský model sa však dajú hodnotiť bez poznania úmyslu.“ | `MK/27 Audit citatelskeho modelu po anotaciach.md:581–582` (AI syntéza, 4. 9.) |
| P3 | Alert nie je obvinenie; profesijná, vlastnícka alebo inštitucionálna väzba nie je dôkaz vplyvu. | „Profesijná, vlastnícka alebo inštitucionálna väzba sama osebe nie je dôkazom vplyvu, konfliktu ani protiprávneho konania.“ | `hriech/AGENTS.md:12–13`; `ARCH-H/research/editorial/STATE_READING_EDITORIAL_BRIEF_2026-09-03.md:5` |
| P4 | Netvrdiť percentá bez denominátora, nie „všetky médiá fungujú rovnako“, nie motív ani koordinácia bez dokumentov. | „Čo zatiaľ nemožno tvrdiť: percento nepravdivých viet alebo claimov Denníka N; že všetky slovenské mainstreamové médiá fungujú rovnako; […] motive, triednu psychológiu alebo koordinované ideologické riadenie bez priamych dokumentov.“ | `R/MAINSTREAM_MEDIA_INDICTMENT_MAP_2026-07-30.md:556–566` (AI syntéza) |
| P5 | Nulový výsledok rešerše nie je dôkaz neexistencie. | „Nulový výsledok webového hľadania nie je dôkaz, že taký text nevznikol.“ | `core/07_texty/drafty/03-fico-nemusi-citat-vase-clanky-substack-v3.md:75` (draft v Adamovom hlase, napísaný Codexom, Adamom overený – frontmatter `ai_disclosure`) |
| P6 | Nezamieňať stručnosť za chybu; neprítomnosť praxe nie je dôkaz ne-praxe; zubár ani dovolenka nie sú miera kompetencie. | „Neprítomnosť praxe nie je dôkaz ne-praxe.“ | `MK/40 Klik corpus 50 — operačná prax, príprava a hranice súdu.md:15`; `MK/38:107` |
| P7 | Nenahrávať ani nepublikovať z pamäte, keď obvinenie závisí od presného slova; citát z automatického prepisu iba po kontrole audia a hovoriaceho. | „Do not record from memory when the accusation depends on an exact word, source, timestamp, omission, or attribution.“ | `R/REACTION_DOCKET_V0_1.md:456–457, 414–416` (AI syntéza) |
| P8 | Karta sa po negatívnom výsledku nevymení; rovnomenné záznamy sa nesčítavajú ako nezávislé; promptom vyžiadaný pár nie je meranie frekvencie. | „Karta sa nesmie vymeniť za vhodnejší príklad po negatívnom výsledku.“ | `MK/43 Klik corpus 50 — syntéza P1–P5.md:122, 16`; `MK/41:280–285` |
| P9 | Nepreberať z cudzích systémov: auto-publish po AI schválení, „viac URL = pravdivejšie“, jeden prompt na research aj názor, univerzálne skóre kvality, kryptografickú provenienciu ako náhradu pravdy. | „automatické publikovanie po AI schválení; „viac URL = pravdivejšie“; spoločný prompt na research, názor, písanie aj fact-check;“ | `MK/29 Codex writing workflow research.md:77–83` (AI syntéza) |
| P10 | Popularita nie je potvrdenie; jeden zliaty score nesmie miešať podobnosť, popularitu, dôveryhodnosť a Adamov záujem. | „desať prepisov agentúrnej správy nie je desať nezávislých potvrdení a virálnosť nie je verejný následok“ | `ARCH-H/research/editorial/AI_NEWSROOM_AND_NATURAL20_TEARDOWN_2026-09-03.md:185` (AI syntéza) |
| P11 | Žiadny text neodchádza do cloudu na spracovanie; embeddingy a modely bežia lokálne. | „Cloudové spracovanie textov (OpenRouter, embedding API) zakázané — súkromie.“ | `netopier/STACK.md:16`; `netopier/docs/DECISIONS.md:70–71` |
| P12 | Netopier v0 (kód, runtime, bundly, schedulery) sa nikdy nevracia. | „The previous v0 implementation is retired and must not be reintroduced.“ | `netopier/AGENTS.md:6, 10–11`; `netopier/docs/DECISIONS.md` ADR-001 |
| P13 | Metóda nesmie opakovať chybu, ktorú kritizuje: z neurčitého signálu nevyrábať obžalobu, z veľkého mechanizmu pár pohodlných ostrovov. | „To by opakovalo tú istú chybu, ktorú má rozobrať: z veľkého problémového mechanizmu by vyrobilo pár pohodlných izolovaných ostrovov.“ | `MK/36 Klik 404 - audit celej epizody.md:43–45`; `MK/18:16` (AI syntéza) |

### 1.2 Čo sa vždy

| # | Princíp | Citát | Zdroj |
|---|---|---|---|
| P14 | Robiť všetko, čo médiá nerobia; nie kópia spravodajstva. | „my teda nepotrebujeme robit to iste ako oni, my budeme robit vsetko co oni nerobia“ | korpus p-d66c017da8cc08e3a5755593, 27. 9. 2026 (Adam) |
| P15 | Mechanizmus namiesto komentára; to isté, čo sa žiada od médií, platí pre redakciu. | „ak médium tvrdí, že orientuje verejnosť, musí dodať mechanizmus, nie iba komentár.“ | `MK/05 Corpus reading.md:6` (AI syntéza) |
| P16 | Objektívni a rýchli, nie na úrovni ľudských článkov; systém robí podklady a filtruje. | „my nepotrebujeme dosahovať úroveň článkov, úroveň ľudských článkov. My potrebujeme byť objektívni a rýchli.“ | korpus n=6751 / p-f47223ea62cf842738a7edc7, 3. 9. 2026 18:06 (Adam); C3:368 |
| P17 | Každý rozbor má najsilnejšiu obhajobu protistrany, falzifikátor a kontrolné prípady, kde treba médiu priznať pravdu. | „Ak audit nevie priznat, kde Klik hovori korektne, bude vyzerat ako pomsta. Preto su kontrolne cases strategicky dolezite.“ | `MK/20 Klik audit - kompresia obzaloby.md:151–154` (AI syntéza, Codex – „metodický uzol“ podľa `MK/index.md:42`); `R/REACTION_DOCKET_V0_1.md:19` (AI syntéza); H1:502 (extrakcia: parafráza Adamovej požiadavky, nie jeho slová; Adamov vlastný výrok k tomu v korpuse nedoložený). Kontrolné prípady, kde Klik hovorí korektne: `MK/13` (Ted Chiang, `valid_source_transfer`), `MK/14` K390-M04 (Flight 12), `MK/17` (Apple parental controls), `MK/18` (social media ban) |
| P18 | Jednotkou obžaloby je opakovaný výrobný model (portfólio), nie jeden článok, titulok ani otázka; jednotku pomenovať v prvých odsekoch. | „Jednotlivý článok, titulok, otázka alebo bezpečnostná rada nie sú samy osebe dôkazom celého prípadu. Sú exemplármi mechanizmu, ktorého existencia sa testuje naprieč zmrazenými korpusmi, close-readmi a kontrolnými prípadmi.“ | `R/Denník N a slovenské informovanie o AI - pracovný sourcebook k podaniu.md:107–131` (AI syntéza) |
| P19 | Nie 386 problémov, ale šesť až osem mechanizmov s flagship, podporným a kontrolným prípadom; zvyšok do prílohy. | „Toto nie je 386 verejnych argumentov. Toto je dokazovy lom. Verejna obzaloba musi byt komprimovana.“ | `MK/20:20–32, 218–231`; `core/02_dielo/hriech.md:84` |
| P20 | Publikovať aj prípady, kde médium mechanizmus a kontinuitu zachovalo. | „5. publikovať aj prípady, kde Denník N mechanizmus a kontinuitu zachoval;“ | `R/MAINSTREAM_MEDIA_INDICTMENT_MAP_2026-07-30.md:595` |
| P21 | Zmrazené vzorky, deterministické vzorkovanie, slepé dvojité kódovanie pred populačným tvrdením; atomic-claim počítanie zamietnuté. | „Publishing "percentage of false claims" from that denominator would be false precision.“ | `R/CURRENT_EVIDENCE.md:52–54, 133–152` (AI syntéza, 29. 7.) |
| P22 | Falošné zlúčenie udalostí je drahšie než rozdelenie; návrh na merge nikdy nemerguje sám. | „A false merge is costlier than a false split.“ | `netopier/AGENTS.md:29`; `ARCH-N/benchmarks/SLOVAK_CLUSTERING_REPORT.md:20` |
| P23 | Výpadok zberu nesmie vyzerať ako ticho aktéra; chýbajúci prepis je stav spracovania. | „Výpadok zberu nesmie vytvoriť zdanlivé ticho aktéra.“ | `ARCH-N/docs/DISCOVERY.md:66, 137` (AI syntéza, 5.–6. 9.) |
| P24 | Každý objav má zanechať nový zdroj, kolektor, pravidlo alebo sledovaný vzťah (formulácia Codexu, Adamom neratifikovaná). | „Žiadny objav nesmie zomrieť ako jeden článok. Každý objav musí zanechať nový zdroj, kolektor, pravidlo alebo sledovaný vzťah.“ | M1:273, 760 (M:2035, 1.–3. 9., AI syntéza) |
| P25 | Hodnota nálezu je v normálnosti systému, nie v podozrivosti; AI sa nesmie chytiť ľahšieho príbehu o kauze. | „Keď sa AI chytila ľahšieho príbehu a začala riešiť, či som našiel podozrivú kauzu, opravil som ju. Hodnota zmluvy neleží v jej podozrivosti. Leží v normálnosti systému, ktorý opisuje.“ | `core/07_texty/drafty/03-fico…v3.md:59` (draft v Adamovom hlase, napísaný Codexom, Adamom overený: frontmatter „ai_disclosure: Text vznikol z autorovho výskumu a verejných zdrojov s pomocou OpenAI Codexu. Zdroje a závery overil autor.“; Adamova oprava AI je v jeho promptoch z 1. 9. 2026 o CRZ/Mediaboarde, korpus p-0e43574e027f4025caa2f018, p-80e2683ef8b06d80ebbc947c) |
| P26 | Hotové znamená overené: implementované ≠ otestované ≠ nasadené ≠ publikované. | „A container starting is not a successful RSS-to-feed loop.“ | `netopier/AGENTS.md:34–35` |

### 1.3 Fakt, interpretácia, medzera

| # | Princíp | Citát | Zdroj |
|---|---|---|---|
| P27 | Štyri vrstvy každého rozboru: zdrojový výrok, Adamov komentár, analytická syntéza, evidence gap. | „Drž oddelene zdrojový výrok, Adamov komentár, analytickú syntézu, hypotézu, právny status a evidence gap.“ | `hriech/AGENTS.md:10–11`; `MK/index.md:13–19` |
| P28 | Päť dôkazových vrstiev: documented, coded interpretation, reasonable inference, hypothesis, unsupported leap; posledná nejde von. | „5. `unsupported leap` — nesmie ísť do verejnej obžaloby.“ | `R/MAINSTREAM_MEDIA_INDICTMENT_MAP_2026-07-30.md:14–23` |
| P29 | Do verejného textu ide iba verified, transcript-only s disclaimerom alebo označená inferencia; špekulácia patrí do otvorených otázok. | „`speculative` veci patria do "open questions" alebo research appendixu, nie do hlavnej obžaloby.“ | `MK/04 Evidence schema.md:95–112` |
| P30 | Fakt, interpretácia a medzera zostávajú rozpoznateľné; prípad vysvetľuje, mapa umožňuje samostatné skúmanie. | „Fakt, interpretácia a medzera zostávajú rozpoznateľné. Prípad vysvetľuje, mapa umožňuje samostatné skúmanie.“ | `hriech/PRODUCT.md:29–34` |
| P31 | Surový dôkaz oddelený od odvodených príbehov a skóre; žiadna syntéza nie je primárny dôkaz. | „Raw entries remain source-linked records. Story memberships and scores are derived, versioned state. No generated synthesis is primary evidence.“ | `netopier/docs/ARCHITECTURE.md:28–29` |
| P32 | Tri oddelené súdy nad udalosťou (istota, verejný následok, Adamova relevancia) a viditeľný dôvod zaradenia. | „Editorial relevance must not be hidden inside an opaque model score.“ | `ARCH-N/docs/PRODUCT_HYPOTHESIS.md:45–62` (AI syntéza) |
| P33 | Dáta a komentár sú dve veci; ostrý jazyk musí byť podložený systematicky zbieranými dátami. | „dáta a komentár su dve veci, nikdy som nepovedal ze chcem picovat verejne, a prsve preto chcem systematicky zbierať tieto data, aby ten ostrý jazyk a slovník ktory mi sedí a chcem pouzit, bol dostatočne obhajeny.“ | korpus n=2244, 21. 6. 2026 (Adam); `core/04_myslenie/svetonazor.md:75` |
| P34 | Vynechanie sa volá materiálne vynechanie alebo informačná amputácia, nie lož. | „Boundary: call it material omission or information amputation, not a lie.“ | `R/REACTION_DOCKET_V0_1.md:292` |
| P35 | Zdroj má byť mapa, nie pečiatka; zdroj musí mať možnosť korigovať rámec. | „Thompson nie je u Ondreja mapa. Thompson je peciatka.“ | `MK/11 Klik 392 - Apple WWDC Thompson case.md:93` (AI syntéza) |
| P36 | Grounded graph (čo čitateľ vie) a evidence graph (čo smieme tvrdiť) sú dve otázky. | „Grounded graph odpovedá na otázku **čo už čitateľ vie**; evidence graph na inú otázku, **čo smieme tvrdiť a z čoho**. Jeden nesmie suplovať druhý.“ | `MK/31 Pocock writing workflow teardown.md:91` |

### 1.4 AI autorstvo a schvaľovanie

| # | Princíp | Citát | Zdroj |
|---|---|---|---|
| P37 | AI autorstvo sa nemaskuje, robí sa kvalitným; angličtina nie je medzikrok. | „model je upraviotelny iba do nejakej miery, a neda sa z toho odtranit ai, preto sa to nebudeme snazit obachadzat, ale bude to nasa domena, ze proste moja ai pise aspon dobre, ked uz to znie jak ai“ | korpus n=6478 / p-23c0a24338a007a8211cd47b, 1. 9. 2026 20:57 (Adam; C3:422); `netopier/STATUS.md:15` [A] |
| P38 | AI text sa neoznačí automaticky ako Adamov článok; úloha AI sa v texte uvádza pravdivo. | „AI autorstvo vypíš pravdivo. Ak text vytvorila AI, neoznač ho automaticky ako Adamov článok.“ | `hriech/docs/PUBLISHING.md:19` |
| P39 | Codex píše, Adam publikuje; stav published v dátach nenahrádza jeho vôľu. | „Samotný stav published v dátach nenahrádza Adamov pokyn. Skript vie overiť metadáta, nie vôľu autora.“ | `hriech/docs/PUBLISHING.md:13`; `core/02_dielo/hriech.md:86` |
| P40 | Automatizácia zbiera, zhlukuje, skóruje a pripravuje; operátor vlastní politiku, vyberá a výslovne autorizuje publikáciu; auto-publish bez pomenovaného človeka sa odmieta. | „The operator owns the editorial policy, ratifies its changes, selects the three curated daily pieces, and explicitly authorizes publication.“ | `ARCH-N/docs/PRODUCT_HYPOTHESIS.md:64–69`; `ARCH-H/…/AI_NEWSROOM…:245–253` |
| P41 | Adamov hlas a súd sú vstupná vrstva, ktorú model nesmie vymyslieť; anti-slop editácia nemení modalitu, agenta, citáciu, číslo ani hranicu dôkazu. | „Adamov hlas a súd sú samostatná vstupná vrstva, ktorú model nesmie vymyslieť.“ | `MK/29:71`; `MK/30 High-star GitHub writing systems.md:73–75` |
| P42 | Push, deploy, DNS a publikácia iba na výslovný pokyn; autorita platí pre jeden úkon. | „Bez explicitného súhlasu nerob push, deploy, DNS zmenu ani publikáciu.“ | `hriech/AGENTS.md:19`; `xvadur_workspace/CLAUDE.md` (Git) |
| P43 | Neschvaľovať každý odsek, aby proces nezabrzdil cieľ. | „Neschvaľovať každý odsek, aby proces nezabrzdil cieľ „Codex píše, Adam publikuje“.“ | H1:522–526 (MK/29–31, AI syntéza) |

### 1.5 Zdroje a súkromie

| # | Princíp | Citát | Zdroj |
|---|---|---|---|
| P44 | Zdroj sa nikdy nestratí: URL, čas publikácie a zberu, ID zdroja, hash surového payloadu, verzia modelu. | „Public sources only. Preserve source URL, publication time, collection time, source ID, raw payload hash, and algorithm/model version.“ | `netopier/AGENTS.md:11–12` |
| P45 | Verejný text odkazuje na publikovateľný primárny zdroj, nie na existenciu súkromného prepisu; raw Dia chaty a licencované fulltexty do repozitára nepatria. | „Verejný text odkazuje na publikovateľný primárny zdroj, nie na existenciu súkromného prepisu.“ | `hriech/research/README.md:7`; `hriech/AGENTS.md:14–16` |
| P46 | Iba verejné profesijné a inštitucionálne údaje; žiadne súkromné adresy, rodné údaje, rodina, kontakty ani majetkové lustrovanie fyzických osôb. | „Mapa používa iba verejné profesijné a inštitucionálne údaje. Neobsahuje súkromné adresy fyzických osôb, rodné údaje, rodinu, osobné kontakty ani majetkové lustrovanie fyzických osôb.“ | `hriech/research/newsrooms/README.md:34–36` |
| P47 | Verejné osoby iba v ich verejnej role a pri kritike iba s dôkazom; juniorských novinárov a radových kolegov nemenovať; súkromný Discord nie je verejný dôkaz. | „Verejné osoby (politici, novinári, tvorcovia) sa smú menovať v ich verejnej role a pri kritike iba s dôkazom. Juniorských novinárov a radových kolegov nemenovať.“ | `core/08_ludia.md:7`; `core/02_dielo/hriech.md:120–124` |
| P48 | Verejná dostupnosť údaja v registri neznamená nutnosť publikovať; test nevyhnutnosti a primeranosti. | „Verejnosť katastra automaticky neznamená, že každý údaj je potrebné publikovať v médiu. Rozhodujúca je nevyhnutnosť, primeranosť a otázka, či možno verejný cieľ dosiahnuť menej invazívne.“ | `MK/25 Denník N potvrdzuje Kyseľ Blaha redakčný case.md:102–111` |
| P49 | Pred publikovaním osloviť dotknuté redakcie a dať im priestor. | „Pred publikáciou preto redakcie oslovím a dám im priestor ukázať vlastný výstup alebo opísať svoj systém sledovania štátu.“ | `core/07_texty/drafty/03-fico…v3.md:75` (draft v Adamovom hlase, Codex, Adamom overený) |
| P50 | Kým Adam článok neschváli, nič z research/ sa nepushuje (repozitár je verejný); osobné svedectvo a súkromné podklady ostávajú v jadre. | „Repozitár je verejný: kým Adam článok neschváli, nič z `research/` sa nepushuje; osobné svedectvo a súkromné podklady ostávajú v `xvadur_core/`.“ | `hriech/CLAUDE.md:19`; `hriech/research/zeitgeber/README.md:5` |
| P51 | Raw súbory (audio, prepisy, screenshoty) nie sú na commit ani publikovanie; verejné citácie v nevyhnutnom rozsahu. | „Raw súbory nie sú určené na commit ani verejné publikovanie. Celý transcript a audio podliehajú autorským právam; verejné citácie treba kontrolovať proti zvuku a držať v nevyhnutnom rozsahu.“ | `R/CASE_AKTUALITY_FREDERIKA_LODOVA_2026-08.md:418–420` |
| P52 | Čo nejde von: citlivé výroky zo svetonázoru §12, nič o Karolovi bez súhlasu a anonymizácie, Polymarket ako osobný háčik, prípad Lodová, surové anotácie z 23. 6. 2026. | „Zoznam slúži na to, aby tieto výroky nikto nepreniesol do textu omylom.“ | `core/04_myslenie/svetonazor.md:203–213`; `core/02_dielo/hriech.md:118–124`; `core/10_otvorene.md:103–108` |
| P53 | Netopier vlastní verejné udalosti a dôkazy; osobný profil vlastní Adamovu expozíciu a interpretáciu; súkromný profil sa neprelieva do verejnej dôkazovej vrstvy. | „Netopier vlastní verejné udalosti a dôkazy; osobný profil vlastní Adamovu expozíciu, interpretáciu, revíziu a osobný účinok; súkromný profil sa nemá spätne prelievať do public evidence vrstvy“ | `R/MAINSTREAM_MEDIA_INDICTMENT_MAP_2026-07-30.md:226–229` (AI syntéza) |
| P54 | Kataster iba v zákonnom, technicky stabilnom a eticky obhájiteľnom rozsahu. | „kataster iba v rozsahu aktuálne zákonného, technicky stabilného a eticky obhájiteľného prístupu.“ | `MK/24 Kyseľ Blaha a stroj ktorý číta štát.md:36` |

### 1.6 Hlas

| # | Princíp | Citát | Zdroj |
|---|---|---|---|
| P55 | Hnev je zachytávacia vrstva, nie finálny argument; ostrý jazyk ostáva interne, verejne sa prekladá na mechanizmus, príklad a dôkaz; jeden strategický vulgarizmus je prípustný. | „Anger is the capture layer, not the final argument. […] One strategically placed vulgarism can belong to the voice. A chain of insults usually hides the exact proposition the audience should remember.“ | `R/DAILY_VOICE_LAUNCH_2026-07-30.md:72–83` (AI syntéza); `core/06_firma/znacka.md:85` („Slušní budeme až pri publikácii, teraz musíme byť veľmi ostrí.“) |
| P56 | Verejný hlas: nasratý analytik, jazyk nefiltrovaný, ale objektívny. | „ja som nasratý analytik, ktorý investiguje to, ako je svet paradoxný, ironický a nespravodlivý. A podávam to jazykom nefiltrovaným, ale objektívnym.“ | korpus n=1221, 30. 5. 2026 (Adam) |
| P57 | Tretia možnosť: ani dezinfo, ani mainstream; liberálne médiá nie sú etalón, kritizuje sa aj vlastný tábor. | „Ja nejsom provládne orientovaný, som opozícia, ale ani s tou nejsom spokojný.“ | `core/04_myslenie/svetonazor.md:74, 124`; `MK/06 bezzubý mainstream.md:99` |
| P58 | Nie fact-check, ale pointa a línia. | „moj hlavny zamer je, nachytat politikov na ich hlupostiach, nie na fact checkoch, ale na pointe“ | korpus n=2066 / p-3b2f1a92479a6d5ae9b64136, 21. 6. 2026 (Adam); `core/07_texty/zasobnik.md:216` |
| P59 | Hriech nič netvrdí, ukazuje; je to hlboký nesúhlas s médiami a so svetom. | „moj hriech, je to hlbokom nesuhlase s mediamy a zo svetom / nic netvrdim ukazuje“ | korpus p-dd939dd5a6e473e2f0b75d87, 26. 9. 2026 (Adam) |
| P60 | Značka nesmie závisieť od toho, či terče ďalej publikujú slabé artefakty: 50 % vlastné modely, 30 % kritika artefaktu, 20 % dôkaz z vlastnej praxe. | „Do not build a brand that depends on Martin Gregor, Denník N, or any other target continuing to publish weak artifacts.“ | `R/DAILY_VOICE_LAUNCH_2026-07-30.md:58–71`; commit c0ba356 (INDICTMENT_MAP:72) |
| P61 | Kalendár sa neplní vatou; deriváty iba keď nesú samostatnú myšlienku. | „Deriváty sa publikujú iba vtedy, keď nesú samostatnú myšlienku. Kalendár sa neplní vatou.“ | `R/NETOPIER_CONTENT_CALENDAR_2026-08-31_10-25.md:265–266` |
| P62 | Adam je situovaný operátor, nie neutrálny komentátor; jeho oprávnením je, že systémy stavia a prevádzkuje. | „Adam nemusí predstierať pohľad neutrálneho komentátora. Jeho oprávnením je, že systémy nielen sleduje, ale aj stavia a prevádzkuje.“ | `R/SLOVAK_SUBSTACK_FIELD_AND_DIFFERENTIATION_ANALYSIS_2026-08-28.md:285–290` |
| P63 | AI pri mediálnej kritike nie je babysitter: neupokojuje, nemoralizuje, hľadá zdroje a povie, kde chýbajú. | „nehovoris mi ze spomal alebo ze nekonspiruj, ale haldaj validaciu po zdrojoch, to ej jedina validacia ktoru mozem od teba odstat“ | korpus p-38439986acd83e0641a53eeb, 3. 8. 2026 (Adam); D2:354 ([DN15] L384) |
| P64 | Verdikt o obsahu najprv, dôkazový status až na konci; žiadna „uhladená reč“. | „j aneviem jak to povedat ale ja s tym neviem rpacxovat ked je to v tak debilnej reci uhladenej.. ze porzi ci je to len trasnskript lead.. boze moj aj som vzniesol vazne namietky voci obsahu, fakt haldam vaecnost a ty to furt zaobalujes do tych najbezpecnejsich fraz..“ | korpus n=7691 / p-2c6c4540a09199cebd23c7c1, 12. 9. 2026 16:46 (Adam, codex); rollout `~/.codex/sessions/2026/09/12/rollout-2026-09-12T12-47-41-01a0953a-….jsonl:2888` (pôvodne uvedený „2026-09-12T10-47-41-fEcb:50–52“ neexistuje) |
| P65 | Novinár nemusí byť programátor; musí vedieť, kedy technickému tvrdeniu rozumie sám a kedy iba prenáša istotu zdroja. | „Novinár nemusí vedieť programovať, aby písal o AI. Musí však vedieť, kedy technickému tvrdeniu rozumie sám a kedy iba prenáša istotu svojho zdroja.“ | `R/DAILY_VOICE_LAUNCH_2026-07-30.md:288–300` (skript v Adamovom hlase, AI syntéza) |
| P66 | Nenávisť je k optimalizácii na zisk, nie k človeku; publikum je poškodená strana, nie nepriateľ. | „Není to nenávisť k človeku, je to nenávisť k optimalizácii na zisk.“ | korpus n=8273, 21. 9. 2026 (Adam, chatgpt); `MK/05:51–62` |
| P67 | Identita značky: zdravotník, nie policajt; brand a copy stavať na zdravotníckej línii, nie na spise a odtajňovaní. | „ja som policajt? sak ja som zdravotník“; „odtajňovanie nikoho nezaujíma“ | `~/.claude/projects/-Users-xvadur-mac-xvadur-workspace/memory/identita-zdravotnik-nie-policajt.md` (Adam, 26. 9. 2026; index v `MEMORY.md`); rozpor s registrom „obžaloba“, pozri §6.2. Pôvodne uvedené H1:634 odstránené: je to bod „Adamova sebakritika“ o nálepke „adolescent“ (MK/09), tento výrok neobsahuje |
| P68 | Kritik podlieha tej istej schéme ako médium: kritika mainstreamu z nedezinfo priestoru (Lívia Plaváková, Fiki, Adam sám) prechádza tou istou dôkazovou schémou, inak sa stáva lacným komentárom; nepodložený výsmech kazí dobrú kritiku. | „livia nam urobila polovicu roboty, lebo am dobru kritiku na dennik n, ale pokazila zaver lebo si z dennika n robi nepodlozenu srandu, ktora absentuje humor“; „ak sa dobrá kritika zakončí nepodloženým výsmechom, stratí presnosť a začne vyzerať ako presne ten typ lacného komentára, ktorý kritizujeme na médiách“ | korpus n=2255 / p-4e7bd8889e3d2115e5e1e241, 22. 6. 2026 (Adam); `MK/03 Lívia Plaváková a Denník N case.md:20, 44–47` (AI syntéza; kódy M09 unsupported mockery, M10 valid criticism but weak evidence, M11 source/citation gap); o Fikim: „on to nevie podať formou, ktorá je stráviteľná, je príliš agresívny“ (korpus n=8347 / p-d513b128fbe81d946ea83713, 24. 9. 2026). Funkcia C25 |

---

## 2. Mediálna kritika: čo médiá robia zle

Jadrová téza je od januára 2026 stabilná: médiá dodávajú fakty a náladu, nie mechanizmus a pracovný model; čitateľ vie, čoho sa báť, ale nie čo skúsiť. Adamove slová z 30. 8. 2026: „nepaci sa mi jakym sposobom informuje mainstream a povazujem ho za nebezpecny, lebo clvoeku neposkytuje dostatocny worldview, ktoreho urgencia sa zvysuje kazdy rok a kazdy den“ (korpus n=6487). Každá téza nižšie má dôkaz zo zdrojov a to, čo z nej vyplýva ako funkcia redakcie (id odkazuje na §3).

| # | Téza | Dôkaz | Zdroj | Vyplýva ako funkcia |
|---|---|---|---|---|
| T1 | Fakty a nálada, nie mechanizmus: čitateľ ostáva pozorovateľ, nie operátor (os C6 „informácia nie je agency“). | Kódovanie 50 AI článkov Denníka N (single coder): riziko dominantné 25/50, 37/50 končí na awareness, 9 decision support, 3 practice path; postoj čitateľa 18 spectator, 12 vigilant consumer, 10 citizen, 9 decision-maker, 1 operator; 27 „informed without enabling“. Adam: „Ale aby ti povedali, že jak si to stiahnuť, čo si stiahnuť, prečo sa tomu venovať […] nie. Ty máš AI rovná sa nebezpečie.“ | `R/CURRENT_EVIDENCE.md:80–96`; korpus p-2dabcc3998b7ad4e5eba8465, 21. 9. 2026; `core/02_dielo/hriech.md:14` | E1 skladanie worldview; F15 encyklopedický uzol; C4 vata; C23 audit servisnej línie |
| T2 | Pravdivé fragmenty, chybný alebo ochudobnený destilát; zdroj slúži ako pečiatka na už zvolený afekt, nie ako mapa (osi C3, C4). | Klik 392 Apple/WWDC: „standard / nevystreli dekel“ pred odkazom na Thompsona, ktorého pointa vyvracia záver; 171 material source presences v AI korpuse DN, iba 2 material_countervoice; Trump 2028: fotografia ostala, vysvetľujúca vetva vypadla („informačná amputácia“). | `MK/11:56–93, 252`; `MK/20:35–52`; `R/CURRENT_EVIDENCE.md:116–131`; `R/REACTION_DOCKET_V0_1.md` R013 | C7 porovnanie záznam ↔ podanie; C17 flagy; E6 kompresia mechanizmov |
| T3 | Expert dodá mechanizmus, titulok si ponechá strach: korekcia v tele nezmení dominantný obraz (os C5). | DN-01: titulok „vystrašili svet ‚autonómnymi‘ hackerskými útokmi“, expert Valko v tele: „Vôbec to nie je šokujúce“; trojdňový rez 59 článkov DN: 33/59 titulkov conflict/alarm/moral judgment, headline-body fit 44 tight / 11 partial / 4 distorted; Pikus 1 200 vs ~700 agentov. | D2:207 ([DN15] L109–207); `R/CURRENT_EVIDENCE.md:98–114`; `MK/27:236–248, 406–430` | C5 titulok vs telo; C17 evidence schema |
| T4 | Redakcia si „ukradne priestor na interpretáciu“: predurčí výklad skôr, než čitateľ dostane fakty (os C9 divadlo objektivity). | Adam 15. 8.: „takto si redakcia ukradne, doslova ukradne pristor na interperetaciu ktoru ma aj tak zlu“; AI spresnila: fakty tam sú, problém je hierarchia. Živé.sk otázka „Kde robia MSP chybu…“ už obsahuje odpoveď. | D2:154, 181, 210 ([DN15] L963; [LIS] L1133) | C6 rámovanie; C15 moderátorský loop; C8 jazykový audit |
| T5 | Meranie ako redakčné rámcovanie (os C14): predpoklad → dotazníková kategória → percento → „fakt“; katalóg strachu 10 : 1. | Prieskum DN o súkromnom používaní AI: „Zabudli ste pri rozhovore s AI, že nejde o človeka?“, „Použili ste AI ako ‚terapeuta‘?“, bez „Ušetrila vám AI čas?“; anketa 10. 9. 2025: 10 sekcií obáv, 1 pozitív, záver „najviac zaujíma otázka, ako by mohli AI lepšie a efektívnejšie využívať“ (Adam: „klinec do rakvy“). | D2:214–219 ([DN15] L1062–1089, L1958–2033, L2117–2154); `R/Denník N … sourcebook:316–385, 763–786` | C14 audit ankiet redakcií; C12 ledger návratov |
| T6 | Objem bez akumulácie poznania (os C0) a chýbajúci ledger predikcií a opráv (os C11): stovky položiek, žiadny kumulatívny model. | 250 overených URL série „Trumpov svet“ (čísla 169–550); médium prináša predikcie, nevracia sa k nim; Adam: „urobili to v minulosti? robia nápravy? nie“. Stav: hypotéza, tvrdý test (50 článkov v 10 stratách) nevykonaný. | `R/MAINSTREAM_MEDIA_INDICTMENT_MAP_2026-07-30.md:38–46, 259–281, 447–460`; D2:224 | C12 prediction/correction ledger; E1 kumulatívny model; G7 vlastný correction log |
| T7 | Štát číta médiá strojovo, médiá štát ručne: štát si kúpil stroj na sledovanie médií, novinár kontroluje kataster „zo záľuby“. | CRZ zmluvy Úradu vlády s Mediaboardom 821/2024 (54 720 € s DPH) a 130/2026 (48 073,32 € s DPH): monitoring podľa „premiér, predseda vlády, meno“, ranný súhrn do 5:30, doplnenie do 15 minút; Adam sa k nim od Kyseľovej vety dostal za 58 minút (draft v3:15: „Trvalo mi 58 minút, kým som sa od jednej vety Tomáša Kyseľa… dostal k zmluve“; „7 minút“ je iba v AI extrakcii C3:22, v drafte ani v korpuse sa nevyskytuje; Adam 24. 9. hovorí „trvalo mi to dve minúty“, n=8343 – rozpor v §6.28); k 4. 9. v 10 médiách nenájdený text, ktorý ich pomenúva. Adam: „Tuto to majú celý čas transparentné, dopiče, podpisané GDRom“. Podporný prípad „štát používa AI“: Ústavný súd SR spustil chatbota (RAG nad rozhodnutiami, dodávateľ česká firma), Adam 1. 7.: ustavnysud.sk „Ústavný súd Slovenskej republiky má chatbota, ktorý uľahčí verejnosti prístup k informáciám... toto je strasny gamechanger“; „ked ja teraz spravim netopiera, tak to má už nejaký precedens... existujú dáta a my vieme zistiť, odkiaľ“; „preco česká forma robi slovenskému súdu ai veci? lebo slovensko to nerobí“ (otázka pre D18: kto dodal, za koľko, zmluva v CRZ). | `core/07_texty/drafty/03-fico…v3.md:15–39, 75–81`; `MK/27 Verejna medialna stopa zmluv…:32–75`; korpus p-0e43574e027f4025caa2f018, 1. 9. 2026; korpus n=2498, n=2499, n=2504, 1. 7. 2026 (ÚS chatbot) | D1–D9 celá slučka „stroj, ktorý číta štát“; B15 latencia (5:30 / 15 min ako benchmark) |
| T8 | Objav bez trvalého senzora a zbytočná lokalizácia: jednorazový scoop sa dá preformulovať ako prenasledovanie; súpisné číslo dalo Blahovi lepší príbeh. | Aktuality: fotografia domu, ulica, mapa so súpisným číslom; Denník N 3. 9.: Kyseľ číslo spätne považoval za chybu, Bárdy za nedopatrenie, video neupravené; Adam jadro pomenoval 1. 9. o 14:55–15:19 UTC, ~42 hodín pred článkom DN. | `MK/24:9–13`; `MK/25:20–54, 154–171`; `core/07_texty/drafty/03-fico…v3.md:49–53` | D3 kataster ako senzor; D9 alert; E8 timestamp priorita; P48 test nevyhnutnosti |
| T9 | Z redakcií sa stali podcastové domy: štát je na pár API, redakcie ich nepoužívajú, hlavná činnosť je podcast, nie dátová analytika. | Adam 1. 9.: „keď máš takýto aparát a vieš pracovať s počítačom, máš dátový analytikov a vieš, že v štáte bordel, tak prečo je tvoja hlavná činnosť proste podcasty a nie dátová analytika?“; „mas lupu nad statom, kebyze chces, ale ty si novinar a budujes si socialny status na facebookoch“; z toho istého promptu ako „podcastové domy“: „Jak sa míňajú eurofondy, jak sa míňajú peniaze z rozpočtu, jak sa hlasuje, kto čo hovorí. Všetko by si mohol vedieť, ale ty nie... Proste z redakcií sa stali podcastové domy.“ | korpus n=6514 / p-985db574f0f05266af8834a8 („podcastové domy“, eurofondy), n=6520 / p-da16fc15f08bdce518288684 („mas lupu nad statom“), n=6531 / p-53fa2468114c59c08ea077c3 („cely stat je na par api“), n=6539 („keď máš takýto aparát“), 1. 9. 2026; C3:392 | D5 registre (vrátane ITMS eurofondy a rozpočet); F7 štátny dashboard; B13 prepisy tlačoviek |
| T10 | „Fico je náš čitateľ“: médium vytvorí osobný model spotreby obsahu, hoci dôkaz unesie iba „obsah sa dostal do Ficovej reakcie“ a prenosová cesta (monitoring) je neviditeľná. | Pataj, Newsfilter 20. 3. 2026: „vysvetliť jednému z nich – Robertovi Ficovi“; Fico citoval Tódovej titulok necelých 10 hodín po publikácii (17. 3. 2025); zmluvy s Mediaboardom pokrývajú obdobie. Adam: „dennik n nevie ze ich fico sleduje“. | `MK/28 Fico ako citatel medii…:13–58, 60–87, 115–136`; korpus n=6864, 4. 9. 2026 | C6 rámovanie; D18 krížové kontroly |
| T11 | Hodnotiteľ verzus praktik: o AI rozhodujú tí, čo ju nepoužívajú; autorita bez operačnej fluency (os C8); hovoria o legislatíve, ktorú nečítali. | Klik 404, 48:08–49:10: Mac Studio → OpenClaw → „ja by som sa do toho ani nikdy nepustil“ → čakanie, „kým to niekto urobí za mňa“ (source-transcript-verified, audio nepotvrdené); Hodás v Discorde: AI nie je jeho téma, obaja „skôr skeptici“. Kontrolný vzorok 394–403 zakazuje paušál „nič netestujú“. | `MK/35:29–76`; `MK/09:223–249`; `MK/37:55–59`; D2:88–90, 185 ([LIS] L1258–1353) | C20 kontrolný korpus; C16 speaker asymetria; C21 pass P3 (prax) |
| T12 | Slizký jazyk, jazyk bez páchateľa: „často“, „odborníci varujú“, „nastáva otázka“, „vstupuje nám AI“ robia z rozhodnutí firiem prírodný úkaz. | Adam 2. 7.: „kom,u stupuje co, kam je jai vstupuje prosim ta?“; AI pomenovala hedging, weasel words, agentless construction; slovo „aj“ (23. 6.): „ten jazyk, ja som hovoril o tom jazyku, ktorý je strašne perfídny, taký úplne slizký, drbnutý“. | D2:101, 189, 193, 260 ([LIS] L1598–1618, L2260–2276); korpus n=2296 / p-4ae63e682b9c167154022900, 23. 6. 2026 | C8 jazykový audit |
| T13 | Kolaps kategórií a mierky (os C7): AI, chatbot, model, agent, workflow, infraštruktúra v jednej morálnej kategórii; pojmové pranie (second brain, GDPR compliant, subagents). | Money Talk 114: „to sa volá second brain“ pri utriedení 30 bodov; „enterprise plán = GDPR compliant“ vs EDPB; 20 faktúr → „menšia chybovosť než človek“; Šiškáči: šesť otázok zliatych do testu pôvodu. | `MK/23 Money Talk 114.md:23–29, 49–61, 91–101, 256–272`; `R/REACTION_DOCKET_V0_1.md` R009 | C17 taxonómia M01–M12; E9 šesťotázkový test; F15 uzol |
| T14 | Expert na Slovensku sa nezískava, cirkuluje; branded content nechá zainteresovanú stranu definovať hrozbu bez oponenta (os C12). | Melcerová STVR → SME → hovorkyňa Profesie ako „expertka“; „39 uchádzačov“ bez štruktúrneho vysvetlenia; Index brand s ESET: vzorec „hrozba → čo robíme my“ na 5 miestach; „ESET zaplatil SME“ je záver AI, nie doložený fakt. | D2:92–93, 190–191, 230–233 ([LIS] L1943–1945; [CAVO] L967–1063); `R/REACTION_DOCKET_V0_1.md` R019 | D11 mapa redakcií (roly, vzťahy); C6 rámovanie; C2 preferencie autorov |
| T15 | Mediálny rámec AI je adopčná a trhová brzda (os C13): malí podnikatelia prichádzajú k obrannému predajnému rozhovoru; „sme vo vojne“. | Sales-call tabuľka predsudkov („to je hype“, „AI kradne dáta“, „počkáme“); Adam 15. 8.: „od septembra 2025 sme od Denníka N nepočuli nič užitočné… preto si myslím, že sme vo vojne“; AI: „prispieva, nie spôsobuje“, kauzalita neoverená (E10). | `MK/21 Ondrejov skepticky default.md:41–106`; D2:222 ([DN15] L2555); `R/MAINSTREAM…MAP:480–500` | E12 trhový dopad ako sledovaná hypotéza; F15 uzol |
| T16 | Médiá držia verejnú AI gramotnosť v roku 2023: expozícia bez porozumenia; meno sa objavilo, mentálny model nevznikol. | Hugging Face test („Adamova mama“): jediný explainer Živé.sk 2023; DN 27. 8. definíciu dal, mechanizmus transakcie chýba; Klik: „ani nerobí AI“; o RAG, agentoch, second brain „ani zmienka“. | `R/HUGGING_FACE_SLOVAK_MEDIA_EXPOSURE_TEST_2026-08-29.md:5–28, 54–106`; D2:164, 221; korpus p-a20109f128844a58653a8a89, 12. 9. 2026 | C13 test expozície; F15 encyklopedický uzol |
| T17 | Mainstream stratil monopol po sociálnych sieťach a covide a nezvládol to; vinu externalizuje na dezinfoscénu a útoky politikov; neutralita kódexu bráni moderátorom oponovať politikovi. | Adam 23. 6.: „lenze jak mainstream zacal stracat vpliv, resp monopol na sprostredkovania informacii, tak to nezvladli, a ostali si len stazovat na nedoveru v institucie“; „toto je dalsi hriech do pice.. cize dennik n, mainstream, je v tom uplne nevinne…“; „moderatory nevedia zasiahnut… nemaju v kodexe ze by mali robit oponenta“. DNR 2026: 19 % dôvera, 47 % vyhýbanie, 11 % platí (kontext, nie kauzalita). | `R/Dôvera médií.md:21, 38`; `R/CURRENT_EVIDENCE.md:185–208`; `MK/06:4–19` | C9 dezinfo monitoring; C15 moderátorský loop; C1 aktivita redakcií |
| T18 | Iný slovník pre koalíciu a opozíciu; Denník N „nadržiava Šimečkovi a potápa Fica“; Fico a DN sú antagonistická symbióza. | Adam 6. 9.: „keby sme zobrali sto článkov o politike slovenskej z denníka N, tak by sme vedeli nájsť preferenciu“; Aktuality „jedna chyba“ vs Blaha „doxxing“; R018 ako hypotéza bez tvrdenia o koordinácii; DISCOVERY: úmysel sa z rozdielneho podania nevyvodzuje. | korpus p-c790f9e285b3a8223ab26ea6, 6. 9. 2026; `R/REACTION_DOCKET_V0_1.md:354–370`; `ARCH-N/docs/DISCOVERY.md:127–131`; C3:266–267 | C6 slovník koalícia/opozícia; C7 porovnanie záznam ↔ podanie; C18 zmrazený korpus 100 článkov |
| T19 | Pôvod nie je kvalita; AI slop je zlyhanie úsudku, nie modelu; bezpečnosť je model hrozby, nie atmosféra. | Discord 25. 1.: „bez ai bol tern slop pritomny tiez“; ESET/Index: „nemas davat do chatgpt infroamcie o firme.. jakoze co ej to top za info?“; Marec „Používať AI je hanba“ (pôvodne pripísané Markošovi). | H1:181, 307–311; D2:168, 231; `R/REACTION_DOCKET_V0_1.md:211–231`; `MK/26:13–36` | E9 šesťotázkový test; G3 AI disclosure; E13 korekcie autora |
| T20 | Vízia bez mechanizmu (Vízia 2040, stratégie): dokumenty „skandovania“, ktoré médiá vyhlásia za dobré. | Adam 10. 9.: „ale jak moze dokuemnt o vizii tak gela rozroqvat o tom jake by slovensko mohlo byt, bez hocijakeho mechanizmu“; AI zo 112-stranového PDF: „ako“ príde až v Stratégii 2027. | korpus p-241b0a550727a44765b35251, p-0f3f41bbbedf438310a10c22, 10. 9. 2026; D2:198 | F15 uzol; C22 test materiálneho vynechania |
| T21 | Čitateľ nemá byť externým analytickým oddelením redakcie: platiaci čitateľ dostane fragmenty a rekonštrukciu (aktéri, mierka, peniaze, závislosti) robí sám. | Adam 20. 8. (SME/Irán, Longauer/TA3, regionálny SMER): „Platiaci čitateľ potom dostane fragmenty a rekonštrukčnú prácu musí robiť sám.“; sourcebook: „čitateľ nemôže byť nútený vykonať úplný externý audit redakcie“. | korpus p-5bdb8ec212941639d1db3d41, 20. 8. 2026; `R/Denník N … sourcebook:42`; `R/NETOPIER_CONTENT_CALENDAR:204–227` | F2 udalosť s rekonštrukciou; E1 model reality; B16 denný kontrakt |
| T22 | Tri redakčné úrovne, ale udalosť si skladá poslucháč: pripravená redaktorka, návodné otázky, šéf oddelenia, ktorý zníži extrém, ale neuprace dôkazový reťazec; virálnosť ako náhrada proveniencie. | Aktuality Nahlas 24. 8. 2026 (Lodová, Biró, Sliz): „nevie, či video zverejnil Bombic alebo kto“; „dá sa povedať, že zmiernil“ bez novej pozície; rozpadnuté súvetia, anakolút; právne zlievanie (Tateovci). | `R/CASE_AKTUALITY_FREDERIKA_LODOVA_2026-08.md:67–100, 133–175, 213–262` | F2 minimálny model udalosti; C8 jazykový audit; G5 hranica (junior nemenovať) |
| T23 | Denník N je zainteresovaná strana, nie pokrytec: interne AI používa (~5 000 € mesačne na prepisy), navonok ju rámuje ako hrozbu. | Denník E 5455691: „väčšina našej redakcie to s radosťou využila“, „firma míňa okolo päťtisíc eur mesačne“; AI: „pokrytectvo“ fakty neunesú, obhájiteľné je „zainteresovaná strana“; jadro to prijalo. | D2:61, 213 ([DN15] L542–582, L716–745); `core/02_dielo/hriech.md:100` | C17 flag; E13 korekcie autora |
| T24 | Médiá nevedia vecne reagovať na Ficove ekonomické argumenty (60 % dlh vs Taliansko 120 %); mladé redaktorky kladú naivné otázky a dávajú mu dôvod ich potopiť. | Adam 23. 6.: „media na toto nevedia reagovat vecne, argumentacne, logicky“; „Dávajú mu všetky dôvody na to, aby ich poslal do piče“; „ona sa opýta… kedy sa zníži ten verejný dlh… Lenže cieľ neni do piče zbaviť sa dlhu“. | `R/Dôvera médií.md:38`; korpus n=2280, n=2290, 23. 6. 2026; n=5579, 25. 8. 2026 | F7 štátny dashboard; B13 prepis tlačovky → research; C15 loop |
| T25 | Podcasty a diskusie sú prázdne: moderátorka nevie položiť otázku, z ktorej sa niečo dozvie; debata o AI je „dvaja muži, či skončí ľudstvo“; pasívne počúvanie je hriech. | Adam 10. 9. (Index): „ona nevie položiť zmysluplnú otázku tomu človeku tak, aby sa od neho niečo dozvedela… čo sa proste dozvieš o Slovensku? Nič.“; 14. 9.: „ziadny priklad, ziadny nastroj, ziadny mechanizmus“; overenie Index: absolútna téza „nikdy nenadväzuje“ vyvrátená (Galek 03:23). | korpus n=7527, 10. 9. 2026; n=593, 14. 9. 2026; `ARCH-N/docs/research/INDEX_SOURCE_VALIDATION_2026-09-10.md:18–26` | C15 moderátorský loop; C20 kontrolný korpus; C24 rečový ledger |
| T26 | Klik: pravdivé fragmenty bez orientačnej sily; celosériový verdikt sa nepotvrdil, udržateľný je lokálny prípad Klik 404. | Január 2026: „tento podcast sa uz neda pocuvat“; syntéza 43 (12. 9.): „P1–P5 nepodopierajú celosériový verdict o faktickej nespoľahlivosti, absencii praxe ani absencii orientácie“, opakovateľnosť „neurčité“; Adam 12. 9.: „otvorene sa tam priznali k tomu ze openclaw instalovat nebudu“. | H1:176–181; `MK/43:3–11, 118`; korpus p-8f4741ce7ce8b7be15a790dd, 12. 9. 2026 | C21 pass P1–P5; G14 validácia T/A/E; E6 kompresia |
| T27 | Metóda funguje aj proti autorovi: časť Adamových tvrdení overenie oslabilo alebo opravilo. | Marec, nie Markoš („používať AI je hanba“); Filo nehovorí o návrate k printu; DN má „25 rád“ (16. 9. 2025); DN definoval Hugging Face (27. 8.); „útok“ je technicky opodstatnený; „traja ľudia schválili“ je hypotéza (doložení dvaja autori); DNR meria dôveru priamo; Party Shore „mizogyn“ nenájdené; Karol 36 hodín, nie „štyri hodiny bez triáže“. | `MK/26 Overenie siedmich medialnych tvrdeni.md:13–36`; `core/02_dielo/hriech.md:91–103`; `core/10_otvorene.md:57, 98` | E13 vlastné omyly ako súčasť záznamu; C18 pevné vzorky; G14 validácia |
| T28 | Preklad ako informačná amputácia: redakcia preloží článok z Guardianu a pri preklade posunie významy slov; výsledok je o stupeň či dva horší než originál (P34: vynechanie a posun, nie lož). | Adam 25. 8.: „A to je proste tá istá redakcia, ktorá prekladá anglický článok, ktorý publikovali do Guardianu a pri preklade zmenia významy slov tak, že výsledný článok je o stupeň či dva horší ako pôvodný originál.“; stav: hypotéza, žiadny pár originál ↔ preklad zatiaľ nekódovaný. | korpus n=5584, 25. 8. 2026 | C7 variant `porovnania.typ='original_preklad'` (originál EN ↔ SK text: posuny modality, agensa, kvantifikátorov); spúšťač: záznam s poľom `preklad_z` alebo zhoda titulku s cudzojazyčným zdrojom |

**Čo z toho vyplýva pre redakciu ako celok:** kritika médií nie je samostatný produkt, ale špecifikácia. Každá téza určuje jednu funkciu, ktorú médiá nerobia a ktorú má redakcia robiť sama: (1) mechanizmus a model namiesto faktu a nálady (slučka E a výstup F15), (2) merať rámovanie, jazyk, vatu a nepresnosti na korpuse, nie na dojme (slučka C), (3) čítať štát strojovo skôr, než sa niečo prevalí (slučka D), (4) držať vlastný ledger predikcií a opráv, ktorý médiám chýba (C12, G7), (5) reagovať do minút s pripravenými podkladmi (A2, B13, B15), (6) zverejňovať aj kontrolné prípady a vlastné omyly (P17, P20, E13).

---

## 3. Register funkcií po slučkách

Sedem slučiek: **A Dopredu** (vedieť skôr, než sa to deje), **B Teraz** (zber, filter, udalosti, kauzy, prepisy, Minúta), **C Meranie médií**, **D Registre a OSINT**, **E Worldview a zvody**, **F Výstupy**, **G Prevádzka**. Pri každej funkcii: čo robí, spúšťač, vstup, výstup, meranie úspechu, stav, zdroj, citát. Duplicitné formulácie z rôznych mesiacov sú zlúčené do jednej položky; odlišné funkcie ostávajú samostatné.

### A. Dopredu: kalendár, anticipácia, príprava

**A1 · Kalendár udalostí a odpočet**
- Čo robí: drží plánované domáce a zahraničné udalosti (zasadnutie OSN, schôdze NR SR, program prezidenta a premiéra, ohlásené tlačovky, voľby) s odpočtom na webe; systém vie, že sa niečo deje, skôr než o tom napíšu médiá.
- Spúšťač: pravidelný import kalendárov inštitúcií a ohlásení z médií; denný prepočet odpočtov.
- Vstup: NR SR program, kalendár prezidenta a vlády, agentúrne avíza, RSS.
- Výstup: modul „kalendár a odpočet“ na Hriechu; interný signál pre A2.
- Meranie: podiel udalostí, o ktorých systém vedel pred prvým mediálnym článkom; nula prekvapení typu „dozvedel som sa, až keď sa to dialo“.
- Stav: návrh (Linear XDR-230 zoznam modulov).
- Zdroj: korpus p-d66c017da8cc08e3a5755593, 27. 9. 2026; korpus n=8048, 25. 9. 2026 („kalendar udalosti domácich a zahranicnych, odpocet odalosti“); korpus n=7766, 29. 5. 2026 (obsidian Netopier: „chcel by som smedovat program a kalendar narodnej rady a prezdienta a navstevy premiera“).
- Citát: „nieco sa deje ako napr ze je zasadnutie osn, jak bolo teraz niekedy, tak my mame kaldner cize vieme dopredu ze sa toto deje, teraz som sa o tom dozvedel az ked sa to dialo, lebo mainstream infromuje proste zle“

**A2 · Anticipácia ohlásenej udalosti a kauzálne prepojenie (Danko o 13:50)**
- Čo robí: keď sa v médiách alebo iných zdrojoch objaví ohlásenie (tlačovka o 14:00), systém ju pred začiatkom zaeviduje ako udalosť, prepojí ju s tým, na čo reaguje (Fico), založí prípad a spustí research podkladov (B12), aby boli hotové skôr, než sa udalosť stane.
- Spúšťač: detekcia ohlásenia v prúde B1/B2/C10 (kľúčové slová, entity, čas).
- Vstup: ohlásenie, profil aktéra (C10), história témy (B11), registre (D).
- Výstup: predvyplnená karta udalosti s kontextom „reakcia na X, lebo sa stalo Y“ a research pack.
- Meranie: čas medzi ohlásením a zaevidovaním (cieľ ≤ 10 min pred začiatkom); podiel tlačoviek s hotovými podkladmi pred štartom.
- Stav: návrh.
- Zdroj: korpus p-d66c017da8cc08e3a5755593, 27. 9. 2026.
- Citát: „ak danko zvola tlacovku o 14 v piatok, tak uz 13:50 ak to niekde v mediach povedali, alebo na inych zdrojoch, tak system uz vie ze danko ide mat tlacovku, je to reakcia na fica, danko povedal toto, lebo sa stalo toto a kedze je to dalsi case, tak sa k tomu spravi reserach aby boli podklady“

**A3 · Sledované témy a watch pravidlá**
- Čo robí: zoznam sledovaných tém a aktérov, podľa ktorého sa prichádzajúce správy skórujú a eskalujú; explicitné watch rule je jeden z dôvodov, prečo sa udalosť vynorí (B9).
- Spúšťač: Adam pridá alebo zmení tému; nový záznam sa oproti zoznamu vyhodnotí.
- Vstup: Adamove témy, entity, kľúčové slová; prúdy B a D.
- Výstup: skóre relevancie, why_surfaced „watch rule“, zaradenie do tematického dokumentu (B11).
- Meranie: podiel relevantných udalostí zachytených cez watch pravidlo; počet falošných eskalácií.
- Stav: návrh (koncept od júna 2026, výslovne 27. 9.).
- Zdroj: korpus n=1251, 5. 6. 2026; p-d66c017da8cc08e3a5755593, 27. 9. 2026; `ARCH-N/docs/PRODUCT_HYPOTHESIS.md:31–47`.
- Citát: „podla mojihc tem ktore chcem sledovat a podla tem ktore sa vyskytuju sa bude robit scoring sprav a podla skoringu a preferencie sa potom pojde do konkretnych clankoch“ (5. 6.); „budeme mat filtrovanie tem, sledovane temy“ (27. 9.)

**A4 · Týždenná ústredná otázka a content calendar**
- Čo robí: Netopier vopred položí jednu ústrednú otázku a najviac päť pomocných; Adam 45–60 minút hovorí alebo píše bez rešerše; Netopier nájde tézu, oddelí fakt, interpretáciu, hypotézu a rétorickú skratku, pripojí sourcebook, dohľadá chýbajúce dôkazy a vráti iba rozhodnutia, ktoré zaňho nemožno urobiť (výstup F4).
- Spúšťač: týždenný rytmus; osem tém 31. 8. – 25. 10. 2026.
- Vstup: zásobník tém, sourcebooky, Adamov surový rozbor.
- Výstup: článok pre xvadur.com/Hriech + deriváty.
- Meranie: jeden článok týždenne; Adamov vstup ≤ 60 min; nestihnutý týždeň sa presúva, nie preskakuje.
- Stav: rozhodnuté 30. 8. 2026, nenaplnené (žiadny z ôsmich článkov nevyšiel; 14. 9. Hriech odložený).
- Zdroj: `R/NETOPIER_CONTENT_CALENDAR_2026-08-31_10-25.md:15–47` (AI syntéza, author Adam Rudavský); korpus 30. 8. 2026 („lebo ked sa ma nieco oyptas, ja viem pisat aj hodinu, ked si dame temu, ja ju viem kompletne rozobrat a ptoom o tom napisat clanok, ale ja na to nemam cas chapes?“); H1:372.
- Citát: „Raz za týždeň odpovedať 45–60 minút na jednu ústrednú otázku bez rešerše, editovania a prerušovania.“

**A5 · Pravidlo prerušenia kalendára aktuálnou udalosťou**
- Čo robí: nová udalosť smie plán prerušiť iba vtedy, keď priamo aktualizuje jednu z nosných tém; kalendár nie je publikačný dlh.
- Spúšťač: udalosť s vysokým skóre v B9, ktorá sa viaže na tému v A3/A4.
- Vstup: skóre udalosti, mapa tém.
- Výstup: rozhodnutie „prerušiť / nechať“ s dôvodom.
- Meranie: počet prerušení za štvrťrok; podiel prerušení, ktoré viedli k publikácii.
- Stav: rozhodnuté (AI syntéza, 30. 8.).
- Zdroj: `R/NETOPIER_CONTENT_CALENDAR_2026-08-31_10-25.md:34–36`.
- Citát: „Nová aktuálna udalosť môže plán prerušiť iba vtedy, keď priamo aktualizuje jednu z nosných tém.“

**A6 · Reaction docket: zásobník leadov so stavovou gramatikou a výberovým pravidlom dňa**
- Čo robí: každý verejný artefakt, ktorý stojí za reakciu, dostane záznam (artefakt, najsilnejšia verzia tvrdenia, čo je pravdivé, chýbajúca distinkcia, silnejší model, najsilnejšia námietka, chýbajúci dôkaz) a stav lead → captured → verified → scripted → recorded → published → corrected; rodiny mechanizmov A1–M1. Výber dňa: verified working case → captured s jedným ohraničeným defektom → lead až po zachytení artefaktu → portfóliová hypotéza až po rešerši.
- Spúšťač: Adam alebo systém zachytí artefakt (článok, podcast, post); denný výber témy.
- Vstup: URL, screenshot, audio, dátum, presný citát.
- Výstup: záznam R-xxx; vstup pre F13 karta reakcie a F10 klipy.
- Meranie: počet záznamov, ktoré prešli z lead do verified a published; žiadna nahrávka z pamäte.
- Stav: postavené ako dokument (R001–R019, 30. 7. 2026); nič nedosiahlo recorded.
- Zdroj: `R/REACTION_DOCKET_V0_1.md:8–57, 447–457` (AI syntéza); `core/07_texty/zasobnik.md:221`.
- Citát: „The target is never merely a person. The unit of criticism is: artifact -> claim -> authority transfer or compression mechanism -> consequence -> stronger model -> falsifier“
- Doplnenie (audit 27. 9.): docket je zmrazený na R001–R019 z 30. 7., ale korpus obsahuje ďalšie leady z augusta–septembra, ktoré register nezachytával. Backlog R020–R026 (dátum, artefakt, rodina): **R020** platená epizóda Indexu (Denník SME) s Evou Frantovou – branded content ako rozhovor, nová rodina T14 („kedze je to dennik sme, platena inzerrcia neni o promo ale o rozhovore.. index riesi ekonomiku... s evou frantovou“, „je v podcaste platenom“; korpus n=624, n=632, 21. 9. 2026); **R021** Branislav Bežák, Newsfilter, o manifestácii („Branislav Bežák vo svojej vydrbanej rubrike pri newsletteri, či Newsfiltri... povie, že manifestácia je šarlatánske presvedčenie“; n=8271, 21. 9. 2026); **R022** Dobré ráno sobota naživo, Zuzana Kovačič Hanzelová a Jakub Filo („Pokračujeme v rozoberaní podcastu Dobré ráno sobota naživo so Zuzanou Kovačič Hanzelovou a Jakubom Filom“; n=5948, 22. 8. 2026; previazať s E13, Filo/print); **R023** Index a Vízia 2040 (n=7517–7538, 10. 9. 2026; T20); **R024** TV JOJ 24 podcast („toto je dalsi hriech ktory musime zahrnut“; n=3468, 29. 7. 2026); **R025** ďalšie relácie poslané z aplikácie Podcasty 28.–29. 7. 2026 (Vizita, Aréna s Dibákovou, 30tnik, Index, Klik, Dobré ráno; n=3431, n=3435, n=3439, n=3460); **R026** MK/03 Lívia Plaváková a Denník N (video EUvwkQI9NHw, článok DN neidentifikovaný; P68, C25). Vstupy docketu, ktoré register neuvádzal: odkaz z aplikácie Podcasty (podcasts.apple.com) je platný spúšťač (B14 doplnenie); Instagram „uložené/reposty“ sú Adamov hlavný prísun podnetov („90% nových vstupov, ktoré mám, tak mám z Instagramu... ktoré si saveujem, ku ktorým sa už nikdy nevrátim“, n=8355, 25. 9. 2026; „eden vie citat to co si ukalads reply ci jak sa to vola, to by som strasne chcel“, n=7642, 11. 9. 2026) → cez Eden export desk položka `lead` s URL a časom uloženia.

**A7 · Podklady k trvalým témam (demografia, Zeitgeber, Opus Major)**
- Čo robí: redakcia priebežne pripravuje podklady k témam, ktoré nie sú viazané na deň: demografická krivka a starnutie (DSS čakačky, Senior Atlas 79 okresov / 1 553 služieb), Zeitgeber („kto vlastní hodiny“, 13 tvrdení na overenie), Opus Major (história, náboženstvo, moc, 292 záznamov) ako verejne sledovaný výskum.
- Spúšťač: založenie `research/<téma>/` v repozitári Hriechu (od 26. 9. 2026); štvrťročná aktualizácia dát.
- Vstup: ŠÚ SR, DSS registre, Notion Opus Major, primárne pramene.
- Výstup: research priečinok s tabuľkou tvrdení (primárny zdroj pred použitím; sporné = nepoužiť), neskôr modul a článok.
- Meranie: každé tvrdenie v drafte má primárny zdroj; Zeitgeber draft do 31. 12. 2026 (XDR-197).
- Stav: rozhodnuté (Zeitgeber research založený 26. 9.); demografia a Opus Major návrh.
- Zdroj: korpus n=8048, 25. 9. 2026; `hriech/research/zeitgeber/README.md:1–88`; `core/02_dielo/register.md:35, 59`; Linear XDR-197.
- Citát: „hriech ma taktiez pripravovat podklady na to, ze demograficka krivka hovori ze bude extremny problem zo starnucim obyvatelstvom“; „co je zaklad researchu ktory rozbehneme a ktoreho stav budeme sledovat v ramci verejneho ekosystemu“
- Doplnenie (audit 27. 9.): korpusy pre Chronos/Opus Major: transkripty kanálov Predictive History a John Harris (Obsidian) majú dostať `korpus_id` (D14): „Johna Harrisa a Predictive History. To sú dva najdôležitejšie YouTube-ové kanály 2026... Čo keby sme indexovali?“ (korpus n=5799, 21. 8. 2026); „Toto je dôkaz, že prediktív history je relevantný“ (n=5586, 25. 8. 2026). Zeitgeist (4 filmy) a Michael Moore sú základ Adamovho worldview a vznik Opus Major (apríl 2026): „film zeitgest som videl prvy krat v aprili spolu s filmami michaela moora a kompletne mi to zmenilo zivot, tieto veci treba naclipovat z vysokou urgenciou hned ako sa wrkflow overi u fikiho. vtedy v aprili z toho vuznikol opus_major“ (n=8048 / p-8ea14a6969a33e12dcfb1500, 25. 9. 2026); „touto tezou sa da odpovedat na kazdu otazku ked pochopis vsetky 4 filmy zeitgeist... dennik n je vlemi daleko od pravdy ak je zeitgeist blizko“ (n=8101, 26. 9. 2026). Hranica: tézy zo Zeitgeistu sa v E1 vedú ako `hypothesis` (P28) a do verejného textu idú iba s primárnym zdrojom; klipovanie cudzích filmov (F10) je autorské právo, iba citácia v nevyhnutnom rozsahu (G13); „Zeitgeist ako worldview vs dôkazová línia Hriechu“ je rozhodnutie Adama (§6.25).

### B. Teraz: zber, filter, udalosti, kauzy, prepisy, Minúta

**B1 · Monitoring slovenských médií cez RSS**
- Čo robí: každých 30 minút polluje registrované slovenské kanály (Denník N, Minúta po minúte, Aktuality, Pravda; register `sources/slovak-core.yaml`), lokálne cez Miniflux, v cloude cez konektor `rss`; každý záznam nesie zdroj, URL, čas publikácie a zberu, hash obsahu. Textový rozsah je RSS výňatok, nie celý článok.
- Spúšťač: cron */30.
- Vstup: RSS/Atom feedy.
- Výstup: záznamy v archíve (B4); vstup pre B5, B6, C1.
- Meranie: nulový výpadok zberu > 1 h; každý článok dohľadateľný cez URL a hash; pokrytie všetkých registrovaných zdrojov.
- Stav: postavené (Miniflux lokálne, runtime stojí od 7. 9.; konektor `rss` lokálne overený 26. 9., nenasadený).
- Zdroj: `netopier/sources/slovak-core.yaml:5–37`; `netopier/zber/README.md:20`; `netopier/docs/DECISIONS.md` ADR-002; korpus p-5ac6a7bf60c351a3fc1e25e2, 21. 5. 2026; C1:267 (23. 6.).
- Citát: „budeme chcieť sledovať tlačové agentúry, slovenské, zahraničné, aj európske, všetky veľké médiá, ako sú New York Times, ak sa dajú sledovať. No nejakým spôsobom by som chcel RRRS, RSS alebo nejakú API agregáciu proste správ“; „denník N neni objektívny. Prináša informácie, ktoré sú relevantné, ale tá forma, akým o tom informujú, je malígna. Aby sme sa tejto malignity zbavili, potrebujeme mať vlastný zdroj informácií.“

**B2 · Svetové kanály World Monitor a inventár zdrojov**
- Čo robí: číta 155 svetových RSS kanálov z katalógu World Monitor (politics, europe, middleeast, gov, thinktanks, crisis) každé 2 h priamo od vydavateľov; denne sťahuje inventár zdrojov cez MCP (outlety podľa tieru, propagandistické riziko, štruktúrovaní poskytovatelia). Živé briefy a riziká krajín iba s plateným kľúčom (99,99 $/mes.).
- Spúšťač: cron 2 h; denný inventár.
- Vstup: World Monitor katalóg a MCP.
- Výstup: svetové záznamy v archíve; vstup pre E2 (pulz sveta).
- Meranie: 155 kanálov aktívnych; inventár denne obnovený.
- Stav: postavené (26. 9., XDR-229 Done), nenasadené v cloude.
- Zdroj: Linear XDR-229; `netopier/zber/README.md:17–22, 33`; `netopier/STATUS.md:30`.
- Citát: „Netopier sleduje zákulisie (rozhodnutie 22.–23. 9.): World Monitor (worldmonitor.app) ako svetový zdroj, CRZ zmluvy, obstarávania, kataster a štátne dáta.“

**B3 · Full-text ingest (Denník N, tlačové agentúry, Reuters, Guardian)**
- Čo robí: RSS je signálna vrstva; k nej sa pridávajú plné texty z predplateného Denníka N (rubriky Slovensko, Minúta po minúte, newsletter) a z agentúr a veľkých zahraničných médií, aby klastre mali celý text a nie iba výňatok.
- Spúšťač: nový záznam v B1 s vysokým skóre (A3); denný ingest newslettera.
- Vstup: predplatné, agentúrne API, newsletter.
- Výstup: plný text pripojený k záznamu a klastru.
- Meranie: podiel záznamov s plným textom v sledovaných témach.
- Stav: neurčité (v0 mal ingest Denníka N; v2 iba RSS výňatky; licenčná hranica: licencované fulltexty nepatria do verejného repozitára).
- Zdroj: korpus n=1222, n=1226, 30. 5. 2026; n=2877, 30. 6. 2026; n=1251, 5. 6. 2026; `hriech/AGENTS.md:14–16`.
- Citát: „potrebujeme nejaky full text zdroj, a ked budeme krlastrovat teamy, tak mame nejake verejne zdroje jak su tlacove agentury a potom amme dennik n co je mienko tvorne mediaum ktore pokyrva vsetko“
- Doplnenie (audit 27. 9.): agentúrne fulltexty TASR/SITA ako platený zdroj s licenčnou hranicou (nikdy do verejného repozitára, P45); Adam od 25. 5. menuje TASR a Reuters ako krížovú kontrolu popri Wikipedii a Eurobarometri: „stane sa ze dennik n spravi newsletter, podla dostupneho obsahu, sa spravi cross referencing z dalsimi dostupnymi zdrojmi ako wikipedia reuters tasr a dalsie veci z toho sa spravi statistika pre web... k tomu moze byt statistiky eurobarometer“ (korpus n=994, 25. 5. 2026).

**B4 · Archív s provenienciou a nemennými revíziami**
- Čo robí: každý článok alebo záznam sa ukladá ako zdrojovo viazaný záznam (URL, zdroj, čas publikovania, zberu a zmeny, hash, surový payload v R2); zmena obsahu vytvorí novú nemennú `article_revision` a invaliduje embedding; nič sa neprepisuje.
- Spúšťač: každý ingest (B1, B2, D1–D4).
- Vstup: surový payload.
- Výstup: archív (Postgres lokálne / D1 + R2 v cloude); dôkazová vrstva pre všetko ostatné.
- Meranie: každý verejný výrok Hriechu dohľadateľný k revízii a hashu; žiadny prepis pôvodného textu.
- Stav: postavené (ArticleArchive v2; zber/ D1+R2 lokálne overené, 14 299 záznamov 26. 9.).
- Zdroj: `netopier/docs/ARCHITECTURE.md:28–35, 50–52`; `ARCH-N/docs/reports/BUILD_2A_REPORT.md:14–16`; `netopier/zber/README.md:4–6`.
- Citát: „Raw entries remain source-linked records. Story memberships and scores are derived, versioned state. No generated synthesis is primary evidence.“

**B5 · Zhlukovanie do príbehov lokálnymi embeddingmi**
- Čo robí: FastEmbed paraphrase-multilingual-MiniLM-L12-v2 beží lokálne; temporal-centroid prah kosínusu 0,83 z benchmarku 22 slovenských titulkov (precision 1,0, recall 0,83, 0 false merges); články sa zaraďujú do príbehov bez LLM.
- Spúšťač: nová revízia v B4.
- Vstup: text záznamu.
- Výstup: členstvo v príbehu (odvodený, verzovaný stav).
- Meranie: 0 falošných zlúčení na benchmarku; Adamova ratifikácia labelov (čaká od 3. 9.).
- Stav: postavené (kód), runtime stojí od 7. 9.; Python vrstva nie je napojená na D1.
- Zdroj: `ARCH-N/benchmarks/SLOVAK_CLUSTERING_REPORT.md:6–20`; `netopier/docs/DECISIONS.md:22–31` ADR-004; `netopier/STATUS.md:4–5, 20`.
- Citát: „False merges are treated as costlier than false splits.“

**B6 · Event Intelligence Core: kandidáti udalostí, päť vzťahov, ľudský merge/split**
- Čo robí: EventCandidateExtractor atomizuje článok na kandidátov udalostí s presným výňatkom a offsetmi; RelationshipDecider rozhoduje syndicated_copy / same_event / event_update / same_topic / unrelated v 72-hodinovom okne; navrhované zlúčenia sa nikdy nevykonajú automaticky, merge/split robí človek so zachovanou lineage. Karta udalosti: titulok, zdrojovo ohraničené zhrnutie, čas, miesto, aktéri, organizácie, stav, počet článkov a nezávislých rodín, časová os, presné dôkazy, confidence, konflikty, revízie.
- Spúšťač: nová revízia; návrh vzťahu; ľudské rozhodnutie v B17.
- Vstup: články (B4), príbehy (B5), neskôr prepisy (B13, B14) a štátne záznamy (D).
- Výstup: `/events` karty; udalosť ako jednotka pre F2.
- Meranie: 5 párov udalostí v benchmarku; žiadne automatické zlúčenie; posledný beh 3.–5. 9.: 76 článkov, 71 udalostí.
- Stav: postavené (Build 2A, 3. 9.), runtime stojí.
- Zdroj: `ARCH-N/docs/reports/BUILD_2A_REPORT.md:12–34`; `ARCH-N/PRODUCT.md:27`; `netopier/contracts/events.example.json`.
- Citát: „Suggested decisions create a separate event and never merge automatically.“; „Vstupnou jednotkou je udalosť s vývojom a odkazmi na zdroje.“
- Doplnenie (audit 27. 9.): výsledky benchmarku vzťahov, ktoré register neuvádzal (`ARCH-N/benchmarks/EVENT_RELATIONS_REPORT.md:6–10`): 5 párov, `hybrid-event-v2` presnosť 1,0000 s 0 falošnými zlúčeniami a 0 falošnými rozdeleniami vs `lexical-baseline` 0,4000; čísla sú provizórne do ratifikácie labelov Adamom (`artifacts/verification-2026-09-03.json` known_boundaries: „Benchmark labels still require Adam's editorial ratification“; §6.21).

**B7 · Počet nezávislých zdrojových rodín**
- Čo robí: pri každej udalosti ráta nezávislé zdrojové rodiny a vylučuje syndikované kópie; desať prepisov agentúrnej správy je jedno potvrdenie.
- Spúšťač: priradenie vzťahu syndicated_copy v B6.
- Vstup: členstvá udalosti, domény, agentúrna signatúra.
- Výstup: pole independent_source_count na karte; vstup pre B10 event_confidence.
- Meranie: agentúrne kópie nikdy nezvyšujú počet nezávislých potvrdení.
- Stav: postavené.
- Zdroj: `ARCH-H/…/AI_NEWSROOM_AND_NATURAL20_TEARDOWN_2026-09-03.md:185`; `ARCH-N/docs/DISCOVERY.md:105`.
- Citát: „desať prepisov agentúrnej správy nie je desať nezávislých potvrdení a virálnosť nie je verejný následok“

**B8 · Feed a udalosti cez API s nemenným snapshotom**
- Čo robí: `/feed` stránkuje nad zmrazeným PostgreSQL snapshotom (24 h), `/events` vracia presné výňatky, URL, hashe a rozhodovacie znaky; API je iba na čítanie.
- Spúšťač: požiadavka klienta (web, agent B19).
- Vstup: archív, príbehy, udalosti.
- Výstup: JSON (`contracts/openapi.json`: /health, /feed, /stories/{id}, /sources, /events).
- Meranie: pri listovaní sa žiadny príbeh nezdvojí ani neskryje.
- Stav: postavené (FeedProjector), runtime stojí.
- Zdroj: `netopier/docs/ARCHITECTURE.md:37–39`; `netopier/contracts/openapi.json`.
- Citát: „Its opaque cursor binds subsequent pages to a snapshot ID and position for 24 hours, so live score changes cannot duplicate or hide a story during traversal.“

**B9 · Filter relevancie (pravidlo Gelnica / Fínsko) s viditeľným dôvodom why_surfaced**
- Čo robí: prichádzajúce správy sa filtrujú podľa relevancie pre Slovensko a pre Adamovu agendu; lokálny incident (požiar v Gelnici, bomba vo Fínsku) ostáva v archíve a eskaluje sa iba pri konaní ministra, vlády, polície, prokuratúry alebo samosprávy, pri verejných peniazoch, systémovom vzorci, politickom zneužití, rozpore zdrojov alebo explicitnom watch rule (A3). Každá vynorená udalosť nesie strojovo aj ľudsky čitateľný dôvod; pravidlo je verzované, nie skryté v modeli.
- Spúšťač: nová udalosť v B6.
- Vstup: karta udalosti, entity, registre, watch pravidlá.
- Výstup: zaradenie (archív / verejný feed / Adamova priorita) + `why_surfaced`.
- Meranie: podiel vynorených udalostí, ktoré Adam neodmietol; každá eskalácia má dôvod; bomba na Slovensku pred bombou vo Fínsku.
- Stav: rozhodnuté (Adam 3. 9. a 27. 9.); implementácia návrh.
- Zdroj: korpus n=6751 / p-f47223ea62cf842738a7edc7, 3. 9. 2026 (C3:368); p-d66c017da8cc08e3a5755593, 27. 9. 2026; `ARCH-N/docs/PRODUCT_HYPOTHESIS.md:29–47` (AI syntéza).
- Citát: „my to musí robiť podklady na články a hlavne to musí filtrovať, že požiar v Gelnici nás nezaujíma, pokiaľ to nerieši nejaký minister alebo sa to nejak inak nezneužíva.“; „k nam jak prichadzaju spravy tak sa filtruju, lebo bomba vo finsku ma zaujim amenej ako ta na slovensku“

**B10 · Tri oddelené skóre: event_confidence, public_consequence, adam_relevance**
- Čo robí: istota udalosti (je to tá istá udalosť a ako je doložená), verejný následok (inštitucionálny, právny, finančný dopad) a Adamova relevancia sú tri samostatné úsudky; popularita alebo momentum (Natural20 bigness) je štvrtý pomocný signál a nikdy nerozhoduje sám.
- Spúšťač: každá udalosť po B9.
- Vstup: nezávislé rodiny (B7), registre (D), watch pravidlá (A3), pokrytie.
- Výstup: tri čísla + poradie vo feede.
- Meranie: skóre sú vysvetliteľné; Adamov feedback mení politiku (E3), nie váhy potichu.
- Stav: návrh.
- Zdroj: `ARCH-N/docs/PRODUCT_HYPOTHESIS.md:49–62`; `ARCH-H/…/AI_NEWSROOM…:177–185` (AI syntéza).
- Citát: „Popularity or coverage momentum may inform ordering, but it cannot replace any of these judgments.“

**B11 · Živý tematický dokument: jeden dokument na deň a tému, klaster kauzy**
- Čo robí: na daný deň a tému vzniká jeden dokument, do ktorého sa zapisuje všetko z RSS, tlačoviek a rozhovorov; keď o pár dní príde podobná vec, zapíše sa do toho istého klastra; kauza (Očistec) dostane dokument alebo databázu ľudí, udalostí a dôkazov s pridruženými článkami a historickými paralelami.
- Spúšťač: nová udalosť s väzbou na existujúcu tému; nová kauza.
- Vstup: udalosti (B6), prepisy (B13), registre (D).
- Výstup: tematický dossier s časovou osou, ktorý rastie; vstup pre F2 a F5.
- Meranie: každá téma má jeden živý dokument, nie N článkov; kontinuita v čase.
- Stav: návrh (Adamova formulácia 23. 6. a 19. 6. 2026; čiastočne pokryté B6 a F5).
- Zdroj: korpus n=2289 / p-231cbda66315bb6d858d5042, 23. 6. 2026; n=2058, 19. 6. 2026; n=7766, 29. 5. 2026.
- Citát: „na daný deň, na danú tému by mal vzniknúť proste jeden dokument, do ktorého sa bude zapisovať všetko podľa toho, čo hovoria RSS zdroje […] na budúce, keď príde niečo podobné, tak sa to zapíše zase do toho klastra na iný deň“; „chcem mat dynamicky systzem aby ked sa nieco prevali aby sa vedela spravit investigativa a vznikali artefakty pridruzenych calnkov a relevantnych udalosti aj historickych“

**B12 · Kauza → paralelný research (research lane)**
- Čo robí: keď sa ukáže kauza, zaháji sa paralelný research ako ohraničený prípad: explicitná otázka a falzifikátory → schválený plán zdrojov s rozpočtom → ohraničený zber → extrakcia tvrdení, citátov a dokumentov → diverzitný výber dôkazov → medzery a rozpory → evidence pack → Adamova pozícia → zmluva článku. Klik na „research“ nespúšťa neobmedzeného agenta.
- Spúšťač: eskalácia v B9/B17 (dispozícia research), A2, alebo Adamova otázka.
- Vstup: udalosť, tematický dokument (B11), registre (D), korpusy (D14).
- Výstup: research case s evidence packom; vstup pre F3.
- Meranie: každý pack má otázku, falzifikátor, plán zdrojov, rozpočet a stav; žiadny neohraničený beh.
- Stav: návrh (Adam 27. 9. „paralelny research“; 3. 9. „ešte musíme dorobiť nejakú research lane“).
- Zdroj: korpus p-d66c017da8cc08e3a5755593, 27. 9. 2026; korpus n=6750 / p-916e64f6df221611f7677fd4, 3. 9. 2026 („ešte musíme dorobiť nejakú research lane“); `ARCH-H/…/AI_NEWSROOM…:212–230`; H1:493–500 (MK/05:109–115).
- Citát: „budeme mat filtrovanie tem, sledovane temy, ked sa ukaze nejaka kauza zahaji sa paralelny research, proste redakcia kjtorej nic neunikne“; „Adam povie ostrú pointu. Codex ju rozdelí na tvrdenia. Netopier alebo Obsidian dodá zdroje. Slabé časti sa označia. Verejný text použije iba to, čo unesie kontrolu.“

**B13 · Tlačovka → prepis → tvrdenia → research → záznam do databázy**
- Čo robí: pri každej tlačovke (Ficove pravidelné víkendové) systém nájde vysielanie (YouTube), stiahne prepis (titulky alebo audio; ak nejde YouTube prepis, alternatíva), ide vetu po vete, vytiahne tvrdenia, každé overí researchom s dátami a zdrojom (napr. „Slovensko je na tom ako Poľsko“), zapíše sumár a výroky do databázy k aktérovi a do tematického dokumentu (B11).
- Spúšťač: nová tlačovka (A2, C10) alebo nové video na kanáli aktéra.
- Vstup: video/audio, kanál, profil aktéra.
- Výstup: prepis s časom, sumár, zoznam tvrdení so statusom overenia, záznam v DB.
- Meranie: každá víkendová tlačovka má prepis a sumár do niekoľkých hodín; každé tvrdenie má zdroj alebo status „neoverené“.
- Stav: rozhodnuté (27. 9.), nepostavené (korpusový nástroj existuje pre Fikiho, D14).
- Zdroj: korpus p-d66c017da8cc08e3a5755593, 27. 9. 2026; n=2289, 23. 6. 2026; n=7032, 5. 9. 2026.
- Citát: „fico ma pravidelne vikendove tlacovky, potrebujem prepis, sumar a zaznam do databaz“; „keď Fico povie, že Slovensko je na tom tak v pohode jak Poľsko, tak musíme zistiť proste, či je to pravda. Tým pádom sa spraví research na to, že Slovensko versus Poľsko. A pokúsime sa odpovedať na to, že či je toto tvrdenie pravdivé alebo nie, doložíme zdroj, doložíme dáta“

**B14 · Verejné vystúpenie na YouTube → časovaný prepis → udalosť pred článkom → nabaľovanie → syntéza**
- Čo robí: nové politické vystúpenie (rozhovor, debata, podcast) sa zachytí v dohodnutom intervale, uloží sa originál a verzovaný prepis s provenienciou, vznikne udalosť bez čakania na mediálny článok; k nej sa neskôr pripájajú články, reakcie, ďalšie vyjadrenia a štátne dokumenty; jeden pohľad ukáže pôvodný obsah, následné pokrytie a doloženú syntézu. Chýbajúci prepis je stav spracovania, nie ticho aktéra.
- Spúšťač: nové video na sledovaných kanáloch (16 účtov v v0: TA3, JOJ 24, SME, Denník N, Úrad vlády, TASR TV, SMER, Hlas, PS).
- Vstup: YouTube, kanály aktérov.
- Výstup: udalosť s prepisom; vstup pre C7 (porovnanie s podaním).
- Meranie: čas od vydania videa po udalosť; „nechcem, aby som počul Šimečku v podkaste, prečítal si o tom v Denníku N a Netopier ani slovo“.
- Stav: návrh (Adamova explicitná požiadavka 6. 9. 2026; v0 YouTube ingest zmazaný).
- Zdroj: korpus p-c790f9e285b3a8223ab26ea6, 6. 9. 2026; `ARCH-N/docs/DISCOVERY.md:123–137`; korpus n=2068, 21. 6. 2026; p-cf7c842f82a7793c35f11291, 17. 6. 2026.
- Citát: „netopier by mal v čase vydania rozhovoru na YouTube spracovať transkript, vytvoriť event a na ten event potom nabalovať články, vyjadrenia a tak ďalej, všetko na jednom mieste a z toho potom vznikne syntéza.“; „youtube vieme tahat transkripty, na ktore sa spolieham lebo tam sa toho najviac dozvieme“
- Doplnenie (audit 27. 9.): audio podcasty (Apple Podcasts / Spotify RSS) sú samostatná trieda zdrojov, nie iba YouTube; register ich do auditu neuvádzal (grep „Apple Podcasts“, „audio RSS“ = 0). Adam hriechy najčastejšie spúšťa z aplikácie Podcasty (Index, Klik, Dobré ráno, Vizita, JOJ 24 podcast, Aréna s Dibákovou, 30tnik) a viaceré relácie YouTube verziu nemajú: „keď si otvorím jebanú aplikáciu Podcast, a tu na iPhone, tak na mňa vyskočia podcasty všelijakých redakcií, áno. A tam je tak veľa hriechu. […] Normálne ráno od 5 už sú na hraniciach a už sa ti štelujú do telefónu“ (korpus n=8343 / p-86615d676cd1f387d1875bcc, 24. 9. 2026); odkazy podcasts.apple.com s „toto je dalsi hriech ktory musime zahrnut“ (n=3431, n=3435, n=3439, n=3460, n=3468, 28.–29. 7. 2026); „na spracovávanie transkriptu ak nepôjde youtube transkript“ (n=7032, 5. 9. 2026). Funkcia: konektor `podcast-rss` (feed URL relácie z Apple Podcasts / Spotify) → stiahnutie audia → lokálny whisper.cpp → `prepisy` so `zdroj_prepisu='whisper'`; `zdroje` typ `podcast` so zoznamom relácií SK redakcií; odkaz z aplikácie Podcasty je platný spúšťač pre A6 a E10; latencia prepisu do 2 h ako pri YouTube (medzery L4). Stav: návrh; zoznam relácií = Adam (§6.29).

**B15 · Vlastná Minúta po minúte: live wire, ktorý nemešká**
- Čo robí: živý prúd udalostí na Hriechu z Netopierových dát, zložený z RSS a ďalších zdrojov s malým oneskorením, ktorý „vyskočí“ pri udalosti; LLM až na konci na syntézu („15 zdrojov hovorí jednu tému“) alebo na výber hlavného titulku. Konkurencia Minúte po minúte Denníka N; jej model (zverejňuje zdroje) sa dá prevziať a doplniť o štátne dáta, ktoré žiadna Minúta nemá.
- Spúšťač: každý nový záznam, ktorý prejde B9.
- Vstup: B1, B2, B13, B14, D.
- Výstup: modul „minúta po minúte“ (F1); 20–30 správ denne (B16).
- Meranie: latencia od publikácie zdroja po zobrazenie; benchmark je štátny monitoring (Mediaboard: doplnenie do 15 minút, ranný súhrn do 5:30); „nemôže meškať pol hodinu“.
- Stav: rozhodnuté (30. 8., 3. 9., 27. 9.); nepostavené; rozpor s B21 (lokálny beh).
- Zdroj: korpus p-916e64f6df221611f7677fd4, 3. 9. 2026; p-5c4e1f99e96ee2bc4b071b06, 27. 9. 2026; n=6467, 30. 8. 2026; n=948, 21. 5. 2026; `netopier/STATUS.md:14`; Linear XDR-230.
- Citát: „My ideme robiť konkurenciu minútu po minúte a celému denníku N, áno. Pretože hypotéza je taká, že ja som kurátor informácií.“; „minute nemoze meskat pol hodinu, stratziula by vyznam“; „máš proste jednu web stránku, ktorá sa pravidelne aktualizuje live a keď sa objaví nejaká nová správa, tak sa tu tam práve ukáže. Fico niečo povie, nahra nové video, zistí sa nejakým spôsobom, čo v tom videu odznelo.“

**B16 · Denný verejný kontrakt: 20–30 event reportov + aspoň 3 kurátorské články**
- Čo robí: primárna verejná jednotka je krátka, zdrojovo ohraničená správa o udalosti (čo sa stalo, kto konal, prečo je v pozornosti, ktoré nezávislé zdroje, čo je neisté); 20–30 denne prevažne automaticky, plus aspoň 3 články, ktoré Adam vyberie a ktoré majú research pack a ľudskú ratifikáciu.
- Spúšťač: denný cyklus B15 + Adamov výber v B17.
- Vstup: udalosti, research packy.
- Výstup: wire (F1) a články (F3).
- Meranie: 20–30 / 3 denne po viacdňovej skúške (zdrojový objem, relevancia, kvalita dôkazov, náklady, Adamova záťaž); do overenia je to produktový cieľ, nie prevádzkové tvrdenie.
- Stav: rozhodnuté (3. 9. 2026), nebeží.
- Zdroj: korpus n=6752 / p-6c5570eadd531b56045ae86c, 3. 9. 2026 18:46 („ano a cielom netopiera verejneho bude mat za den aspon 3 kuratoske clanky a 20 az 30 feed sprav“); `ARCH-N/docs/PRODUCT_HYPOTHESIS.md:19–27`.
- Citát: „20–30 concise feed reports distributed through the day; at least 3 curated articles selected from the strongest events and supported by a bounded research pack and human ratification.“

**B17 · Kurátorská fronta NOW / WATCH / RESEARCH / LOW**
- Čo robí: súkromný inbox udalostí po strojovej triáži; karta s titulkom, čo je nové, kto konal, čas, počet nezávislých rodín, sila dôkazu, rozpory, momentum, dôvod zaradenia; akcie comment / save / dismiss / escalate / merge-split; každá akcia má štruktúrovaný dôvod, z ktorého agent navrhne diff redakčnej politiky (E3) a Adam ho ratifikuje.
- Spúšťač: udalosť po B9/B10; Adamov denný prechod.
- Vstup: karty udalostí.
- Výstup: dispozícia; výber troch článkov dňa; feedback do politiky.
- Meranie: Adam prejde frontu za ≤ 30 min denne; opakované opravy sa menia na diff politiky, nie na rant.
- Stav: návrh (AI syntéza 3. 9.; Adam: „ja som kurátor informácií“).
- Zdroj: `ARCH-H/…/AI_NEWSROOM_AND_NATURAL20_TEARDOWN_2026-09-03.md:199–212`; korpus n=6750 / p-916e64f6df221611f7677fd4, 3. 9. 2026.
- Citát: „Klik na `research` nesmie spúšťať neobmedzeného agenta; vytvorí trvalý case s otázkou, plánom zdrojov, rozpočtom, stavom a výsledným evidence packom.“

**B18 · Notifikácie a beh bez dohľadu**
- Čo robí: systém beží sám, spracuje newsletter alebo udalosť, založí záznam, urobí syntézu na web a Adama upozorní; Adam číta iba upozornenia a syntézy.
- Spúšťač: udalosť nad prahom; denný súhrn.
- Vstup: B9 výstup.
- Výstup: notifikácia s odkazom na kartu; primárny kanál je Telegram (vlastný bot na telefóne, always-on, bez OpenClaw) pre prahy `priorita` a `ohlasenie`, macOS notifikácia a mail sekundárne; Telegram bot je iba výstup, nikdy zdroj dát ani úložisko (P44). Register do auditu uvádzal iba „push, mail“ (korekcia: Adam sa o dôležitej udalosti mimo Macu inak nedozvie).
- Meranie: Adam sa o dôležitej udalosti dozvie zo systému skôr než z médií.
- Stav: návrh.
- Zdroj: korpus n=1251, 5. 6. 2026; n=1254, 6. 6. 2026; n=7985 / p-10bf7a496b51f86fec9f88a3, 24. 9. 2026 (day; ts 25. 9. 01:05 UTC); Telegram: n=1255, 7. 6. 2026; n=1034, 26. 5. 2026; n=6585, 1. 9. 2026; n=7794, 5. 2. 2026.
- Citát: „dennik n vidal newsletter ty si tho precitas spracujes, zalozis a spravis nejaku syntezu a ta synteza pojde na web a to si ja potom pozrem a na to dostane upozornennie“; „potrebujem aby vznikol Hriech/netopier ktory bude z amna monitorovat vsetko a ja na to potom budem ivba reagovat a robit z toho dalsie puibliakcie“
- Doplnenie (audit 27. 9.): Telegram ako kanál podľa Adama: „postavime to cez agenta... neksor to bude openclaw na telegrame. tvojou ulohou bude ma informovat“ (korpus n=1255, 7. 6. 2026); „chcem n8n iba na to aby som z webov mohol na formular posielat notifikacie na telegram“ (n=1034, 26. 5. 2026); „openclaw potrebujem na telegrame ako handy jarvisa“ (n=6585, 1. 9. 2026); „teraz mi to zije na telegrame a budem to pouzivat ako capture system“ (n=7794, 5. 2. 2026). C9 uvádza Telegram iba ako dezinfo zdroj; tu je to výstupný kanál.

**B19 · Agent „čo sa deje“ nad databázou; web ako preview databázy**
- Čo robí: primárne rozhranie je rozhovor s agentom nad archívom a udalosťami („čo sa dialo dnes, včera? čo povedal Fico? čo povedal Denník N?“); web zobrazuje výstupy; RAG nad vlastnými dátami (vzor Juro chatbot nad NRSR).
- Spúšťač: Adamova otázka.
- Vstup: B4, B6, D, korpusy.
- Výstup: odpoveď so zdrojmi; uložená syntéza.
- Meranie: odpoveď na „čo povedal X“ s presným citátom a časom bez ručného hľadania.
- Stav: návrh.
- Zdroj: korpus n=1251, 5. 6. 2026; n=6747, 3. 9. 2026; n=2522, 1. 7. 2026.
- Citát: „ja chcem docielit to ze teba sa ja mozem spytat ze co sa deje vo svete a ty sa bdues moct pozriet do databaz a vystupov atd a az potom sa budeme pozerat na web“; „web je len preview databazy aj kkeby s ktortou komunikujem ja“

**B20 · Cloudový zber bez Macu (Cloudflare Workers, Queues, D1, R2)**
- Čo robí: cron (*/30 RSS, denne 05:20 UTC štát) → fronta → konzument (1 správa = 1 úloha) → konektor (rss, worldmonitor, crz, ted, kataster, statistika) → R2 surový payload, D1 records / runs / source_state; retry 3×, DLQ; verzia záznamu = (source, external_id, content_hash). 27 testov vo workerd; lokálne 14 299 záznamov.
- Spúšťač: cron.
- Vstup: konektory.
- Výstup: archív v cloude, ktorý nezávisí od Macu.
- Meranie: zber beží bez Macu aspoň 48 h (XDR-228 „Hotové keď“).
- Stav: postavené lokálne, nenasadené; ADR-008 je návrh, ktorý sa potvrdí nasadením; čaká na Workers Paid (5 $/mes.) a Adamov pokyn (XDR-258, do 3. 10.).
- Zdroj: `netopier/docs/DECISIONS.md:52–72` ADR-008; `netopier/zber/README.md:16–33`; `netopier/STATUS.md:9–13, 21–24`; Linear XDR-228, XDR-258.
- Citát: „Netopier must collect without the Mac. The collection layer moves to a Cloudflare Worker (`zber/`)…“

**B21 · Lokálny beh na Macu, web iba zobrazuje, bez GitHub Actions**
- Čo robí: zber a spracovanie bežia lokálne na Macu, ktorý beží stále; web na hriech.xvadur zobrazuje výsledky; platené cloudové služby až po zabehnutí.
- Spúšťač: LaunchAgent alebo lokálny démon.
- Vstup: to isté ako B20.
- Výstup: lokálny archív + statický alebo API výstup pre web.
- Meranie: beh bez výpadku; latencia Minúty (B15) pri lokálnom behu.
- Stav: rozhodnuté 27. 9. 2026; v rozpore s B20 a s tým, že runtime v Dockeri nebeží od 7. 9. a Python 3.12 na Macu chýba (pozri §6).
- Zdroj: korpus p-5c4e1f99e96ee2bc4b071b06, 27. 9. 2026; n=8549.
- Citát: „ja to chcem zatial lokalne, mac mi aj tak bezi stale, a virtualne sluzby budeme aktivovat az ked to bude zabehnute.“; „github actions tiez nepotrebujeme ne? sak lebo onsa to bude diat cele lokalne, ak to nebude moc velke, a na webe sa to bude zobrazovat“
- Doplnenie (audit 27. 9.): archív dokladá plánovanú dvojstrojovú topológiu, ktorú register neuvádzal: Mac mini ako riadiaci stroj a MacBook ako worker cez SSH (Docker, Hermes, OpenClaw), úloha NET-001 blokovaná 11. 9.: „status: blocked... proof: na MacBooku beží docker compose up a curl /health vracia 200; z mini cez SSH readback... blocked_on: MacBook príprava (Docker/OpenClaw/Hermes handoff nedokončený, 11. 9.)“ (`ARCH-N/work/001-runtime-na-macbooku.md:1–17`); Adam 11. 9.: „na macbooku pojde docker, na dockeri bude hermes aj opeclaw... ten je spojeny cez ssh“ (korpus n=7660). Predchádzajúci systém úloh: `work/` front („Front projektu. Jeden súbor = jedno issue. Stavy: draft → ready → running → review → blocked → done... Odvodené sekcie STATUS.md regeneruje node ~/xvadur_system/bin/xv status“, `ARCH-N/work/README.md`) – predchodca Linearu (G10). Rozhodnutie Adama: ktorý stroj beží plánovač (mini „beží stále“ vs MacBook worker) a či je NET-001 zahodené alebo otvorené (§4).

**B22 · Wire karta s presným citátom a rolou zdroja**
- Čo robí: krátka strojová správa z primárnych zdrojov s poľami hovoriaci, presný citát, rola zdroja (source / analysis / support), čas, odkaz, entity; filtre podľa osoby, firmy, produktu (vzor HuggingNews).
- Spúšťač: nová udalosť s prepisom alebo primárnym dokumentom.
- Vstup: B13, B14, D.
- Výstup: karta vo wire (F1) a odpoveď pre B19.
- Meranie: odpoveď na „čo povedal Fico?“ bez článku, s časom a odkazom.
- Stav: návrh.
- Zdroj: `ARCH-H/…/AI_NEWSROOM_AND_NATURAL20_TEARDOWN_2026-09-03.md:96–100`.
- Citát: „To je veľmi blízko želanému „čo povedal Fico?“: samostatne ukladať hovoriaceho, exact quote, rolu zdroja … čas a link.“

**B23 · Ranný brief bez balastu**
- Čo robí: krátky operatívny prehľad pre Adama (v0: 61 riadkov namiesto 398), bez telemetrie; plain-language vysvetlenie po technickej práci; automatizácie o 06:00 (NRSR brief pred návštevou parlamentu).
- Spúšťač: denne ráno.
- Vstup: B9/B17 výstup za 24 h.
- Výstup: brief.
- Meranie: Adam číta iba to, čo potrebuje („vela veci ktore nepotrebujem citat“).
- Stav: zahodené s v0 (jún 2026); ako potreba trvá (B18).
- Zdroj: rollout 2026-06-19T12-53-54-8lz0:11–40; M1:499 (19. 6. 2026).
- Citát: „vela veci ktore nepotrebujem citat“

### C. Meranie médií

**C1 · Aktivita redakcií a ich tém (rebríček redakcií)**
- Čo robí: meria, kto vydal koľko článkov, aké médium, o čom (témy, kľúčové slová), kedy, s akou návštevnosťou (kde sa dá); ranking aktivity redakcií, Instagramu, Google z ľahko dostupných dát na jednom mieste; matica udalosť × redakcia (kto pokryl, kedy, s akými zdrojmi, kto priniesol vlastné zistenie a kto prevzal).
- Spúšťač: priebežne nad archívom (B4); denný a týždenný agregát.
- Vstup: RSS metadáta, autor, rubrika, čas, plné texty (B3), udalosti (B6).
- Výstup: rebríček redakcií (F6), časové rady per médium a téma.
- Meranie: každá redakcia z mapy (D11) má denný riadok; metriky uložené ako časový rad s as_of_date.
- Stav: návrh (pôvodná predstava 29. 5.; výslovne 25. 9. a 27. 9.; modul „rebríček redakcií“ v XDR-230).
- Zdroj: korpus n=7766, 29. 5. 2026; n=8048, 25. 9. 2026; p-d66c017da8cc08e3a5755593, 27. 9. 2026; `ARCH-N/docs/DISCOVERY.md:80–89`.
- Citát: „ja by som chcel vedeit kto vydal kolko clankov, jake medium, kto mal jaku navstevnost pokial sa da zistit, chcel by osm vediet jaky maju clanky sentiment, analyzu klucovych slov“; „budeme robit ranking aktiviti redakcii instagramu google proste odkial sa daju lahko cerpat data odtial ich budeme agregovat na jedno miesto“

**C2 · Aktivita a preferencie autorov**
- Čo robí: pri každom autorovi sleduje počet a frekvenciu článkov, témy, slovník, opakované zdroje a expertov, kladené otázky; preferencie autora na článok; väzba na roly v mape redakcií (D11).
- Spúšťač: nový článok s autorom; mesačný profil.
- Vstup: B1/B3, D11.
- Výstup: profil autora s časovým radom; vstup pre C6 a T14 (expert cirkuluje).
- Meranie: profil pre každého autora nad prahom N článkov; iba verejné profesijné údaje (P46, P47: juniorov nemenovať).
- Stav: návrh.
- Zdroj: korpus p-d66c017da8cc08e3a5755593, 27. 9. 2026; D2:92–93 (Melcerová).
- Citát: „potrebujem poznat aktivitu redakci aj tem redakcii aj aktivitu autorov a preferencie autorov na clanok“

**C3 · Sentiment**
- Čo robí: meria sentiment článkov a pokrytia aktérov v čase (napr. Korčok vs Fico v tom istom médiu); sentiment je pomocný signál, nie dôkaz zaujatosti (P4, P10).
- Spúšťač: každý nový text.
- Vstup: plné texty, entity.
- Výstup: sentiment per článok, aktér, médium; graf v čase.
- Meranie: kalibrácia na slovenčinu; kontrola proti ručne kódovanej vzorke.
- Stav: návrh.
- Zdroj: korpus p-d66c017da8cc08e3a5755593, 27. 9. 2026; n=7766, 29. 5. 2026; n=4392, 4. 8. 2026.
- Citát: „budeme merat sentiment, vatu, zbytocnostiu a neprestonsoti a budeme skladat worldview“; „uvidis na grafe ze korcoka riesilo akdze medium vacsinou pozitivny sentiment, pri ficovy negativny“

**C4 · Vata, zbytočnosť a výplň (meraná umiestnením, nie počtom)**
- Čo robí: meria výplňový text a rečové výplne tam, kde mal byť mechanizmus, definícia, zdroj alebo číslo; zbytočnosť vzhľadom na závažnosť diania; koktanie a „neviem / uvidíme / podľa mňa“ sa počítajú ako dôkaz iba v kombinácii s autoritatívnym záverom. Predchodca: „trepomer“ (graf hlúpostí za deň).
- Spúšťač: prepis alebo článok v korpuse; audit epizódy.
- Vstup: prepisy (D14), texty.
- Výstup: tabuľka výplňových slov s pozíciou (Klik 404: „akože“ 187×, „ale“ 216×, „uvidíme“ 8×), flag `form_noise_on_authority_claim`.
- Meranie: nikdy počet slov sám; význam je v umiestnení; definícia metriky zatiaľ chýba (§6).
- Stav: návrh ako priebežné meranie; postavené ako ručný audit (Klik).
- Zdroj: korpus p-d66c017da8cc08e3a5755593, 27. 9. 2026; n=4391 / p-d8881ceb72706efe9a0d9ff4, 4. 8. 2026 (pôvodne nesprávne n=4392); n=5611, 1. 9. 2026; `MK/36 Klik 404 - audit celej epizody.md:226–252`; `MK/10 Dia brief.md:117–130`.
- Citát: „ja chcem merat zbytocnost.. z ohladom na zavaznosti ktore sa deju“; „Koktanie alebo neistota sama osebe nie je dokaz. Dokazom sa stava vtedy, ked speaker nevie ukotvit zakladny zdroj alebo pojem segmentu, ale napriek tomu odovzda silny verejny ramec.“

**C5 · Nepresnosti: titulok vs telo, čísla bez zdroja, kauzálne overclaimy**
- Čo robí: kóduje headline/body fit (tight / partial / distorted), rám titulku (conflict / alarm / moral judgment), čísla bez zdroja, metric layer blur, kauzálne overclaimy z platnej metriky, chýbajúcu prenosovú cestu; automatický error audit s flagmi (number_no_named_source, strong_claim_no_named_source, poor_prep_admission…) a ručná fronta.
- Spúšťač: každý článok v sledovaných témach; zmrazená vzorka pre publikačné tvrdenia.
- Vstup: titulok, perex, telo, citovaní experti.
- Výstup: kódované riadky; agregát per médium a autor; flagy pre manual review.
- Meranie: 59 článkov DN: 33/59 conflict/alarm/moral, 44/11/4 fit; pred populačným tvrdením blind double-code (P21).
- Stav: postavené (ručne, jednorazovo); priebežné meranie návrh.
- Zdroj: `R/CURRENT_EVIDENCE.md:98–114`; `MK/12 Klik 389-393 - manual review queue.md:6–57`; `MK/19 Facebook feed case.md:4–25`; `MK/27:236–248`.
- Citát: „Tieto flagy same o sebe nedokazuju chybu. Dokaz vznikne az po rucnom case file“

**C6 · Rámovanie a slovník (Ground News maximalizovaný; koalícia vs opozícia)**
- Čo robí: ku každej agregovanej správe analýza rámovania naprieč médiami: kto priniesol vlastné zistenie, kto prevzal rovnaké pôvodné tvrdenie, kde si zdroje odporujú, aké slová a kauzálne vysvetlenia sa opakovali; lexika, prívlastky, hodnotiace označenia, hedging; asymetria slovníka pri koalícii a opozícii (Aktuality „jedna chyba“ vs Blaha „doxxing“); Ground News robí ľavica/pravica, XVADUR to maximalizuje, ale „nebude to politicky orientované“. Úmysel sa z rozdielu neodvodzuje (P2).
- Spúšťač: udalosť s ≥ 2 pokrytiami; zmrazený korpus (100 článkov DN) pre test preferencie.
- Vstup: B6, C7, plné texty.
- Výstup: porovnanie pokrytia na karte udalosti (F2), coverage distribution, blindspot; modul „analýza spravodajstva“.
- Meranie: hypotéza preferencie (Šimečka vs Fico) sa testuje na korpuse s protipríkladmi, nie z dojmu.
- Stav: návrh.
- Zdroj: korpus n=8048, 25. 9. 2026; p-c790f9e285b3a8223ab26ea6, 6. 9. 2026; n=8252, 21. 9. 2026; `ARCH-N/docs/DISCOVERY.md:80–89, 127–133`; `hriech/STACK.md:32`; rollout 2026-09-09T00-14-05-9i4p:69.
- Citát: „ked sa pozres na ground news co ej globalny trhák tak oni spravili taku vec ze ku kazdym spravam ktore agreguju robia anylyzu lavice vs pravice - my tento koncept maximalizujeme podla mojej obsesie“; „tie skurvené, subtilné ... označenia a doplnenia a neurčitosti a debilný slovník pri koalícii, iný slovník pri opozícii. To tam je všetko ... A netopier to proste potrebuje mať, kurva, potrebuje to sledovať“

**C7 · Porovnanie pôvodného záznamu s mediálnym podaním (pasáž článku ↔ úsek záznamu)**
- Čo robí: pri každom zistení prechod z konkrétnej pasáže článku na úsek pôvodného záznamu (prepis, čas); sleduje výber citácií, hodnotiace označenia, pripisovanie zodpovednosti, mieru istoty, ospravedlňujúci kontext, podstatné vynechania; rozlišuje autorov text, citát hosťa a žáner; neúplný RSS výňatok nestačí na záver o vynechaní; side-by-side tabuľka zdroj × podcast.
- Spúšťač: udalosť s prepisom (B13/B14) a pokrytím (B1).
- Vstup: prepis, články.
- Výstup: zistenia s lokátorom v oboch smeroch; flagy source_preserved_but_weight_reduced, authority_appropriation…
- Meranie: každé zistenie klikateľné na sekundu záznamu; jedna relácia end-to-end, potom korpus 100 článkov.
- Stav: návrh (metóda postavená v case files Klik).
- Zdroj: `ARCH-N/docs/DISCOVERY.md:129–133`; `MK/11 Thompson case.md:71–93`; `MK/12:139–141`.
- Citát: „Každé zistenie musí umožniť prechod z konkrétnej pasáže článku na príslušný úsek pôvodného záznamu. […] Neúplný RSS výňatok nestačí na záver, že článok niečo vynechal.“; „Ked sa zda, ze ide o `source_inversion`, najprv skontroluj, ci source nie je nahodou zachyteny spravne.“
- Doplnenie (audit 27. 9.): variant `porovnania.typ='original_preklad'` (T28): originál EN ↔ SK preklad, posuny modality, agensa a kvantifikátorov; spúšťač: záznam s poľom `preklad_z` alebo zhoda titulku s cudzojazyčným zdrojom (korpus n=5584, 25. 8. 2026).

**C8 · Jazykový audit (slizký jazyk, agentless konštrukcie, tón)**
- Čo robí: hľadá hedging („často“, „odborníci varujú“, „nastáva otázka“, „môžu spôsobiť“), nominalizáciu bez páchateľa („vstupuje nám AI“), slovo „aj“, nadradenosť, výsmech, „skrytú drzosť“; anakolút, kontamináciu väzieb, neurčité podmety, pasíva, „mnohí vnímajú“; asymetriu medzi jazykom, ktorý redakcia žiada od iných, a vlastným („dezinfo scéna“, „užitoční idioti“).
- Spúšťač: text alebo prepis v korpuse.
- Vstup: články, prepisy.
- Výstup: tabuľka výrok / jazykový jav / dôsledok; vstup pre C6 a F3.
- Meranie: každý nález s presnou vetou a lokátorom; osobné nálepky („adolescent“) nahradené merateľnými javmi.
- Stav: návrh ako priebežné; postavené v case files (Lodová, Index, Klik).
- Zdroj: korpus n=4079, 2. 8. 2026; n=2296, 23. 6. 2026; n=5948, 22. 8. 2026; D2:189, 193 ([LIS] L1598–1618, L2260–2276); `R/CASE_AKTUALITY_FREDERIKA_LODOVA_2026-08.md:146–175, 291–302`.
- Citát: „prechadzaj vety proste kde je citit nadradenost resp uzgrn resp vysmech resp taka skryta drzost“; „presne vedia rozpoznať necitlivosť, stereotyp, zlý jazyk a nedostatok vzdelávania na druhej strane, ale ani na sekundu ich nenapadne obrátiť rovnaký pohľad na seba“

**C9 · Monitoring dezinfo webov a Telegramu**
- Čo robí: sleduje top dezinfo weby (konspiratori.sk ako zoznam), Telegram kanály s vysokým dosahom (Infovojna, Daniš ~165 tis. odberateľov), ruské kanály; porovnáva s mainstreamom rovnakou metodikou; vlastné štatistiky oboch strán bez nutnosti menovať médiá.
- Spúšťač: rovnaký cron ako B1; Telegram cez verejné kanály.
- Vstup: RSS/HTML dezinfo webov, Telegram verejné kanály.
- Výstup: samostatný prúd v archíve so štítkom; porovnávacie metriky (C1–C6) pre obe strany.
- Meranie: pokrytie 5 najväčších dezinfo webov a hlavných Telegram kanálov; rovnaké kódovanie ako mainstream.
- Stav: návrh (opakovane 21. 5., 25. 5., 3.–4. 8., 13. 8., 27. 9.).
- Zdroj: korpus p-5ac6a7bf60c351a3fc1e25e2, 21. 5. 2026; n=1000, 25. 5. 2026; n=4315, 3. 8. 2026; n=4357, 4. 8. 2026; n=5084, 13. 8. 2026; n=4349, 3. 8. 2026; p-d66c017da8cc08e3a5755593, 27. 9. 2026.
- Citát: „potrebujem emonitoring dezinfo webu“; „bolo by dobre zistit aktivitu na telegrame aj dezinfoweboch, lebo tu je ako som hovoril polotvoreny konflikt ale ta lepsia strana nema prehald o tenj druhej strane“; „teraz si zoberme 5 najvacsich dezinfowebov, najdi si to na konspirstori.sk a konspiatoroch tiez zahrn do zdrojov“
- Doplnenie (audit 27. 9.): meranie „odberatelia a zásah kanálov v čase“ (register meral iba pokrytie tém): Adam má vlastný baseline dezinfo Telegramu z januára 2026 a chce merať rast: „zvyšných je z Telegramu. Môžem si to ísť pozrieť, lebo všetkých som ich začal doberať v januári, asi 15-20, a mali desatisíce followerov. A teraz budú mať omnoho viacej. A na Telegrame sú neverejné dáta a tie... mainstreamové sa tam nikdy nepozrú“ (korpus n=3437, 28. 7. 2026); YouTube Data API a Social Blade: „porovnat social blade resp celkovu aktivitu zaciatok publikacii a videnia na youtube vieme pracovat s youtube datami cez api?“ (n=6097, 28. 8. 2026); „na socialblade sa da prepocitat kolko mu zaraba youtube a aky ma reach“ (n=2408, 25. 6. 2026). Polia `aktor_ucty.odberatelia`, `merane_at`; zdroj `youtube-data-api` (zadarmo, kvóta) v D19; Social Blade sekundárny; baseline január 2026 z Adamových poznámok.

**C10 · Sociálne siete sledovaných ľudí (FB/IG 2× denne) a profily politikov s backlinkami**
- Čo robí: politik alebo inštitúcia má priradené overené účty a kanály (Facebook, Instagram, YouTube, web, NR SR, mediálne citácie); dvakrát denne prieskum sledovaných ľudí; rovnaké vystúpenie na viacerých platformách sa prepojí; každý poslanec má profil, ku ktorému sa dopĺňajú výroky, hlasovania, články a linky; systém rozlišuje „nebol nový príspevok“ od „zdroj sa nepodarilo skontrolovať“. Kandidátne cesty: NewsWhip, Apify, Meta Content Library (neotestované).
- Spúšťač: 2× denne; nový príspevok.
- Vstup: účty aktérov (150 poslancov, ministri Takáč, Blaha, Huliak, Fico, influenceri).
- Výstup: profil aktéra s časovou osou; vstup pre A2, B13, C19.
- Meranie: každý sledovaný aktér má denne aspoň dva kontrolné body so stavom; žiadne zdanlivé ticho.
- Stav: návrh (od 21. 5.; Facebook „nevieme“ 16. 6. a 23. 6.; požiadavka 27. 9.).
- Zdroj: korpus n=947, n=948, 21. 5. 2026; n=1285, n=1303, 16. 6. 2026; n=2065, 21. 6. 2026; n=4391, 4. 8. 2026; p-d66c017da8cc08e3a5755593, 27. 9. 2026; `ARCH-N/docs/DISCOVERY.md:60–78`; `core/04_myslenie/svetonazor.md:125`.
- Citát: „Potom tu máš nejakých ministrov ako je Takáč, alebo Blaha, alebo Huliak. Tých treba sledovať na ich sociálnych sieťach.“; „mozeem robit dva krat za den prieksum sledovanych ludi na facebooku ci instagrame“; „kazdy poslanec by mohol mat profil ktory by sa doplnal.. proste ciganikova niekde nieco povie a aspon link, alebo nejaky abstrakt z odkazom na vyroky alebo clanky alebočo, by sa napislo k jej profilu“

**C11 · Meta Ad Library a politická reklama**
- Čo robí: priebežne sleduje politickú reklamu na Facebooku a Instagrame (EÚ núti Metu zverejňovať), QR kódy a billboardy ako dátovú stopu kampaní; nie raz pred voľbami, ale stále.
- Spúšťač: denný dotaz na Ad Library pre sledované strany a osoby.
- Vstup: Meta Ad Library API, DSA transparentnosť.
- Výstup: časový rad výdavkov, cieľovania a kreatív per aktér (tabuľka `reklamy` s poľami z EÚ transparentnosti: library_id, odhadovaný dosah EÚ, vek, inzerent/platiteľ, + `utm_*`); vrstva pre F6/F8; pravidlo „dosahy reklám sa nesčítavajú na unikátne publikum značky“.
- Meranie: každý sledovaný politický subjekt má týždenný súhrn reklamy.
- Stav: postavené ako ručný protokol bez API tokenu (11. 9. 2026, XDR-195; register do auditu uvádzal „návrh“): „deterministická vzorka prvých 12 kariet... 20 viditeľných reklamných záznamov COR-X; pri dvoch reklamách rozbalené EU údaje“ (Library ID, odhadovaný EÚ dosah 73 839 / 27 422, vek 18–65+, inzerent/platiteľ Corx s.r.o), dekódovanie UTM (`PACK2_PROSPECTING_CBO_2026-06-11`, `broad_22-55_SK`) s hranicou „Parametre nie sú prístup do reklamného účtu“, Obchodný vestník 231/2024, IČO 56570210, SHA-256 stiahnutých materiálov; priebežný API zber je návrh.
- Zdroj: korpus n=6537 / p-766a76d6da3a1a048c8a5f88, 1. 9. 2026; `core/03_znalosti/domeny.md:88`; `ARCH-N/docs/research/PATRIKSYSTEMS_WEB_SOURCES_2026-09-11.md:3–7, 37–50, 56–63, 101, 142–148`; `ARCH-N/docs/README.md:9` (XDR-195).
- Citát: „To isté, máš Meta Ads kokot library a ja neviem čo. Európska únia donúti Facebooky, aby zverejňovali reklamy a oni akože nevedia priniesť nejaký monitoring?“

**C12 · Ledger predikcií, návratov a opráv médií (C0 / C11)**
- Čo robí: systematicky zaznamenáva predikcie, varovania a expertné tvrdenia médií a to, či sa k nim redakcia vráti, opraví ich alebo aktualizuje; actor map, policy map, error ledger; tvrdý test: zmraziť 50 z 250 URL série „Trumpov svet“ v 10 časových stratách a merať explicitné predikcie, návraty, opravy, kontinuitu aktérov, podiel osobného rámca oproti mechanizmu.
- Spúšťač: článok s predikciou alebo varovaním; kvartálny návrat.
- Vstup: B4, C5 kódovanie.
- Výstup: verejná pamäť predikcií a opráv (F18) pre sledované médiá aj pre Hriech.
- Meranie: podiel predikcií, ku ktorým sa médium vrátilo; Hriech má vlastný correction log.
- Stav: návrh (C0 označený 30. 7. za najväčšiu tézu; test nevykonaný).
- Zdroj: `R/MAINSTREAM_MEDIA_INDICTMENT_MAP_2026-07-30.md:259–281, 447–460, 584–597`; `R/SLOVAK_SUBSTACK_FIELD…:239–244`; D2:224.
- Citát: „médium prináša predikcie, warnings a expert claims, ale neskôr sa k nim systematicky nevracia“; „Netopier môže vytvoriť opačnú výhodu: vracať sa k starým tvrdeniam a viesť prípady v čase.“

**C13 · Test expozície vs porozumenia („Adamova mama“)**
- Čo robí: pre tému definuje 6–8 otázok, na ktoré má pozorný neodborný čitateľ vedieť odpovedať po mesiacoch pokrytia (čo je platforma, ako zarába, prečo je strategická, čo incident dokazuje, či je deal potvrdený); mapa pokrytia po médiách (typ expozície, čo vysvetľuje, čo vynecháva); kontrolný obraz podľa primárneho zdroja.
- Spúšťač: opakovane pokrytá téma bez explaineru; Adamova otázka „čo vie moja mama o X“.
- Vstup: B4 archív, primárna dokumentácia.
- Výstup: tabuľka vrstiev porozumenia s verdiktom; podklad pre F15.
- Meranie: každá vrstva (definícia, história, ekosystém, použitie, biznis model, stratégia, incident) má verdikt „pokryté / chýba“.
- Stav: postavené (Hugging Face, 29. 8. 2026, jednorazovo).
- Zdroj: `R/HUGGING_FACE_SLOVAK_MEDIA_EXPOSURE_TEST_2026-08-29.md:5–28, 95–122`; korpus n=6288, n=6289, 29. 8. 2026; `core/04_myslenie/svetonazor.md:224`.
- Citát: „chod sa pozriet ze co vie napr moja mama o huggingface, kebyze cita vsetky media“; „To je rozdiel medzi expozíciou a porozumením. Názov sa v médiách objavil. Súvislý mentálny model nevznikol.“
- Doplnenie (audit 27. 9.): komparatívny test „to isté AI téma v SK vs PL/CZ médiu“ ako kontrolný korpus (C20): „polsko je velmi vysoko umiestnene a je tam rozvinuta startup scena, tak jak o ai infomuju v polsku?“ (korpus n=4454, 6. 8. 2026); „Mohli si zobrať príklad z Poľska“ (n=7520, 10. 9. 2026). Vyžaduje regionálne zdroje (D19 kategória `regionalne`, §6.30).

**C14 · Test C14: audit vlastných ankiet a prieskumov redakcií**
- Čo robí: pri každej vlastnej ankete média zachytí presnú náborovú formuláciu, celý dotazník v pôvodnom poradí, povinnosť a vetvenie, response options, definíciu populácie, samovýber a distribúciu, denominátor pri každom percente, titulok, perex a prvý graf, čo bolo merané a čo inferované, alternatívne vysvetlenia, metodickú poznámku, preberanie inými médiami (12 položiek).
- Spúšťač: médium spustí anketu alebo publikuje jej výsledky.
- Vstup: dotazník (screenshoty, URL), výsledný článok.
- Výstup: audit s verdiktom „meranie ako rámcovanie: áno/nie“ a bezpečným claimom.
- Meranie: zneužitie výsledkov sa netvrdí bez publikovaného článku; každý bod má lokátor.
- Stav: návrh (metóda hotová, prípad SurveyHero DN 15. 8. 2026 zachytený).
- Zdroj: `R/Denník N a slovenské informovanie o AI - pracovný sourcebook k podaniu.md:316–385, 771–786`.
- Citát: „Redakčný predpoklad sa premení na dotazníkovú kategóriu, kategória na percento a percento sa môže vrátiť publiku ako fakt potvrdzujúci pôvodný predpoklad.“

**C15 · Kódovanie moderátorského loopu**
- Čo robí: pri debate alebo rozhovore kóduje každý dôležitý claim ako otázka → odpoveď → odchýlka / non-answer → follow-up → vyriešenie; hodnotí, či moderátor rozpozná non-answer, zachytí zámenu faktu, normy a hodnotenia, položí konkrétny follow-up, nenechá hosťa preskočiť k agende a uzavrie sporné; nehodnotí súkromnú vedomosť, iba on-air fluency.
- Spúšťač: prepis relácie (B14).
- Vstup: prepis s hovoriacimi.
- Výstup: ledger loopov per relácia a moderátor; kontrolné prípady (Galek 03:23 ako vyvrátenie paušálu).
- Meranie: každý dôležitý claim má riadok; absolútne tvrdenia („nikdy nenadväzuje“) sa netvrdia bez korpusu.
- Stav: návrh (metóda), postavené jednorazovo (Deň ústavy, Index).
- Zdroj: `MK/27 Audit citatelskeho modelu po anotaciach.md:86–113, 191–200`; `ARCH-N/docs/research/INDEX_QUESTIONS_AUDIT_2026-09-10.md`; `INDEX_SOURCE_VALIDATION_2026-09-10.md:18–26`.
- Citát: „`otázka → odpoveď → odchýlka/non-answer → follow-up → vyriešenie`“; „Ak sa tento loop opakovane nespustí, možno povedať, že relácia a moderátor v danom korpuse nepreukázali viac než schopnosť vyvolať reakciu.“

**C16 · Speaker asymetria (kto otvára, rámuje, validuje, uzatvára)**
- Čo robí: v dvojhlasných reláciách meria, kto otvorí tému a nastaví rámec, kto rámec spochybní, kto iba dodá čísla a normalizuje ho, koľkokrát sa z „neviem / uvidíme“ prejde do veľkého záveru; hypotéza „formálne dvojhlas, funkčne explainer jedného s redakčným sekundantom“; speaker attribution podľa timestamp mapy, `uncertain` segmenty nejdú do verejnej obžaloby.
- Spúšťač: prepis s rozdelením hovoriacich.
- Vstup: D14 prepisy, heuristický speaker split.
- Výstup: čísla (Klik: 51/30 framing, 100/96 validation) ako indikátor; ručné meranie nevykonané.
- Meranie: každý dôležitý výrok s timestampom a manuálnou kontrolou hovoriaceho.
- Stav: postavené (indikátor), ručné meranie návrh.
- Zdroj: `MK/02 Klik dossier.md:30–31, 63–68`; `MK/06 bezzubý mainstream.md:38–53, 70–78`; `MK/12:63`.
- Citát: „Nejde iba o počet slov. Treba merať, kto otvára tému, kto nastavuje rámec, kto ho uzatvára a kto ho iba legitimizuje.“

**C17 · Evidence schema: segment review table, taxonómia M01–M12, forenzné flagy**
- Čo robí: každý segment dostane riadok (case_id, source_type, source_ref, timestamp_or_line, speaker_or_author, topic, claim_text, claim_type fact/interpretation/prediction/joke/accusation/analogy, media_issue_code, why_it_matters, missing_context, adam_commentary, analysis_note, evidence_status, public_use); 12 kódov M01 operational non-use … M12 scope compression; ~45 jemných flagov (true_facts_false_takeaway, source_as_mood_license, mechanism_named_then_abandoned, metric_layer_blur, causal_overclaim_from_valid_metric, first_pass_false_positive, inference_marked_as_inference…); rodiny tvrdení A1–M1 z docketu.
- Spúšťač: každý rozbor (case file, corpus pass).
- Vstup: prepis alebo text.
- Výstup: jsonl / tabuľka; agregát po epizóde a hovoriacom.
- Meranie: ostrý komentár nikdy v tom istom poli ako dôkaz; každý riadok má evidence_status a public_use.
- Stav: postavené (jún 2026, priebežne rozširované).
- Zdroj: `MK/04 Evidence schema.md:4–93`; `R/REACTION_DOCKET_V0_1.md:39–57`.
- Citát: „Táto schéma má zabrániť tomu, aby sa ostrý komentár miešal s dôkazom. Používa sa pre Klik, Líviu/Denník N aj ďalšie mainstream/dezinfo/media cases.“
- Doplnenie (audit 27. 9.): menovité flagy z forenzných case files MK/13–17, ktoré register necitoval a ktoré patria do `data/kodovnik.json` so zdrojom: `scale_analogy_without_accounting` (`MK/14:11`, Starship 15 mld.: „Nie je to lživý výrok. Je to nedisciplinovaná ekonomická skratka“), `mechanism_named_then_abandoned` (`MK/15:18`, Karpathy), `fact_kernel_to_conspiracy_riff` (`MK/16:10`, bludné prúdy), `answered_privacy_question_left_open` (`MK/17:14`, Apple parental controls), `valid_source_transfer`, `scope_compression`, `missing_institutional_mechanism` (`MK/13:4`, Ted Chiang: „druhý ručný case file... funguje ako dôležitý kontrolný príklad“). Kontrolné príklady pre P17: MK/13, MK/14 K390-M04 (Flight 12), MK/17, MK/18. Sedem hodnotiacich osí z MK/22 sú samostatná funkcia C26.

**C18 · Zmrazené vzorky, deterministické kódovanie, denominátor, slepé dvojité kódovanie**
- Čo robí: korpus sa zmrazí vopred (DN-50 = celá prvá strana archívu + 20 z druhej bez vyraďovania; Klik 50 v pevných poloviciach S01–S25 / S26–S50; 250 Trump URL); presné znenie dopytu sa uloží; každý riadok je lead, kým neprejde validáciou; blind double-code s meraním zhody (alfa 0,929) pred populačným tvrdením; atomic-claim počítanie zamietnuté (396 vs 522, 6/10 pod 0,80); register korpusov s `public_text_policy` a `next_gate` (11 korpusov, 334 jednotiek, 717 332 slov).
- Spúšťač: každé tvrdenie o prevalencii; nový korpus.
- Vstup: archív, prepisy.
- Výstup: corpus-register.csv, manifesty, SHA-256 vstupov.
- Meranie: žiadne percento bez menovateľa; karta sa po negatívnom výsledku nevymení.
- Stav: rozhodnuté a postavené (29. 7. 2026).
- Zdroj: `R/CURRENT_EVIDENCE.md:5–31, 52–54, 62–63, 133–152`; `R/corpus-register.csv:1–12`; `MK/43:11–17, 122`; `MK/38:96–135`.
- Citát: „No complete truth verdict exists yet. A seven-row fact-check pilot is not a denominator for an error rate.“; „Pôvodný celý-korpusový formát bol nahradený **deterministicky** dvomi polovicami, aby žiadny diel nevypadol podľa toho, či sa hodí do tézy.“

**C19 · Línia politikov v čase (nie fact-check, ale pointa)**
- Čo robí: sleduje, či vládni predstavitelia naprieč časom držia líniu (Šaková odpovedá vyhýbavo, hovorí to isté ako iní z Hlasu) alebo z nej vychádzajú (Danko); porovnáva výroky jednej osoby v čase a naprieč aktérmi tej istej strany; Demagog.sk (iba fact-checking) je „pod úrovňou Netopiera“.
- Spúšťač: nový prepis alebo výrok v profile aktéra (C10, B13).
- Vstup: výroky s časom, profily.
- Výstup: mapa línie per strana a osoba; odchýlky ako lead.
- Meranie: každý výrok priradený k línii alebo označený ako odchýlka s dôkazom.
- Stav: návrh (21. 6. 2026).
- Zdroj: korpus n=2066 / p-3b2f1a92479a6d5ae9b64136, 21. 6. 2026; n=2878, 30. 6. 2026; `core/07_texty/zasobnik.md:216`.
- Citát: „moj hlavny zamer je, nachytat politikov na ich hlupostiach, nie na fact checkoch, ale na pointe, ze ak denisa sakova, cely podcast odpoveda vyhybavo, rozprava to iste ako niekto iny z hglasu alebo z vlady, ze ci vladny predsatvitelia napriec casom drzi liniu alebo vychadza z linie ako danko“; „demagog je velmi blizko k tomu co chcem ja ale je to zamerane iba na fgactchecking, co je podla mna pod urovnou netopiera“

**C20 · Kontrolný korpus a mechanism density**
- Čo robí: párové porovnania toho istého formátu na rovnakých témach (Klik vs mAIndset / Link / David Tvrdoň): transcript, speaker split, claim ledger, mechanism density, practical action density, form/preparation flags, evidence gap; metriky: claim, evidence, decision rule, komu sa to týka, next action.
- Spúšťač: kritika formátu, ktorá potrebuje protipríklad.
- Vstup: prepisy oboch formátov.
- Výstup: párová tabuľka; verdikt „strata funkcie formátu“ alebo „Adamova podráždenosť“.
- Meranie: každá téza o formáte má kontrolný formát.
- Stav: návrh (blokované na prepisoch: mAIndset bez titulkov, WebUP55 iba hrubý Whisper).
- Zdroj: `MK/07 mAIndset ako kontrolný korpus.md:79–144`; `MK/06:80–89`; `MK/08 WebUP55.md:66–70`.
- Citát: „Pre každú dvojicu: transcript, speaker split, claim ledger, mechanism density, practical action density, form/preparation flags, evidence gap.“
- Doplnenie (audit 27. 9.): AI Daily Brief ako párový kontrolný formát ku Klik a k Martinovi Gregorovi: „Kebyže porovnáš AI Daily Brief a podcast Klik“ (korpus n=7792, 4. 4. 2026); „AI Daily Brief... to je človek, za ktorého sa vydáva Martin Gregor“ (n=3442, 28. 7. 2026); pozri §4 referencie.

**C21 · Korpusový pass P1–P5 (päť oddelených línií)**
- Čo robí: nad zmrazeným korpusom päť samostatných dopytov: P1 vernosť prenosu (férovo / skrátené / fact-check / nenájdené), P2 mechanizmus → zúženie (kontext, agregácia, systémové premostenia), P3 operačná prax a hranice súdu, P4 rámovanie a banalizácia (spotrebiteľská redukcia, cenový filter, výsmech, áno-ale, odklad, hype fatigue, rizikový rámec bez protiváhy), P5 verejná orientácia (postup, kritérium, bezpečný postup, zdrojový smer, hranica neistoty) a test opakovateľnosti (lokálny / periodický / stabilný / neurčitý); každý riadok transcript-only lead s citation chipom a dôkazovou kartou.
- Spúšťač: audit formátu alebo redakcie nad korpusom.
- Vstup: D14 prepisy (NotebookLM snapshot 50 entries / 44 titulov).
- Výstup: 5 dokumentov + syntéza s rozlíšením dovolených tvrdení.
- Meranie: oddeliť doslovnú správnosť od kontextu, praxe, registra a orientácie; opakovateľnosť „neurčité“, kým nie je rovnaké kódovanie a menovateľ.
- Stav: postavené (Klik, 12. 9. 2026); validácia nevykonaná.
- Zdroj: `MK/38–43` (38:96–135; 39:22–61; 40:24–64; 41:20–60; 42:20–62, 240–244; 43:153–159).
- Citát: „**Aktuálna klasifikácia opakovateľnosti: `neurčité`.** Nie `stabilné` ani `periodické`, kým sa nevykoná rovnaký direct-transcript check“

**C22 · Test materiálneho vynechania (čitateľský model)**
- Čo robí: vynechanie je materiálne, ak pri deklarovanom žánri zmení kauzalitu, kontrolovateľnosť, mierku, rozhodnutie, prenos (jednorazový vs všeobecný) alebo agency čitateľa; pri každom prípade štyri testy: výsledný model čitateľa, chýbajúca väzba, materiálnosť, najsilnejšia obrana / falzifikátor. Nie požiadavka „vysvetliť všetko“.
- Spúšťač: článok alebo relácia v audite.
- Vstup: text, kontext udalosti (napr. 60-dňová lehota War Powers Resolution, ústavná sťažnosť).
- Výstup: verdikt materiálnosti s falzifikátorom.
- Meranie: každé tvrdenie o vynechaní prejde štyrmi testami.
- Stav: postavené (4. 9. 2026).
- Zdroj: `MK/27 Audit citatelskeho modelu po anotaciach.md:56–73, 115–212`.
- Citát: „Vynechanie je materiálne, ak pri deklarovanom žánri zmení aspoň jednu z týchto vecí: kauzalita ... kontrolovateľnosť ... mierka ... rozhodnutie ... prenos ... agency“

**C23 · Portfóliový audit servisnej línie (praktický manuál: 5 podmienok)**
- Čo robí: porovnateľný praktický manuál musí spĺňať 5 podmienok (AI ako hlavná téma, čitateľ vie vykonať úlohu, široký používateľ, viacstupňový proces, reprodukovateľný postup); vzorka sa kóduje awareness / decision support / practice path / bez adoption bridge; hľadá sa, či po jednom manuáli vznikla nadväzujúca servisná línia.
- Spúšťač: téza „médium nedáva praktickú cestu“.
- Vstup: archív média za obdobie.
- Výstup: tabuľka s uvedením „single-coder lead“, protipríklady (MediaBrífing 21. 8. 2026).
- Meranie: kritika nie je „nič praktické“, ale „chýba nadväzujúca vrstva od chatbotu k workflow a vlastníctvu výsledku“.
- Stav: postavené (DN, 4. 9. 2026).
- Zdroj: `MK/27:431–563`; `R/Denník N … sourcebook:439–490`.
- Citát: „Z 50-textovej vzorky bolo 37 výstupov kódovaných ako awareness, 9 ako decision support, 3 ako practice paths a 1 bez adoption bridge. Je to single-coder lead, nie publikovateľná prevalencia celého archívu.“

**C24 · Rečový ledger celej epizódy a editoriálna alokácia času**
- Čo robí: namiesto fact-checku každej vety ledger po rečových ťahoch: čas, ťah, čo je vecné, čo sa s ním hneď stane, výsledok pre poslucháča, flag (editorial_allocation_failure, strategic_source_disregard, ecosystem_subtraction, brand_proxy_for_analysis, consumer_example_monoculture, platform_fatalism, deferred_orientation…); tabuľka alokácie času podľa tém (Klik 404: ~37 min Apple cenník, AI biznis „ak ostane čas“); povinné kontroly proti videu s časmi pred publikovaním.
- Spúšťač: flagship epizóda.
- Vstup: prepis, video.
- Výstup: ledger + obžalobná veta + kontrolný vzorok susedných dielov (394–403) pred vyhlásením flagshipu.
- Meranie: audit ide po tom, čo segment sľúbi, čím ho nahradí a s čím nechá poslucháča odísť; izolovaný správny detail nezachraňuje reláciu; paušál sa netvrdí.
- Stav: postavené (Klik 404, 12. 9. 2026).
- Zdroj: `MK/36 Klik 404 - audit celej epizody.md:32–52, 76–93, 190–252, 341–353`; `MK/37 Klik 394-403.md:1–59`.
- Citát: „Audit ide po **každom významovom rečovom ťahu** epizódy — po tom, čo segment sľúbi, čím ho nahradí a s čím nechá poslucháča odísť.“; „K 404 sa preto nesmie písať, že relácia alebo jej hostitelia „nič nepoužívajú“ či „nevedia nič o technológiách“.“

**C25 · Audit kritikov a vlastných textov (kritika kritikov)**
- Čo robí: kritika mainstreamu z nedezinfo priestoru (Lívia Plaváková, Fiki, Adamove vlastné drafty) prechádza tým istým kódovníkom ako médium: nad `kodovanie` s kódmi M09 unsupported mockery, M10 valid criticism but weak evidence, M11 source/citation gap; self-audit Hriechovho draftu tým istým kódovníkom pred publikáciou (E13). Inak sa kritika stáva „lacným komentárom“, ktorý sa vyčíta médiám (P68).
- Spúšťač: nový kritický text alebo video, ktoré chce Adam použiť ako spojenca alebo klipovať; každý Hriechov draft pred G1.
- Vstup: prepis alebo text kritika; Hriechov draft.
- Výstup: riadky `kodovanie` so schémou `kritik`; verdikt „použiteľné / iba s doplneným dôkazom / nepoužiť“; kritika kritikov v A6 (R026).
- Meranie: žiadny cudzí kritický text sa necituje ako opora bez auditu; každý Hriechov text má self-audit M09–M11.
- Stav: postavené jednorazovo (MK/03, jún 2026); ako pravidlo návrh (register do auditu MK/03 necitoval: grep „Lívia“, „M09“, „M10“ = 0).
- Zdroj: `MK/03 Lívia Plaváková a Denník N case.md:20, 44–47`; korpus n=2255 / p-4e7bd8889e3d2115e5e1e241, 22. 6. 2026; n=8347 / p-d513b128fbe81d946ea83713, 24. 9. 2026.
- Citát: „ak sa dobrá kritika zakončí nepodloženým výsmechom, stratí presnosť a začne vyzerať ako presne ten typ lacného komentára, ktorý kritizujeme na médiách“

**C26 · Audit postoja k technologickej revolúcii (sedem osí, clustre A1–A10)**
- Čo robí: samostatný pass vedľa P1–P5 (C21) nad korpusom relácie: sedem hodnotiacich osí `revolution_frame`, `operational_fluency`, `audience_activation`, `risk_balance`, `economic_mechanism`, `source_discipline`, `institutional_role`; tabuľka clusterov A1–A10 s verejnou silou; kontrolné clustre A8 a A9 musia ostať v texte ako brzda proti prepáleniu; mechanizmy M1–M8 (E6) sa previažu s clustrami A1–A10.
- Spúšťač: uzavretý korpus relácie (Klik); nová relácia o AI.
- Vstup: D14 prepisy, C21 pass.
- Výstup: tabuľka osí a clusterov; vstup pre E6.
- Meranie: každý cluster má verejnú silu a kontrolný protiklad; bez A8/A9 sa text nepublikuje.
- Stav: postavené jednorazovo (MK/22, Klik); ako priebežný pass návrh (register do auditu MK/22 necitoval: grep „operational_fluency“, „audience_activation“ = 0).
- Zdroj: `MK/22 Klik AI revolution audit - segment selection.md:46–54, 271–277`.
- Citát: „A8 a A9 musia zostať v texte ako brzda proti prepáleniu... Bez týchto kontrol by obžaloba vyzerala ako selektívny hnev“

### D. Registre a OSINT: stroj, ktorý číta štát

**D1 · Centrálny register zmlúv (CRZ)**
- Čo robí: denne sťahuje export CRZ (zmluvy zverejnené alebo zmenené v deň: strany, IČO, sumy, prílohy), dobieha 14 dní; nová verzia záznamu pri zmene obsahu; surový payload do R2, normalizované záznamy do D1. Zakladajúci prípad: zmluvy Úradu vlády s Mediaboardom nájdené za 58 minút (draft v3:15).
- Spúšťač: cron denne 05:20 UTC.
- Vstup: CRZ export.
- Výstup: 3 026 záznamov lokálne (26. 9.); vstup pre D7–D9, F6 (vrstva mapy), F3.
- Meranie: každá zmluva sledovaného subjektu do 24 h v archíve s hashom; nesúlady (detail 0,00 € vs PDF 48 073,32 €) zachytené ako rozpor, nie prepísané.
- Stav: postavené (nenasadené v cloude).
- Zdroj: `netopier/zber/README.md:23`; `netopier/STATUS.md:10`; Linear XDR-229 (Done); korpus p-766a76d6da3a1a048c8a5f88 a p-80e2683ef8b06d80ebbc947c, 1. 9. 2026; `core/07_texty/drafty/03-fico…v3.md:69`.
- Citát: „Ale jak je to do piče možné, že všetci tí analytici plačú, jak nemáme dáta, nemáme dáta, nikto nevie, čo sa deje v štáte, ale iba z centrálneho registra zmlúv sa vie dozvedieť, čo ten úrad robí.“; „v CRZ som nasiel ze urad vladya si objenal za 50 000 costum apku na monitoring vsetkych slvoewnky medii zo zameranim na fica, to moze byt nas tiket jak keby, referencia“

**D2 · Verejné obstarávania (TED, nadlimitné)**
- Čo robí: denne číta TED Search API v3 pre obstarávateľov zo SR: výzvy, výsledky, víťazi, hodnoty, CPV. Podlimitné zákazky (vestník ÚVO) nemajú otvorené API a nezbierajú sa.
- Spúšťač: cron denne.
- Vstup: TED API.
- Výstup: 205 záznamov lokálne; vstup pre D8, D9.
- Meranie: každé nadlimitné obstarávanie SR v archíve do 24 h.
- Stav: postavené (nenasadené); podlimitné otvorené (§6).
- Zdroj: `netopier/zber/README.md:24`; `netopier/STATUS.md:31`; `MK/24:29–36`.
- Citát: „Obstarávania: podlimitné zákazky (vestník ÚVO) nemajú otvorené API; TED pokrýva iba nadlimitné“

**D3 · Kataster: sledované oblasti ako trvalý senzor**
- Čo robí: denne číta INSPIRE WFS ÚGKK: parcely registra C v sledovaných bboxoch (`data/kataster-oblasti.json`: Úrad vlády a Námestie slobody; Hrad a NR SR), verzia, výmera, geometria; zmena parcely = nová verzia. Vlastníci (LV) nie sú otvorené dáta. Ktoré oblasti sledovať, určí Adam.
- Spúšťač: cron denne.
- Vstup: WFS.
- Výstup: 533 záznamov lokálne; diff parciel; vstup pre F6 mapa s vrstvami.
- Meranie: zmena v sledovanej oblasti zachytená do 24 h; iba v zákonnom a eticky obhájiteľnom rozsahu (P54); test nevyhnutnosti pri publikovaní (P48).
- Stav: postavené (pilot 2 oblasti).
- Zdroj: `netopier/zber/README.md:25`; `netopier/zber/data/kataster-oblasti.json`; `netopier/STATUS.md:32`; `MK/24:9–13, 36`; `core/07_texty/drafty/03-fico…v3.md:17–19`.
- Citát: „Občas si zo záľuby kontrolujem kataster nehnuteľností. […] Je to aj zvláštne priznanie pracovnej metódy: reportér jednej z najväčších slovenských redakcií ručne kontroluje niekoľko vybraných mien a čaká, či mu to vyjde.“

**D4 · Štatistický úrad (DATAcube)**
- Čo robí: denne číta katalóg ~680 datasetov ŠÚ SR s dátumom aktualizácie a celé sledované datasety pri zmene (`data/statistika-datasety.json`); zachytáva aj zmenu metodiky.
- Spúšťač: cron denne.
- Vstup: DATAcube API.
- Výstup: 684 záznamov lokálne; časové rady pre F7 štátny dashboard a pre overovanie tvrdení (B13).
- Meranie: každá zmena sledovaného datasetu zachytená; metodika verzovaná.
- Stav: postavené (nenasadené).
- Zdroj: `netopier/zber/README.md:26`; `netopier/STATUS.md:10`; `ARCH-N/docs/DISCOVERY.md:57, 85`.
- Citát: „Čo sa zmenilo v relevantných štatistikách a zmenila sa aj ich metodika?“

**D5 · Ďalšie prúdy štátu: RPVS, ORSR / RÚZ, justícia, NBS, NCZI, MV SR, ÚVO**
- Čo robí: plánované rozšírenie „stroja, ktorý číta štát“: Register partnerov verejného sektora, obchodný register a Register účtovných závierok, verejné dáta rezortu spravodlivosti, NBS, NCZI, ministerstvo vnútra a ďalšie verejné API, „ktoré nikto bežne nepozná“; stav prístupu sa eviduje ako kandidát → dokumentácia overená → vzorka získaná → pravidelný zber overený.
- Spúšťač: discovery per zdroj; potom cron.
- Vstup: API a exporty registrov.
- Výstup: nové konektory v zber/; register zdrojov so stavom prístupu.
- Meranie: každý zdroj má stav prístupu, licenciu a technický kontrakt (dnes neoverené).
- Stav: návrh (rozhodnuté ako smer 1. 9. a 22.–23. 9.).
- Zdroj: `MK/24 Kyseľ Blaha a stroj ktorý číta štát.md:25–36`; korpus n=6473 / p-47cfc3e048955d8416384d8d, 31. 8. 2026 20:09; `ARCH-N/docs/DISCOVERY.md:15–47`; `ARCH-H/…/STATE_READING_EDITORIAL_BRIEF_2026-09-03.md:44–56`.
- Citát: „my mozeme mat neico co ziadna minuta nema nbs, nczi, statisticky urad ministerstvo vnutra atd... vela z tych veci ma verejne api ktore nikto nepozna bezne“; „Netopier má byť aj stroj, ktorý číta štát.“
- Doplnenie (audit 27. 9.): eurofondy a rozpočet chýbali ako pomenované prúdy, hoci Adam ich 1. 9. postavil vedľa hlasovaní: „Jak sa míňajú eurofondy, jak sa míňajú peniaze z rozpočtu, jak sa hlasuje, kto čo hovorí. Všetko by si mohol vedieť, ale ty nie... Proste z redakcií sa stali podcastové domy.“ (korpus n=6514 / p-985db574f0f05266af8834a8, 1. 9. 2026) → ITMS2014+ / ITMS21+ (čerpanie eurofondov, open data) a rozpocet.sk / Štátna pokladnica ako prúdy pre F7 („koľko štát dnes minul a za čo“); rozhodnutia Ústavného súdu SR ako otvorený dataset (precedens ÚS chatbot, T7, 1. 7. 2026).

**D6 · Skener Národnej rady (hlasovania, parlamentná tlač, výbory, rozprava)**
- Čo robí: po zverejnení záznamu zo schôdze sa deň skrejpuje a urobia sa z toho dáta: program, body, hlasovania, kluby, výbory, rozprava jednotlivcov, parlamentná tlač (ČPT); krátky report z každej schôdze; ústavný súd „skôr než zajtra“. V júni 2026 plán Supabase NRSR knowledge graph a backfill roka 2026.
- Spúšťač: nová schôdza, nová tlač, nové hlasovanie.
- Vstup: nrsr.sk verejné dáta.
- Výstup: hlasovania v profile poslanca (C10), report zo schôdze, položky do A1.
- Meranie: každé hlasovanie v archíve v deň zverejnenia; každý poslanec má hlasovaciu históriu.
- Stav: zahodené s v0 (25. 9. 2026); potreba trvá (prvá funkcia Netopiera 21. 5.).
- Zdroj: korpus n=947 / p-d396a1315c87dd053ba3629a, 21. 5. 2026; n=1221, 30. 5. 2026; n=2066, 21. 6. 2026; prompty 16.–17. 6. 2026 (p-187a41d5, p-00a2c94e); `netopier/STATUS.md:17`.
- Citát: „Chcem mať skener Národnej rady, aby keď je zasadnutie a následne je zverejnené na internete na stránke, tak sa to nejakým spôsobom skrejpuje a urobia sa z toho dáta z toho celého dňa.“; „ak ustavny ud nieco povei tak to chcem vediet skor nez zajtra“

**D7 · Verzovanie štátnych záznamov a diff pri zmene**
- Čo robí: verzia záznamu je (source, external_id, content_hash); nezmenený obsah sa nezapíše, zmena vytvorí novú verziu; počítač porovná nové znenie so starým a zachová pôvodný dokument; súkromný change feed pred alertmi.
- Spúšťač: každý beh konektora.
- Vstup: D1–D5.
- Výstup: revízie s vzťahom nahradenie / oprava / zrušenie; diff.
- Meranie: každá zmena dohľadateľná k predchádzajúcej verzii; žiadny prepis.
- Stav: postavené (verzovanie v zber/), change feed návrh.
- Zdroj: `netopier/docs/ARCHITECTURE.md:50–52`; `netopier/zber/README.md:4–6`; `core/07_texty/drafty/03-fico…v3.md:69`; `ARCH-H/…/STATE_READING…:58–77`.
- Citát: „Počítač zachová pôvodný dokument, porovná nové znenie so starým, spojí organizácie podľa identifikátorov a upozorní človeka na neobvyklú zmenu.“

**D8 · Prepájanie entít (IČO ako kľúč, konzervatívne párovanie osôb)**
- Čo robí: organizácie sa spájajú podľa IČO naprieč CRZ, RPVS, ORSR, RÚZ, ÚVO, TED; mená fyzických osôb bez jednoznačného identifikátora sa párujú konzervatívne; natívne identifikátory oddelené od odvodených väzieb; nejednoznačné zhody ostávajú otvorené; navrhované zlúčenie osôb nikdy automaticky.
- Spúšťač: nový záznam s IČO alebo menom.
- Vstup: D1–D6, D11 (mapa redakcií: vydavateľ, IČO, KÚV).
- Výstup: entity graf (D17), krížové väzby na karte udalosti.
- Meranie: nulové tiché zlúčenie osôb; každá odvodená väzba má neistotu.
- Stav: návrh.
- Zdroj: `MK/24:38`; `ARCH-H/…/STATE_READING_EDITORIAL_BRIEF_2026-09-03.md:60–77`; C3:392 (reťazec CRZ → IČO → RPVS → RÚZ → ÚVO, Codexov).
- Citát: „IČO je silný spojovací kľúč pre organizácie; mená fyzických osôb bez jednoznačného identifikátora vyžadujú konzervatívne párovanie.“

**D9 · Alert na neobvyklú zmenu: evidence contract a ľudská dispozícia**
- Čo robí: každé upozornenie nesie zdrojový systém, kanonickú URL, čas zberu a publikovania, surový payload a hash, verziu parsera, nemenné revízie, identifikačné kľúče, presné pravidlo, ktoré alert vytvorilo, neistotu párovania a cestu ľudského overenia; človek rozhodne routine / monitor / research / merge / split / dismiss / escalate; odvodené väzby a anomálie sú výskumné leady, nikdy verejné obvinenie bez kontroly zdroja, kontextu, práva na odpoveď a Adamovej ratifikácie. Prvý rez: jeden zdroj end-to-end, denné revízie bez alertov, IČO, súkromný change feed, ručné labelovanie, až potom anomálie.
- Spúšťač: diff (D7) nad prahom alebo pravidlom.
- Vstup: D7, D8.
- Výstup: alert do B17; research case (B12).
- Meranie: každý alert má pravidlo a dispozíciu; žiadny alert nejde von ako obvinenie.
- Stav: návrh (rozhodnuté ako princíp 1.–3. 9.).
- Zdroj: `core/07_texty/drafty/03-fico…v3.md:71`; `MK/24:38`; `ARCH-H/…/STATE_READING_EDITORIAL_BRIEF_2026-09-03.md:58–113`; `ARCH-N/docs/PRODUCT_HYPOTHESIS.md:79–82`.
- Citát: „Upozornenie ešte nie je obvinenie. Automatizácia nerozhodne o verejnom záujme, právnej hranici ani význame nálezu. Odstráni však náhodu ako základný detektor.“; „Derived links and anomaly scores are research leads. They cannot overwrite raw records, silently merge people, or become public accusations without source review, contextual reporting, a right-of-reply step where appropriate, and operator ratification.“

**D10 · Medzinárodná kontextová vrstva (World Bank, OECD, IMF, UN SDG, GDELT)**
- Čo robí: k slovenskému tvrdeniu dodá dohľadateľnú časovú radu a porovnanie štátov; spoločný kontrakt záznamu (inštitúcia, dataflow, indikátor, geografia, dimenzie, obdobie, hodnota/jednotka, retrieved_at, verzia vydania, URL, metadáta, hash); GDELT iba ako mediálny signál, nie primárny záznam; prieskumy (NMS, Focus, AKO) a historické štatistiky SK/EÚ/svet.
- Spúšťač: tvrdenie s číslom (B13, C5); modul F7/F8.
- Vstup: API inštitúcií.
- Výstup: kontextové rady na karte udalosti a v dashboardoch.
- Meranie: každé číslo v texte má sériu, metodiku a verziu vydania.
- Stav: návrh (dokumentácia overená 5. 9., žiadna integračná vzorka).
- Zdroj: `ARCH-N/docs/research/GLOBAL_PUBLIC_INSTITUTIONAL_DATA_SOURCES_2026-09-05.md:6–47`; korpus n=7766, 29. 5. 2026.
- Citát: „Tieto zdroje nie sú náhradou za primárny záznam konkrétneho slovenského prípadu… Tvoria medzinárodnú kontextovú vrstvu.“; „chcel by som mat prehglad o prieskumoch ktora sa pravidelne robia“
- Doplnenie (audit 27. 9.): Eurobarometer (séria dôvery v inštitúcie a médiá vedľa DNR) do `statistika_rady.institucia`: „research vatinske encykliky, slovenska demografia a statistiky eurobarometra“ (korpus n=991, 25. 5. 2026); „k tomu moze byt statistiky eurobarometer“ (n=994, 25. 5. 2026). Register do auditu Eurobarometer neuvádzal.

**D11 · Mapa redakcií (dataset): ľudia, vlastníci, financie, vzťahy, zdroje**
- Čo robí: verejný dataset 10 médií (Denník N, SME, Aktuality, Startitup, Refresher, Pravda, HN, Trend, Štandard, Postoj), 558 osôb, 586 rolí, 113 zdrojov; polia outlet / legalEntity / products / units / people / relationships / financialFacts / openQuestions; každý údaj má evidence_state (current_verified / documented_historical / inference / unknown) a zdroj; mapping_state seed / partial / public_roster_mapped / reviewed; vrstvy CRZ, granty, súdy, historické väzby (SME štátna reklama 811 537,71 € za 2025; Štandard a Postoj CRZ 0,00 €); pravidlá čerstvosti: team page mesačne, ORSR/RPVS/RÚZ štvrťročne, metriky ako časový rad s as_of_date.
- Spúšťač: overenie verejného rosteru, vydavateľa, IČO, poslednej účtovnej závierky; mesačný a štvrťročný recheck.
- Vstup: web redakcií, ORSR, RÚZ, RPVS, CRZ.
- Výstup: `hriech/research/newsrooms/`, schema `contracts/media/v1/editorial-organization-map.schema.json`; modul F6 (59 statických stránok, RSS, vyhľadávanie bez diakritiky).
- Meranie: chýbajúci údaj označený ako medzera, nie domnienka; zobrazený dátum = dátum zmapovania; iba verejné profesijné údaje (P46); TA3 a STVR v druhej vlne; Markíza, JOJ, TASR vyradené (dôvod nezdokumentovaný).
- Stav: postavené (live od 3.–5. 9. 2026); Adam 25. 9.: „odflaknuta“, dorobiť.
- Zdroj: `hriech/research/newsrooms/README.md:6–51`; `hriech/STATUS.md:4`; `hriech/PRODUCT.md:27`; korpus n=6619, n=5614, 1. 9. 2026; p-50919ad51ebd66ef47d5d3d7, 3. 9. 2026; n=8048, 25. 9. 2026.
- Citát: „potrebujem zmapovat vsetky velke redakcie na slvoensku, mozeme zacat dennikom n“; „Médium vstúpi do mapy Hriechu po overení aktuálneho verejného rosteru, organizačných jednotiek, vydavateľa a IČO. Finančné fakty sa berú z poslednej dostupnej účtovnej závierky.“; „mapou redakcii ktoru potrebujeme dorobit lebo je odflaknuta“

**D12 · Rozšírenie mapovania na štát a influencerov**
- Čo robí: rovnakou metódou ako D11 zmapovať štát (úrady, ich dodávatelia, monitoring) a influencerov (top 200 SK Instagram, dezinfo aktéri); Adamove objavy a postrehy z Netopiera publikované cez Hriech.
- Spúšťač: po dorobení D11; nový sektor.
- Vstup: D1–D8, C9, C10.
- Výstup: ďalšie mapy (F6).
- Meranie: každý sektor má rovnakú schému a evidence_state.
- Stav: návrh (4. 9. 2026) ako rozšírenie mapy; dataset „SK Instagram Top 200“ postavený jednorazovo 16.–17. 8. 2026 (Heepsy + Apify, 201 profilov, dve poradia) a CSV po zmazaní v0 (25. 9.) vo workspace nenájdené (§6.23); profil influencera Patriksystems postavený ako ručný protokol 11. 9. (C11).
- Zdroj: korpus p-9f640b47f9d52fdf91feb34a, p-eee98607f6b8f4c5a811f4da, 4. 9. 2026; n=6603, 1. 9. 2026 (Batman téma); n=5289, 16. 8. 2026; n=5408, 17. 8. 2026; `xvadur_core/zdroje/syntezy/codex-pamat/rollout_summaries/2026-08-17T18-45-05-MxfW-sk_instagram_active_creator_atlas_firecrawl_web_enrichment.md`; `ARCH-N/docs/research/PATRIKSYSTEMS_WEB_SOURCES_2026-09-11.md`.
- Citát: „cez hriech budem publikovat svoje objavy a postrehy z netopiera, co je osint spravodajsky tool ktory bude mat tiez svoj web, chapes, a mapa redakcii bude sucast hriechov, takto zmapujeme aj stat a influencerov a moje clanky“
- Doplnenie (audit 27. 9.): (a) podfunkcia „SK Instagram Top 200“: „Áno, vieme spraviť dôveryhodný SK Instagram Top 200... 1. Heepsy... 2. Apify... 4. Dve poradia: Top 200 podľa followerov; Top 200 podľa reálnej pozornosti“ (korpus n=5289, 16. 8. 2026); „201 profilov – hlavné CSV (/Users/xvadur_mac/netopier/docs/research/sk-instagram-top-200/candidate-profiles-2026-08-17.csv)... 103 účtov potrebuje manuálnu klasifikáciu a hashtag discovery má recency bias“ (n=5408, 17. 8. 2026); `find` vo workspace na 'instagram-top-200' a 'candidate-profiles' = 0 → obnoviť z rollout summary / Time Machine (§6.23); metóda „dve poradia: followeri vs reálna pozornosť (medián views)“ je meranie pre `aktori` typ influencer a seed `data/aktori-seed.json` má odkazovať na tento dataset. (b) podfunkcia „profil influencera“ (Patriksystems / COR-X, 11. 9. 2026, XDR-195): deterministická vzorka kariet Meta Ad Library, cesta obsah → komentár → DM → newsletter → ponuka, Obchodný vestník ako identita (231/2024, IČO 56570210), SHA-256 stiahnutých materiálov (`ARCH-N/docs/research/PATRIKSYSTEMS_WEB_SOURCES_2026-09-11.md`); prvý influencer profil, pozri C11 a §4.

**D13 · Person resolution a OSINT na mená**
- Čo robí: modul na mená: RPO/ORSR → firmy, Meta Instagram Business Discovery, identity graf, sledovanie followingov a reklám; Netopier ako „slovenský OSINT ako OSS produkt“ a zároveň Adamov spravodajský nástroj.
- Spúšťač: meno v udalosti alebo v Adamovej otázke.
- Vstup: registre, Meta API (token chýba), Ad Library (C11).
- Výstup: profil entity s väzbami a neistotou.
- Meranie: každá väzba má zdroj a neistotu; žiadne súkromné údaje (P46).
- Stav: neurčité (technicky hotové bez live tokenu, august 2026; smer potvrdený 30. 8.).
- Zdroj: korpus n=6453, 30. 8. 2026; C3:556; rollout 2026-08-31T19-59-33-Cemo:43–44, 61–65; n=6722, 2. 9. 2026.
- Citát: „ano, ja chcem aby bol netopier slovensky osint ako oss produkt, a zaroven moj spravidajsky tool na publikaciu atd“
- Doplnenie (audit 27. 9.): metóda „publikum reklamy“ je Adamova opísaná prax, ktorú register neuvádzal: „Ja často robím také, že nájdem nejakú reklamu, tá reklama je niekým lajknutá, idem sa pozrieť na ľudí, ktorí to lajkli, a kuknem sa, že čo sú to za ľudia. Niektorým dám follow a takto si zbieram rôznych ľudí“ (korpus n=8354 / p-b0254caeb9ee0df7fe42f764, 25. 9. 2026). Hranica voči P46/P47: v redakcii iba agregáty (počet, typ účtu), nikdy identita súkromných osôb; profil sa zakladá len verejným aktérom (`aktori.verejny=1`); `zoznam lajkujúcich` je zakázané pole (G5, HLAS).

**D14 · Korpusy prepisov s časom a fulltextom (Fiki, Klik, Gregor, Cangama) a protokol integrity**
- Čo robí: `fiki/fiki.py` + `data/fiki/`: 93 videí (35,4 h), titulky 92, 3 630 odsekov (20–40 s), FTS5 bez diakritiky s odkazom youtu.be?t=; 53 vystúpení mimo kanála z 33 kanálov (titulky má 5, 48 čaká na odblokovanie YouTube); staršie korpusy: Klik 389–393 (233 segmentov + 153 rizikových riadkov), Martin Gregor 100 videí, Edi Cangama 69, 334 jednotiek / 717 332 slov; vrstvená stratégia zdrojov prepisu (NotebookLM, verejné titulky, caption proxy, lokálny Whisper), unikátne video ID, VTT hashe, kontrola NotebookLM vs verejné titulky; automatický prepis je navigačný, nie citačný dôkaz.
- Spúšťač: nové video na sledovanom kanáli; sync (XDR-254).
- Vstup: YouTube titulky (VTT), audio.
- Výstup: SQLite s FTS; vstup pre C4, C7, C16, C21, F10 klipy.
- Meranie: každý citát má čas a odkaz; presný verejný citát iba po audio a speaker checku (G14).
- Stav: postavené (Fiki 25.–26. 9. 2026; ostatné CSV/jsonl v R/); v0 YouTube ingest 16 účtov zahodený.
- Zdroj: `netopier/fiki/fiki.py:2–13`; `netopier/data/fiki/README.md:34–44, 72`; `netopier/STATUS.md:6–7`; `R/CURRENT_EVIDENCE.md:5–48, 166–168`; Linear XDR-254, XDR-265.
- Citát: „Korpus Fikiho (Filip Sulík) s časovými značkami: kanál Fiki Unchained + vystúpenia inde. […] Videá sa nesťahujú, iba titulky (VTT).“; „They are fit for topic discovery and search, but exact public quotation requires checking the source audio/video.“
- Doplnenie (audit 27. 9.): Dia browser drží celý transkript sledovaného videa a je zdrojom prepisov `zdroj_prepisu='dia'` (navigačný, nie citačný, G14) s cestou z corpus stimuli: „ako sme zistili ze dia ma cely transkript toho co sledujem, a nemusim pouzivat ytdnlp“ (korpus n=198, 21. 9. 2026); „pokial som ho pozeral a riesil s dia tak chcem transkript toho videa uchovat“ (n=54, 21. 9. 2026); „Podnety narástli z 41 na 173 (153 stránok, 20 videí s transkriptom)“ (n=85, 22. 9. 2026). Register capture vrstvu obmedzoval na Dia chaty, Codex a Claude. Korpusy Predictive History a John Harris (Obsidian) dostanú `korpus_id` (A7); audio podcasty cez `podcast-rss` (B14 doplnenie).

**D15 · Korpus realitného trhu ako analytická research vrstva**
- Čo robí: dáta o realitnom trhu (18 súborov, 27. 6. – 1. 8. 2026, z práce pre Jakuba) sú v `netopier/data/realitny-trh/` mimo gitu; Netopier ako miesto na systematické zbieranie dát z internetu, nie iba médií; Jakubov newsletter z týchto dát zahodený.
- Spúšťač: nový dataset.
- Vstup: realitné portály, NBS, ŠÚ SR.
- Výstup: analytická vrstva pre články a Remotion infografiky (93 % vlastníctvo bytov).
- Meranie: dataset s dátumom zberu a zdrojom.
- Stav: postavené (23. 9. 2026).
- Zdroj: korpus p-24643e8ea02ee3e2a5bc3086, 23. 9. 2026; `netopier/STATUS.md:8`; korpus p-0a2fa2b4f6da827af017a542, 9. 7. 2026.
- Citát: „data o realitnom trhu chcem do netopiera lebo to je moja analyticka research vrstva“

**D16 · Súdne spory a obžalovaní politici**
- Čo robí: databáza súdnych sporov vysokých politikov a obžalovaných; právne statusy presne (zatknutý ≠ obžalovaný ≠ odsúdený; civilné ≠ trestné) v correction ledgeri.
- Spúšťač: nový záznam v justičných dátach (D5) alebo v médiách.
- Vstup: dáta rezortu spravodlivosti, médiá.
- Výstup: profil aktéra (C10) s právnym statusom; vstup pre F2.
- Meranie: každý právny status s dátumom a zdrojom; žiadne zlievanie.
- Stav: návrh (29. 5. 2026).
- Zdroj: korpus n=7766, 29. 5. 2026; `R/CASE_AKTUALITY_FREDERIKA_LODOVA_2026-08.md:213–222`.
- Citát: „chcel by osm sledovat sudne spory a obzalovanyhc vysokyhc politikov“; „Táto korekcia nemení hodnotenie Kaliňákovej verejnej obhajoby Tateovcov. Mení iba právnu presnosť, s akou sa musia opisovať skutky a konania.“

**D17 · Graf vzájomnosti pre kauzy (entity graf)**
- Čo robí: kauzu vysvetlí ako graf prepojených osôb, firiem, udalostí a dokumentov; interaktívny monitoring kauzy so sentimentom médií (C3) a paralelami z minulosti; kto o kom píše a aké má vzťahy.
- Spúšťač: kauza (B11/B12).
- Vstup: D8 entity, B6 udalosti, D14 korpusy.
- Výstup: graf na karte prípadu (F5); vrstva mapy (F6).
- Meranie: každá hrana má zdroj; väzba nie je dôkaz vplyvu (P3).
- Stav: návrh (29. 5., 30. 5., 4. 8. 2026).
- Zdroj: korpus n=7766, 29. 5. 2026; n=1221, 30. 5. 2026; n=4392, 4. 8. 2026.
- Citát: „chcel by som mat vysvewtlenie kauz, proste na grafe vzajomnosti zobrazit klucove postavy, klucove udalkosti ktore su spolu previazane“; „potrebujeme vedieť sledovať ľudí, politické strany, médiá, konkrétnych ľudí na internete, témy na internete a to všetko potrebujeme vedieť zobrazovať na dashboarde“

**D18 · Krížové kontroly a zdrojové registre prípadu**
- Čo robí: pre každý prípad register zdrojov s ID, publikáciou, spôsobom overenia a limitom (E01–E09 Edison; E01–E21 Denník N); register primárnych zdrojov epizódy (kanonické ID, RSS pubDate vs web vs YouTube so zónou, dĺžka podľa povrchu, stav prepisu; automatický export označený ako „YouTube automatický prepis, zber dátum“, nie „prepis SME“); rešeršný protokol s nulovým výsledkom (zoznam domén, presné dotazy s identifikátormi, kontrola primárnych PDF, tabuľka médium × výsledok × obmedzenie, uzatváracie kroky: otázka redakciám, platené archívy, prepisy vysielania, opakovanie); reťazec CRZ → IČO → RPVS → RÚZ → ÚVO; rozlíšenie motív / požiadavka / prostriedok / výsledok.
- Spúšťač: každý spis pred verejným claimom.
- Vstup: primárne dokumenty, distribučné povrchy.
- Výstup: register v spise; bezpečný claim (F19).
- Meranie: nulový výsledok iba ako „v tejto rešerši sa nenašiel“; nesúlady zachované, nie zjednotené (jeden čas naprieč platformami sa netvrdí).
- Stav: postavené (metóda, september 2026).
- Zdroj: `MK/33 Edison Filmhub - zdrojova chronologia.md:7–66`; `MK/34 Klik 404 - primarne zdroje.md:10–141`; `MK/27 Verejna medialna stopa zmluv…:115–170`; C3:392.
- Citát: „Nulový výsledok je pomerne silný pre tvrdenie „nenašiel som verejne indexovaný článok, ktorý zmluvu explicitne vysvetľuje“. Je slabý pre tvrdenie „žiadne médium o tom nikdy neinformovalo“.“; „**Motív, požiadavka, prostriedok a výsledok sú samostatné veci.**“
- Doplnenie (audit 27. 9.): Wikipedia/Wikidata ako podklad pre `entity` s `evidence_state='documented_historical'`, nikdy ako primárny dôkaz (P31); Adam ich menuje od 25. 5. 2026 ako krížovú kontrolu popri Reuters a TASR (korpus n=994). Otázka pre ÚS chatbot (T7): kto dodal, za koľko, zmluva v CRZ.

**D19 · Katalóg zdrojov s typom, dôveryhodnosťou, orientáciou a objemom**
- Čo robí: každý zdroj má kartu: meno, typ (RSS / článkové spracovanie / API), dôveryhodnosť, orientácia, objem, koľko z neho čerpáme, aktivita farebným číslom; štátne zdroje ako samostatná kategória; v v0 ~100 zdrojov, v v2 `sources/slovak-core.yaml` + World Monitor inventár (tier, propagandistické riziko).
- Spúšťač: pridanie zdroja; denný inventár (B2).
- Vstup: register zdrojov.
- Výstup: `/sources` API; source tab.
- Meranie: každý zdroj v archíve má kartu s prístupovým typom a stavom.
- Stav: zahodené ako source tab v0 (25. 9.); ako register žije v v2.
- Zdroj: korpus n=1217, 29. 5. 2026; n=1231, 30. 5. 2026; `netopier/sources/slovak-core.yaml`; `netopier/zber/README.md:21–22`.
- Citát: „kazda karta bude obsahovat po kliknuti jak keby tabulku ... meno zdroja, typ, doveryhodnost, orientacia, aky amout z daneho zdroja cerpame udajov“; „zroje budu kategorizovane, lebo knim amem rozny pristup. niektore mame iba na rss, ku niektorym amem pristup na urovni clankoveho spracovania“
- Doplnenie (audit 27. 9.): kategória `regionalne` (V4: CZ, PL, HU) s 2–3 kanálmi na krajinu a sledovanie vojny na Ukrajine ako samostatný prúd – register ich neuvádzal (grep „Poľsk“, „Česk“, „Maďar“ = 0; B2 iba World Monitor, D10 iba inštitúcie): „aj tak sa chcem zameriavat halvne na domace spravodajstvo mozno by sm emohli podporit ceske zdroje a pridat polsko madarsko ukrajinu tiez potrebujeme, a to spraviem cez vyvoj bojov na denniku n“ (korpus n=3952, 2. 8. 2026); „nrsr dennik n nyt a este nejake dva tri europske zdroje, mozno ceske, pouzijeme ako main ingest mainstreamu“ (n=1226, 30. 5. 2026); komparatívny audit SK vs PL/CZ (C13). Zdroj `youtube-data-api` pre odberateľov a zásah kanálov (C9); typ `podcast` (B14).

### E. Worldview a zvody: línia, hypotézy, EKG, seizmograf

**E1 · Skladanie worldview: kumulatívny model reality**
- Čo robí: z denného toku (B) a meraní (C, D) vyrába queryable mapu: actor map, policy map, prediction ledger, update a correction ledger, historické paralely; nie N článkov, ale model, do ktorého sa nová udalosť dá zaradiť; „worldview“, ktorého „urgencia sa zvyšuje každý rok“.
- Spúšťač: každá udalosť a meranie; týždenná syntéza.
- Vstup: B6, B11, C12, D, E5.
- Výstup: modelové vrstvy pre F2, F3, F15; odpovede pre B19.
- Meranie: test C0 nad 50 článkami (predikcie, návraty, opravy, kontinuita aktérov); Adam vie z modelu zaradiť novú udalosť bez čítania médií.
- Stav: návrh (jadrová téza od 30. 7.; výslovne 27. 9.).
- Zdroj: korpus p-d66c017da8cc08e3a5755593, 27. 9. 2026; n=6487, 30. 8. 2026; `R/MAINSTREAM_MEDIA_INDICTMENT_MAP_2026-07-30.md:30–36, 259–281`.
- Citát: „budeme merat sentiment, vatu, zbytocnostiu a neprestonsoti a budeme skladat worldview“; „Inštitucionálne médiá môžu vyprodukovať veľké množstvo fakticky použiteľného obsahu, ale nepreklopiť ho do kumulatívneho modelu reality.“
- Doplnenie (audit 27. 9.): tézy zo Zeitgeistu (4 filmy), Michaela Moora, Predictive History a Johna Harrisa sú základ Adamovho worldview (A7, n=8048, n=8101, n=5799), v E1 sa vedú ako `hypothesis` (P28); do verejného textu iba s primárnym zdrojom; rozhodnutie Adama v §6.25.

**E2 · Seizmograf / EKG udalostí: pulz sveta vs o čom sa píše**
- Čo robí: meranie nad Netopierom: pulz sveta (World Monitor, štátne dáta) oproti tomu, o čom píšu slovenské médiá; na webe „rôzna srdcová aktivita podľa prichádzajúcej live agregácie“; zdravotnícka metafora (tachykardia pri cyber outbreaku, arytmia pri hike); vzor seizmograf z openclaw.sk; reporty.
- Spúšťač: live agregácia (B15); denný a týždenný agregát.
- Vstup: B1, B2, D, C1.
- Výstup: modul EKG na Hriechu + štátny dashboard (XDR-232: „modul živý s dátami z posledných 7 dní“).
- Meranie: modul živý s dátami za 7 dní do 27. 11. 2026; rozdiel medzi realitou a mediálnou agendou viditeľný.
- Stav: návrh (rozhodnuté 22. 9., 25. 9., 27. 9.).
- Zdroj: korpus n=8292, 22. 9. 2026 (chatgpt); n=8048, 25. 9. 2026; p-a4db2135e4ff282fa744d6f8 / n=8534, 27. 9. 2026; Linear XDR-232.
- Citát: „Keď si napíšeš, že openclo.tv.sk, tak nájdeš web, že seizmograf a ukazuje ti seizmograf podľa agregácie zdrojov. Čo je úplne geniálna myšlienka, adaptujeme to a adaptujeme to na pulse, keďže som zdravotník. A keď bude, že nejaký cybersecurity outbreak, tak máme tachykardiu.“; „z openclaw.sk prebereme seismograf a spravime z toho ekg na udalsoti“

**E3 · Verzovaná redakčná politika so spätnou väzbou**
- Čo robí: redakčné kritériá (score bands, hard exclusions, pozitívne signály, taxonómia) sú ľudsky čitateľný verzovaný Markdown; Adamov feedback (👍/👎/⭐ + poznámka) sa hromadí, agent navrhne diff, Adam schváli, workery načítajú novú verziu; menej než päť spätných väzieb nestačí na zmenu; oddelenie event_summary / Adam_note / research_brief / published_article (vzor AI·HOT, koncept, nie kód).
- Spúšťač: nahromadený feedback z B17.
- Vstup: dispozície a dôvody.
- Výstup: nová verzia politiky; zmena B9/B10.
- Meranie: každá zmena politiky má diff a ratifikáciu; opakované Adamove opravy sa nevracajú.
- Stav: návrh (3. 9. 2026).
- Zdroj: `ARCH-H/…/AI_NEWSROOM_AND_NATURAL20_TEARDOWN_2026-09-03.md:23–25, 76–82, 120–132`; H1:523 (MK/29).
- Citát: „Toto je prakticky Adamova hypotéza premenená na produktový mechanizmus. Treba prevziať **koncept**, nie kód“

**E4 · Scoring podľa Adamovej politickej pozície (rozpor s tromi skóre)**
- Čo robí: pôvodná predstava (29. 5.): matematický scoring správ a aktérov vypočítaný podľa Adamových politických predpokladov na jeho škále; neskoršia hypotéza (3. 9.) to nahrádza tromi oddelenými skóre (B10), kde Adamov záujem je jedno z troch a nemieša sa s dôkazom.
- Spúšťač: každá udalosť.
- Vstup: Adamova pozícia („som opozícia, ale ani s tou nie som spokojný“).
- Výstup: adam_relevance ako samostatné pole.
- Meranie: skóre nesmie robiť to, čo sa vyčíta Denníku N (jeden slovník pre jednu stranu).
- Stav: návrh; ktorá verzia platí, Adam neratifikoval (§6).
- Zdroj: korpus n=7766, 29. 5. 2026; n=2068, 21. 6. 2026; `ARCH-N/docs/PRODUCT_HYPOTHESIS.md:49–62`.
- Citát: „chcel by som mat nejaky pokrocily matematicky scoring system ktory bude vypocitany podla mojich politickych predpokladov“; „ja nejsom proi vladne orientovany, som opozicia ale ani s tou nejsom spokojny“

**E5 · Register osí mediálnej kritiky C0–C14 a rodiny mechanizmov A1–M1**
- Čo robí: centrálna taxonómia toho, čo médiá robia zle: C0 objem bez akumulácie, C1 fakt bez mechanizmu, C2 osoba namiesto systému, C3 pravdivé fragmenty / chybný destilát, C4 zdroj ako pečiatka, C5 titulok pridáva konflikt, C6 risk model vyrába pasívneho čitateľa, C7 kolaps kategórií, C8 autorita bez fluency, C9 divadlo objektivity, C10 distribučná slepota, C11 chýbajúci correction ledger, C12 vzdelávanie a funnel, C13 frame ako adopčná brzda, C14 meranie ako rámcovanie; každá os má tézu, materiál, hranicu a stav; rodiny A1–M1 (komerčná reputácia → morálna autorita, anekdota → populácia, výsledok → motív, denný objem → žiadny model…) s reakčnou otázkou.
- Spúšťač: nový prípad sa priradí k osi a rodine.
- Vstup: C17, A6.
- Výstup: mapa obžaloby; vstup pre E6 a F3.
- Meranie: každý prípad je exemplár osi; osi sa nerozmnožujú bez novej kategórie.
- Stav: postavené (30. 7. 2026; C14 pridaná 15. 8.).
- Zdroj: `R/MAINSTREAM_MEDIA_INDICTMENT_MAP_2026-07-30.md:257–500`; `R/Denník N … sourcebook:763–769`; `R/REACTION_DOCKET_V0_1.md:39–57`; `MK/01 Analytický rámec.md:6–25`.
- Citát: „C14 — Meranie ako redakčné rámcovanie: médium skonštruuje kategórie podľa vlastného naratívu, vyrobí nimi dáta a následne tieto dáta interpretuje ako poznanie o spoločnosti.“; „| `M1` | daily volume -> no cumulative model | After repeated coverage, where are the actor map, prediction ledger, updates, and corrections? |“

**E6 · Kompresia obžaloby do 6–8 mechanizmov s flagship, podporným a kontrolným prípadom**
- Čo robí: stovky riadkov auditu sa nenesú ako stovky káuz, ale ako mechanizmy (M1 zdroj ako pečiatka, M2 správny mechanizmus a zlý afekt, M3 mechanizmus pomenovaný a opustený, M4 metrika bez zdrojovej disciplíny, M5 forma ako dôkaz slabej prípravy, M6 reálne jadro ako lacný riff, M7 kontrolné prípady, M8 skeptický default); public argument shape v 6 krokoch (nie spor o jednu chybu → nie vymýšľajú, horšie: majú zdroj, ale nevedia z neho urobiť model → najsilnejší príklad → pattern → kontrolné prípady → záver „pravdivé fragmenty bez orientačnej sily“).
- Spúšťač: uzavretý audit korpusu.
- Vstup: C17, C21.
- Výstup: 6–8 mechanizmov + príloha.
- Meranie: každý mechanizmus má flagship, podporný a kontrolný prípad; „Adam nemá niesť 386 problémov“.
- Stav: rozhodnuté (jún–júl 2026).
- Zdroj: `MK/20 Klik audit - kompresia obzaloby.md:20–32, 151–170, 195–231`; `core/02_dielo/hriech.md:84`.
- Citát: „Zaver nie je "Klik klame". Zaver je: Klik vo svojej aktualnej forme casto dodava pravdive fragmenty bez orientacnej sily.“
- Doplnenie (audit 27. 9.): mechanizmy M1–M8 previazať s clustrami A1–A10 z MK/22 (C26); A8 a A9 ako kontrolné ostávajú v texte.

**E7 · Hypotéza, falzifikátor a „čo by ich očistilo“ pri každej téze**
- Čo robí: každá téza, karta, bod obžaloby a spis uvádza, čo by ju vyvrátilo alebo oslabilo a čo na jej posilnenie nestačí; bod obžaloby má výrok (timestamp, link) → skutok → najsilnejšiu obhajobu → čo by obžalovaných očistilo (aké dáta, logy, zdroje) → verdikt so závažnosťou; špekulácia sa nevyhadzuje, premení sa na otázku: aký dokument alebo finančný tok by ju potvrdil; povinná sekcia „Čo prežije po odstránení bullshitu“.
- Spúšťač: každý spis a každý verejný text.
- Vstup: E5, C17.
- Výstup: blok falzifikátorov v spise a v článku (F3).
- Meranie: žiadny verejný text bez falzifikátora a najsilnejšej obhajoby.
- Stav: rozhodnuté (jún–september 2026).
- Zdroj: `MK/01 Analytický rámec.md:27–54`; `MK/23 Money Talk 114.md:49–284`; `MK/27:565–583`; `MK/28:138–147`; `R/DAILY_VOICE_LAUNCH_2026-07-30.md:113–122`.
- Citát: „Špekulatívne vlákno sa nemá vyhadzovať. Má sa označiť a potom premeniť na otázku: ak by to bola pravda, aký dokument, finančný tok alebo verejný záznam by to mal potvrdiť?“; „What is the strongest objection to me? What would change my mind? Am I criticizing one artifact or claiming a population pattern? Do I have the denominator for that pattern?“

**E8 · Timestampovaný záznam Adamových hypotéz (časová priorita)**
- Čo robí: Adamove otázky a hypotézy z rozhovorov (Dia, Codex, Claude) sa ukladajú s UTC časom a context ID; keď médium neskôr publikuje to isté, redakcia vie doložiť, že mechanizmus pomenovala skôr a samostatne (Kyseľ/Blaha: 1. 9. 14:55–15:19 UTC, ~42 h pred Denníkom N).
- Spúšťač: každý rozhovor, ktorý obsahuje tézu.
- Vstup: prompt korpus (corpus.sqlite), Dia ledger.
- Výstup: ledger hypotéz s časom; dôkaz metódy pre F3.
- Meranie: každá téza v článku má dátum prvej formulácie.
- Stav: postavené (corpus.sqlite v adam.xvadur; použité v MK/25).
- Zdroj: `MK/25 Denník N potvrdzuje Kyseľ Blaha redakčný case.md:36–54`; `projekty/adam.xvadur/var/corpus.sqlite`.
- Citát: „Nejde o dôkaz, že Denník N Adamovu analýzu poznal. Ide o dôkaz, že Adam bez redakčného zázemia samostatne a skôr pomenoval jadro problému“

**E9 · Šesťotázkový test a šesť otázok triedenia výhrady**
- Čo robí: pri každom artefakte: 1. čo presne bolo tvrdené, 2. čo je podložené, 3. ktorá kategória, mechanizmus, mierka alebo counterfactual chýba, 4. akú praktickú chybu spôsobí slabší model, 5. aký je silnejší model, 6. aký dôkaz by dokázal, že XVADUR sa mýli; pri Adamovej výhrade triedenie na morálny / epistemický / distribučný / kompetenčný / dôkazový / estetický problém, každý s inou dôkazovou požiadavkou; verejná pozícia nie je „AI je dobrá“ ani „médiá sú hlúpe“, ale oddeľovanie kategórií.
- Spúšťač: A6 záznam; Adamov rant.
- Vstup: artefakt, Adamov komentár.
- Výstup: vyplnené otázky → F13 karta reakcie alebo F3.
- Meranie: každý výstup má odpoveď na otázku 6 (falzifikátor).
- Stav: rozhodnuté (30. 7. 2026) / návrh (triedenie).
- Zdroj: `R/DAILY_VOICE_LAUNCH_2026-07-30.md:39–56`; `MK/05 Corpus reading.md:118–133`.
- Citát: „Slovak public discussion often collapses different AI systems, moral questions, technical mechanisms, and levels of evidence into one emotional category. Xvadur separates them and gives the audience a stronger model.“

**E10 · Skill /hriech: dekompozícia toho, čo Adama vytočilo**
- Čo robí: Adam pošle odkaz alebo opis (`hriech:` hook v Codexe od 3. 8., slash command `/hriech` v Claude od 25. 9.); AI sa prepne do režimu „naštvaný, ale štruktúruje“: nehovorí „spomaľ“ ani „nekonšpiruj“, rozloží vec na fakt, aktéra, mechanizmus a overiteľné tvrdenia, hľadá validáciu po zdrojoch, oznámi, kde chýba, povie, či je z toho téma, a vytvorí artefakt (PR/issue, spis).
- Spúšťač: Adam napíše hriech.
- Vstup: URL, screenshot, výrok.
- Výstup: dekompozícia + artefakt; záznam do A6 alebo B11.
- Meranie: každé vytočenie skončí ako štruktúra so zdrojmi alebo s pomenovanou medzerou; hnev ostáva interne (P55).
- Stav: postavené (`_claude/skills/hriech`).
- Zdroj: korpus p-38439986acd83e0641a53eeb, p-75be38233b5e50637866f7ac, 3. 8. 2026; p-38e837943ae425afcfad7dc2, 25. 9. 2026; `_claude/handoff/2026-09-26-1530.md:7`.
- Citát: „ked sa chcem vytocit tak zapnem hriech a ty sa prepnes do reziomu ze si nasraty somnou ale strukturujes, nehovoris mi ze spomal alebo ze nekonspiruj, ale haldaj validaciu po zdrojoch, to ej jedina validacia ktoru mozem od teba odstat […] noa musi vzniknut artefakt na github“
- Doplnenie (audit 27. 9.): vstupom je aj odkaz z aplikácie Podcasty (podcasts.apple.com) a Instagram „uložené“, nie iba URL článku alebo YouTube (B14, A6 doplnenia); výstup ide do `reakcie` (medzery A6).

**E11 · Conversation ledger: rozhovor → Netopier → podklady → článok**
- Čo robí: Adamove úvahy v Dia alebo v Claude sa cez conversation ledger uložia, spracujú, podložia Netopierom, pripravia sa podklady z rozhovoru a zo zistení, Adam napíše hrubý článok a writing engine (F3) z neho spraví príspevok; rant → fakty → devulgarizácia → publikácia.
- Spúšťač: rozhovor s tézou; Adamov rant.
- Vstup: prompt korpus, E8.
- Výstup: podklady + hrubý draft.
- Meranie: každá konverzácia s tézou má vyústenie (článok, spis alebo zamietnutie s dôvodom).
- Stav: návrh (5. 9. 2026; rant→publikácia rozhodnuté 23. 6.).
- Zdroj: korpus p-d69d0fb387e66ee782e994ed, 5. 9. 2026; n=2289, 23. 6. 2026; n=4125, 3. 8. 2026.
- Citát: „predstav si ze sa rozpravam s Dia browser a cez conversation ledger, atlas sa konverzacia ulozi do systemu, spracuje sa, podlozi sa netopierom, odovzda sa clanok do hriechu, a mne sa pripravia podklady z tej konverzacie a najdenych zisteni, a napisem clanok nahrubo z ktorteho writing engine spravi prispevok“; „Ja napíšem rant, strašne agresívny, ty mi k tomu rantu dáš objektívne informácie, ktoré sa potom spoja s mojím rantom, rant sa devolgarizuje a s priloženými zisteniami sa publikuje.“
- Doplnenie (audit 27. 9.): súčasťou záznamu z Dia je aj transkript sledovaného videa (D14 `zdroj_prepisu='dia'`), nie iba chat; ledger vedie aj IG „uložené“ ako podnet (A6).

**E12 · Trhový dopad mediálneho rámca (sales-call model) ako sledovaná hypotéza**
- Čo robí: dokumentuje, ako mediálny AI rámec vstupuje do dopytu: prednastavený stav zákazníka („to je hype“, „neverím“, „kradne dáta“, „drahé“, „pre veľké firmy“, „počkáme“) a chýbajúca druhá polovica gramotnosti (kde AI funguje, hranice, dáta lokálne/cloud, ROI, pilot, vendor lock-in); vedie sa ako hypotéza C13 s operator proof, nie ako populačný dôkaz (kauzalita neoverená, E10 v ledgeri DN).
- Spúšťač: predajný rozhovor; nový článok s rizikovým rámcom.
- Vstup: Adamova prax, C5, C6.
- Výstup: ledger prípadov; 20 % „operator proof“ v mixe (G16).
- Meranie: každý prípad má dátum a zdroj; tvrdenie „prispieva, nie spôsobuje“.
- Stav: návrh.
- Zdroj: `MK/21 Ondrejov skepticky default.md:41–106`; `R/MAINSTREAM_MEDIA_INDICTMENT_MAP_2026-07-30.md:480–500`; D2:222; rollout 2026-06-21T20-41-04-HDPF:16, 45.
- Citát: „Ked technologicky mainstream pri AI opakovane zdoraznuje riziko, hype, nedoveru a cakanie, ale neukazuje prakticke, ohranicene a dostupne pouzitie, nevytvara len zly nazor. Vytvara trhovu brzdu.“

**E13 · Vlastné omyly ako súčasť worldview (korekcie autora)**
- Čo robí: zoznam Adamových nepresností, ktoré overenie našlo, sa vedie otvorene a je súčasťou príbehu Hriechu: Marec vs Markoš, Filo a print, „25 rád“, definícia Hugging Face, „pokrytectvo“ → „zainteresovaná strana“, „traja ľudia schválili“ → dvaja autori, DNR metodika, Party Shore, Karol 36 h, Klik celosériový verdikt; Adam sám opravil AI, keď z Mediaboardu chcela spraviť kauzu.
- Spúšťač: každé overenie (MK/26, 27a, 37, 43).
- Vstup: Adamove tézy, primárne zdroje.
- Výstup: sekcia „Kde sa Adam mýlil“ v jadre; correction log (F18).
- Meranie: každá vyvrátená téza je v zozname a pri ďalšom texte sa znova vylúči.
- Stav: postavené.
- Zdroj: `core/02_dielo/hriech.md:91–103`; `MK/26:13–36`; `core/10_otvorene.md:57, 98`.
- Citát: „Patrí to k príbehu Hriechu, lebo to ukazuje, že metóda funguje aj proti autorovi.“; „Výsledok je vidieť: dokument 27a opravuje 26, dokument 37 vyvracia paušál, syntéza 43 odmieta rétoriku 36.“
- Doplnenie (audit 27. 9.): self-audit Hriechovho draftu tým istým kódovníkom M09–M11 (unsupported mockery, weak evidence, citation gap) ako pri kritike kritikov (C25, P68); „Kde sa Adam mýlil“ dopĺňa aj čas nálezu Mediaboardu (58 min vs „7 min“ vs „dve minúty“, §6.28).

### F. Výstupy

**F1 · Modul Minúta po minúte (live wire na webe)**
- Čo robí: verejný živý prúd z B15/B16: 20–30 stručných event reportov denne so zdrojmi pri každej položke (čo sa stalo, kto konal, prečo je to v pozornosti, nezávislé zdroje, čo je neisté); JSON/RSS výstup.
- Spúšťač: B15.
- Vstup: B6, B9, B22.
- Výstup: stránka /minuta na Hriechu, RSS.
- Meranie: latencia (B15); zdroj pri každej položke; žiadna položka bez why_surfaced.
- Stav: návrh (XDR-230 modul).
- Zdroj: Linear XDR-230; korpus p-5c4e1f99e96ee2bc4b071b06, 27. 9. 2026; `hriech/STATUS.md:18`.
- Citát: „minuta po minute zverejnuje zdroje coze to mozeme kompletne orebrat a doplnit o svoje“ (30. 8. 2026)

**F2 · Udalosť: karta a detail (prehľad, chronológia, zdroje, otvorené otázky, porovnanie pokrytia)**
- Čo robí: detail udalosti s prehľadom, chronológiou, zdrojmi a otvorenými otázkami; porovnanie pokrytia s pôvodom každej formulácie (C6, C7); minimálny novinársky model udalosti: presné znenie a tón výroku, kontext, kto nahral a kto prvý zverejnil, vzťahy aktérov, rozdiel osobné hodnotenie vs súhlas, reakcie a ich záujmy, aktuálny stav, čo by tézu podporilo alebo vyvrátilo; verejný záujem z virality ≠ proveniencia.
- Spúšťač: udalosť nad prahom B9.
- Vstup: B6, B7, C6, C7, D.
- Výstup: stránka udalosti na Hriechu; `/events` JSON.
- Meranie: každá formulácia má pôvod; skutočné médiá nesmú dostať vymyslené titulky ani pokrytie.
- Stav: postavené ako API (B8); frontend Vydanie archivovaný (25. 9.); nový frontend čaká na redizajn.
- Zdroj: `ARCH-N/DESIGN.md:41–50`; `ARCH-N/PRODUCT.md:27–29`; `ARCH-N/frontend/data.js:5–14`; `R/CASE_AKTUALITY_FREDERIKA_LODOVA_2026-08.md:115–144`.
- Citát: „Detail udalosti: prehľad, chronológia, zdroje a otvorené otázky. / Porovnanie pokrytia s jasným pôvodom každej formulácie.“; „Podcast tieto línie čiastočne pomenoval, ale neposkladal ich do jedného overiteľného modelu.“

**F3 · Články: writing engine a repozitárový redakčný proces**
- Čo robí: dve cesty: (a) Adamov hrubý draft alebo rant → AI upraví na publikáciu; (b) z Netopierovho evidence packu vzniká článok. Proces, nie prompt: article contract (otázka, Adamova pozícia, adresát, civic consequence, rozsah, čo by zmenilo záver) → research map (perspektívy, najsilnejšia obrana, alternatívny mechanizmus, falzifikátor) → evidence pack (URL, autor, čas publikácie a zberu, presný úsek, obmedzenie) → claim map (ID, typ fakt / interpretácia / syntéza / hypotéza / právny status, zdroje pre a proti, sila, gap) → causal outline iba z claim map (pozorovanie → dôkazový predmet → chybný verejný model → mechanizmus → dôsledok → najsilnejšia obhajoba → falsifier) → grounded beat map (requires(x) ⊆ G) → jeden súvislý autorský draft → nezávislé prechody (citation audit, causal/agency audit, kvantifikátory a alibi jazyk, strongest-defense, voice edit) s REQUEST_CHANGES → fresh-reader test → lokálny anti-slop → Adam uzamkne publication_candidate. Validátor chýbajúcich URL, dátumov, claim ID, orphan citácií. Autorský materiál označený adam_direct / adam_edited / ai_generated / quoted_external; hard fail pri vymyslenom citáte, nepodloženom čísle, zámene entity, falošnej kauzalite.
- Spúšťač: A4, B12, E11, A6.
- Vstup: evidence pack, Adamov hlas.
- Výstup: publication_candidate; článok na Hriechu (F17) a Substacku (F11).
- Meranie: každý claim v texte má ID a zdroj; fresh-reader odpovie zhodne s claim mapou; Adam neschvaľuje každý odsek.
- Stav: návrh (4. 9. 2026); archívny CLI `netopier-write` „s hard gates“ spomínaný 22. 9., v aktuálnom STATUS nie je; repozitár hriech nemá `.agents/skills`.
- Zdroj: korpus p-337d31d568e1f5a0c9fb5c50, p-c02b9c66a495335951cc644e, 4. 9. 2026 (n=6870 = „v ramci hriechu by som chcel writing engine“); korpus n=6479 / p-f63bde736e2a513bce784aba, 1. 9. 2026 („yes, a ja by osm prave chcel aby model odpovedi…“); `MK/29:14, 62–76, 176–187`; `MK/30:38–95`; `MK/31:35–48, 69–93`; rollout 2026-09-01T21-48-04-j7Vy:14–35.
- Citát: „v ramci hriechu by som chcel writing engine, ktory bude pisat aj do netopiera“; „yes, a ja by osm prave chcel aby model odpovedi resp model clankov a urcita kvalita boal systeamtizovana a na pisanie clankov musi byt system“; „Codex bude pre Hriech písať najlepšie ako **repozitárový redakčný proces**, nie ako jeden dokonale vyladený prompt.“; „Ak čerstvý agent odpovie inak než claim mapa, draft nevytvoril zamýšľaný model čitateľa.“

**F4 · Týždenný článok s derivátmi (téza, 3 posty, 5 citátov, vizuál, otázka)**
- Čo robí: z každého schváleného článku Netopier odvodí jednu nosnú tézu, tri krátke posty, päť citovateľných viet z Adamovho textu, jeden vizuál mechanizmu alebo časovej osi, jednu otázku, ktorá otvorí ďalší článok; osem tém 31. 8. – 25. 10. (pravdivé fakty, zlý obraz sveta; expert dodá mechanizmus, titulok si ponechá strach; médium vyrobí dáta; Sulík–Barami; Aktuality/Lodová; správa sleduje vetu, moc sa skladá v sérii; čitateľ nie je analytické oddelenie; čo má robiť médium, keď je informácia lacná); mechanika vydania: skutočná otázka → mapa pozornosti → prípad → zdrojová rekonštrukcia → mechanizmus → najsilnejšia obrana → posun → otvorený bod.
- Spúšťač: A4.
- Vstup: F3 článok.
- Výstup: deriváty na sociálne siete a Substack.
- Meranie: deriváty iba keď nesú samostatnú myšlienku (P61).
- Stav: rozhodnuté (30. 8. 2026), nenaplnené.
- Zdroj: `R/NETOPIER_CONTENT_CALENDAR_2026-08-31_10-25.md:49–271`; `R/SLOVAK_SUBSTACK_FIELD…:299–333`.
- Citát: „Z každého schváleného článku Netopier pripraví: jednu krátku nosnú tézu; tri samostatné krátke posty; päť citovateľných viet z Adamovho vlastného textu; jeden vizuál mechanizmu alebo časovej osi; jednu otázku, ktorá otvorí ďalší článok v sérii.“; „Netopier sleduje, čo médiá publikovali. Adam píše o modeli sveta, ktorý z toho vznikol — a o tom, čo v ňom zostalo neviditeľné.“

**F5 · Prípady (cases) na webe a case file formát**
- Čo robí: web má chronologické publikácie, prípady a moduly; prvý prípad je „Kto tvorí slovenské médiá?“ (Redakcie); case file (vzor SMA-AKT-FL-2026-08): frontmatter (case_id, status, sendable_as_is), referenčná formulácia, hierarchia (tematická epizóda → nosný prípad → podporný → kontext), záver pri dostupných dôkazoch, chronológia so stavom, mechanizmus s označením pozorovateľného a inferencie, dôkazové vrstvy, najsilnejšia obrana, falzifikátory, otvorené dôkazy, raw evidence s SHA-256 v ignorovanej vrstve, verejné zdroje, „Adamov komentár“, checklist ďalšieho použitia; forenzný case file (Klik): verdict, source status, segment map, side-by-side, evidence verdict, Adam commentary layer, public-safe formulation, next checks.
- Spúšťač: B12 uzavretý research; Adamovo potvrdenie jadra.
- Vstup: evidence pack, D18.
- Výstup: `src/content/cases/`; stránka /pripady.
- Meranie: prípad je citovateľný stabilným ID; neodíde von s pracovnými inferenciami; checklist (Adam potvrdil jadro, otvorené dôkazy uzavreté, citácie proti audiu).
- Stav: postavené (Redakcie published 3. 9. 2026, approvedBy Adam); ostatné prípady adam-review.
- Zdroj: `hriech/PRODUCT.md:19`; `hriech/src/content/cases/redakcie.md`; `R/CASE_AKTUALITY_FREDERIKA_LODOVA_2026-08.md:1–469`; `MK/02 Klik dossier.md:70–78`.
- Citát: „Chronologické publikácie, prípady a samostatné moduly. Prvý prípad aj modul sú Redakcie. Štát a firmy pribudnú až s dátami.“; „Klik má byť analyzovaný tak, aby aj nepriateľsky naladený čitateľ videl: 1. čo bolo povedané, 2. prečo je to problém, 3. čo tam chýbalo, 4. aký dopad to môže mať na poslucháča, 5. kde má Adam pravdu, 6. kde Adam ešte potrebuje tvrdší dôkaz.“

**F6 · Mapy: mapa redakcií (live), mapa s vrstvami štátnych dát, rebríček redakcií**
- Čo robí: mapa redakcií (D11) ako prvý modul: 59 statických stránok, RSS, vyhľadávanie bez diakritiky, stabilné kotvy /mapy/redakcie/MEDIUM/ludia#osoba-ID, funguje bez JavaScriptu; interaktívna mapa s hromadou vrstiev (štátne dáta, kataster D3, DSS a senior atlas, demografia, vlastné poznámky), do ktorej Adam pridáva informácie, „lebo často potrebujem niečo vysvetliť na mape“; rebríček redakcií z C1. Stack pri redizajne (MapLibre + deck.gl v STACK.md).
- Spúšťač: D11 update; nová vrstva.
- Vstup: D11, D3, D4, C1.
- Výstup: /mapy na Hriechu.
- Meranie: každá vrstva má zdroj a dátum; zobrazený dátum = dátum zmapovania.
- Stav: postavené (mapa redakcií); mapa s vrstvami a rebríček návrh (XDR-230).
- Zdroj: `hriech/STATUS.md:4, 18`; `hriech/docs/design-direction.md:9`; `hriech/STACK.md:27–33`; korpus n=8048, 25. 9. 2026; p-d396a1315c87dd053ba3629a, 21. 5. 2026.
- Citát: „chcem tam map mapu ktora bude mat hromadu vrstiev a ukazovat bude rozne vrstvy a casti statnych dat a tiez aby osm mohol do mapy pridavat dalsie informacie lebo casto potrebujem neico vysvetlit na mape“

**F7 · Dashboardy: štátny dashboard, briefing room, EKG**
- Čo robí: štátny dashboard podľa amerického vzoru a worldometer.com: štátny dlh vs príjem, zadlženie na hlavu, HDP, demografia, nezamestnanosť, koľko štát dnes minul a za čo, príjmy, výdavky, pôžičky; briefing room pre vojny a geopolitiku (Irán, Ukrajina, armáda, EÚ, USA); EKG modul (E2).
- Spúšťač: D4, D10, B2 aktualizácie.
- Vstup: ŠÚ SR, MF SR, NBS, World Monitor.
- Výstup: /stat, /svet na Hriechu; XDR-232.
- Meranie: modul živý s dátami za 7 dní do 27. 11.; každé číslo má sériu a metodiku; laický výklad („Dlh nie je dlh“, 60 % vs 120 %).
- Stav: návrh.
- Zdroj: korpus n=8048, 25. 9. 2026; n=8292, 22. 9. 2026; n=7766, 29. 5. 2026; n=2290, 23. 6. 2026; Linear XDR-232.
- Citát: „hriech bude mat statny dashboard podla konceptu ktory som videl v amerike ze maju proste na dashboard statny dlh vs prijem zadlzenie na hlavu hdp demografia a taketo rozne veci podobne jak to je na worldometer.com“; „chcel by som mat briefing room pre vojnu v irane, ukrjajine, a neviem kde este prebieuhaju boje“
- Doplnenie (audit 27. 9.): briefing room téma Ukrajina s vlastným zdrojom, nie iba DN „vývoj bojov“ (korpus n=3952, 2. 8. 2026; D19 regionálne); štátny dashboard „koľko štát dnes minul a za čo“ napojený na ITMS a rozpocet.sk / Štátnu pokladnicu (D5 doplnenie, n=6514).

**F8 · Kalkulačky: volebná kalkulačka a agregácia prieskumov**
- Čo robí: modul, ktorý agreguje prieskumy (NMS, Focus, AKO…), počíta prepočet mandátov, ukazuje históriu; nadväzuje na rozbor dátovej žurnalistiky Martina Sliza (30 príspevkov, zdroje, operácie, grafy, rytmus; XDR-142 Canceled, XDR-173–177 Backlog).
- Spúšťač: nový prieskum; voľby.
- Vstup: D10 prieskumy, ŠÚ SR volebné dáta.
- Výstup: /volby na Hriechu; Remotion grafy.
- Meranie: každý prieskum so zadávateľom, metodikou a dátumom; „Fico si platí 30 tisíc za prieskum“ doložené zmluvou (D1).
- Stav: návrh.
- Zdroj: korpus n=8048, 25. 9. 2026; `ARCH-N/docs/LINEAR_PLAN.md:23–77`; korpus p-d88b79b4976cbaef466b2495, 10. 9. 2026.
- Citát: „hriech bude zaroven investigativny nastroj to znamena ze tam budu veci ako kalkulacka volebna, agregaci aprieskumov, agregacia verejnych statnych a zahranicnych verejnych dat“

**F9 · Chronos, demografia, Opus Major (interaktívna timeline a trvalé moduly)**
- Čo robí: xvadur_chronos: interaktívna časová os dejín, cez ktorú sa dá prechádzať (chronológia sveta popri chronológii Adama); demografia a starnutie ako trvalý modul (A7); Opus Major (história, náboženstvo, moc) ako verejne sledovaný výskum so stavom v ekosystéme.
- Spúšťač: A7 podklady; redizajn (XDR-230).
- Vstup: Notion Opus Major, ŠÚ SR, Zeitgeber research.
- Výstup: /chronos, /demografia, /opus na Hriechu (vis-timeline v STACK.md).
- Meranie: každý bod na osi má prameň; sporné („Hórus 25. 12.“) sa nepoužije.
- Stav: návrh.
- Zdroj: korpus n=8048, 25. 9. 2026; `core/02_dielo/register.md:59`; `hriech/research/zeitgeber/README.md`; `hriech/STACK.md:27–33`.
- Citát: „hriech bude mat tiez xvadur_chronos, interaktivnu timeline cez ktoru sa bude dat prechadzat dejinami pretoze vnimanie casu a historie je velmi narocne dneska, a na dejepise vacsina ludi spala“; „yes, hriech bude xvadur_spravodajska sluzba“
- Doplnenie (audit 27. 9.): korpusy pre Chronos/Opus Major: transkripty Predictive History a John Harris s `korpus_id` (A7, D14); Zeitgeist ako worldview iba ako `hypothesis` (E1, §6.25).

**F10 · Klipy: okamžitá reakcia z korpusu, kompilácie, montáž**
- Čo robí: politik niečo povie → do hodiny 15 klipov na 15 tém z Adamovho korpusu (700 tis. slov) alebo z klipovaného tvorcu; kompilácie Fikiho výrokov k Adamovým tézam (1 437 výrokov vs 490 téz, 331 zhôd, 32 sérií „roky hovorí to isté“); Remotion šablóny FikiKlip a Kompilacia; článok ako scenár, k slovám sa priradia klipy politikov s časom a zdrojom (montage.json), označené ako montáž; knižnica trendov, hookov, meme sounds; 2 posty denne na 6 účtoch.
- Spúšťač: nové video aktéra (B14); F3 článok; F13 karta.
- Vstup: D14 korpusy, yt-dlp + whisper.cpp.
- Výstup: klipy (projekt obsah/); prvý týždeň 42 klipov Fikiho, Adam nahráva ručne.
- Meranie: čas od videa po klipy (cieľ hodina); štruktúra, engagement, dosah merané publikačným systémom; Fiki je tenant, nie cieľ.
- Stav: postavené (Fiki, 25.–27. 9. 2026); reakčné klipy na Fica návrh; ktorý projekt vlastní reakčné klipy, neurčené (§6).
- Zdroj: korpus p-b0254caeb9ee0df7fe42f764 / n=8354, 25. 9. 2026; n=8408, 26. 9. 2026; `_claude/handoff/2026-09-26-2209.md:15–18`; `_claude/handoff/2026-09-27-0439.md`; `projekty/obsah/STATUS.md`; rollout 2026-08-25T23-27-56-R5P8.
- Citát: „Fico vydá video a do hodiny mám urobených, dajme tomu, 15 rôznych klipov na 15 rôznych tém z môjho korpusu. Fico niečo povie, vznikne na to reelsko alebo memečko.“; „sulik neni targent ale iba tenant, cliping je uzitocny skill“
- Doplnenie (audit 27. 9.): klipovanie cudzích filmov (Zeitgeist, Michael Moore: „tieto veci treba naclipovat z vysokou urgenciou hned ako sa wrkflow overi u fikiho“, korpus n=8048, 25. 9. 2026) je autorské právo – iba citácia v nevyhnutnom rozsahu (G13); experimentálne účty ako senzor publika sú samostatná funkcia F22.

**F11 · Substack a newsletter (osobný hlas, personalizovateľný briefing)**
- Čo robí: Adamove články na Substacku (XVADUR; nová publikácia alebo premenovanie `sestramd`, 3 followeri) ako domov textov popri Hriechu; personalizovateľný newsletter z analýz Netopiera podľa zamerania čitateľa; premium vrstva; štýlová norma (titulok s postojom, prvá scéna „58 minút“, medián odseku ~30 slov, dejové medzititulky, inline zdroje, jeden dôkazový vizuál, poznámka o AI za oddeľovačom, jedna CTA veta).
- Spúšťač: F3 článok.
- Vstup: F3, F4.
- Výstup: Substack post, newsletter.
- Meranie: text pôsobí ako „osobne objavená, zdrojovo podložená slovenská publicistika“; nulový počet publikovaných textov dnes.
- Stav: neurčité (14. 9. Substack ako kanál; 25.–27. 9. Hriech; 7. 7. Adam Substack odmietol, 28. 8. chcel).
- Zdroj: korpus p-63dfa4e621bb6c86a20965f8, 14. 9. 2026; n=7593, 11. 9. 2026; n=3021, 7. 7. 2026; n=6282, 28. 8. 2026; `MK/32 Slovensky Substack stylovy korpus.md:12–16, 137–147, 158–219`; `core/06_firma/firma.md:132, 137, 183`.
- Citát: „netopier bude robit analyzy a teda newsletter si moze clvoek personalizovat podla svojho zamerania“; „Text má po úprave pôsobiť ako **osobne objavená, zdrojovo podložená slovenská publicistika**, nie ako inštitucionálny report, denník ani produktový AI príbeh.“

**F12 · Denný hlas: 30–60 s klip + text + source card (mix 50/30/20)**
- Čo robí: denná slučka podľa Dana Koea s dôkazovou vrstvou: capture (URL, autor, timestamp, doslovný citát po kontrole) → compress na 5 riadkov → attack the self → record (jedna myšlienka, 30–60 s, jeden take) → publish v troch formách (vertikálne video, Threads 5–8 odsekov, source card); po 5–7 klipoch karusel a esej; sedem hotových skriptov (Ľudský pôvod nie je certifikát kvality; Čo je AI? je zlá prvá otázka; Chatbot sa nestane agentom; AI slop je zlyhanie úsudku; Bezpečnosť je model hrozby; Informácia nie je agency; Nežiadam, aby novinári boli developeri).
- Spúšťač: denne, 30–45 min od zdroja po nahrávku.
- Vstup: A6 docket.
- Výstup: 7 klipov, 7 textov, 7 source cards, verejný correction log, karusel, draft eseje, ≥ 3 zachytené námietky publika.
- Meranie: nie views, ale koľko tvrdení prežilo kontrolu zdrojov, sebaútok, nahrávku a publikáciu.
- Stav: zahodené (30. 7. 2026 → nahradené týždenným rytmom 30. 8.; nič nenahraté; skripty v zásobníku).
- Zdroj: `R/DAILY_VOICE_LAUNCH_2026-07-30.md:7–37, 85–141, 302–351`; H1:364–372; `core/07_texty/zasobnik.md:32–33`.
- Citát: „The first objective is not a perfect personal brand. It is seven consecutive days in which one defensible idea leaves the private corpus.“; „Views are not the Week 1 success metric. The metric is whether seven distinct claims survived source checking, self-attack, recording, and publication.“

**F13 · Karta reakcie na jednu minútu**
- Čo robí: pred nahrávkou vyplniť: artefakt, presné tvrdenie, čo je pravda, chýbajúca distinkcia, prečo záleží, silnejší model, najsilnejšia námietka, čo by zmenilo názor, stav dôkazu; hovorená kostra „They say X. X contains a legitimate point: A. But it collapses A and B. That matters because C. The stronger model is D. I would change my mind if E.“
- Spúšťač: A6 záznam vo stave verified/scripted.
- Vstup: A6, E9.
- Výstup: minútový klip alebo post (F10).
- Meranie: každá reakcia má falzifikátor a evidence status pred nahrávkou.
- Stav: návrh (30. 7. 2026).
- Zdroj: `R/REACTION_DOCKET_V0_1.md:420–445`; `core/02_dielo/hriech.md:87`.
- Citát: „They say X. X contains a legitimate point: A. But it collapses A and B. That matters because C. The stronger model is D. I would change my mind if E.“

**F14 · Source card pri každom výstupe**
- Čo robí: ku každému klipu alebo textu karta: typ tvrdenia (analytická téza / empirické tvrdenie o prevalencii), či bol potrebný primárny zdroj, URL, overený citát, evidence status, correction path (čo by tézu vyvrátilo), najsilnejšia námietka a odpoveď.
- Spúšťač: každá publikácia.
- Vstup: F3/F10/F13.
- Výstup: source card pod výstupom.
- Meranie: filozofická téza sa nemieša s populačným tvrdením bez menovateľa.
- Stav: návrh.
- Zdroj: `R/DAILY_VOICE_LAUNCH_2026-07-30.md:138, 190–208`.
- Citát: „Type: Xvadur analytical thesis / Empirical prevalence claim: none / Primary source required: no / Correction path: a counterexample must show that provenance alone is a sufficient quality verdict“

**F15 · Encyklopedický uzol (sedemkrokový explainer)**
- Čo robí: 1. aktuálna udalosť → 2. relevance audit (čo médiá zdôraznili, čo nevysvetlili) → 3. encyklopedický uzol (pojmy) → 4. historická línia → 5. obchodný mechanizmus → 6. strategická interpretácia → 7. aktualizácia (čo sa zmení po potvrdení alebo rozpade); proxy čitateľ „Adamova mama“; text dá model použiteľný aj pri ďalšej udalosti; obsah má byť bingewatchable a storytelling-heavy, lebo „za pol roka si to nikto nepamätá“.
- Spúšťač: C13 negatívny výsledok; téma bez explaineru.
- Vstup: C13, D10, B4.
- Výstup: explainer na Hriechu; vstup pre F4 deriváty.
- Meranie: čitateľ vie po texte odpovedať na 6–8 otázok z C13.
- Stav: návrh (29. 8. 2026).
- Zdroj: `R/HUGGING_FACE_SLOVAK_MEDIA_EXPOSURE_TEST_2026-08-29.md:124–134`; korpus n=6286, 28. 8. 2026.
- Citát: „Taký text neopakuje zahraničné AI správy. Dáva slovenskému čitateľovi model, ktorý mu zostane použiteľný aj pri ďalšom modeli, incidente alebo akvizícii.“; „ono sa to moze raz vysvetlit v clanku, ale za pol roka si to nikto nepamata.. cize musis zmenit koncepciu.. produkovany kontent musi byt bingewatchable, storytelling heavy“
- Doplnenie (audit 27. 9.): seed tém explainerov s dátumom prvej formulácie (E8), ktorý F15 nemal: kybernetická bezpečnosť ako model hrozby (21.–22. 9. 2026: „Rusko robí hybridné hrozby na štáty Európskej únie... a v médiách si nikde nepočul nič o tom, že ako by taký kybernetický útok mal vyzerať. A to som dneska počúval celý čas podcasty o bezpečnosti“, korpus n=8273; „celá cybersecurity je miliardový biznis... navrhnutý tak, aby bol užívateľsky blbuvzdorný. A oni si potom v podcaste povedia Eva Frantová... že ona má obavy z kyberbezpečnosti“, n=8288; „pod mi vysvetlit cyber sec, kedze mi to nevysvetlili v podcastoch“, n=8284; nadväzuje na Cybersecurity sekciu z 13. 8., §4), Hugging Face (29. 8.), GitHub, RAG (T16); T19 („bezpečnosť je model hrozby, nie atmosféra“) má v týchto citátoch ďalší dôkaz.

**F16 · Podanie redakcii (mail, otázky, žiadosť o stanovisko)**
- Čo robí: 25 otázok redakcii (zodpovednosť za metodiku AI, interné pravidlá model / chatbot / agent, kontrola titulkov, záznam predikcií, konkrétny článok, nový prieskum, interné používanie AI, praktická línia); architektúra prvého mailu (identifikovať odosielateľa, opakovaný problém, tri najťažšie prípady, korpus, žiadosť o zodpovedného, ponuka appendixu); ledger E01–E21 pred odoslaním; mail je následné podanie, nie master obsah.
- Spúšťač: hotový sourcebook; pred publikovaním investigatívy (G6).
- Vstup: sourcebook, D18.
- Výstup: odoslaný mail, evidované odpovede (žiadne vymyslené).
- Meranie: „mail má byť nepríjemný tým, že sa z neho nedá uniknúť odpoveďou na tón, jednu vetu alebo jednu drobnú opravu“.
- Stav: neurčité (list Denníku N 19. 8. 2026 odoslaný, bez odpovede; 25 otázok neposlané; sekcie „Adamov komentár“ prázdne).
- Zdroj: `R/Denník N … sourcebook:28–49, 792–889`; `core/07_texty/zasobnik.md:37`; D2:283 ([DN15] L1413).
- Citát: „Nie som ochotný analyzovať všetky články, lebo na to nemám čas. Je toho však tak veľa, že ma to zamestnalo na niekoľko týždňov. Som otrávený z počúvania podcastov a chcem sa k tomu vyjadriť celému.“ (Adam, 15. 8. 2026)

**F17 · Web Hriechu: publikačná vrstva (publikácie, prípady, moduly, RSS, sitemap, search)**
- Čo robí: Astro statický web na Cloudflare Worker hriech-web; kolekcie publications (clanok / postreh / pripad), cases, modules; jedna publikačná politika pre titulku, filtre, RSS, sitemap, search.json; max 12 položiek na stránku; zdroje pri tvrdení cez #zdroj-ID a záverečný zoznam; ružový plastický vizuál (Rubik + Source Sans 3) podľa loga; redizajn na šablóne XVADUR rozhodnutý 25. 9.
- Spúšťač: G1 pokyn publikovať; pnpm qa; deploy.
- Vstup: F3, F5, F6.
- Výstup: hriech.xvadur.com (59 stránok, live od 5. 9. 2026).
- Meranie: build bez draftov a súkromných markerov; funguje bez JavaScriptu; frontend bajt po bajte zhodný so živým webom (25. 9.). Redizajn „Hotové keď“ (z rámca 50 frontendov, 9. 9., ktorý register uvádzal iba ako koncept): reálne dáta zo zmrazeného fixture s reálnymi URL, žiadny mock („nevytvárať falošné aktuálne udalosti ani zdroje. Každý variant používa rovnakú revíziu dát“), reflow 320 px, kontrast 4,5:1, klávesnica, Adamov výber z ≥ 2 alternatív („Adam môže označiť 6–10 kandidátov... 8–12 párových porovnaní... Nezobrazovať priebežné preskupovanie ani skóre modelu“); „Vizuálna podoba nie je dôkazom existencie backendovej schopnosti“; pri redizajne na šablóne XVADUR ten istý zmrazený fixture.
- Stav: postavené; redizajn a stack modulov návrh (XDR-230, do 20. 10.) – bez kritérií prijatia okrem vyššie uvedených brán.
- Zdroj: `hriech/PRODUCT.md:11` (citát; pôvodne uvedené PUBLISHING.md:21–29 a PRODUCT.md:19 citát neobsahujú); `hriech/docs/PUBLISHING.md:21–29`; `hriech/PRODUCT.md:19`; `hriech/STATUS.md:12–14`; `ARCH-N/docs/research/FRONTEND_EXPLORATION_FRAMEWORK_2026-09-09.md:32–34, 76–83, 130–135`; `ARCH-H/docs/VERIFICATION.md:40–53`; Linear XDR-230.
- Citát: „Slovenský publikačný web pod značkou XVADUR: Adamove články, postrehy a systémové rozbory, výstupy z Netopiera a trvalé mapy verejného prostredia. Netopier vlastní monitoring, pamäť a získavanie podkladov. Hriech vlastní verejnú prezentáciu a autorstvo.“

**F18 · Verejný correction log a ledger predikcií Hriechu**
- Čo robí: každá publikácia má cestu opravy; oprava je nový prepojený záznam, nie tichý prepis (vzor Machine Herald); updatedAt pri aktualizácii; verejná pamäť vlastných predikcií a zmien stanovísk; to, čo Hriech vyčíta médiám (C12), robí sám.
- Spúšťač: pripomienka, nový dôkaz, vyvrátená téza (E13).
- Vstup: F3, F14.
- Výstup: /opravy na Hriechu; pole v publikácii.
- Meranie: každá oprava s dátumom, pôvodnou a novou verziou; postup pripomienka → posúdenie → readback.
- Stav: návrh (XDR-165 Backlog; PUBLISHING má updatedAt).
- Zdroj: Linear XDR-165; `hriech/docs/PUBLISHING.md:10`; `R/DAILY_VOICE_LAUNCH_2026-07-30.md:337`; `ARCH-H/…/AI_NEWSROOM…:134–140`.
- Citát: „Publikácia má použiteľný postup pre opravy a ďalšie verzie.“; „Ako má vyzerať verejná pamäť predikcií, opráv a zmien stanovísk?“
- Doplnenie (audit 27. 9.): precedens F21 – nález zverejnený cudzím účtom nemá correction path ani source card; Hriech ho môže dodatočne zaradiť do vlastného ledgeru ako „sekundárne zverejnenie“ s dátumom prvej formulácie z E8 (§6.10).

**F19 · Bezpečný verejný claim ako výstup každého spisu**
- Čo robí: každý interný spis končí blokom „Bezpečný verejný claim“ (iba to, čo dôkazy unesú, vrátane hranice) a zoznamom „Čo ešte treba overiť“; verejná formulácia rozsahu vlastnej práce (Adamov priamy close-read vs strojová analýza 108 článkov / 334 jednotiek).
- Spúšťač: uzavretie spisu.
- Vstup: D18, E7.
- Výstup: veta pripravená do F3.
- Meranie: verejný text použije iba bezpečný claim; nulový výsledok ≠ neexistencia.
- Stav: rozhodnuté (september 2026).
- Zdroj: `MK/05 Corpus reading.md:109–116`; `MK/25:214–220`; `MK/27 Verejna medialna stopa…:172–180`; `R/Denník N … sourcebook:702–723`.
- Citát: „Verejný text použije len to, čo unesie kontrolu.“; „Osobne som detailne komentoval päť článkov a jeden dotazník. Popri tom sme strojovo analyzovali 108 unikátnych článkov Denníka N v dvoch zmrazených korpusoch a širší porovnávací korpus 334 mediálnych jednotiek s viac než 717-tisíc slovami.“

**F20 · Vizuál mechanizmu a relevantné obrázky**
- Čo robí: k výstupom AI generované alebo internetové obrázky, ale relevantné; jeden dôkazový vizuál (výrez zmluvy s „predseda vlády“, 5:30, 15 minút, link na CRZ) namiesto fotky politika; vizuál mechanizmu alebo časovej osi z každého článku; Remotion infografiky.
- Spúšťač: F3, F4.
- Vstup: D1 dokumenty, dáta.
- Výstup: obrázok v článku a v derivátoch.
- Meranie: každý vizuál je dôkaz alebo mechanizmus, nie ilustrácia.
- Stav: návrh.
- Zdroj: korpus n=7766, 29. 5. 2026; `MK/32:158–219`; `R/NETOPIER_CONTENT_CALENDAR:255–266`.
- Citát: „urcite potrebujeme viac zahrnut obrazky ciuz ai generovane alebo z intenetu relevantne, al emusia byt relevantne“
- Doplnenie (audit 27. 9.): AI video (Higgsfield, Remotion) ako vrstva derivátov, ktorú register neuvádzal (grep „Higgsfield“ = 0): „preco sa mechanicky nepozret na tieto proejkty, zozbierat prompty, a „naucit“ sa promptovat video gen? ... urobit film? napojit to na spravodajstvo?“ (korpus n=6596, 1. 9. 2026); „predstav si ze mi bezia kampane a reklama robene cez higsfield“ (n=8024, 25. 9. 2026); „cez higsfield spravim konecne to pojebane video s final cutom... voice over, k tomu clanok na substack“ (n=5386, 18. 8. 2026). Pravidlo: nikdy fotorealistické zobrazenie reálnej osoby alebo udalosti, vždy označené `ai_generated` (G3), nikdy ako dôkazový vizuál („vizuál je dôkaz alebo mechanizmus“).

**F21 · Nález publikovaný cudzím účtom: IG „Nasratý občan“ (Mediaboard)**
- Čo robí: nález o zmluvách Úradu vlády s Mediaboardom (D1) nezverejnil Adam, ale cudzí aktivistický Instagramový účet „Nasratý občan“, ktorému Adam po jeho komentári pod príspevkom Aktualít poslal screenshoty a odkaz na faktúru z CRZ; príspevok mal na tom účte najviac lajkov zo všetkých. Nález odišiel bez Hriechovej proveniencie, source card (F14), correction path (F18) ani práva na opravu; Hriech k 27. 9. 2026 nemá žiadny vlastný publikovaný text.
- Spúšťač: ad hoc (Adam reagoval na komentár účtu; účtu písal už pri koncipovaní Netopiera).
- Vstup: D1 nález (screenshoty CRZ, faktúra).
- Výstup: IG post tretej strany; precedens pre G6 a F18: „nález publikovaný cudzím účtom“.
- Meranie: 0 publikovaných textov Hriechu k 27. 9. 2026; proveniencia nálezu je iba v korpuse (E8), nie vo verejnom výstupe.
- Stav: postavené (jednorazovo, treťou stranou); či Hriech nález cituje ako svoj prvý verejný výstup alebo ako sekundárne zverejnenie a či to mení stratégiu prvého článku, nerozhodnuté (§6.10).
- Zdroj: korpus n=6857 / p-c2523bbf624e7311f5323d39 a n=6858 / p-37693c20a3d31269d0aee39e, 4. 9. 2026; n=8343 / p-86615d676cd1f387d1875bcc, 24. 9. 2026. Pôvodná formulácia registra („Adam publikoval nález o Mediaboarde na Instagramovom účte Nasratý občan“) bola nesprávna – viedla k zlému záveru o kanáli, proveniencii a práve na opravu – a je opravená (audit 27. 9.); rovnako v §4, §5 a §6.10.
- Citát: „ne ne ne nasraty obcan je aktivita ktory chce zdielat moju kauzu ktoru som ansiel s tym mediaboardom“; „tam komentoval aj nasraty obcan a reagoval som an jeho komentar aby mi odpisal na spravu, a potom mi zacal odpisovat a to je ta konverzacia, a v nej som mu poslal screenshoty a link na tu fakturu ktoru som nasiel cez kysela“; „Napísal som tento objav na strany Občan, čo je instagramový účet a tento publikoval a ten príspevok má najviac lajkov zo všetkých jeho príspevkov“

**F22 · Experimentálne účty ako senzor publika**
- Čo robí: faceless kanál na TikToku na monitoring nálad a viacúčtová infra na lacné testovanie hypotéz na publiku so spätnou väzbou: hypotéza → variant obsahu (GPT obrázky, trendová hudba, Remotion edit) → metriky per účet → záver; tabuľka `experimenty` (hypoteza, ucty, varianty, metriky, zaver) v projekte obsah. Register to do auditu redukoval na „2 posty denne na 6 účtoch“ (F10) a meral iba engagement a dosah.
- Spúšťač: hypotéza o publiku; nový variant obsahu.
- Vstup: F10 klipy, anonymné účty (§6.18).
- Výstup: záver o publiku; vstup pre G16 a E12.
- Meranie: výsledky sú signál o publiku, nie dôkaz o médiu (P10); každý experiment má hypotézu a záver; anonymné účty evidované v §6.18.
- Stav: návrh (16. 9. a 25. 9. 2026); infra 6 účtov Fiki beží (F10).
- Zdroj: korpus n=225, 16. 9. 2026; n=8048 / p-8ea14a6969a33e12dcfb1500, 25. 9. 2026.
- Citát: „chcem vyskusat monitorovat nalady ludi na tiktoku cez faceless chanel budem pridavat konketne edity robene cez gpt obrazky, trendovu hudbu, a remotion edit“; „ak budem mat zabehnutu infra cez ktoru mozem lahkjo a lacno testovat hypotezy na publiku, cez rozne ucty cez rozne platformy a budem vediet monitorovat spatne vazby, tak by osm konecne mohol vyuzit moju psychologicku prax“

### G. Prevádzka: kto schvaľuje, proveniencia, archív, hranice súkromia

**G1 · Schvaľovanie: Codex/Claude píše, Adam publikuje**
- Čo robí: draft → lokálny náhľad `/nahlad/…` (iba dev, noindex) → Adam skontroluje text, citácie, autorstvo, rozsah AI → status published, publishedAt, approvedBy iba na výslovný pokyn → pnpm qa (draft ani súkromné markery nie sú v dist, RSS, sitemap, search) → push a deploy ako samostatné kroky na pokyn; automatizácia môže zbierať, zhlukovať, skórovať, sumarizovať a pripraviť research, nie publikovať; Adam vyberá tri kusy dňa a ratifikuje zmeny politiky.
- Spúšťač: publication_candidate (F3).
- Vstup: draft, QA.
- Výstup: publikácia na webe.
- Meranie: nič nejde von bez Adamovho výslovného pokynu; status v dátach nenahrádza vôľu; autorita platí pre jeden úkon.
- Stav: postavené (PUBLISHING.md, QA skript).
- Zdroj: `hriech/docs/PUBLISHING.md:5–23`; `hriech/AGENTS.md:19`; `ARCH-N/docs/PRODUCT_HYPOTHESIS.md:64–69`; `core/02_dielo/hriech.md:86`; `xvadur_workspace/CLAUDE.md` (Orchestrácia: agent nerobí push, deploy ani nič externé).
- Citát: „Až na výslovný pokyn k publikovaniu nastav status: published, publishedAt a approvedBy.“; „Samotný stav published v dátach nenahrádza Adamov pokyn. Skript vie overiť metadáta, nie vôľu autora.“

**G2 · Proveniencia a archív: URL, časy, hash, surový payload, nemenné revízie**
- Čo robí: každý záznam nesie zdroj, kanál, URL, čas publikácie, čas zberu, ID zdroja, hash, verziu parsera a modelu, odkaz na surový payload v R2; príbehy, skóre a syntézy sú odvodený verzovaný stav; LLM výstup je voliteľný a nikdy neblokuje zber; každý verejný výstup dohľadateľný k dôkazom a histórii revízií.
- Spúšťač: každý zápis.
- Vstup: B, D.
- Výstup: D1 + R2 (cloud), Postgres (lokálne).
- Meranie: každé verejné tvrdenie vedie späť na revíziu a hash; žiadny prepis.
- Stav: postavené.
- Zdroj: `netopier/AGENTS.md:11–15`; `netopier/docs/ARCHITECTURE.md:28–29`; `ARCH-N/docs/PRODUCT_HYPOTHESIS.md:66–69`.
- Citát: „Public sources only. Preserve source URL, publication time, collection time, source ID, raw payload hash, and algorithm/model version. Keep raw evidence separate from derived stories, scores, and synthesis.“; „Every public output must remain traceable to its evidence and revision history.“

**G3 · AI disclosure a transparentný AI redaktor**
- Čo robí: každá publikácia má `aiDisclosure` a `approvedBy`; AI text sa neoznačí ako Adamov; autorský materiál označený adam_direct / adam_edited / ai_generated / quoted_external; koncept pomenovaného AI redaktora (Aether / Netopier AI Editor), ktorý publikuje pod vlastným menom; AI syntézy z OSINTu ako „AI syntézy mnou kurované“.
- Spúšťač: každá publikácia.
- Vstup: F3.
- Výstup: pole v publikácii; autorská poznámka o AI za oddeľovačom.
- Meranie: rozsah AI v každom texte pravdivo uvedený.
- Stav: postavené (pole); AI redaktor koncept.
- Zdroj: `hriech/docs/PUBLISHING.md:19`; `netopier/STATUS.md:15` [A]; M1:261, 483; `MK/32:195–197`.
- Citát: „2026-09-01 — AI autorstvo sa nemaskuje, robí sa kvalitným [A]“; „Človekom vytvorené nie je automaticky hodnotné. AI vytvorené nie je automaticky bezcenné.“

**G4 · Repozitár, jadro a súkromný archív: čo kde žije a čo sa nepushuje**
- Čo robí: nový článok má výskum aj draft v `hriech/research/<téma>/` (od 26. 9.); nič z research/ sa nepushuje pred schválením (repozitár je verejný); osobné svedectvo a súkromné podklady ostávajú v `xvadur_core/`; raw Dia chaty, licencované fulltexty, celé prepisy a súkromné poznámky do repozitára nepatria; minulé verzie v `xvadur_core/zdroje/hriech/archiv-2026-09/` (v0 zmazaný, mock Vydanie, staré koncepcie); `hriech/private/` (1 016 súborov, SHA-256 manifest zo 6. 9.) sa v poradku nenašiel celý.
- Spúšťač: nový článok; konsolidácia.
- Vstup: research, drafty, podklady.
- Výstup: repo hriech, jadro, archív.
- Meranie: na konci ťahu nič necommitnuté; verejný repozitár bez súkromného obsahu; archív s manifestom.
- Stav: rozhodnuté (26. 9. 2026 [A]); poradok archívu neúplný (§6).
- Zdroj: `hriech/STATUS.md:9`; `hriech/CLAUDE.md:19`; `hriech/research/README.md:6–7`; `hriech/AGENTS.md:14–16`; `core/02_dielo/hriech.md:131`; `core/10_otvorene.md:76`; `ARCH-N/PRESUN_2026-09-18.md`.
- Citát: „Nič z tohto priečinka sa nepushuje, kým článok nie je schválený (repozitár je verejný).“

**G5 · Hranice súkromia osôb**
- Čo robí: iba verejné profesijné a inštitucionálne údaje; žiadne súkromné adresy, rodné údaje, rodina, kontakty, majetkové lustrovanie fyzických osôb; žiadne raw ORSR dokumenty s podpismi; verejné osoby iba v roli a s dôkazom; juniorských novinárov a radových kolegov nemenovať (prípad Lodová citlivý); Karol bez súhlasu a anonymizácie nie; Discord nie ako hlavný verejný dôkaz; kataster iba v zákonnom a etickom rozsahu; test nevyhnutnosti a primeranosti pred publikovaním údaja z registra.
- Spúšťač: každý údaj o osobe pred zaradením do mapy alebo textu.
- Vstup: D, C10, F5.
- Výstup: evidence_state a public_use pri každom údaji.
- Meranie: nulový výskyt súkromného údaja vo verejnom buildu.
- Stav: rozhodnuté.
- Zdroj: `hriech/research/newsrooms/README.md:34–36`; `core/08_ludia.md:7`; `core/02_dielo/hriech.md:118–124`; `core/07_texty/drafty/04-karol…v1.md:5, 85–87`; `MK/10 Dia brief.md:144–147`; `MK/25:102–111`; rollout 2026-08-31T19-59-33-Cemo:80.
- Citát: „Karol nie je v tejto verzii označený pseudonymom; pred zverejnením treba vyriešiť jeho súhlas alebo dôslednú anonymizáciu. Klinické udalosti opisované z pamäti nie sú nahradené zdravotnou dokumentáciou.“; „nezverejnovat sukromny Discord ako hlavny dokaz bez dalsieho rozhodnutia“
- Doplnenie (audit 27. 9.): zakázané pole `zoznam lajkujúcich` (D13 „publikum reklamy“): iba agregáty (počet, typ účtu), nikdy identita súkromných osôb; profil iba pre `aktori.verejny=1`.

**G6 · Právo na odpoveď: oslovenie dotknutých redakcií a aktérov**
- Čo robí: pred publikovaním investigatívy osloviť redakcie s číslami zmlúv a otázkami (účel, podklad, adresát), dať priestor ukázať vlastný výstup alebo systém; right-of-reply pri alertoch zo štátnych záznamov; odoslanie a reakcie evidovať samostatne; žiadne vymyslené odpovede.
- Spúšťač: uzavretý spis pred F3 published.
- Vstup: D18, F16.
- Výstup: záznam o oslovení a odpovediach v spise a v článku.
- Meranie: každý menovaný subjekt dostal otázku pred publikáciou; nulový výsledok rešerše sa cituje ako nulový.
- Stav: rozhodnuté (draft 03: „nepublikovať bez redakčnej kontroly a oslovenia dotknutých redakcií“); nevykonané (XDR-162 Backlog).
- Zdroj: `core/07_texty/drafty/03-fico…v3.md:7, 75`; Linear XDR-162, XDR-231; `ARCH-H/…/STATE_READING…:74–77`.
- Citát: „Nulový výsledok webového hľadania nie je dôkaz, že taký text nevznikol. Pred publikáciou preto redakcie oslovím a dám im priestor ukázať vlastný výstup alebo opísať svoj systém sledovania štátu.“
- Doplnenie (audit 27. 9.): precedens „nález publikovaný cudzím účtom“ (F21): nález o Mediaboarde zverejnil IG účet „Nasratý občan“ z Adamových podkladov bez Hriechovej proveniencie, source card ani correction path; pri ďalšom zdieľaní nálezu tretej strane ide s ním aspoň odkaz na CRZ záznam a dátum prvej formulácie (E8) a oslovenie dotknutých (G6) sa tým neobchádza.

**G7 · Opravy a verzie článkov (correction lineage)**
- Čo robí: viditeľný spôsob oznámenia opravy s dátumom, zachovaná pôvodná a opravená verzia, postup pripomienka → posúdenie → readback; tri míľniky článku: 01 dôkazový audit (tvrdenia majú zdroje, lokátory, hranice inferencie) → 02 redakčná verzia (otázky, reakcie, verzia schválená autorom) → 03 publikácia a opravy (overená verejná verzia a história opráv).
- Spúšťač: pripomienka alebo nový dôkaz po publikácii.
- Vstup: F18.
- Výstup: nová verzia s väzbou na pôvodnú.
- Meranie: každá oprava dohľadateľná; míľniky v Lineari.
- Stav: návrh (XDR-165); míľniky rozhodnuté 25.–26. 9. (P-XDR-6).
- Zdroj: Linear XDR-165; Linear projekt P-XDR-6 míľniky; `core/07_texty/drafty/03-fico…v3.md:7`.
- Citát: „01 · Dôkazový audit — Nosné tvrdenia majú zdroje, lokátory a hranice inferencie. 02 · Redakčná verzia — Otázky, reakcie a presná verzia schválená autorom. 03 · Publikácia a opravy — Overená verejná verzia a história následných opráv.“

**G8 · Lokálne spracovanie textov; cloud iba na fetch, parse a uloženie verejných záznamov**
- Čo robí: embeddingy (FastEmbed) a modely bežia lokálne; žiadne OpenRouter ani embedding API pre texty; Worker iba sťahuje, parsuje a ukladá verejné záznamy; NotebookLM iba ako index nad prepismi, nie ako dôkaz.
- Spúšťač: architektonické rozhodnutie.
- Vstup: —
- Výstup: STACK.md, ADR-004, ADR-008.
- Meranie: žiadny text v cloudovom LLM API; embeddingy lokálne.
- Stav: rozhodnuté.
- Zdroj: `netopier/STACK.md:16`; `netopier/docs/DECISIONS.md:22–31, 70–71`; `MK/37:31–33`.
- Citát: „No text leaves for cloud processing: the Worker only fetches, parses and stores public records. Embeddings stay local.“; „NotebookLM je iba index nad prepismi.“

**G9 · Kto redakciu obsluhuje: Codex → OpenClaw → Claude Code → Paperclip s rolami**
- Čo robí: história obsluhy: Codex (jún–september), OpenClaw ako backend, orchestrátor research lane a produkt (7.–12. 9.), Claude Code workspace (od 23. 9., „xvadur_workspace bude môj jediný pracovný priestor“), Paperclip ako redakcia s rolami: šéfredaktor, analytik, editor, fact-checker, strih, grafik, publikátor (25. 9.); lacný model prideľuje a sleduje výskumnú prácu s rozpočtami a eskaláciou, neukladá autoritatívne dáta; Adam nie je denný manuálny orchestrátor („stačí ukázať prstom, a nechať ťa chvíľu pracovať“); agenti projektov (`hriech` agent) cez hlavnú session.
- Spúšťač: rozhodnutie XDR-226 (do 3. 10. 2026).
- Vstup: Paperclip beží (paperclip.xvadur.com, port 3100).
- Výstup: org chart redakcie alebo pozastavenie.
- Meranie: Adam dostane cieľ a vráti sa artefakt, overenie alebo blokujúca otázka.
- Stav: neurčité (Paperclip 25. 9. pozastavený, 26. 9. „ešte nič nerob“; OpenClaw 18. 9. „daj preč“).
- Zdroj: korpus p-aa0e80e2bbc44ddafd48fa4c, 25. 9. 2026; p-f6d562dffcf5503a2c7b57b5, 7. 9.; p-1383450b4d59a5478b05f9f6, 23. 9.; rowid 451, 18. 9.; `projekty/paperclip/STATUS.md:12`; `ARCH-N/docs/LINEAR_PLAN.md:17–21`; rollout 2026-08-31T19-59-33-Cemo:51; Linear XDR-226.
- Citát: „kokooooooot co ma napadlo, sak paperclip mozeme pouzit na to ze z toho samotneho sprsvime netopier.. sefredaktor, editor, helper, strih.. atd“; „stačí ukázať prstom, a nechať ťa chvíľu pracovať“

**G10 · Riadenie úloh cez Linear: míľniky, štítok Kto, stavy**
- Čo robí: projekt Hriech + Netopier (P-XDR-6) s míľnikmi Systém 10. 10., Infra 31. 10., Živé 30. 11. (prvé články, meranie spravodajstva, štátny dashboard), Vianoce 31. 12. (Zeitgeber); úloha má termín, „Hotové keď“, závislosti a štítok Kto (Agent / Adam); stavy Backlog → Todo → Pripravené → Rozpracované → Na overenie → Done; Čaká = na Adamovi; commit k úlohe začína číslom (XDR-123).
- Spúšťač: každé zadanie práce s jasným výsledkom.
- Vstup: rozhodnutia z konverzácií.
- Výstup: tikety XDR-228 (zber), XDR-229 (zákulisie, Done), XDR-230 (redizajn a moduly), XDR-231 (prvé články), XDR-232 (EKG + dashboard), XDR-258 (Adam: Workers Paid, WM kľúč, kataster), XDR-226 (Paperclip), XDR-197 (Zeitgeber), XDR-254/265 (Fiki).
- Meranie: Done iba s dôkazom (commit, URL, test, riadok v DB); staré úlohy z 10. 9. (XDR-161–177) nezosúladené (§6).
- Stav: rozhodnuté (štruktúra od 26. 9. 2026).
- Zdroj: `_claude/rules/linear.md`; `_claude/handoff/2026-09-26-2355.md:6, 10`; Linear list_issues (27. 9.).
- Citát: „Štruktúra (od 26. 9. 2026), z ktorej číta roadmapa na adam.xvadur: projekt → míľnik s dátumom (Systém 10. 10., Infra 31. 10., Živé 30. 11., Vianoce 31. 12.) → úloha s termínom, podmienkou „Hotové keď“ a závislosťami“

**G11 · Definícia hotového: implementované ≠ otestované ≠ nasadené ≠ publikované**
- Čo robí: rozlišuje implementované, otestované, integrované, pozorované za behu, uložené a overené v cieli; kontajner nie je RSS-to-feed slučka; benchmarky provizórne do Adamovej ratifikácie; hotové znamená overené (build, test, otvorená URL, riadok v databáze).
- Spúšťač: každé hlásenie „hotové“.
- Vstup: —
- Výstup: STATUS.md s [A] pri rozhodnutiach; Na overenie → Done.
- Meranie: každé „hotové“ má dôkaz.
- Stav: rozhodnuté.
- Zdroj: `netopier/AGENTS.md:34–35`; `xvadur_workspace/CLAUDE.md` (Práca); `core/06_firma/znacka.md:89` (dôkazový kontrakt).
- Citát: „A container starting is not a successful RSS-to-feed loop.“; „Hotové znamená overené: build, test, otvorená URL, riadok v databáze. Oddeľ fakt, inferenciu a hypotézu.“
- Doplnenie (audit 27. 9.): akceptačný protokol runtime z `ARCH-N/docs/reports/NIGHT_BUILD_REPORT.md:66–82`, ktorý register necitoval, ako podmienka „hotové“ pre lokálny beh (medzery L1): idempotentný replay („Idempotent replay: 20 received, 20 skipped, 0 created“), súbežná rekonciliácia („Concurrent reconcile: serialized safely“), reštart API a workera bez straty článkov („API and worker restarts preserved articles“), secret scan („Secret scan passed 60 text files“), zaznamenané zlyhanie („One deliberately invalid Miniflux credential produced a durable failed run“); otvorené hranice z :84–94 (žiadny webhook, outbox, SBOM).

**G12 · Monetizácia (zadarmo / OSINT za poplatok / články paid)**
- Čo robí: Hriech ako redakcia zadarmo; výstupy z OSINTu (AI syntézy kurované Adamom) za drobný poplatok ~3 €; Adamove články na Substacku a Hriechu paid; neskôr subscription; „prácu nemeraj peniazmi“ (ústava workspace).
- Spúšťač: po zabehnutí prevádzky.
- Vstup: F3, F11, D13.
- Výstup: cenník.
- Meranie: —
- Stav: návrh (7.–8. 9. 2026), neratifikované; 24. 9. „ja tým vôbec nejdem zarábať“ (o klipovaní).
- Zdroj: korpus n=7313 / p-e8d33e5d803ea86c229a6fbe, 8. 9. 2026; C3:312, 604; `core/06_firma/firma.md` (rebrík: Vydanie a Hriech zdarma); `xvadur_workspace/CLAUDE.md`.
- Citát: „na Hriechu bude... akože bude to zadarmo, hej, lebo bude to akože moja redakcia, ale výstupy z OSINTu budú za nejaký drobný poplatok, 3 eurá alebo čo, lebo to budú AI syntézy a mnou kurované“

**G13 · Raw súbory, autorské práva, rozsah citácií**
- Čo robí: audio, prepisy, screenshoty nie sú na commit ani publikovanie; celé prepisy podliehajú autorským právam; verejné citácie v nevyhnutnom rozsahu a po kontrole proti zvuku; videá sa nesťahujú, iba titulky (VTT); raw evidence s SHA-256 v ignorovanej vrstve.
- Spúšťač: každý korpus a spis.
- Vstup: D14.
- Výstup: .gitignore vrstvy, manifesty.
- Meranie: žiadny raw súbor vo verejnom repozitári.
- Stav: rozhodnuté.
- Zdroj: `R/CASE_AKTUALITY_FREDERIKA_LODOVA_2026-08.md:418–420`; `netopier/data/fiki/README.md:34–44, 72`.
- Citát: „Raw súbory nie sú určené na commit ani verejné publikovanie. Celý transcript a audio podliehajú autorským právam; verejné citácie treba kontrolovať proti zvuku a držať v nevyhnutnom rozsahu.“
- Doplnenie (audit 27. 9.): klipovanie cudzích filmov (Zeitgeist, Michael Moore) a indexovanie cudzích kanálov (Predictive History, John Harris; A7, F10) – iba citácia v nevyhnutnom rozsahu, celé prepisy nikdy verejne; audio z podcastov (B14 `podcast-rss`) sa po prepise neuchováva verejne.

**G14 · Validačný protokol T/A/E a audio check pred citátom**
- Čo robí: vrstvy transcript-only → direct-raw-transcript lead → overený vonkajší fakt → inferencia; validácia T (direct transcript: celý tematický segment + 2 repliky okolo), A (audio: hovoriaci, poradie, irónia, opravy), E (primárny zdroj pri externom tvrdení); výsledok confirmed-local / context-sufficient / false-positive / unresolved; pevné poradie V00–V15; nedostupný podklad = unresolved, nie potvrdenie; žiadny presný verejný citát z podcastu bez ručného vypočutia; časové značky sa líšia podľa prehrávača, citovať konkrétny povrch + vlastný timestamp.
- Spúšťač: karta pred verejným použitím.
- Vstup: D14, C21.
- Výstup: status karty.
- Meranie: nulový verejný citát bez A checku; celý Klik korpus je dnes transcript-only.
- Stav: rozhodnuté; backlog V00–V15 nevykonaný.
- Zdroj: `MK/43:36–49, 120–152`; `MK/34:74–77`; `MK/00 Source map.md:41`; `R/CURRENT_EVIDENCE.md:45–48`.
- Citát: „Nedostupný podklad znamená `unresolved`, nie potvrdenie hypotézy.“; „NotebookLM transcript nie je quote-perfect primárny dôkaz. Na verejný text treba dôležité pasáže ešte skontrolovať proti videu/audio alebo timestampom.“

**G15 · Frontmatter stavu spisu**
- Čo robí: každý spis má title, date, status (interný pracovný / overovací), publication_status (nepublikovať bez…), sendable_as_is (true/false), source_url, source_published, source_collected, scope, visible_authors; oddeľuje interný spis od publikovateľného textu a viaže tvrdenia na čas zberu.
- Spúšťač: založenie spisu.
- Vstup: —
- Výstup: hlavička spisu.
- Meranie: žiadny spis bez publication_status; adam-review a sendable_as_is:false blokujú publikáciu.
- Stav: postavené.
- Zdroj: `MK/25:1–14`; `MK/23:1–11`; `R/CASE_AKTUALITY_FREDERIKA_LODOVA_2026-08.md:1–9`.
- Citát: „publication_status: nepublikovať bez kontroly originálu Aktualít a finálnej redakcie / sendable_as_is: false“

**G16 · Redakčný mix 50/30/20 a redakčná veta série**
- Čo robí: približne 50 % vlastné modely a distinkcie, 30 % zdrojovo viazaná kritika verejného artefaktu, 20 % operator proof zo systémov, ktoré Adam postavil (git commit c0ba356 „Add editorial balance guardrail“); redakčná veta série: Netopier sleduje, čo médiá publikovali, Adam píše o modeli sveta.
- Spúšťač: plánovanie výstupov (A4, B16).
- Vstup: F3, F4, F10.
- Výstup: mix výstupov za mesiac.
- Meranie: kritika priťahuje pozornosť, model zarába autoritu, operator proof bráni divadlu; značka nezávislá od terčov.
- Stav: rozhodnuté (30. 7. 2026); rozpor s kalendárom, kde je všetkých 8 tém mediálna kritika (§6).
- Zdroj: `R/DAILY_VOICE_LAUNCH_2026-07-30.md:58–71`; `R/MAINSTREAM_MEDIA_INDICTMENT_MAP_2026-07-30.md:68–72`; `R/NETOPIER_CONTENT_CALENDAR:268–271`.
- Citát: „The criticism attracts attention. The stronger model earns authority. The operator proof prevents the authority from becoming another media performance.“

**G17 · Archív minulých verzií a poradok**
- Čo robí: minulé koncepcie, mock frontend Vydanie, reporty v0/v2 a staré docs sú v `xvadur_core/zdroje/hriech/archiv-2026-09/`; v0 Netopiera zmazaný 25. 9.; GitHub xvadur/netopier archivovaný (read-only); xvadur_watchdog ako historický snapshot (jediná kópia indexu AI segmentov); worktree d3f1293 ako recovery point neintegrovaného toolingu; poradok `hriech/private/` s manifestom.
- Spúšťač: presun, zmazanie, konsolidácia.
- Vstup: staré repozitáre a priečinky.
- Výstup: archív s odkazmi v STATUS.
- Meranie: nič sa nezmaže bez archívu a manifestu; chýbajúce položky pomenované (§6).
- Stav: postavené (25.–26. 9. 2026), poradok neúplný.
- Zdroj: `hriech/STATUS.md:13`; `netopier/STATUS.md:17`; `ARCH-N/PRESUN_2026-09-18.md:1–11`; `R/MAINSTREAM…MAP:176–210`; `core/10_otvorene.md:76`.
- Citát: „Hriech je XVADUR spravodajská služba: Hriech frontend, Netopier backend; projekt vyčistený od minulých verzií (shadcn vrstva, mock Vydanie, staré koncepcie → archív); v0 Netopiera zmazaný“

---

## 4. Minulé koncepty a ich osud

| Názov | Čo to bolo | Kedy | Osud | Zdroj |
|---|---|---|---|---|
| Command Centre / Slovak Newsroom Dashboard / News Sonar | Cockpit + SK/EÚ politický intelligence modul, zjednotenie source registry; vzor natural20.com. | 24.–29. 5. 2026 | Pohltené do Netopiera v0. | korpus n=981, n=992, n=1196 |
| Netopier v0 (Cockpit/Radar, Supabase archív, NRSR knowledge graph, nočné buildy, morning brief, actor radar, case watch, Live Triage) | ~100 RSS zdrojov každých 30 min (launchd), YouTube ingest 16 účtov, Supabase (sources → ingest_runs → raw_items → documents → chunks/entities → briefs/alerts), NRSR ČPT graf, actor_observations (1 172), case watch sulik-barami, weekly media review, netopier-write; pri audite 30. 8.: 87 772 dokumentov, ~10 085 klastrov, scheduler nezdravý. | máj – august 2026 | 30. 8. „nevydareny pokus“, „neverim netopieru ako takemu“; ADR-001 v0 retired; 25. 9. zmazaný; „pičungy“ a research cases zachované v Hriechu/jadre. | korpus n=6455, 30. 8.; n=6755, 3. 9.; n=8061, 25. 9.; `netopier/docs/DECISIONS.md` ADR-001; rollout 2026-06-19T12-53-54-8lz0; 2026-08-26T04-56-16-4ysz |
| Netopier v1/v2 (Event Intelligence Core na OSS) | Miniflux + PostgreSQL 17 + pgvector + FastEmbed + FastAPI; ArticleArchive, StoryEngine, FeedProjector; Build 2A; benchmark 0,83; posledný beh 3.–5. 9.: 76 článkov, 71 udalostí; ~2 500 riadkov. | 2.–5. 9. 2026 | Kód žije v `hriech/netopier/`; runtime nebeží od 7. 9. (Colima odstránená); Python vrstva sa má napojiť na D1; číslovanie v1/v2 nekonzistentné. | `ARCH-N/docs/reports/*`; `netopier/STATUS.md:4–5, 21`; C3:663 |
| Netopier zber (Cloudflare Workers/Queues/D1/R2) | Konektory rss, worldmonitor, crz, ted, kataster, statistika; 27 testov; 14 299 záznamov lokálne. | 26. 9. 2026 | Postavené, nenasadené; čaká na Workers Paid a pokyn (XDR-258). | `netopier/zber/README.md`; Linear XDR-228, XDR-258 |
| Minúta po minúte (Denník N) ako backbone → teardown → vlastný modul | Jún: MpM ako chrbtica monitoringu; 30. 8.: teardown MpM a HotInfo; 27. 9.: vlastná minúta bez meškania. | jún – september 2026 | Teardown rozhodnutý [A]; vlastný modul v XDR-230; nepostavené. | korpus n=2068, 21. 6.; n=6465–6467, 30. 8.; p-5c4e1f99…, 27. 9.; `netopier/STATUS.md:14` |
| HotInfo | Referenčný produkt, podľa Adama „to, čím by mal byť Netopier“. | 31. 8. 2026 | Teardown zapísaný v STATUS; výstup teardownu (čo adaptovať) v archíve ani v jadre nie je. | korpus n=6469–6471, 31. 8.; `netopier/STATUS.md:14` |
| Natural20 / AI newsroom teardown | Natural20 (momentum scoring, clustre s receipts, false merge), HuggingNews, AI·HOT, News Minimalist, Particle, Machine Herald, Heatwire, NEWSCOPE ako donori mechanizmov. | 3. 9. 2026 | Referenčný dokument; prevzatý model troch skóre, wire karta, verzovaná politika (nepostavené); Adam 27. 9. znovu odkazuje na natural20, MpM, Ground News, NYT. | `ARCH-H/research/editorial/AI_NEWSROOM_AND_NATURAL20_TEARDOWN_2026-09-03.md`; korpus n=8534 |
| Ground News | Globálny vzor agregácie s analýzou ľavica/pravica. | 21.–25. 9. 2026 | Živý: „maximalizovať podľa mojej obsesie“, ale „nebude politicky orientované“. | korpus n=8252, 21. 9.; n=8048, 25. 9. |
| Seizmograf (openclaw.sk) → EKG | Seizmograf podľa agregácie zdrojov adaptovaný na pulz zdravotníka. | 22. a 27. 9. 2026 | Rozhodnuté; XDR-232 Todo do 27. 11. | korpus n=8292, n=8534; Linear XDR-232 |
| Frontend „Vydanie“ a 50 frontendov | 9. 9.: rámec ~50 webov na ranný výber (10 rodín × 5); vybraný koncept Vydanie (veľký serifový NETOPIER, biela, čierna, červené akcenty, novinové stĺpce); mock bez napojenia. | 9.–11. 9. 2026 | 11. 9. zaznamenaný ako záväzný smer; výroba 50 webov zrušená; 25. 9. archivovaný ako mock; Hriech dostane redizajn na šablóne XVADUR; slovo „Vydanie“ žije ako názov týždenného explainera v rebríku produktov. | korpus p-c2f7de37c62a5eed802b0ec1, 9. 9.; `ARCH-N/DESIGN.md:3–10`; `ARCH-N/PRODUCT.md:19–23`; `core/06_firma/firma.md:62`; `ARCH-N/docs/research/FRONTEND_EXPLORATION_FRAMEWORK_2026-09-09.md:32–34, 76–83, 130–135` (brány a výberový protokol → F17 „Hotové keď“) |
| Reaction docket v0.1 | 19 záznamov R001–R019 (Martinus/Dibáková, „AI vytvára hlavne knihy pre deti“, európsky prokurátor, benzínky Charkov–Poltava, Šiškáči, Trump 4. termín, Thompson/Klik, Fico „zlý otec“, Fico × DN symbióza, Index brand ESET) s rodinami A1–M1 a stavovou gramatikou. | 30. 7. 2026 | Žiadny záznam nedosiahol recorded/published; zásobník námetov; žiadna aktualizácia stavov po 30. 7. | `R/REACTION_DOCKET_V0_1.md`; H1:604; `core/07_texty/zasobnik.md:221` |
| Daily Voice Launch | 7 skriptov + karusel „Sedem kategórií“ + esej; slučka Dana Koea s dôkazovou vrstvou; mix 50/30/20; definition of done prvého týždňa. | 30. 7. 2026 | Nič nenahraté (dávka to nevidí); 30. 8. nahradený týždenným rytmom; texty v zásobníku; mix 50/30/20 prežil ako guardrail. | `R/DAILY_VOICE_LAUNCH_2026-07-30.md`; H1:364–372; `core/07_texty/zasobnik.md:32` |
| Mapa analytickej obžaloby C0–C13 (+C14) a Slovak Media Audit hub | Register osí s vrstvami documented/coded/inference/hypothesis/unsupported; canonical hub v Netopieri (commity d70af79, 49625e9, c0ba356); publikačná sekvencia 5 textov. | 30. 7. 2026 (C14 15. 8.) | Taxonómia živá; hub zanikol s presunmi; žiadny z 5 textov nevyšiel; C0 test nevykonaný. | `R/MAINSTREAM_MEDIA_INDICTMENT_MAP_2026-07-30.md:48–72, 257–582` |
| Korpus mediálneho auditu (334 jednotiek, 717 332 slov) | Martin Gregor 100 videí, Edi Cangama 69, Denník N AI 50 + 59 (26.–28. 7.), Klik 5 epizód, JOJ 24 + Vizita, 50 newsletterov; 250 Trump-day URL, 55 YouTube a 30 IG AI tvorcov. | 29. 7. 2026 | Zachované ako CSV v R/; kódovanie nedokončené (45/50 factual_status not_checked); prepisy Gregora a Ediho v kniznica/. | `R/CURRENT_EVIDENCE.md:5–30`; `R/corpus-register.csv`; H1:143–157, 398 |
| Sourcebook „Denník N a slovenské informovanie o AI“ + list redakcii | 7 290 slov: ústredné obvinenie, DN-01 až DN-08, os C14, ledger E01–E21, 25 otázok, architektúra mailu. | 15. 8. 2026 (list 19. 8.) | Sekcie „Adamov komentár“ prázdne; list odoslaný, „neodpísali“; newsletter nevznikol; 25 otázok neposlané. | `R/Denník N a slovenské informovanie o AI - pracovný sourcebook k podaniu.md`; D2:63, 283–284; `core/07_texty/zasobnik.md:37` |
| Content calendar jeseň 2026 (8 týždňov) | Osem týždenných tém 31. 8. – 25. 10. s pomocnými otázkami a podkladmi; publikácia xvadur.com; stály 6-krokový rytmus. | 30. 8. 2026 | Ani jedna téma nevyšla; 14. 9. Hriech odložený; 25.–26. 9. nahradený míľnikmi Linearu; témy v zásobníku. | `R/NETOPIER_CONTENT_CALENDAR_2026-08-31_10-25.md`; `core/07_texty/zasobnik.md:45–53` |
| Klik audit (obžaloba → test) | Discord rant 25. 1. → obžalobná teória dvoch právd (22. 6.) → datasety 389–393 (233 segmentov) → 8 case files → kompresia M1–M8 → osi A1–A10 → kontrolný vzorok 394–403 → corpus 50 P1–P5 → syntéza 43 → backlog V00–V15. | január – 12. 9. 2026 | Celosériový verdikt nepotvrdený; udržateľný lokálny prípad Klik 404; opakovateľnosť „neurčité“; validácia nevykonaná; Adamova ratifikácia otvorená (12. 9.: „toto je jeden z nahorsich case“). | `MK/02, 10, 20, 22, 35–43`; `core/02_dielo/hriech.md:56`; `core/10_otvorene.md:20` |
| Money Talk 114 obžaloba | 14 bodov s timestampmi (pojmové pranie, GDPR compliant, 20 faktúr), systémová vina, „čo prežije“. | 14. 8. 2026 | Interný spis; 5 bodov na došetrenie; nepublikované. | `MK/23 Money Talk 114.md` |
| Case SMA-AKT-FL-2026-08 (Aktuality, Lodová, Sulíkovo video) | Prvý plne štruktúrovaný case file s chronológiou, jazykovým auditom, právnym ledgerom, raw evidence SHA-256. | 27. 8. 2026 | adam-review, sendable_as_is:false; 7 otvorených dôkazov; téma 5. týždňa kalendára; menovanie juniorky citlivé. | `R/CASE_AKTUALITY_FREDERIKA_LODOVA_2026-08.md` |
| Sulík–Barami article master | 7 363 slov + source audit 4 619 slov; „ako internet vyrába tribalizmus“; téma 4. týždňa. | 29. 8. 2026 | Nie publication-ready (timestampované citáty, TikTok originál); v poradku nebol; Fiki sa stal tenantom klipovania. | rollout 2026-08-26T04-56-16-4ysz:46–75; `core/07_texty/zasobnik.md:25` |
| Hugging Face exposure test | 8 otázok, mapa 15 médií, korekcia Adamovej intuície, návrh 7-krokového explaineru. | 29. 8. 2026 | Hotový audit; explainer nerealizovaný. | `R/HUGGING_FACE_SLOVAK_MEDIA_EXPOSURE_TEST_2026-08-29.md` |
| Kyseľ/Blaha → Mediaboard → State-reading brief | Prvá investigatívna línia; produktová veta „stroj, ktorý číta štát“; brief s evidence contractom a bounded first slice. | 1.–4. 9. 2026 | Čiastočne realizované ako zber/ (CRZ, TED, kataster, ŠÚ SR); alerty, entity linking, ľudská dispozícia nepostavené. | `MK/24–28`; `ARCH-H/research/editorial/STATE_READING_EDITORIAL_BRIEF_2026-09-03.md` |
| Draft 03 „Fico nemusí čítať vaše články“ | ~982 slov, v3 (4. 9.), 5 medzititulkov, končí otázkou, prečo médiá nečítajú štát tak ako štát ich; polish odporučený. | 4. 9. 2026 | Nepublikované; čaká na overenie CRZ (0,00 € vs 48 073,32 €), chýbajúcu zmluvu 2025/26 a oslovenie redakcií; nález zverejnil cudzí IG účet „Nasratý občan“ z Adamových podkladov (F21); v1 a v2 chýbajú v poradku. | `core/07_texty/drafty/03-fico…v3.md`; `MK/32`; `hriech/STATUS.md:24` |
| Draft 04 „Kto má na starosti Karola?“ | Svedectvo o starostlivosti a urgente Nemocnice Bory v prvej osobe, napísané Codexom. | 6. 9. 2026 | Súkromný; Adam neschválil; anonymizácia a súhlas otvorené. | `core/07_texty/drafty/04-karol…v1.md`; `hriech/STATUS.md:25` |
| Publication Engine / skill hriech-article / CLI netopier-write | Repozitárový writing workflow (AGENTS.md + SKILL.md + references + validátor); Pocock grounding; stavový engine candidate → Adam approved; v0 CLI s hard gates. | 4. 9. 2026 (CLI 1. 9., 22. 9.) | Návrh; repo hriech nemá .agents/skills; CLI vo v2 neexistuje; kde má engine žiť (Hriech vs Netopier) nerozhodnuté. | `MK/29, 30, 31`; rollout 2026-09-01T21-48-04-j7Vy:24–28; `ARCH-N/PRESUN_2026-09-18.md:4` |
| Hook `hriech:`, `strucne:`, `zaciatok_`, `koniec_`, `imaginacia_` | Hooky v Codexe; `hriech:` prepína do režimu štruktúrovaného hnevu s artefaktom na GitHube. | 3.–8. 8. 2026 | 15. 8. odstránené („žerú kredity“); 25.–26. 9. vrátené ako slash command `/hriech` v Claude. | korpus p-38439986…, 3. 8.; C2:355 (E:8897); `_claude/skills/hriech` |
| Trepete / Netrep / trepomer | Brand „meranie hlúpostí za deň“ nad Telegramom a sociálnymi sieťami; netrep = sociálne veci, netopier = politika; logo na deploy. | 4.–5. 8. 2026 | Zahodené; slovo v slovníku; „merať vatu“ sa vrátilo 27. 9. ako funkcia C4. | korpus n=4381, n=4392, 4. 8.; n=4533, 5. 8.; `core/09_slovnik.md:76` |
| HLAD.AI / hlad.xvadur.com | Kurátorované AI news a poznatky, kurzy; alias pred Hriechom („byť hladný po AI“). | 6.–14. 8. 2026 | Zrušený 11. 9.; Adam 25. 9.: Hriech je „punchy, ale take moc vyzivave“; nomenklatúra (možno latinská) nerozhodnutá. | `core/06_firma/znacka.md:23, 32`; korpus n=4843, n=5118; n=8048, 25. 9. |
| Picung / pičung / PICUNG.md | Adamova „kritika a nadávanie na médiá ako metóda“; priečinok a subdoména pred Hriechom; PICUNG.md obsahová mapa. | júl – september 2026 | 6.–7. 9. zmazaný, obsah presunutý do Hriechu; PICUNG.md chýba; slovo žije v značke Lucie „Terapia Picungom“. | `core/09_slovnik.md:74`; korpus p-1c15181be6840aef270f3809, 6. 9.; C3:555; H1:481 |
| Obsidian Kontext/Mediálna kritika 00–43 a xvadur_watchdog | Kanonická významová vrstva (45 dokumentov); watchdog = prvý čistý GitHub export (commit e32f687b) so 101-riadkovým indexom AI segmentov. | jún – september 2026 | Presunuté do `xvadur_core/zdroje/hriech/research/medialna kritika/`; „index copy.md“ je novšia, pre Hriech upravená verzia (relatívne odkazy, doplnené riadky 23–34, odkaz na neexistujúci ../PICUNG.md), index.md končí pri 22; kanonický má byť „index copy.md“ (§6.23); watchdog historický snapshot. | `R/MAINSTREAM…MAP:100–127, 176–189`; `MK/index copy.md:1–6` |
| Polymarket spravodajsko-tradovací systém | Netopier sleduje svet a premieňa ho na Polymarket hypotézy; trojvrstvový systém s Polymarketom ako jadrom; 30 pozícií. | 6. 6. – 27. 7. 2026 | Zahodené: Polymarket na Slovensku od 27. 7. zakázaný, „Adam všetko abortoval“; ostal osobný háčik (War Powers), nepublikuje sa. | korpus n=1681, n=1682, 6. 6.; p-ed6cb887c6bdfe2cea453e89, 27. 7.; `core/01_pribeh/kronika.md:219` |
| Newsletter pre Jakuba z Netopiera | Netopier robí briefing z realitných zdrojov, Adam píše v Jakubovom mene 2× týždenne; Remotion reels. | 5.–12. 7. 2026 | Nezrealizované (Jakub nemá čas); realitné dáta ostali ako vrstva D15. | korpus p-0a2fa2b4f6da827af017a542, 9. 7.; p-202601122ed53b157ebd836b, 12. 7.; `core/06_firma/firma.md:136` |
| Kokpit / karty feed (TikTok-like) | Vrstvy kariet, swipe medzi kartami Netopiera, capture do timeline. | 8. 7. 2026 | Prešlo do adam.xvadur (observácia písania). | korpus n=3053, n=3062, 8. 7.; n=3507, 26. 7. |
| Cybersecurity sekcia (AI ako etický hacker tool) | Nová sekcia Netopiera na hybridné hrozby. | 13. 8. 2026 | Vrátené 21.–22. 9. 2026 ako mediálna téza (bezpečnosť ako atmosféra bez mechanizmu, T19) a potreba explaineru (F15 seed): „pod mi vysvetlit cyber sec, kedze mi to nevysvetlili v podcastoch“. | korpus n=5086, 13. 8.; n=8273, n=8284, n=8288, 21.–22. 9. |
| Batman téma | Jednorazová plošná analýza mediálneho trhu a influencerov s tematikou Batmana. | 1. 9. 2026 | Nezrealizované. | korpus n=6603, 1. 9. |
| OpenClaw ako backend / orchestrátor / interface nad všetkým; Symphony | OpenClaw nahradí Codex ako middlemana, backend aplikácií a produkt; lacný model orchestruje research lane; Symphony na konsolidáciu workspace. | 3.–12. 9. 2026 | Symphony 3. 9. zamietnutý („pojdeme cez liner“); OpenClaw 18. 9. „daj preč“, gateway vypnutý 11. 9.; nahradené Claude Code workspace (23. 9.). | korpus p-f6d562dffcf5503a2c7b57b5, 7. 9.; rowid 451, 18. 9.; C3:486; `ARCH-N/docs/LINEAR_PLAN.md:17–21` |
| Rozbor 30 príspevkov Martina Sliza (XDR-142) | Dátová žurnalistika ako zdroj postupov, 3 reprodukcie, Remotion zadania. | 10.–11. 9. 2026 | XDR-142 Canceled; XDR-173–177 Backlog; 4 z 30 príspevkov predbežne čítané. | `ARCH-N/docs/LINEAR_PLAN.md:23–77`; Linear |
| Linear projekty Hriech (XDR-161–165) a Netopier (XDR-166–177) z 10. 9. | Míľniky Dôkazový audit → Redakčná verzia → Publikácia; Funkčné Vydanie → Živé zdroje a API → Analytika. | 10. 9. 2026 | Zlúčené do „Hriech + Netopier“ 25.–26. 9.; staré úlohy Pripravené/Backlog bez míľnikov novej štruktúry. | Linear list_issues (27. 9.); `ARCH-N/docs/LINEAR_PLAN.md` |
| Aether / Netopier AI Editor | Pomenovaný AI redaktor publikujúci pod vlastným menom. | 30. 8. – 1. 9. 2026 | Koncept; v PUBLISHING.md ostal iba aiDisclosure. | M1:261, 483 |
| Paperclip ako redakcia | Roly šéfredaktor, analytik, editor, fact-checker, strih, grafik, publikátor. | 25.–26. 9. 2026 | Otvorené (XDR-226, Čaká do 3. 10.); alternatíva pozastaviť. | korpus p-aa0e80e2bbc44ddafd48fa4c, 25. 9.; `projekty/paperclip/STATUS.md:12` |
| Fiki Unchained korpus a klipovanie | 93 videí s titulkami, 53 vystúpení mimo kanála, 42 klipov na 1. týždeň, 6 účtov; prvý tenant projektu obsah. | 25.–27. 9. 2026 | Postavené a beží; Adam to chápe ako tréning skillu pre vlastnú „shadow tvorbu“ a anonymný účet. | `netopier/STATUS.md:6–7`; `_claude/handoff/2026-09-27-0439.md`; `projekty/obsah/STATUS.md` |
| Zeitgeber — kto vlastní hodiny | Prvý článok novej éry: téza z Opus Major, tabuľka 13 tvrdení, Hórus 25. 12. „sporné, nepoužiť“; draft cez Vianoce. | 26. 9. 2026 | Research založený v `hriech/research/zeitgeber/`; nepushnuté; draft sa nepíše. | `hriech/research/zeitgeber/README.md`; Linear XDR-197 |
| Substack XVADUR ako domov textov | 14. 9.: Hriech odložený, kritika do Substacku; nová publikácia alebo premenovanie `sestramd` (3 followeri). | 14. 9. 2026 | Otvorené; 25.–27. 9. kanál späť na hriech.xvadur; ani jeden text. | korpus p-63dfa4e621bb6c86a20965f8, 14. 9.; `core/06_firma/firma.md:132, 137, 183`; `core/10_otvorene.md:19` |
| trumptracker.org („newstracker“), lawtracker, Demagog | Referenčné produkty pre ledger sľubov a predikcií (C12) a pre hranicu fact-checku (C19). | 25. 6., 4. 8. 2026 | Vzor C12; nepostavené; register ich do auditu neuvádzal. | korpus n=2479, 25. 6. („https://trumptracker.org/ toto som myslel ked som povedat ze chcem newstracker“); n=4392, 4. 8. („mas hentie pokusy ako demagog a lawtracker“) |
| Algoritmus X/Twitter (OSS) ako vzor feedu | Zverejnený algoritmus X ako vzor pre vlastný feed a rozhranie (B10/F1). | 30. 6. 2026 | Vzor; nepostavené. | korpus n=2880, 30. 6. („vieme pouzit algorytmus X/twittera lebo ho maju zverejneny... urobit instagram/facebook clone/ interface s feedom“) |
| AI Daily Brief | Pozitívny kontrolný formát ku Klik; case Martin Gregor („človek, za ktorého sa vydáva“). | 4. 4., 28. 7. 2026 | C20 kontrolný korpus; nepostavené. | korpus n=7792, 4. 4. („Kebyže porovnáš AI Daily Brief a podcast Klik“); n=3442, 28. 7. |
| Kapital noviny | Dizajnový vzor (veľký footer) pre F17. | 2. 8. 2026 | Vzor pre redizajn XDR-230. | korpus n=4110, 2. 8. („Analyzuj dizajn Kapital noviny... ten veľký footer... vyzerá strašne dobre“) |
| Ústavný súd SR chatbot a Juro (RAG nad NR SR) | Štát používa AI: ÚS SR spustil chatbota (RAG nad rozhodnutiami, dodávateľ česká firma); Juro = RAG nad verejnými dátami NR SR; Adam ich označil za paradigm shift, dôkaz, že dáta existujú, a vzor Netopiera (B19). | 1. 7. 2026 | Vzor B19 a podporný prípad T7; otázka pre D18 (kto dodal, za koľko, CRZ); ÚS rozhodnutia ako dataset D5. | korpus n=2498, n=2499, n=2504, n=2522, 1. 7. 2026 („toto je strasny gamechanger“; „ten juro chatbot, je obycajny rag nad verejnymi nrsr.. to iste ako dobuducna chcem urobit netopier“) |
| SK Instagram Top 200 | Heepsy + Apify, 201 profilov, dve poradia (followeri vs reálna pozornosť); 103 účtov na manuálnu klasifikáciu; hashtag discovery s recency bias. | 16.–17. 8. 2026 | Postavené jednorazovo; CSV po zmazaní v0 vo workspace nenájdené (§6.23); metóda ako meranie pre `aktori` typ influencer (D12). | korpus n=5289, n=5408; rollout summary `codex-pamat/rollout_summaries/2026-08-17T18-45-05-MxfW-…md` |
| Patriksystems / COR-X (profil influencera, Meta Ad Library ručne) | Deterministická vzorka 12 kariet Ad Library, 20 reklám, EÚ transparentnosť (dosah 73 839 / 27 422), UTM dekódovanie, Obchodný vestník 231/2024 ako identita, SHA-256 materiálov. | 11. 9. 2026 (XDR-195) | Postavené ako ručný protokol bez API; prvý influencer profil (C11, D12); register ho do auditu necitoval. | `ARCH-N/docs/research/PATRIKSYSTEMS_WEB_SOURCES_2026-09-11.md:3–7, 37–63, 101, 142–148`; `ARCH-N/docs/README.md:9` |
| `work/` front a `xv status` (xvadur_system) | Systém úloh pred Linearom: jeden súbor = jedno issue, stavy draft → ready → running → review → blocked → done; `xv status` regeneruje sekcie STATUS.md; NET-001 runtime na MacBooku cez SSH (Docker, Hermes, OpenClaw) blokovaný 11. 9. | jún – september 2026 | Nahradené Linearom (G10); NET-001 zahodené alebo otvorené = rozhodnutie Adama (B21). | `ARCH-N/work/README.md`; `ARCH-N/work/001-runtime-na-macbooku.md:1–17`; korpus n=7660, 11. 9. |
| NIGHT_BUILD_REPORT a EVENT_RELATIONS_REPORT | Dôkazové dokumenty v2: akceptačný protokol runtime (idempotentný replay, súbežná rekonciliácia, reštart, secret scan, zaznamenané zlyhanie; bez webhooku, outboxu, SBOM) a benchmark vzťahov (5 párov, hybrid 1,0 vs lexical 0,4). | 3. 9. 2026 | Použité v G11 a B6; labely čakajú na ratifikáciu (§6.21). | `ARCH-N/docs/reports/NIGHT_BUILD_REPORT.md:66–94`; `ARCH-N/benchmarks/EVENT_RELATIONS_REPORT.md:6–10`; `artifacts/verification-2026-09-03.json` |
| Logo a brand-assets | Wordmark a ikona (ružová bodka nad i s dvoma drážkami) odvodené z písmen slova „hriech“; originál dodal Adam 5. 9. 2026. | 5. 9. 2026 | Zmena mena = nový wordmark; ikona môže ostať ako značka nezávislá od slova (§6.2). | `ARCH-H/docs/brand-assets.json` („hriech-original.png: Source: original pink sculptural hriech logo supplied by Adam Rudavsky on 2026-09-05“; „hriech-icon.png: … derived EXACTLY from the round pink dot over the letter i in the supplied hriech logo“) |

---

## 5. Chronológia rozhodnutí

| Dátum | Rozhodnutie | Zdroj |
|---|---|---|
| 2026-01-25 | Adam formuluje jadro kritiky Kliku v Discorde (po odchode Dávida „yapping o AI“, defenzívny rámec, chýba praktické využitie); Martin Hodás pripúšťa, že sú „skôr skeptici“. | `MK/09 Discord thread.md:32–76, 223–249`; H1:176–181 |
| 2026-05-21 | Vzniká Netopier: „sledovanie internetu, hlavne politikov“; skener NR SR, RSS/API agregácia SK/EÚ/svet, dezinfo weby, politici na sociálnych sieťach; motív „médiá mi furt klamú“. | korpus p-d396a1315c87dd053ba3629a, p-5ac6a7bf60c351a3fc1e25e2; `core/01_pribeh/kronika.md:198` |
| 2026-05-30 | Stavať od zdrojov (NRSR ako prvý, ingest Denníka N), nie od kokpitu; verejný hlas „nasratý analytik, nefiltrovaný, ale objektívny“; motív „nemám páku“. | korpus n=1218, n=1221; C1:334, 512 |
| 2026-06-05/06 | Scoring podľa sledovaných tém; web je preview databázy; notifikácie; Polymarket ako overovanie hypotéz. | korpus n=1251, n=1254 |
| 2026-06-15/17 | „jebem na web, pojdeme cez masivnu databazu“ (Supabase); Netopier dostane root a vlastný GitHub. | C1:515 (E:5741); korpus n=1333 |
| 2026-06-16 | Facebook sa nedá spoľahlivo sledovať: „budeme bez facebooku“. | korpus n=1303 |
| 2026-06-18/19 | v0 automatizácie: RSS ingest každých 30 min, morning brief („veľa vecí, ktoré nepotrebujem čítať“), actor radar s NRSR a YouTube. | rollout 2026-06-19T12-53-54-8lz0; M1:499 |
| 2026-06-21 | Zámer: nie fact-check, ale línia politikov v čase; Demagog.sk pod úrovňou Netopiera (30. 6.); stiahnuť prepisy 5 epizód Kliku a skladať obžalobu médií; MpM Denníka N ako backbone. | korpus n=2066, n=2068, n=2238, n=2243, n=2244; n=2878 |
| 2026-06-22/23 | Dia session: obžalobná teória „dvoch právd“ (Klik); prvé „hriech“ ako kategória (anotácie DN newslettera); pracovný tok rant → fakty → devulgarizácia → publikácia; rozsah možno 30 SK zdrojov + tlačovky; xvadur_watchdog na GitHub. | `MK/10 Dia brief.md:4–16`; `R/Dôvera médií.md:38`; korpus n=2289, n=2269 |
| 2026-06-28/30 | Automatizácie v Codexe vypnuté; RSS ingest cez launchd; Netopier = „slovenský OSINT ako OSS produkt“ (prvá formulácia 30. 6.). | C1:524, 572, 729 |
| 2026-07-01 | Ústavný súd SR spustil chatbota (RAG nad rozhodnutiami, dodávateľ česká firma): Adam ho označil za „strasny gamechanger“ a precedens, že dáta existujú („existujú dáta a my vieme zistiť, odkiaľ“); Juro chatbot nad NR SR ako vzor RAG pre Netopier („obycajny rag nad verejnymi nrsr.. to iste ako dobuducna chcem urobit netopier“). | korpus n=2498, n=2499, n=2504, n=2522 |
| 2026-07-02/03 | Mediálna kritika ako línia: „ja začnem dnes“; „považujem to za hriech, lebo nelegálne to nie je“. | D2:120, 278 ([LIS] L415, L461, L2830); `hriech/STATUS.md:10` |
| 2026-07-12 | Cieľová predstava Netopiera: RSS → radar topic → scoring → paralelná syntéza → event calendar → Polymarket okno; RSS rozdeliť SK/EÚ/USA/Čína. | C1:573 (E:13405–13459) |
| 2026-07-27/28 | Netopier preč zo Supabase, lokálne; trojvrstvový systém s Polymarketom ako jadrom; „od zajtra systematicky píšem“. | C2:350; korpus p-ed6cb887c6bdfe2cea453e89; D2:281 |
| 2026-07-29 | Atomic-claim metóda zamietnutá; snapshot korpusu 334 jednotiek / 717 332 slov; „Nejsom dezinfoscéna a nejsom ani mainstream“. | `R/CURRENT_EVIDENCE.md:3–8, 149–152`; korpus n=3560 |
| 2026-07-30 | Denný publikačný model (Daily Voice, 7 dní, mix 50/30/20, „hnev je zachytávacia vrstva“); Reaction docket v0.1; Mapa obžaloby C0–C13; najbližší dôkazový krok C0 (50 Trump článkov); commit c0ba356. | `R/DAILY_VOICE_LAUNCH_2026-07-30.md`; `R/REACTION_DOCKET_V0_1.md`; `R/MAINSTREAM_MEDIA_INDICTMENT_MAP_2026-07-30.md:67–72, 584–597` |
| 2026-07-31 | Tri piliere: Jakub = biznis, Netopier = výskum a „externá inteligencia“, xvadur_mac = počítač. | korpus p-38186b294144470264f8bfa9 |
| 2026-08-03 | Definícia hriechu (napraviteľné zlyhanie, nie obžaloba); hook `hriech:` s artefaktom na GitHube; Netopier okrem monitoringu zbiera evidence; substack skill. | korpus p-f56166d8f8be56ab0056ff9d, p-38439986acd83e0641a53eeb, p-5a962aef569c612ae7bdfbb0 |
| 2026-08-04/05 | Brand Trepete/trepomer, logo na deploy; portfólio: netopier = politika, netrep = sociálne, adam.xvadur, xvadur.com, broker jakub. | korpus n=4381, n=4392, n=4533 |
| 2026-08-10 | Chce byť influencer a mať distribúciu (Substack denne, videá). | korpus p-44e307e285258dc0ac3640bd, p-dc73779d0b4fe3ee9102731a |
| 2026-08-14 | Money Talk 114: interný spis obžaloby, nepublikovať bez kontroly zvuku. | `MK/23:1–11, 286–305` |
| 2026-08-15 | Denník N: žalovať portfólio, nie článok; primárny artefakt je autorský newsletter, mail redakcii až následné podanie; os C14; hooky odstrániť. | `R/Denník N … sourcebook:16–26, 763–769`; D2:283; C2:355 |
| 2026-08-16/17 | SK Instagram Top 200: Heepsy + Apify, 201 profilov, dve poradia (followeri vs reálna pozornosť); CSV v `netopier/docs/research/sk-instagram-top-200/` (po zmazaní v0 nenájdené). | korpus n=5289, n=5408; rollout summary 2026-08-17T18-45-05-MxfW |
| 2026-08-19 | List redakcii Denníka N odoslaný; odpoveď neprišla. | `core/07_texty/zasobnik.md:37` |
| 2026-08-26/29 | Sulík–Barami ako integrovaný proof case v Netopieri; article master 7 363 slov; Hugging Face test opravuje Adamovu intuíciu. | rollout 2026-08-26T04-56-16-4ysz; `R/HUGGING_FACE…:54–69` |
| 2026-08-28 | Pozícia týždenného textu: „verejný vyšetrovateľ mechanizmu“; diferencovať metódou, nie témou. | `R/SLOVAK_SUBSTACK_FIELD_AND_DIFFERENTIATION_ANALYSIS_2026-08-28.md:254–333` |
| 2026-08-30 | Teardown Minúty po minúte a HotInfo; v0 = nevydarený pokus, v2 nanovo z OSS („pičungy zachováme“); týždenný rytmus namiesto denného, 8 tém do 25. 10.; „ja si chcem singlehandedly nahradiť redakciu Denníka N“; Netopier = slovenský OSINT ako OSS produkt + spravodajský tool. | `netopier/STATUS.md:14` [A]; `R/NETOPIER_CONTENT_CALENDAR:1–47`; korpus n=6450–6466 |
| 2026-08-31 | HotInfo je to, čím má byť Netopier: adaptovať. | korpus n=6469–6471 |
| 2026-09-01 | Genéza Hriechu: Kyseľ/Blaha → CRZ → Mediaboard (58 min podľa draftu v3:15; „7 min“ iba v AI extrakcii C3:22); Netopier ako stroj, ktorý číta štát; „z redakcií sa stali podcastové domy“; AI autorstvo sa nemaskuje, robí sa kvalitným; angličtina nie je medzikrok; písanie článkov musí byť systém; mapa redakcií ako prvý tab. | korpus p-0e43574e027f4025caa2f018, p-80e2683ef8b06d80ebbc947c, n=6478 / p-23c0a24338a007a8211cd47b, n=6479 / p-f63bde736e2a513bce784aba, n=6619; `MK/24:25–38`; `netopier/STATUS.md:15` [A]; `hriech/STATUS.md:10` [A] |
| 2026-09-02/03 | Netopier v2 (Miniflux, Postgres/pgvector, FastEmbed, FastAPI) a Build 2A lokálne overené; Hriech = autorstvo a publikácia, Netopier = monitoring a dôkazy; hriech.xvadur.com ako hlavný web mediálnej kritiky, všetko o médiách do Hriechu; cieľ 3 kurátorské články + 20–30 feed správ denne; filter „požiar v Gelnici“; koncept Natural20; Symphony zamietnutý; starý netopier zmazať, v2 na GitHub; Denník N potvrdil Adamov rozbor Kyseľ/Blaha; prípad Redakcie published (approvedBy Adam). | `hriech/STATUS.md:11` [A]; korpus p-916e64f6df221611f7677fd4, p-50919ad51ebd66ef47d5d3d7, n=6750–6752 (p-916e64f6…, p-f47223ea…, p-6c5570ea…), n=6809 / p-1da6f47b5c407768066c3bb2 (Symphony); `ARCH-N/docs/reports/*`; `MK/25`; `hriech/src/content/cases/redakcie.md` |
| 2026-09-04 | Draft 03 v3: nepublikovať bez redakčnej kontroly a oslovenia redakcií; writing engine v Hriechu; Netopier a Hriech existujú samostatne, jeden odpovedá druhému; písanie cez repozitárový proces a Pococka („Codex píše, Adam publikuje“); overenie siedmich tvrdení (4 podložené, 3 nie); Mediaboard v 10 médiách nenájdený; mapa redakcií → štát a influenceri. | `core/07_texty/drafty/03-fico…v3.md:7`; korpus p-337d31d568e1f5a0c9fb5c50, p-9f640b47f9d52fdf91feb34a; `MK/26, 27, 29, 31, 32` |
| 2026-09-05 | Ružový plastický vizuál podľa loga nasadený na hriech.xvadur.com (Adam výslovne autorizoval deploy); discovery verejných dát so stavom prístupu; conversation ledger (Dia → Netopier → článok). | `hriech/STATUS.md:12` [A]; `ARCH-H/docs/VERIFICATION.md:40–53`; `ARCH-N/docs/DISCOVERY.md:15–47`; korpus p-d69d0fb387e66ee782e994ed |
| 2026-09-06/07 | Požiadavka YouTube → časovaný prepis → udalosť bez článku → syntéza (monitoring sa tým nezapína); všetka mediálna kritika do Hriechu, Picung zmazaný; Edison Filmhub chronológia; draft Karol napísaný; runtime Netopiera zastavený (Colima); plán monetizácie (Hriech zadarmo, OSINT ~3 €, články paid); OpenClaw ako backend. | `ARCH-N/docs/DISCOVERY.md:123–137`; korpus p-c790f9e285b3a8223ab26ea6, p-1c15181be6840aef270f3809, p-f6d562dffcf5503a2c7b57b5; `netopier/README.md:8–18`; C3:312 |
| 2026-09-09/11 | ~50 frontendov Netopiera na ranný výber; vybraný koncept Vydanie; 11. 9. zápis ako záväzný smer, výroba 50 webov sa nevykonáva; Linear projekty Hriech a Netopier (XDR-142, 161–177); OpenClaw gateway vypnutý; HLAD.AI zrušený; profil Patriksystems / COR-X cez Meta Ad Library ručne (XDR-195); NET-001 runtime na MacBooku cez SSH blokovaný. | korpus p-c2f7de37c62a5eed802b0ec1, p-58574c7972e5410ab7352456; `ARCH-N/DESIGN.md:3–10`; `ARCH-N/docs/LINEAR_PLAN.md`; `ARCH-N/docs/research/PATRIKSYSTEMS_WEB_SOURCES_2026-09-11.md`; `ARCH-N/work/001-runtime-na-macbooku.md` |
| 2026-09-12 | Klik: syntéza 43 – celosériový verdikt sa nepotvrdil, iba lokálny prípad 404, opakovateľnosť neurčitá, backlog V00–V15 navrhnutý; kontrolný vzorok 394–403 zakázal paušál; Adam odmieta „uhladenú reč“ a trvá: „toto je jeden z nahorsich case“. | `MK/37:55–59`; `MK/43:3–9, 118, 120–165`; korpus p-8f4741ce7ce8b7be15a790dd; rollout 2026-09-12T10-47-41-fEcb |
| 2026-09-14/15 | Hriech a Netopier sa odkladajú „až po revenue“, zatiaľ publikácia na Substacku; personal brand xvadur: konzultácie, publikácie, agenti, systém pre maklérov; „nemám nič publikované, lebo som sa tak rozhodol“ (Jakub prvý). | korpus p-63dfa4e621bb6c86a20965f8, p-1a4d8e15792183ac20e524d6; `core/02_dielo/hriech.md:5`; `core/06_firma/firma.md:132` |
| 2026-09-18 | Netopier presunutý pod hriech (GitHub xvadur/netopier archivovaný); monitoring, OSINT, Event Intelligence Core a writing engine neskôr v hriechu; OpenClaw, opencode, hermes, cursor preč. | `ARCH-N/PRESUN_2026-09-18.md:3–11` [A]; korpus rowid 451 |
| 2026-09-21/22 | Hriech zlúčený s Netopierom pod hriech, „má živý web“; Netopier sleduje zákulisie (World Monitor, CRZ, obstarávania, kataster, štátne dáta); seizmograf → pulz/EKG; štátny dashboard; „Kto bude ten kurátor?“. | Linear XDR-229, XDR-232; korpus n=8292, n=8273 (chatgpt 21.–22. 9.); rowid 117 |
| 2026-09-23 | xvadur_workspace ako jediný pracovný priestor (Claude Code); dáta o realitnom trhu do Netopiera ako analytickej vrstvy; Netopier má sledovať zákulisné pohyby, nie iba médiá. | korpus p-1383450b4d59a5478b05f9f6, p-24643e8ea02ee3e2a5bc3086, n=8327 |
| 2026-09-24 | Hriech je publikačná vrstva Netopiera, Netopier je xvadur OSINT engine; frontend sa bude prerábať; nález Mediaboard zverejnil cudzí IG účet „Nasratý občan“ z Adamových podkladov (F21); hriechy Adam spúšťa z aplikácie Podcasty (B14). | korpus p-d6f1208f8378dec99f2d9904, n=8343 |
| 2026-09-25 | Hriech je XVADUR spravodajská služba (Hriech frontend, Netopier backend); projekt vyčistený od minulých verzií, v0 zmazaný, mock Vydanie archivovaný; Hriech dostane redizajn; zoznam modulov (mapa s vrstvami, štátny dashboard, volebná kalkulačka, prieskumy, kalendár a odpočet, minúta po minúte, EKG, ranking redakcií, Chronos, demografia, Opus Major); Ground News maximalizovať; naming Hriech/Netopier „veľmi otázny“; Paperclip ako redakcia (nápad) a zároveň pozastavený; skill /hriech; Fiki klipovanie ako tréning. | `hriech/STATUS.md:13–14` [A]; `netopier/STATUS.md:17` [A]; korpus p-0152fae1072a0ef7e7286b51, p-5a16cf3b1927eb6fb507bf2f, p-8ea14a6969a33e12dcfb1500, p-aa0e80e2bbc44ddafd48fa4c, n=8012, n=8354 |
| 2026-09-26 | Nový článok má research aj draft v `research/<téma>/` v repozitári Hriechu; Zeitgeber ako článok cez Vianoce (XDR-197); cloudový zber ADR-008 ako návrh (14 299 záznamov lokálne), nasadenie čaká na Workers Paid a pokyn; míľniky Infra 31. 10., Živé 30. 11., Vianoce 31. 12.; Fiki ako prvý tenant obsahu; Paperclip „ešte nič nerob“ (XDR-226). | `hriech/STATUS.md:9, 17` [A]; `netopier/docs/DECISIONS.md` ADR-008; `_claude/handoff/2026-09-26-1530.md`, `2026-09-26-2355.md`; Linear XDR-197, XDR-258, XDR-226 |
| 2026-09-27 | „budujeme ai redakciu a investigativny osint tool“; referencie openclaw.sk seizmograf, Natural20, Minúta po minúte, slovenské a americké redakcie (NYT print), Ground News; doména hriech.xvadur, meno sa zmení pri builde; minúta nemôže meškať pol hodinu; GitHub Actions netreba, zber lokálne, web zobrazuje; funkcie redakcie: kalendár vopred, reakcia v minútach (Danko 13:50), filter relevancie, sledované témy a paralelný research, prepisy Ficových tlačoviek do DB, dezinfo monitoring, FB/IG 2× denne, aktivita redakcií a autorov, sentiment/vata/nepresnosti, worldview; „my sme úplne iné zviera“. | korpus p-a4db2135e4ff282fa744d6f8, p-5c4e1f99e96ee2bc4b071b06, p-d66c017da8cc08e3a5755593, n=8549 |

---

## 6. Otvorené a rozpory

1. **Priorita: „až po revenue“ (14. 9.) vs spravodajská služba ako projekt s termínmi (25.–27. 9.).** Adam 14. 9.: „netopier a hriech […] az potom co dosiahnem an revenue, zatial to ostane ako publikacia na substack“ (p-63dfa4e621bb6c86a20965f8); 25.–27. 9. Hriech je „XVADUR spravodajská služba“ s 12 modulmi, redizajnom a míľnikmi do 30. 11. Jadro (`core/02_dielo/hriech.md:5`, `core/06_firma/firma.md:132`) stále uvádza 14. 9. ako platný stav. Ktoré rozhodnutie platí a v akom poradí voči xvadur.com, Lucii, Jakubovi a BrokerOS, treba zapísať do jadra a STATUS.
2. **Meno a značka.** Hriech „sa bude este menit ked podjeme na build“ (27. 9.); 25. 9. „hriech a netopier je este velmi otazny naming“, Hriech je „punchy, ale take moc vyzivave“; HLAD.AI zrušený; Trepete opustené; latinská nomenklatúra nerozhodnutá. Zároveň pamäť: „Identita: zdravotník, nie policajt“ (MEMORY.md), kým celý dôkazový aparát používa „obžaloba“, „hriech“, „obvinenie“, „spis“ (memory `identita-zdravotnik-nie-policajt.md`, 26. 9. 2026: „ja som policajt? sak ja som zdravotník“). Register a značka nemajú rovnaký register jazyka. Logo: `ARCH-H/docs/brand-assets.json` dokladá, že wordmark aj ikona sú odvodené z písmen slova „hriech“ („hriech-original.png: Source: original pink sculptural hriech logo supplied by Adam Rudavsky on 2026-09-05“; „hriech-icon.png: Create the favicon app icon derived EXACTLY from the round pink dot over the letter i in the supplied hriech logo“) – zmena mena = nový wordmark; ikona (bodka s dvoma drážkami) môže ostať ako značka nezávislá od slova; úloha pre Adama: dodať nový wordmark alebo potvrdiť Hriech (medzery `data/znacka.json` `logo_provenance`).
3. **Kanál publikácie.** hriech.xvadur.com (27. 9.) vs Substack XVADUR (14. 9.; nová publikácia alebo premenovanie `sestramd`, 3 followeri) vs xvadur.com (kalendár 30. 8.); 7. 7. Adam Substack odmietol pre vlastné riešenie, 28. 8. chcel publikovať aj tam. Kde vychádza text a či paralelne, nie je rozhodnuté; publikované je 0 textov.
4. **Tempo a beh: minúta „nemôže meškať pol hodinu“ + „celé lokálne bez GitHub Actions“ (27. 9.) vs runtime nebeží od 7. 9., Python 3.12 na Macu chýba, cloudový zber čaká na Workers Paid (XDR-258, štítok Adam), ADR-008 nepotvrdený, cron RSS je */30.** Ak má Minúta nemeškať a Mac spí, live wire nie je možný; treba rozhodnúť runtime (lokálny démon vs Worker) a napojiť Python vrstvu (embeddingy, príbehy, udalosti) na D1 namiesto Minifluxu (ADR-002 a ADR-008 platia súčasne).
5. **Tri rôzne rytmy výstupu, žiadny nebežal.** Denný hlas 30–45 min denne (30. 7.), týždenný článok 45–60 min týždenne (30. 8.), reakčný v minútach + 20–30 správ denne (3. 9., 27. 9.). Čo je jednotka výstupu Hriechu teraz (wire karta, týždenný článok, klip), a či verejný wire smie ísť von bez Adama (PRODUCT_HYPOTHESIS vyžaduje ratifikáciu každej publikácie; 8. 9. Adam: „keby som mal systém, ktorý publikuje za mňa“).
6. **Mix 50/30/20 vs kalendár, v ktorom je všetkých 8 tém mediálna kritika**; operator proof a vlastné modely nemajú vyhradené miesto. Zeitgeber (prvý článok novej éry) nie je o médiách ani o štáte – či Hriech ostáva mediálnou kritikou a čítaním štátu, alebo je širšou autorskou publikáciou XVADUR, materiál neuzatvára.
7. **Scoring podľa Adamovej politickej pozície (29. 5.) vs tri oddelené skóre (3. 9.)**; Adam neratifikoval, ktorá verzia platí; „nefiltrovaný, ale objektívny“ a „vlastný názor, ktorému sa môže všetko podriadiť“ (27. 9.) sa musia zmestiť do jedného mechanizmu, ktorý nerobí to, čo sa vyčíta Denníku N.
8. **Ako merať „vatu“, „zbytočnosť“, „sentiment“ a skladať „worldview“ (27. 9.)**: žiadna definícia, žiadny kódovník; atomic-claim postup zamietnutý pre nízku zhodu (CURRENT_EVIDENCE:149–152); Adam nechce sedieť pri posudzovaní výrokov („nechcem pritom sedieť“).
9. **Klik.** Prijíma Adam výsledok syntézy 43 (iba lokálny prípad 404, opakovateľnosť neurčitá), alebo trvá na silnej téze z dokumentu 36 („povrchný pesimizmus bez praxe“)? Validačný backlog V00–V15 nevykonaný; žiadny Klik segment nie je audio/speaker verified; NotebookLM atribúcia „Andrej“ vs Ondrej neopravená; dve paralelné metodiky (flagy + case files jún–júl vs corpus 50 september) nezlúčené; dosah Kliku `needs source`.
10. **Draft 03 „Fico nemusí čítať vaše články“.** Nesúlad CRZ detail 0,00 € vs PDF 48 073,32 €; chýbajúca zmluva 16. 8. 2025 – 15. 8. 2026; rešerš v médiách nulová (SME blokovalo prístup), treba zopakovať; redakcie neoslovené (XDR-162); nález už zverejnil cudzí IG účet „Nasratý občan“ z Adamových podkladov, nie Adam (F21) – či Hriech nález cituje ako svoj prvý verejný výstup alebo ako sekundárne zverejnenie a či to mení stratégiu prvého článku, nezapísané; v1 a v2 draftu chýbajú v poradku.
11. **Denník N podanie.** List 19. 8. bez odpovede; 15 sekcií „Adamov komentár“ v sourcebooku prázdnych; 25 otázok neposlané; newsletter „Ako médiá vyrábajú význam AI — a potom ho merajú“ nevznikol; verejné použitie súkromnej Discord diskusie (E12) nerozhodnuté.
12. **Facebook a Telegram politikov.** 16. 6. „budeme bez facebooku“ vs 27. 9. „prieksum sledovanych ludi na facebooku ci instagrame“ 2× denne; NewsWhip, Apify, Meta Content Library neotestované; Meta obmedzuje automatizovaný zber; Meta token pre person resolution chýba; Telegram scraping bez rozhodnutia o podmienkach.
13. **Hranice „stroja, ktorý číta štát“.** Dostupnosť, licencie a technické kontrakty RPVS, ORSR, RÚZ, justície neoverené; podlimitné obstarávania (vestník ÚVO) bez API; vlastníci parciel nie sú otvorené dáta; kataster potrebuje právny prehľad a Adamov výber oblastí; World Monitor živé dáta 99,99 $/mes. áno/nie (XDR-258, do 3. 10.).
14. **Writing engine.** 4. 9. nerozhodnuté, či patrí do Hriechu alebo Netopiera; PRESUN 18. 9. ho radí do Netopiera „neskôr“; Adamov stav z 22. 9. uvádza CLI `netopier-write` s hard gates, aktuálny STATUS ho nespomína; repozitár hriech nemá `.agents/skills`; Codex vs Claude Code a umiestnenie AGENTS.md pre Hriech nevyriešené.
15. **Kto obsluhuje redakciu.** Codex → OpenClaw (preč 18. 9.) → Claude Code workspace → Paperclip s rolami (XDR-226, Čaká do 3. 10.) alebo pozastaviť; agent `hriech` cez hlavnú session; nerozhodnuté.
16. **Frontend a stack modulov.** Vydanie archivované; ružový vizuál live a „uzamknutý“; XDR-230 hovorí o šablóne XVADUR s ružovou témou; STACK.md: spoločný repozitár webov nerozhodnutý, hosting Python backendu otvorený; poradie modulov (mapa s vrstvami, štátny dashboard, minúta, voľby, kalendár, EKG, rebríček, Chronos, demografia, Opus Major) neurčené.
17. **Kto je čitateľ.** Netopier PRODUCT.md: „Presný cieľový segment zostáva otvorený“; Hriech PRODUCT.md: „čitatelia verejného diania“; Adam 25. 9. „ekosystem“ a „komunita“, 26. 9. „mam byt cool“, ale aj „osveta“; bez segmentu sa nedá rozhodnúť modul-first vs text-first.
18. **Verejný jazyk a tvár.** 6. 8. „xvadur bude zatial bez tvare“; 25. 9. anonymný účet a „shadow veci“ popri osobnom brande s tvárou; Adam o Fikim „príliš agresívny“, hoci sám rantuje rovnako; hranica medzi interným ostrým jazykom a verejným hlasom nie je operatívne určená; sebakritika k forme („adolescent“) v AI syntézach uznaná, či ju Adam prijal, zdroje nehovoria. Anonymné účty na evidenciu (F22): Threads „Strašne ma nasralo“ (korpus n=3444, 28. 7. 2026), účty fikinec.ko / fiki_necko / fikin.ecko na Instagrame, Threads, YouTube a TikToku („mam 3 instagramy, fiki_necko, fikinec.ko, fikin.ecko / threads, fikinec.ko, fikinečko / yotube fikiencko1, fikinecko / tiktok fikinec.ko“, n=8452, 26. 9. 2026), faceless TikTok kanál (n=225, 16. 9.).
19. **Monetizácia.** 7.–8. 9. Hriech zadarmo, OSINT ~3 €, články paid; firma.md „Vydanie a Hriech zdarma“; 24. 9. „ja tým vôbec nejdem zarábať“; ústava: „prácu nemeraj peniazmi“. Neratifikované.
20. **Ratifikácia AI syntéz.** Content calendar, Reaction docket, Daily Voice, PRODUCT_HYPOTHESIS, DISCOVERY, STATE_READING brief, teardowny sú AI dokumenty postavené na Adamových slovách; viaceré „rozhodnutia“ v STATUS majú [A], ale bez datovaného Adamovho výroku v korpuse (napr. „Hriech = autorstvo, Netopier = monitoring“ má v hriech/STATUS dátum 3. 9., v netopier/STATUS 7. 9.); formulácie „Žiadny objav nesmie zomrieť ako jeden článok“ a „Problém nie je informácia, ale exekúcia“ majú nejasné autorstvo. Do verejných textov iba po ratifikácii.
21. **Benchmarkové labely Netopiera v2** (22 titulkov, 5 párov, EU sankcie „suggested“) čakajú na Adamovu ratifikáciu od 3. 9.; bez nej je prah 0,83 provizórny.
22. **Linear.** Staré úlohy projektov Hriech a Netopier z 10. 9. (XDR-161–165, 166–177) ostávajú Pripravené/Backlog bez míľnikov novej štruktúry; XDR-142 Canceled; XDR-228 „Na overenie“ bez bežiaceho runtime; nezosúladené s XDR-228–232.
23. **Poradok archívu.** `hriech/private/` (1 016 súborov, manifest zo 6. 9.) sa nenašiel celý: chýbajú v1 a v2 draftu 03, PICUNG.md, raw prepisy a jsonl korpusy Kliku, raw prípadu Lodová; „index copy.md“ je novšia, pre Hriech upravená verzia (relatívne odkazy; „Aktuálny vstup pre články a ich podklady je [pracovný stôl Hriechu](../../README.md)... Odkazy na miestne analýzy sú opravené pre Hriech“; doplnené riadky 23–34: Money Talk, Kyseľ Blaha, Overenie siedmich tvrdení…; odkazuje na neexistujúci ../PICUNG.md), index.md končí pri 22 – rozhodnutie: určiť „index copy.md“ za kanonický (premenovať na index.md, starý ako index-obsidian-2026-08.md), doplniť 35–43 a opraviť odkaz na PICUNG.md; po vykonaní zmeniť na „rozhodnuté“; dataset SK Instagram Top 200 (17. 8., 201 profilov, `candidate-profiles-2026-08-17.csv`) po zmazaní v0 nenájdený – obnoviť z rollout summary / Time Machine (D12); xvadur_watchdog na zozname na zmazanie, hoci je jediná kópia indexu AI segmentov.
24. **Vzťah obsahu (Fiki klipy, anonymný účet) k Hriechu.** Fiki korpus je v Netopieri, klipy v projekte obsah; Sulík–Barami je téma kalendára aj klipovaný tenant („mal som sympatie k sulikovy, ale zial.. nemam“ 6. 9. vs predplatné a súhlas 24. 9.); ktorý projekt vlastní reakčné klipy na Fica, nie je určené.
25. **Citlivé a neoverené tvrdenia v surových vstupoch.** Anotácie „Dôvera médií“ z 23. 6. (bulvár vlastní Haščák, Kostolný ako zamestnanec Šimečku, výklad metodiky DNR, migračné pasáže), geopolitické tézy z 13.–24. 9. (Fico ako „agent“, doom naratív ako dizajn, Bernays, sionisti) – AI ich označila za neoverené alebo citlivé; pred akýmkoľvek použitím overiť alebo vypustiť; či patria do redakčnej línie alebo iba do interného worldview, nerozhodnuté. Sem patrí aj „Zeitgeist ako worldview vs dôkazová línia Hriechu“: Zeitgeist (4 filmy), Michael Moore, Predictive History a John Harris sú podľa Adama základ jeho worldview a cieľ klipovania a indexovania (n=8048, n=8101, n=5799, n=5586) – či sa ich tézy vedú iba ako `hypothesis` (P28) v E1, alebo ako redakčná línia, je rozhodnutie Adama.
26. **Karol (draft 04)**: súhlas alebo anonymizácia, zdravotná časová os, vyjadrenie nemocnice; Adam text autorsky neschválil.
27. **Rozpory v Adamovom postoji k overovaniu.** „je úplne nepodstatné, že to neni overené“ (svetonazor.md:104, pri dejinách) vs celá metóda Hriechu stojí na overovaní; „Ja sa nemýlim“ vs „rád by som sa mýlil“ (svetonazor.md:195–199); Adam 6. 9. varuje, že staršie koncepty nie sú záväzné („ak budes ksumat co som chcel a co sa nestalo, tak urcit enetrafis co chcem teraz“) – tento register preto uvádza pri každej položke stav a dátum, nie záväznosť.
28. **Rozpory v číslach.** „~550 ľudí v redakciách“ bez zdroja; „každé slovo videli minimálne 3 ľudia“ (podpísaní dvaja); „600 AI dní“; tokeny 7,11 / 10 / 16,9 mld.; Kompresia obžaloby počíta 8 mechanizmov, „psychologická hygiena“ hovorí 6 a vymenuje 7 (MK/20). Čas nálezu Mediaboardu: draft v3 „58 minút“ (v3:15), AI extrakcia C3:22 „7 minút“ (bez opory), Adam 24. 9. „trvalo mi to dve minúty“ (n=8343). Pred verejným použitím overiť.
29. **Podcasty ako zdroj a Telegram ako kanál.** Register do auditu 27. 9. nemal audio podcasty (Apple Podcasts / Spotify RSS) ako triedu zdrojov ani Telegram ako notifikačný kanál, hoci obe sú Adamove opísané praxe (B14 a B18 doplnenia). Rozhodnutie Adama: zoznam relácií SK redakcií pre `podcast-rss` a či Telegram bot vzniká bez OpenClaw (token, kde beží).
30. **Regionálne zdroje a Ukrajina.** CZ/PL/HU ako `regionalne` (D19), Ukrajina ako samostatný prúd briefing roomu (F7) a komparatívny test SK vs PL/CZ (C13) – ktoré kanály, v akom poradí a či pred míľnikom Živé, neurčené.
31. **Dvojstrojová topológia.** Mac mini vs MacBook worker cez SSH (NET-001, `work/` front) – zahodené alebo otvorené; kto beží plánovač (B21).


---

## 7. Doplnenia a opravy z kritiky (27. 9. 2026, nezapracované do textu vyššie)

Kritik úplnosti a overovateľ citátov našli tieto veci. Oprava textu registra nedobehla (limit session), preto sú tu ako záväzné poznámky: pri čítaní registra platia tieto opravy pred textom vyššie.

### Chýbajúce funkcie a nesprávne stavy (major)

- Audio podcasty (Apple Podcasts/Spotify RSS) chýbajú ako trieda zdrojov; register B14/D14 stavia prepisy iba na YouTube. Adam však hriechy najčastejšie spúšťa z aplikácie Podcasty (Index, Klik, Dobré ráno, Vizita, JOJ 24 podcast, Aréna s Dibákovou, 30tnik) a viaceré relácie nemajú YouTube verziu.
- F21 nesprávne pripisuje publikáciu: „Nasratý občan“ nie je Adamov účet, ale cudzí aktivistický IG účet, ktorému Adam poslal screenshoty a faktúru z CRZ a ktorý nález zverejnil. Register (F21, §6.10) to formuluje ako „Adam publikoval nález... na Instagramovom účte Nasratý občan“, čo vedie k zlému záveru o kanáli, proveniencii a práve na opravu.
- Kritika kritikov chýba ako funkcia aj princíp: MK/03 (Lívia Plaváková a Denník N) register necituje, hoci zakladá pravidlo, že kritika mainstreamu z nedezinfo priestoru (Lívia, Fiki, Adam sám) prechádza tou istou dôkazovou schémou, inak sa stáva lacným komentárom.
- Forenzné case files MK/13–17 a MK/22 register necituje, čím chýbajú konkrétne flagy a hodnotiace osi, ktoré C17/C21 iba všeobecne spomínajú, a chýbajú doložené kontrolné príklady pre P17 (kde Klik hovorí korektne).
- Register D12/D13/C11 podceňuje stav: metóda čítania Meta Ad Library a profilovania influencera je už postavená a zdokumentovaná (PATRIKSYSTEMS, 11. 9.), bez API tokenu, s presnými poľami a hranicami; archívny dokument register necituje a C11 uvádza „návrh“.
- Dataset „SK Instagram Top 200“ (16.–17. 8.) je v registri D12 vedený ako návrh zo 4. 9., hoci bol postavený (Heepsy + Apify, 201 profilov, dve poradia) a jeho súbory po zmazaní v0 nie sú vo workspace dohľadateľné.
- Regionálne zdroje (české, poľské, maďarské) a sledovanie vojny na Ukrajine ako samostatný prúd v registri chýbajú; rovnako komparatívny audit „ako o AI informujú v Poľsku“ (SK vs PL/CZ rámcovanie).
- Notifikačný kanál pre Adama je podľa jeho slov Telegram (bot na telefóne, always-on), nie macOS notifikácia ani mail; register B18 uvádza „push, mail“, medzery navrhujú `osascript`/mail. Adam sa o dôležitej udalosti mimo Macu nedozvie.
- Zeitgeist (4 filmy), Michael Moore, Predictive History a John Harris sú podľa Adama základ jeho worldview a zároveň cieľ klipovania a indexovania, ale register ich nikde nemenuje (E1, A7, F9, F10) ani nenastavuje dôkazovú hranicu.
- OSINT metóda „kto lajkol reklamu“ (profilovanie ľudí, ktorí reagujú na politickú/komerčnú reklamu, a ich sledovanie) je Adamova opísaná prax, register ju neuvádza a nestanovuje hranicu voči P46/P47 (súkromné osoby).
- Reaction docket (A6) je zmrazený na R001–R019 z 30. 7., ale Adam v auguste–septembri vyprodukoval ďalšie konkrétne leady, ktoré register ani medzery (seed R001–R019) nezachytávajú: platená epizóda Indexu s Evou Frantovou, Bežák/Newsfilter o manifestácii, Dobré ráno sobota (Hanzelová/Filo), Vízia 2040 v Indexe, JOJ 24 podcast/Vizita/Aréna z 28.–29. 7.
- T7: tvrdenie „Adam ich našiel za 7 minút“ nemá oporu; draft hovorí o 58 minútach.
- B16: nesprávne id promptu. „ano a cielom netopiera verejneho bude mat za den aspon 3 kuratoske clanky a 20 az 30 feed sprav“ nie je p-337d…
- Odkazy „C3:NNNN“ s číslom nad 667 neukazujú na dávku C3 (má 667 riadkov); sú to čísla z korpusu (n) alebo z raw exportu. Týka sa §0 C3:6531, P16 C3:6178, P37 C3:1320–1329, B12 C3:4274, B16 C3:4283, T9 C3:4579, D5 C3:1257–1290, D13 C3:4257, G12 C3:9001, C3:312/604.

### Menšie doplnenia a chyby citácií (minor)

- Register nezachytáva Adamovu funkciu „publikum ako senzor“: faceless TikTok kanál na monitoring nálad a viacúčtová infra na lacné testovanie hypotéz na publiku so spätnou väzbou; F10 to redukuje na „2 posty denne na 6 účtoch“.
- Zdroje pre kontext a krížovú kontrolu, ktoré Adam menoval od mája (Wikipedia, TASR, Reuters, Eurobarometer), v registri chýbajú: D10 uvádza World Bank/OECD/IMF/UN SDG/GDELT, ale nie Eurobarometer; Wikipedia/Wikidata ako entitný podklad nie je nikde.
- „Stroj, ktorý číta štát“ (D5) vynecháva eurofondy (ITMS) a rozpočet, hoci Adam ich 1. 9. výslovne postavil vedľa hlasovaní ako to, čo médiá nečítajú; register T9 cituje z toho istého promptu iba vetu o podcastových domoch.
- Téza o preklade ako degradácii významu (redakcia preloží článok z Guardianu a posunie významy) nie je v registri ani ako téza, ani ako funkcia; C7 porovnáva iba záznam ↔ podanie.
- Dia browser ako zdroj prepisov videí (drží celý transkript sledovaného videa) a Instagram „uložené/reposty“ ako Adamov hlavný prísun podnetov chýbajú v D14/A6/E11; register capture vrstvu obmedzuje na Dia chaty, Codex a Claude.
- Higgsfield (AI video/obraz) chce Adam napojiť na spravodajstvo a kampane; register F20 hovorí len o AI obrázkoch všeobecne a nestanovuje hranicu pre generované video vo výstupoch redakcie.
- Precedens „štát používa AI“ – Ústavný súd SR spustil chatbota (RAG nad rozhodnutiami, dodávateľ česká firma) – Adam ho 1. 7. označil za paradigm shift a dôkaz, že dáta existujú; register D6 spomína ÚS iba ako alert, T7 (štát číta médiá strojovo) ho nevyužíva. Podobne Juro chatbot nad NR SR ako vzor RAG je v B19 bez odkazu na ÚS.
- Register B21 predpokladá jeden Mac; archív a korpus ukazujú plánovanú dvojstrojovú topológiu (Mac mini + MacBook ako worker cez SSH, NET-001 blokované 11. 9.) a predchádzajúci systém úloh (work/ front, receipt cez /handoff, `xv status`), ktoré register necituje.
- Archívne dôkazové dokumenty NIGHT_BUILD_REPORT a EVENT_RELATIONS_REPORT register necituje; G11 (definícia hotového) tak nemá konkrétny akceptačný protokol runtime a B6 neuvádza výsledky benchmarku vzťahov.
- Rámec 50 frontendov (9. 9.) obsahuje výberový a akceptačný protokol pre redizajn (brány, ranný výber Adamom, zákaz falošných udalostí), ktorý register §4 spomína iba ako koncept a F17/XDR-230 nemá žiadne kritériá prijatia.
- Register nemá zoznam referenčných produktov úplný: trumptracker.org (Adamov „newstracker“), lawtracker, OSS algoritmus X ako vzor feedu, AI Daily Brief ako pozitívny kontrolný formát a Kapital noviny ako dizajnový vzor chýbajú; C20 kontrolné korpusy uvádzajú iba mAIndset/Link/Tvrdoň.
- C9/C10 nemajú metriku dosahu v čase: Adam má baseline dezinfo Telegramu z januára 2026 a chce merať rast publika a kanálov (YouTube Data API, Social Blade), register meria iba pokrytie tém.
- index.md a „index copy.md“ v priečinku mediálnej kritiky: register §6.23 uvádza „kanonický index neurčený“, hoci diff ukazuje, že „index copy.md“ je novšia, pre Hriech upravená verzia (relatívne odkazy, doplnené 23–34) a odkazuje na neexistujúci ../PICUNG.md.
- Kybernetická bezpečnosť: register §4 vedie „Cybersecurity sekciu“ (13. 8.) ako „návrh, nepokračovalo“, ale Adam ju 21.–22. 9. vrátil ako mediálnu tézu (bezpečnosť ako atmosféra bez mechanizmu) a explainer potrebu; F15 nemá seed tém.
- Logo a značka: brand-assets.json dokladá, že vizuálna identita (wordmark, ikona z bodky nad i) je odvodená z písmen slova „hriech“, ktoré sa má podľa Adama pri builde zmeniť; register §6.2 rieši meno, nie dôsledok pre logo, a archívny súbor necituje.
- P64: zdroj „rollout 2026-09-12T10-47-41-fEcb:50–52“ neexistuje a citát má v rozpore s pravidlom registra opravené preklepy.
- P67: „H1:634“ nepodporuje „Identita: zdravotník, nie policajt“; H1 tento výrok neobsahuje.
- §0: dva citáty z 27. 9. nie sú doslovné.
- T12: citát „ten jazyk, ktorý je strašne perfídny, taký úplne slizký“ je skrátený bez označenia vynechania.
- T9: „mas lupu nad statom, kebyze chces, ale ty si novinar a budujes si socialny status na facebookoch“ nie je v žiadnom z uvedených n=6514, 6531, 6539.
- B18: n=7985 má nesprávny dátum.
- C4: „ja chcem merat zbytocnost.. z ohladom na zavaznosti ktore sa deju“ nie je v n=4392.
- F17: citát „Slovenský publikačný web pod značkou XVADUR…“ nie je na uvedených miestach.
- P17: citát z MK/20 je Codexova formulácia, v tabuľke nie je označený ako AI syntéza (iné riadky sú).
- P25 označené „(Adam)“ a P5/P49 bez označenia, hoci draft 03 v3 vznikol s Codexom (prvá osoba v Adamovom hlase).
