# Hospodárske noviny — mapa redakcie a vydavateľa

> Stav overenia: **2026-09-03**
> Stabilné ID média: `hospodarske-noviny`
> Verejný web: <https://hnonline.sk/>
> Mapping state: `partial`
> Scope: profesionálna a inštitucionálna mapa z verejných primárnych zdrojov. Neobsahuje súkromné adresy osôb, dátumy narodenia, rodinné väzby, súkromné kontakty ani osobný majetok.

Aktuálne first-party zdroje potvrdzujú šéfredaktorku, produkty HN a spoločné vedenie/podporu vydavateľa. Vydavateľ však nezverejňuje aktuálny úplný newsroom roster, preto nie sú radoví redaktori dopĺňaní z historických kontaktov ani odvodení z jednotlivých bylinov.

## 1. Identita a právny rámec

| Pole | Hodnota | Stav | Zdroj |
|---|---|---|---|
| Médium | Hospodárske noviny | current_verified | `hn-source-publisher-contacts` |
| Vydavateľ | MAFRA Slovakia, a.s. | current_verified | `hn-source-publisher-contacts`, `hn-source-orsr` |
| IČO | 51904446 | current_verified | `hn-source-publisher-contacts`, `hn-source-orsr` |
| Právna forma | akciová spoločnosť | current_verified | `hn-source-publisher-contacts`, `hn-source-orsr` |
| Sídlo právnickej osoby | Kalinčiakova 33, 831 04 Bratislava – mestská časť Nové Mesto | current_verified | `hn-source-publisher-contacts`, `hn-source-orsr` |

### Vlastníctvo a governance

Aktuálny ORSR uvádza ako jediného akcionára spoločnosť **MAFRA, a.s.** Predstavenstvo MAFRA Slovakia: Michal Hanák, Ivan Netík, Katarína Michálechová. Dozorná rada: Patrik Ovšonka, Vladimíra Perová, Petr Mindžak. RPVS potvrdzuje aktívny zápis partnera verejného sektora; súkromné údaje fyzických osôb sa nepreberajú.

### Dôležitá hranica rosteru

Aktuálna first-party kontaktná stránka vydavateľa zverejňuje iba šéfredaktorku HN a spoločné publisher/support roly. Historický článok „xHNS Kontakt“ bol nájdený, ale je zjavne starý a nie je použitý ako aktuálny roster. Tento dokument preto vedome nepredstiera úplnosť interného newsroomu.


## 2. Produkty

| product_id | produkt | typ | vzťah | stav | sources |
|---|---|---|---|---|---|
| `hn-product-print` | Hospodárske noviny | print | celoštátny ekonomický denník | current_verified | `hn-source-publisher-about` |
| `hn-product-web` | HNonline.sk | publication | spravodajský portál Hospodárskych novín s archívom | current_verified | `hn-source-publisher-about`, `hn-source-home` |
| `hn-product-hn24` | HN24 | news_service | rýchly spravodajský servis | current_verified | `hn-source-home` |
| `hn-product-tv` | HNtelevízia | publication | video a relácie | current_verified | `hn-source-home` |
| `hn-product-magazin` | HNmagazín | magazine | pravidelná printová príloha | current_verified | `hn-source-supplements-2026` |
| `hn-product-preco-nie` | Prečo nie?! | magazine | magazín/príloha HN | current_verified | `hn-source-home`, `hn-source-publisher-about` |
| `hn-product-prakticke-hn` | Praktické HN | publication | servisný obsah o daniach, majetku, práci a poradenstve | current_verified | `hn-source-home` |
| `hn-product-konferencie` | HN konferencie | events | podujatia pod značkou HN | current_verified | `hn-source-home` |
| `hn-product-brifing` | Brífing HN | newsletter | spravodajský brífing v menu HN | current_verified | `hn-source-home` |

## 3. Verejné organizačné jednotky

| unit_id | názov | typ | parent | stav | sources |
|---|---|---|---|---|---|
| `hn-unit-publisher` | MAFRA Slovakia, a. s. | publisher | — | current_verified | `hn-source-publisher-contacts`, `hn-source-orsr` |
| `hn-unit-governance` | Predstavenstvo a dozorná rada | governance | `hn-unit-publisher` | current_verified | `hn-source-orsr` |
| `hn-unit-ownership` | Vlastníctvo | ownership | `hn-unit-publisher` | current_verified | `hn-source-orsr`, `hn-source-rpvs` |
| `hn-unit-newsroom` | Redakcia Hospodárskych novín | newsroom | `hn-unit-publisher` | current_verified | `hn-source-publisher-contacts`, `hn-source-editor-profile` |
| `hn-unit-digital` | HNonline, HN24 a HNtelevízia | editorial | `hn-unit-newsroom` | current_verified | `hn-source-home` |
| `hn-unit-print` | Print a prílohy HN | editorial | `hn-unit-newsroom` | current_verified | `hn-source-publisher-about`, `hn-source-supplements-2026` |
| `hn-unit-events` | Event division / HN konferencie | commercial | `hn-unit-publisher` | current_verified | `hn-source-publisher-contacts`, `hn-source-home` |
| `hn-unit-support` | Spoločná prevádzková, obchodná, HR a administratívna podpora | support | `hn-unit-publisher` | current_verified | `hn-source-publisher-contacts` |

## 4. Verejne pomenované osoby a roly

Počet unikátnych osôb v tomto zbere: **9**. Počet explicitných rolí: **12**. Počet jednotiek: **8**.

| person_id | meno | verejná rola | unit_id | role_level | roster_status | evidence_state | sources |
|---|---|---|---|---|---|---|---|
| `hn-person-marcela-simkova` | Marcela Šimková | šéfredaktorka redakcie Hospodárskych novín | `hn-unit-newsroom` | editorial_leadership | listed_current | current_verified | `hn-source-publisher-contacts`, `hn-source-editor-profile` |
| `hn-person-ivan-netik` | Ivan Netík | prevádzkový riaditeľ | `hn-unit-support` | publisher_leadership | listed_current | current_verified | `hn-source-publisher-contacts` |
| `hn-person-ivan-netik` | Ivan Netík | podpredseda predstavenstva | `hn-unit-governance` | governance | listed_current | current_verified | `hn-source-orsr` |
| `hn-person-katarina-michalechova` | Katarína Michálechová | obchodná riaditeľka | `hn-unit-support` | publisher_leadership | listed_current | current_verified | `hn-source-publisher-contacts` |
| `hn-person-katarina-michalechova` | Katarína Michálechová | členka predstavenstva | `hn-unit-governance` | governance | listed_current | current_verified | `hn-source-orsr` |
| `hn-person-vladimira-perova` | Vladimíra Perová | mzdová a personálna riaditeľka | `hn-unit-support` | publisher_leadership | listed_current | current_verified | `hn-source-publisher-contacts` |
| `hn-person-vladimira-perova` | Vladimíra Perová | členka dozornej rady | `hn-unit-governance` | governance | listed_current | current_verified | `hn-source-orsr` |
| `hn-person-lucia-bizonova` | Lucia Bizoňová | Head of event division | `hn-unit-events` | commercial_staff | listed_current | current_verified | `hn-source-publisher-contacts` |
| `hn-person-andrea-cervenanska` | Andrea Červenanská | asistentka | `hn-unit-support` | support_staff | listed_current | current_verified | `hn-source-publisher-contacts` |
| `hn-person-michal-hanak` | Michal Hanák | predseda predstavenstva | `hn-unit-governance` | publisher_leadership | listed_current | current_verified | `hn-source-orsr` |
| `hn-person-patrik-ovsonka` | Patrik Ovšonka | člen dozornej rady | `hn-unit-governance` | governance | listed_current | current_verified | `hn-source-orsr` |
| `hn-person-petr-mindzak` | Petr Mindžak | člen dozornej rady | `hn-unit-governance` | governance | listed_current | current_verified | `hn-source-orsr` |

## 5. Posledné dostupné finančné fakty

| obdobie | metrika | hodnota | poznámka | source |
|---|---|---:|---|---|
| 2025 | čistý obrat | 16 128 910 EUR | Údaj celej MAFRA Slovakia, a.s.; 2024: 16 328 702 EUR. | `hn-source-ruz-2025` |
| 2025 | výsledok hospodárenia po zdanení | 772 997 EUR | Údaj celej spoločnosti; 2024: 355 684 EUR. | `hn-source-ruz-2025` |
| 2025 | osobné náklady | 3 499 356 EUR | Údaj celej spoločnosti. | `hn-source-ruz-2025` |
| 2025 | výsledok hospodárenia z hospodárskej činnosti | 1 716 306 EUR | Údaj celej spoločnosti. | `hn-source-ruz-2025` |

Čísla sú firemné; nie sú segmentovým účtovníctvom konkrétneho média.

## 6. Verejné zmluvy a dotácie

V tomto rýchlom prvom priechode nebol do dokumentu zaradený žiadny záznam. To nie je tvrdenie, že zmluvy alebo dotácie neexistujú; konsolidované vyhľadanie podľa IČO v CRZ a dotačných registroch zostáva otvorenou úlohou.

## 7. Explicitné medzery

- Aktuálny úplný roster redaktorov, editorov, vedúcich deskov, fotografov, grafikov, produkcie a korektúr nie je na verejných first-party stránkach dostupný.
- Starý článok „xHNS Kontakt“ obsahuje historický tím a nesmie sa považovať za aktuálny roster.
- Finančné čísla patria celej MAFRA Slovakia, a.s., nie iba Hospodárskym novinám.
- Verejné zmluvy a dotácie neboli v rýchlom prvom priechode konsolidovane prehľadané.

Otvorené otázky:

- Kde vydavateľ publikuje aktuálny úplný masthead HN a HNonline?
- Ktorí vedúci deskov, editori, reportéri, komentátori, fotografi, grafici, video/podcast pracovníci a pomocné roly sú aktuálne súčasťou HN?
- Aký podiel na spoločných výsledkoch MAFRA Slovakia tvorí značka HN?
- Aké verejné zmluvy alebo dotácie možno priamo priradiť MAFRA Slovakia v CRZ a dotačných registroch?

## 8. Zdroje

- `hn-source-publisher-contacts` — [MAFRA Slovakia – kontakty](https://mafraslovakia.hnonline.sk/kontakt.html), MAFRA Slovakia, a. s.; typ `official_roster`; prístup **2026-09-03**. Aktuálna first-party stránka zverejňuje šéfredaktorku HN a spoločné vedenie/podporu vydavateľa.
- `hn-source-publisher-about` — [MAFRA Slovakia – o spoločnosti a portfólio](https://mafraslovakia.hnonline.sk/o-spolocnosti.html), MAFRA Slovakia, a. s.; typ `official_outlet`; prístup **2026-09-03**.
- `hn-source-home` — [HNonline.sk – aktuálne menu a produkty](https://hnonline.sk/), MAFRA Slovakia, a. s.; typ `official_outlet`; prístup **2026-09-03**.
- `hn-source-supplements-2026` — [Harmonogram špecializovaných príloh HN 2026](https://static.hnonline.sk/pdfs/HN_harmonogram_2026.pdf), MAFRA Slovakia, a. s.; typ `official_outlet`; prístup **2026-09-03**.
- `hn-source-editor-profile` — [Marcela Šimková – profil autorky](https://hnonline.sk/autor/marcela-simkova-13042), Hospodárske noviny; typ `professional_profile`; prístup **2026-09-03**.
- `hn-source-orsr` — [Aktuálny výpis MAFRA Slovakia, a.s., IČO 51904446](https://www.orsr.sk/vypis.asp?ID=495437&SID=2&P=0), Obchodný register SR; typ `official_registry`; prístup **2026-09-03**.
- `hn-source-ruz-entity` — [MAFRA Slovakia, a.s. – účtovná jednotka a závierky](https://www.registeruz.sk/cruz-public/domain/accountingentity/show/1794119), Register účtovných závierok; typ `official_registry`; prístup **2026-09-03**.
- `hn-source-ruz-2025` — [MAFRA Slovakia, a.s. – účtovná závierka 2025](https://www.registeruz.sk/cruz-public/domain/financialreport/show/10323194/552), Register účtovných závierok; typ `financial_filing`; prístup **2026-09-03**.
- `hn-source-rpvs` — [Aktuálny výpis RPVS – MAFRA Slovakia, a.s.](https://rpvs.gov.sk/rpvs/Partner/Partner/DetailPdf/29414), Register partnerov verejného sektora; typ `official_registry`; prístup **2026-09-03**. Súkromné údaje osôb sa nepreberajú.
