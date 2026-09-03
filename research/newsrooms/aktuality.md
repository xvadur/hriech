# Aktuality.sk — verejnozdrojová mapa redakcie a vydavateľa

> Stav overenia: **2026-09-03**
> Stabilné ID: `aktuality`
> Verejné profesionálne a inštitucionálne údaje; bez súkromných adries osôb, dátumov narodenia, rodiny, osobných kontaktov a majetkových lustrácií.

## Výsledok a počty

- **11 osôb**, **11 rolí**, **6 jednotiek**, **4 produkty/formáty**.
- Z toho je 5 osôb explicitný blok „Náš tím“ a 6 osôb aktuálna štatutárna/dozorná vrstva vydavateľa.
- Mapping state: `partial`, pretože first-party stránka deklaruje viac ako 30 novinárov, ale menovite zvýrazňuje iba päť.

`current_verified` znamená priamo pozorované na aktuálnom first-party zdroji alebo registri. Každý zdroj bol otvorený 2026-09-03.

## Médium, vydavateľ a vlastníctvo

| Pole | Hodnota | evidence_state | Zdroj |
|---|---|---|---|
| médium | Aktuality.sk | current_verified | [Aktuality](https://www.aktuality.sk/p/o-nas/) |
| vydavateľ/prevádzkovateľ | Ringier Slovakia Media s.r.o. | current_verified | [Aktuality](https://www.aktuality.sk/p/o-nas/), [ORSR](https://www.orsr.sk/vypis.asp?ID=569427&SID=2&P=0) |
| IČO | 53708792 | current_verified | [ORSR](https://www.orsr.sk/vypis.asp?ID=569427&SID=2&P=0) |
| právna forma | spoločnosť s ručením obmedzeným | current_verified | [ORSR](https://www.orsr.sk/vypis.asp?ID=569427&SID=2&P=0) |
| vlastníctvo | Ringier Central and Eastern Europe AG 87 %; OMH mezzanine, s.r.o. 13 % základného imania aj hlasovacích práv k 31.12.2025 | current_verified | [RÚZ poznámky 2025](https://www.registeruz.sk/cruz-public/domain/financialreport/attachment/12824045) |

Peter Bárdy je aktuálne uvedený ako šéfredaktor. Aktuálny ORSR uvádza konateľov Petra Hollého, Petra Chabrečka a Františka Nováka a dozornú radu Milan Dubec, Michael Moersch a Stefan Christian Benkert. Staršia veta na stránke Aktuality menuje Petra Hollého a Mareka Václavíka; pre súčasnosť má prednosť register. [O Aktuality.sk](https://www.aktuality.sk/p/o-nas/), [ORSR](https://www.orsr.sk/vypis.asp?ID=569427&SID=2&P=0), prístup 2026-09-03.

## Produkty

| product_id | Názov | kind | Väzba | Zdroj |
|---|---|---|---|---|
| `aktuality-web` | Aktuality.sk | publication | hlavný spravodajský web | [zdroj](https://www.aktuality.sk/p/o-nas/) |
| `aktuality-navyse` | Aktuality Navyše | publication | platená obsahová služba spustená v roku 2022 | [zdroj](https://www.aktuality.sk/p/o-nas/) |
| `aktuality-podcasty` | Aktuality Podcasty | podcast | podcastová vertikála vrátane Aktuality Nahlas, Ráno Nahlas, Mafiánsky štát a Banánové deti | [zdroj](https://www.aktuality.sk/p/o-nas/) |
| `aktuality-video` | Aktuality Video | publication | video vertikála vrátane Na rovinu, Ťažký týždeň, Na scéne a Mimóza | [zdroj](https://www.aktuality.sk/p/o-nas/) |

## Jednotky

| unit_id | Názov | kind | evidence_state | Zdroj |
|---|---|---|---|---|
| `aktuality-publisher` | Ringier Slovakia Media s.r.o. | publisher | current_verified | [zdroj](https://www.orsr.sk/vypis.asp?ID=569427&SID=2&P=0) |
| `aktuality-newsroom` | Aktuality.sk | newsroom | current_verified | [zdroj](https://www.aktuality.sk/p/o-nas/) |
| `aktuality-leadership` | Vedenie redakcie | leadership | current_verified | [zdroj](https://www.aktuality.sk/p/o-nas/) |
| `aktuality-editorial` | Zvýraznený redakčný tím | editorial | current_verified | [zdroj](https://www.aktuality.sk/p/o-nas/) |
| `aktuality-governance` | Konatelia Ringier Slovakia Media | governance | current_verified | [zdroj](https://www.orsr.sk/vypis.asp?ID=569427&SID=2&P=0) |
| `aktuality-supervisory` | Dozorná rada Ringier Slovakia Media | governance | current_verified | [zdroj](https://www.orsr.sk/vypis.asp?ID=569427&SID=2&P=0) |

## People a roly

Pracovnoprávny status sa neodvodzuje.

| person_id | Meno | Verejná rola | unit_id | role_level | evidence_state | Zdroj |
|---|---|---|---|---|---|---|
| `aktuality-peter-bardy` | Peter Bárdy | Šéfredaktor | `aktuality-leadership` | editorial_leadership | current_verified | [zdroj](https://www.aktuality.sk/p/o-nas/) |
| `aktuality-jan-petrovic` | Ján Petrovič | Redaktor | `aktuality-editorial` | editorial_staff | current_verified | [zdroj](https://www.aktuality.sk/p/o-nas/) |
| `aktuality-laura-kello-kalinska` | Laura Kellö Kalinská | Redaktorka | `aktuality-editorial` | editorial_staff | current_verified | [zdroj](https://www.aktuality.sk/p/o-nas/) |
| `aktuality-peter-hanak` | Peter Hanák | Redaktor | `aktuality-editorial` | editorial_staff | current_verified | [zdroj](https://www.aktuality.sk/p/o-nas/) |
| `aktuality-martina-benova` | Martina Beňová | Redaktorka | `aktuality-editorial` | editorial_staff | current_verified | [zdroj](https://www.aktuality.sk/p/o-nas/) |
| `aktuality-peter-holly` | Peter Hollý | Konateľ | `aktuality-governance` | governance | current_verified | [zdroj](https://www.orsr.sk/vypis.asp?ID=569427&SID=2&P=0) |
| `aktuality-peter-chabrecek` | Peter Chabreček | Konateľ | `aktuality-governance` | governance | current_verified | [zdroj](https://www.orsr.sk/vypis.asp?ID=569427&SID=2&P=0) |
| `aktuality-frantisek-novak` | František Novák | Konateľ | `aktuality-governance` | governance | current_verified | [zdroj](https://www.orsr.sk/vypis.asp?ID=569427&SID=2&P=0) |
| `aktuality-milan-dubec` | Milan Dubec | Člen dozornej rady | `aktuality-supervisory` | governance | current_verified | [zdroj](https://www.orsr.sk/vypis.asp?ID=569427&SID=2&P=0) |
| `aktuality-michael-moersch` | Michael Moersch | Člen dozornej rady | `aktuality-supervisory` | governance | current_verified | [zdroj](https://www.orsr.sk/vypis.asp?ID=569427&SID=2&P=0) |
| `aktuality-stefan-christian-benkert` | Stefan Christian Benkert | Člen dozornej rady | `aktuality-supervisory` | governance | current_verified | [zdroj](https://www.orsr.sk/vypis.asp?ID=569427&SID=2&P=0) |

## Vzťahy

| subject | predicate | object | Poznámka | Zdroj |
|---|---|---|---|---|
| `aktuality-ringier-media` | operates | Aktuality.sk | Ringier Slovakia Media je vydavateľom a prevádzkovateľom. | [zdroj](https://www.aktuality.sk/p/o-nas/) |
| `aktuality-peter-bardy` | leads | Vedenie redakcie |  | [zdroj](https://www.aktuality.sk/p/o-nas/) |
| `aktuality-ringier-cee` | owns_share_in | Ringier Slovakia Media s.r.o. | 87 % základného imania a hlasovacích práv k 31.12.2025. | [zdroj](https://www.registeruz.sk/cruz-public/domain/financialreport/attachment/12824045) |
| `aktuality-omh-mezzanine` | owns_share_in | Ringier Slovakia Media s.r.o. | 13 % základného imania a hlasovacích práv k 31.12.2025. | [zdroj](https://www.registeruz.sk/cruz-public/domain/financialreport/attachment/12824045) |

## Finančné fakty

Hodnoty sú za celú Ringier Slovakia Media, nie iba Aktuality.sk.

| Obdobie | Metrika | Hodnota | Poznámka | Zdroj |
|---|---|---:|---|---|
| 2025 | Čistý obrat | 8 095 102 EUR | 2024: 7 433 766 EUR. | [RÚZ](https://www.registeruz.sk/cruz-public/domain/financialreport/show/10320254/552) |
| 2025 | Tržby z predaja služieb | 7 875 955 EUR | 2024: 7 152 111 EUR. | [RÚZ](https://www.registeruz.sk/cruz-public/domain/financialreport/show/10320254/552) |
| 2025 | Osobné náklady | 3 844 514 EUR | 2024: 3 640 413 EUR. | [RÚZ](https://www.registeruz.sk/cruz-public/domain/financialreport/show/10320254/552) |
| 2025 | Výsledok hospodárenia pred zdanením | -624 389 EUR | 2024: -813 087 EUR. | [RÚZ](https://www.registeruz.sk/cruz-public/domain/financialreport/show/10320254/552) |
| 2025 | Výsledok hospodárenia po zdanení | -443 414 EUR | 2024: -725 831 EUR. | [RÚZ](https://www.registeruz.sk/cruz-public/domain/financialreport/show/10320254/552) |
| 2025 | Priemerný prepočítaný počet zamestnancov | 86 FTE | 2024: 84; celá Ringier Slovakia Media, nie iba Aktuality.sk. | [RÚZ](https://www.registeruz.sk/cruz-public/domain/financialreport/attachment/12824045) |

## Redakčný rámec a medzery

[Redakčné pravidlá](https://www.aktuality.sk/p/redakcne-pravidla/) sú verejný first-party normatívny dokument; jeho existencia je `current_verified`, praktické dodržiavanie v jednotlivých rozhodnutiach zostáva `unknown`.

- Kompletný menný roster deklarovaných viac ako 30 novinárov a helper/support rolí nie je publikovaný.
- [Autorský katalóg](https://www.aktuality.sk/autori/) mieša interných, externých, partnerských a syndikovaných autorov; preto sa nepoužil ako pracovný roster.
- Presné deskové zaradenie štyroch redaktorov nie je verejne uvedené.
- CRZ, granty a zmluvy neboli v rýchlom prvom priechode systematicky enumerované.

## Zdrojový register

| source_id | Názov | kind | URL | access_date | Poznámka |
|---|---|---|---|---|---|
| `aktuality-about-roster` | O Aktuality.sk | official_roster | [URL](https://www.aktuality.sk/p/o-nas/) | 2026-09-03 | Päť zvýraznených členov tímu, produkty, vydavateľ; zároveň deklaruje tím viac ako 30 novinárov. |
| `aktuality-contact` | Kontaktné informácie | official_outlet | [URL](https://www.aktuality.sk/kontakt/) | 2026-09-03 | Prevádzková a vydavateľská vrstva. |
| `aktuality-authors` | Zoznam autorov portálu | official_roster | [URL](https://www.aktuality.sk/autori/) | 2026-09-03 | Mieša interných, externých, partnerských a syndikovaných autorov; nie je to HR roster. |
| `aktuality-rules` | Redakčné pravidlá Aktuality.sk | official_outlet | [URL](https://www.aktuality.sk/p/redakcne-pravidla/) | 2026-09-03 | Verejné redakčné pravidlá. |
| `aktuality-ringier-orsr` | Ringier Slovakia Media s.r.o. — ORSR | official_registry | [URL](https://www.orsr.sk/vypis.asp?ID=569427&SID=2&P=0) | 2026-09-03 | Aktuálny výpis; iba profesionálne funkcie a firemné údaje. |
| `aktuality-ringier-ruz` | Ringier Slovakia Media — RÚZ 2025 | financial_filing | [URL](https://www.registeruz.sk/cruz-public/domain/financialreport/show/10320254) | 2026-09-03 | Riadna individuálna závierka 2025. |
| `aktuality-ringier-notes` | Ringier Slovakia Media — poznámky 2025 | financial_filing | [URL](https://www.registeruz.sk/cruz-public/domain/financialreport/attachment/12824045) | 2026-09-03 | Vlastníctvo, orgány a zamestnanci. |
| `aktuality-ringier-statements` | Ringier Slovakia Media — výkazy 2025 | financial_filing | [URL](https://www.registeruz.sk/cruz-public/domain/financialreport/show/10320254/552) | 2026-09-03 | Výkaz ziskov a strát 2025. |

Strojový fragment: [aktuality.json](./fragments/aktuality.json).
