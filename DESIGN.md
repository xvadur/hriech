---
name: Hriech
description: Ružový plastický Hriech s čitateľnými publikačnými a dátovými plochami.
colors:
  pink: "#f18fa0"
  blush: "#fbe8ec"
  ink: "#181616"
  muted: "#625457"
  paper: "#fff"
  line: "#dac4c9"
typography:
  display:
    fontFamily: '"Rubik Variable", sans-serif'
    fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  headline:
    fontFamily: '"Rubik Variable", sans-serif'
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  title:
    fontFamily: '"Rubik Variable", sans-serif'
    fontSize: "1.35rem"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  body:
    fontFamily: '"Source Sans 3 Variable", sans-serif'
    fontSize: "18px"
    lineHeight: 1.55
  reading:
    fontFamily: '"Source Sans 3 Variable", sans-serif'
    fontSize: "20px"
    lineHeight: 1.7
  label:
    fontFamily: '"Source Sans 3 Variable", sans-serif'
    fontSize: "16px"
    fontWeight: 650
  record-title:
    fontFamily: '"Rubik Variable", sans-serif'
    fontSize: "19px"
    fontWeight: 700
    letterSpacing: "-0.02em"
rounded:
  reading: "6px"
  field: "10px"
  control: "12px"
  panel: "14px"
  pill: "999px"
spacing:
  "8": "8px"
  "12": "12px"
  "16": "16px"
  "20": "20px"
  "24": "24px"
  "28": "28px"
  "32": "32px"
  "48": "48px"
components:
  button-primary:
    backgroundColor: "{colors.pink}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "11px 20px"
  button-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "11px 20px"
  button-paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "11px 20px"
  filter-chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "7px 19px"
  filter-chip-selected:
    backgroundColor: "{colors.pink}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "7px 19px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "10px 14px"
  navigation-current:
    backgroundColor: "{colors.blush}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 19px"
  map-callout:
    backgroundColor: "{colors.pink}"
    textColor: "{colors.ink}"
    rounded: "22px"
    padding: "25px 25px 20px"
  reading-paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.reading}"
    padding: "42px 64px"
  data-surface:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "28px"
  records:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 24px"
---

# Design System: Hriech

## Overview

**Creative North Star: "Ružový plastický Hriech"**

Vizuálny charakter vychádza zo schváleného obrazového loga: ružový materiál, oblé tvary, tmavé kontúry a odsadený tieň. Rozhranie prenáša túto fyzickosť do ovládania, navigačného výberu a výrazných vstupov do máp. Kompaktná hlavička zachováva logo ako obrazový asset; značka XVADUR zostáva menšia.

Texty majú priamu typografickú hierarchiu a pokojné čítacie plochy. Dlhé články a dátové panely sú biele; publikácie na titulke tvoria otvorené chronologické riadky na svetloružovom podklade. Hustejšie mapové pohľady používajú rovnaké písmo, farby a oblé ovládanie, pričom zdroje, dátumy a stav podkladov zostávajú súčasťou čitateľného obsahu.

**Key Characteristics:**

- Ružový materiál, tmavá kontúra a fyzické stlačenie ovládania.
- Výrazný lokálny Rubik a čitateľný lokálny Source Sans 3.
- Biele plochy dlhého textu a dát, otvorené riadky publikácií.
- Jednostĺpcový mobil a dotykové ciele aspoň 44 px.

Dokument zachytáva implementovaný stav v `src/styles/global.css` a komponentoch `BaseLayout`, `MapCallout`, `PublicationRows`, `ArticleView`, `NewsroomOverview`, `NewsroomPeople`, `NewsroomFinance` a `Icon`. Frontmatter je normatívny záznam primitív; sidecar dopĺňa stavy, tiene a samostatné ukážky. Schválený smer je v `PRODUCT.md` a `docs/design-direction.md`.

## Colors

Paleta má jednu ružovú akcentovú rodinu a teplé neutrálne farby. Presné hodnoty sú vo frontmatteri.

### Primary

- **Ružová — `pink`:** hlavička, primárne tlačidlá, vstup do mapy, vydavateľský uzol a vybraný filter, médium či sekcia.
- **Svetloružová — `blush`:** pozadie webu, aktívna položka hlavnej navigácie, podklad organizačných uzlov a hlavička finančnej tabuľky.

### Neutral

- **Takmer čierna — `ink`:** základný text, kontúry, ostré tiene, deliace čiary publikácií a tmavý variant tlačidla.
- **Tlmený text — `muted`:** perexy zoznamu, dátumy, popisy, zdrojové metadáta a pomocný text.
- **Biela plocha — `paper`:** článok, dátové panely, vstupné polia, nevybrané filtre a svetlý variant tlačidla.
- **Jemná deliaca čiara — `line`:** okraje bielych panelov a vnútorné členenie dát, rolí, zdrojov a tímov.

Lokálne farby hoveru a farebného tieňa tmavého tlačidla zostávajú jeho komponentovými stavmi v sidecare. Ilustračné tónové rampy sidecaru nerozširujú implementovanú paletu o ďalšie tokeny.

## Typography

**Display Font:** Rubik Variable, so sans-serif fallbackom.  
**Body Font:** Source Sans 3 Variable, so sans-serif fallbackom.

Obe rodiny sa importujú z lokálnych balíkov `@fontsource-variable`. Rubik nesie hutné oblé nadpisy; Source Sans 3 drží dlhý text, navigáciu, filtre a podklady. Samostatná monospace rodina sa nepoužíva.

### Hierarchy

- **Display, headline, title:** globálne nadpisové roly sú definované vo frontmatteri. Veľkosť konkrétneho nadpisu sa prispôsobuje čítaniu alebo hustote mapy; nejde o jedinú matematickú stupnicu.
- **Titulok publikácie:** responzívna veľkosť (`clamp(1.7rem, 2.7vw, 2.4rem)`), šírka do 24 znakov, na menšom layoute do 27 znakov. Na úzkom mobile má 28 px.
- **Článkový titulok:** (`clamp(2.3rem, 5vw, 4rem)`), šírka do 20 znakov; na úzkom mobile 38 px. Perex má 24 px s riadkovaním 1.4 a šírkou do 60 znakov.
- **Body:** základ webu má vlastnú rolu vo frontmatteri. Dlhý článok používa rolu `reading`, šírku do 68 znakov a na úzkom mobile 18 px pri zachovaní riadkovania 1.7.
- **Dátové záznamy:** meno používa rolu `record-title`; podtitul 16 px, bežný detail 17 px a metadáta 15 px. Finančné hodnoty majú tabuľkové číslice a váhu 700.
- **Label:** prirodzený zápis a bežná veľkosť písmen. Označenia druhu publikácie, obdobia, roly a stavu podkladov nesú konkrétnu informáciu.
- **Textová značka v päte:** Rubik 900, veľkosť 27 px a tracking -0.035em. Hlavičkové logo sa nahrádza iba jeho schváleným obrazovým assetom.

## Layout

Hlavný kontajner má maximálnu šírku 1344 px a desktopové bočné odsadenie 48 px. Hlavička má vlastný rámec do 1440 px; čítanie do 1040 px a päta do 1248 px. Opakované vnútorné medzery a odsadenia sú vo frontmatteri; väčšie odstupy oddeľujú stránky, menšie držia vzťah medzi titulkom, metadátami a textom.

Publikačný layout používa pružný hlavný stĺpec a pravý vstup do mapy široký 320 px s medzerou 56 px. Pri šírke do 1100 px má pravý stĺpec 290 px a medzeru 32 px. Riadky publikácií oddeľuje tenká tmavá čiara; voliteľný náhľad má samostatný úzky stĺpec a pomer 4:3.

Mapový workspace má desktopový výber médií široký 220 px, pružnú dátovú plochu a medzeru 36 px. Pri šírke do 1100 px sa mení na 180 px a medzeru 24 px. Sekcie média ostávajú bezprostredne nad obsahom. Organizačné uzly a tímy využívajú dva stĺpce, keď majú dostatok miesta.

Pri šírke do 800 px sa titulka, čítanie aj workspace skladajú do jedného stĺpca. Hlavička zostáva v bežnom toku, hlavná navigácia je pod logom a výber médií sa mení na rozbaľovací prvok nad obsahom. Mapový vstup pokračuje za publikáciami. Základné bočné odsadenie je 24 px, pri šírke do 480 px 20 px; tímy a organizačné skupiny sa vtedy skladajú do jedného stĺpca.

Financie majú na desktope tabuľku s obdobím, ukazovateľom a hodnotou. Pri šírke do 640 px sa každý záznam skladá: obdobie vľavo, hodnota hneď vpravo, pod nimi ukazovateľ a jeho zdroje cez celú šírku. Názvy a poznámky sa zalamujú, hodnota zostáva viditeľná bez vodorovného posunu.

## Elevation & Depth

Hĺbka je štrukturálna a vychádza z plastického loga. Tmavý obrys a tvrdý odsadený tieň podopierajú ovládanie, vybrané položky, mapový vstup a zvýraznený vydavateľský uzol. Biele čítacie a dátové plochy držia jemný okraj a zostávajú bez vonkajšieho tieňa. Textúra je v obrazovej značke.

### Shadow Vocabulary

- **Primárne ovládanie:** `4px 5px 0 var(--ink)`; hover zdvihne prvok o 1 px a rozšíri tieň na `5px 6px 0 var(--ink)`.
- **Vybraný filter a médium:** `2px 3px 0 var(--ink)`.
- **Vybraná hlavná navigácia a vydavateľský uzol:** `3px 4px 0 var(--ink)`.
- **Mapový vstup:** `6px 7px 0 var(--ink)`.
- **Miniatúrne organizačné uzly:** `2px 2px 0 var(--ink)`.

Tlačidlo pri stlačení prejde do svojho tieňa. Bežný prechod transformácie a tieňa trvá 120 ms; nejde o priebežnú animáciu obsahu. Pri `prefers-reduced-motion: reduce` sa prechody a animácie vypínajú.

## Shapes

Ovládanie má oblé rohy, čitateľný tmavý obrys a pevný dotykový rozmer. Primárne tlačidlo a hlavná navigácia zdieľajú rolu `control`, pole používa `field`, filter plnú kapsulu `pill`. Mapový vstup má výraznejšie oblé rohy (22 px).

Biele čítanie používa jemné rohy `reading`; dátové plochy a organizačné uzly rolu `control`. Vstupy do médií a modulové pásy používajú `panel`. Rám ovládania býva 2 px, organizačné uzly a polia 1.5 px; jemné dátové okraje sú 1 px.

Logo zostáva samostatným obrazovým assetom. Jeho horizontálne tmavé kontúry na r, c a oboch h sú súčasťou schválenej značky.

## Components

### Buttons

Fyzické oblé ovládanie s krátkym posunom pri interakcii. Základná výška je najmenej 48 px, text má váhu 700 a voliteľnú SVG šípku. Primárny variant je ružový; tmavý variant sa používa vo výraznom mapovom vstupe; biely variant v ružovom modulovom páse článku. Farby, rohy a padding sú vo frontmatteri.

Hover základného tlačidla zdvihne plochu; stlačenie ju posunie o 4 px doprava a 5 px nadol. Tmavý variant sa posunie o 3 px doprava a 4 px nadol, kompaktnejšie tlačidlá vyhľadávacieho formulára o 2 px doprava a 3 px nadol. Pri stlačení sa príslušný tieň vypne. Klávesnicový focus tvorí tmavý obrys 3 px s odsadením 5 px. Menšie textové akcie majú dotykovú výšku najmenej 44 px.

### Filters and fields

Kapsulový filter je biely, ružový pri výbere alebo hoveri; výber navyše dostáva odsadený tieň. Stav používa `aria-current` alebo `aria-pressed`. Stlačenie kapsuly má posun 2 px doprava a 3 px nadol.

Vyhľadávacie pole a select sú biele, s tmavým obrysom a výškou najmenej 48 px. Viditeľný label je nad poľom; vyhľadávanie má inline SVG lupu a zodpovedajúce ľavé odsadenie. Formulár sa zalamuje podľa dostupnej šírky, na úzkom mobile sú polia a hlavné tlačidlo cez celý riadok. Výsledkový počet je samostatný textový stav.

### Navigation

Hlavná navigácia sedí v ružovej hlavičke. Aktívna položka má svetloružovú plochu, tmavý obrys a tieň. Výber média má ružový aktívny riadok; sekcia média ružovú záložku spojenú s dolnou deliacou čiarou.

Na mobile výber média používa natívny `details/summary` s ružovou plochou a tieňom. Drobčeky, vonkajšie odkazy a odkazy v päte majú dotykovú výšku najmenej 44 px. Smerové a externé ikony sú inline SVG s `currentColor`, oblými zakončeniami a hrúbkou čiary 1.8; navigácia ostáva pomenovaná textom.

### Publication rows and article

Publikačný riadok spája druh a dátum, výrazný titulok, krátky popis a textový vstup so šípkou. Titulok pri hoveri dostáva podčiarknutie. Náhľad sa zobrazuje iba pri skutočnom titulnom obrázku.

Článok používa samostatnú bielu čítaciu plochu. Citácia má ružovú ľavú čiaru, podklady a informácia o autorstve vlastné čitateľné bloky oddelené jemnou čiarou. Ružový modulový pás môže spojiť článok s mapou.

### Map callout and organization

Výrazný ružový vstup kombinuje názov Redakcie, stručný popis, miniatúrnu organizačnú schému a tmavé tlačidlo. Schéma používa oblé svetloružové uzly, tmavé spojnice a malý odsadený tieň.

V dátovom prehľade sú vlastnícke a personálne uzly svetloružové; vydavateľ je zvýraznený ružovou a tieňom. Názov, rola a podklady zostávajú vnútri každého uzla. Tímy sú biele kontajnery s jemným okrajom a rozbaliteľnými podkladmi.

### Records and finance

Osobné a vzťahové záznamy používajú biely spoločný kontajner s jemnými deliacimi čiarami. Natívny `details` má súhrn vysoký najmenej 44 px, výrazný názov a tlmený podtitul. Inline SVG chevron sa pri otvorení otočí o 180 stupňov. Detail obsahuje roly, stav podkladov, zdroje a trvalý odkaz; cieľová kotva zvýrazní celý otvoriteľný záznam ružovým obrysom.

Finančná tabuľka má biely podklad, svetloružovú hlavičku a výrazné hodnoty s tabuľkovými číslicami. Mobilné skladanie je opísané v Layout. Štítky obdobia a hodnoty vysvetľujú bunky; dátové stavy a zdrojové odkazy sú obsahom záznamu.

## Do's and Don'ts

### Do:

- **Do** vychádzaj zo schváleného obrazového loga a zachovaj jeho kompletné tmavé kontúry.
- **Do** používaj lokálny Rubik pre výrazné nadpisy a Source Sans 3 pre čítanie a dáta.
- **Do** drž dlhý článok a dátové panely na bielej ploche s jemným okrajom.
- **Do** zachovaj fyzický stav ovládania, viditeľný klávesnicový focus a dotykové ciele aspoň 44 px.
- **Do** nechaj na mobile finančnú hodnotu viditeľnú pri období a rešpektuj reduced motion.

### Don't:

- **Don't** prenášaj textúru loga na dlhé čítacie alebo dátové plochy.
- **Don't** obklopuj každý publikačný text dekoratívnym rámom; existujúci zoznam používa otvorené riadky.
- **Don't** nahrádzaj chýbajúce obrázky publikácií vymyslenými náhľadmi.
