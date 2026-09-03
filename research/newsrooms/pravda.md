# Pravda — mapa redakcie a vydavateľa

> Stav overenia: **2026-09-03**
> Stabilné ID média: `pravda`
> Verejný web: <https://www.pravda.sk/>
> Mapping state: `public_roster_mapped`
> Scope: profesionálna a inštitucionálna mapa z verejných primárnych zdrojov. Neobsahuje súkromné adresy osôb, dátumy narodenia, rodinné väzby, súkromné kontakty ani osobný majetok.

Zmapované všetky mená a profesionálne roly z aktuálnej verejnej kontaktnej stránky Pravdy vrátane vedenia, vedúcich deskov a príloh, výroby, IT, marketingu a obchodu; doplnené aktuálne orgány a vlastnícka vrstva z registrov.

## 1. Identita a právny rámec

| Pole | Hodnota | Stav | Zdroj |
|---|---|---|---|
| Médium | Pravda | current_verified | `pravda-source-contacts` |
| Vydavateľ | OUR MEDIA SR a. s. | current_verified | `pravda-source-contacts`, `pravda-source-orsr` |
| IČO | 51267055 | current_verified | `pravda-source-contacts`, `pravda-source-orsr` |
| Právna forma | akciová spoločnosť | current_verified | `pravda-source-contacts`, `pravda-source-orsr` |
| Sídlo právnickej osoby | Kalinčiakova 14083/33, 831 04 Bratislava – mestská časť Nové Mesto | current_verified | `pravda-source-contacts`, `pravda-source-orsr` |

### Vlastníctvo a governance

Aktuálny ORSR uvádza ako jediného akcionára **Blueberg Media a.s.** Aktuálny RPVS a verifikačný dokument uvádzajú profesijný registračný status Michala Voráčka ako konečného užívateľa výhod; dokument zámerne nepreberá jeho adresu, dátum narodenia ani iné súkromné údaje. Predstavenstvo: Maroš Havran, Ladislav Ollé, Katarína Agnerová. Dozorná rada: Rastislav Šedaj, Rudolf Ondruš, Natália Petkáčová.


## 2. Produkty

| product_id | produkt | typ | vzťah | stav | sources |
|---|---|---|---|---|---|
| `pravda-product-print` | Denník Pravda | print | hlavný tlačený denník | current_verified | `pravda-source-contacts` |
| `pravda-product-web` | Pravda.sk | publication | hlavný spravodajský web | current_verified | `pravda-source-contacts` |
| `pravda-product-tv` | TV Pravda | publication | video produkt Pravdy | current_verified | `pravda-source-contacts` |
| `pravda-product-varecha` | Varecha | magazine | kulinárska vertikála pomenovaná v kontaktoch | current_verified | `pravda-source-contacts` |
| `pravda-product-uzitocna` | Užitočná Pravda | magazine | servisná príloha/vertikála | current_verified | `pravda-source-contacts` |
| `pravda-product-vikend` | Víkend | magazine | príloha | current_verified | `pravda-source-contacts` |
| `pravda-product-dobre-zdravie` | Dobré zdravie | magazine | príloha | current_verified | `pravda-source-contacts` |
| `pravda-product-krizovky` | Krížovky | magazine | príloha | current_verified | `pravda-source-contacts` |
| `pravda-product-mediaklik` | Mediaklik | publication | portál uvedený v reklamnom portfóliu vydavateľa | current_verified | `pravda-source-contacts` |
| `pravda-product-ahojmama` | AhojMama | publication | portál uvedený v reklamnom portfóliu vydavateľa | current_verified | `pravda-source-contacts` |

## 3. Verejné organizačné jednotky

| unit_id | názov | typ | parent | stav | sources |
|---|---|---|---|---|---|
| `pravda-unit-publisher` | OUR MEDIA SR a. s. | publisher | — | current_verified | `pravda-source-contacts`, `pravda-source-orsr` |
| `pravda-unit-governance` | Predstavenstvo a dozorná rada | governance | `pravda-unit-publisher` | current_verified | `pravda-source-orsr` |
| `pravda-unit-ownership` | Vlastníctvo | ownership | `pravda-unit-publisher` | current_verified | `pravda-source-orsr`, `pravda-source-rpvs-2025`, `pravda-source-rpvs-current` |
| `pravda-unit-leadership` | Vedenie obsahu | leadership | `pravda-unit-newsroom` | current_verified | `pravda-source-contacts` |
| `pravda-unit-newsroom` | Redakcia Pravdy | newsroom | `pravda-unit-publisher` | current_verified | `pravda-source-contacts` |
| `pravda-unit-domace` | Domáce udalosti | desk | `pravda-unit-newsroom` | current_verified | `pravda-source-contacts` |
| `pravda-unit-ekonomika` | Ekonomika | desk | `pravda-unit-newsroom` | current_verified | `pravda-source-contacts` |
| `pravda-unit-zahranicie` | Zahraničné udalosti | desk | `pravda-unit-newsroom` | current_verified | `pravda-source-contacts` |
| `pravda-unit-nazory` | Názory | desk | `pravda-unit-newsroom` | current_verified | `pravda-source-contacts` |
| `pravda-unit-kultura` | Kultúra | desk | `pravda-unit-newsroom` | current_verified | `pravda-source-contacts` |
| `pravda-unit-sport` | Šport | desk | `pravda-unit-newsroom` | current_verified | `pravda-source-contacts` |
| `pravda-unit-online` | Online | desk | `pravda-unit-newsroom` | current_verified | `pravda-source-contacts` |
| `pravda-unit-prilohy` | Prílohy a vertikály | editorial | `pravda-unit-newsroom` | current_verified | `pravda-source-contacts` |
| `pravda-unit-production` | Výroba a distribúcia | production | `pravda-unit-publisher` | current_verified | `pravda-source-contacts` |
| `pravda-unit-technology` | IS a IT | technology | `pravda-unit-publisher` | current_verified | `pravda-source-contacts` |
| `pravda-unit-marketing` | Marketing | commercial | `pravda-unit-publisher` | current_verified | `pravda-source-contacts` |
| `pravda-unit-commercial` | Inzercia a obchod | commercial | `pravda-unit-publisher` | current_verified | `pravda-source-contacts` |

## 4. Verejne pomenované osoby a roly

Počet unikátnych osôb v tomto zbere: **31**. Počet explicitných rolí: **31**. Počet jednotiek: **17**.

| person_id | meno | verejná rola | unit_id | role_level | roster_status | evidence_state | sources |
|---|---|---|---|---|---|---|---|
| `pravda-person-maros-havran` | Maroš Havran | predseda predstavenstva | `pravda-unit-governance` | publisher_leadership | listed_current | current_verified | `pravda-source-orsr` |
| `pravda-person-ladislav-olle` | Ladislav Ollé | člen predstavenstva; obchodný riaditeľ | `pravda-unit-governance` | publisher_leadership | listed_current | current_verified | `pravda-source-orsr` |
| `pravda-person-katarina-agnerova` | Katarína Agnerová | členka predstavenstva; finančná riaditeľka | `pravda-unit-governance` | publisher_leadership | listed_current | current_verified | `pravda-source-orsr` |
| `pravda-person-rastislav-sedaj` | Rastislav Šedaj | člen dozornej rady; riaditeľ IS a IT | `pravda-unit-governance` | governance | listed_current | current_verified | `pravda-source-orsr` |
| `pravda-person-rudolf-ondrus` | Rudolf Ondruš | člen dozornej rady | `pravda-unit-governance` | governance | listed_current | current_verified | `pravda-source-orsr` |
| `pravda-person-natalia-petkacova` | Natália Petkáčová | členka dozornej rady; riaditeľka marketingu | `pravda-unit-governance` | governance | listed_current | current_verified | `pravda-source-orsr` |
| `pravda-person-michal-voracek` | Michal Voráček | konečný užívateľ výhod podľa RPVS | `pravda-unit-ownership` | owner | listed_current | current_verified | `pravda-source-rpvs-2025`, `pravda-source-rpvs-current` |
| `pravda-person-daniela-madunicka` | Daniela Madunická | manažérka výroby a distribúcie | `pravda-unit-production` | support_staff | listed_current | current_verified | `pravda-source-contacts` |
| `pravda-person-lubos-kamenisty` | Ľuboš Kamenistý | riaditeľ obsahu | `pravda-unit-leadership` | editorial_leadership | listed_current | current_verified | `pravda-source-contacts` |
| `pravda-person-anna-mogilevskaia` | Anna Mogilevskaia | vedúca kontaktu pre Domáce udalosti | `pravda-unit-domace` | unit_lead | listed_current | current_verified | `pravda-source-contacts` |
| `pravda-person-jaroslav-fabok` | Jaroslav Fabok | vedúci kontaktu pre Ekonomiku | `pravda-unit-ekonomika` | unit_lead | listed_current | current_verified | `pravda-source-contacts` |
| `pravda-person-andrej-matisak` | Andrej Matišák | vedúci kontaktu pre Zahraničné udalosti | `pravda-unit-zahranicie` | unit_lead | listed_current | current_verified | `pravda-source-contacts` |
| `pravda-person-igor-danis` | Igor Daniš | vedúci kontaktu pre Názory | `pravda-unit-nazory` | unit_lead | listed_current | current_verified | `pravda-source-contacts` |
| `pravda-person-katarina-sedlakova` | Katarína Sedláková | vedúca kontaktu pre Kultúru; vedúca Pravda TV magazínu | `pravda-unit-kultura` | unit_lead | listed_current | current_verified | `pravda-source-contacts` |
| `pravda-person-adam-zelinka` | Adam Zelinka | vedúci kontaktu pre Šport | `pravda-unit-sport` | unit_lead | listed_current | current_verified | `pravda-source-contacts` |
| `pravda-person-ivan-piovarci` | Ivan Piovarči | vedúci kontaktu pre Online | `pravda-unit-online` | unit_lead | listed_current | current_verified | `pravda-source-contacts` |
| `pravda-person-zuzana-hlavackova` | Zuzana Hlavačková | vedúca Užitočnej Pravdy | `pravda-unit-prilohy` | unit_lead | listed_current | current_verified | `pravda-source-contacts` |
| `pravda-person-henrieta-halasova` | Henrieta Halasová | vedúca komerčných príloh | `pravda-unit-prilohy` | commercial_staff | listed_current | current_verified | `pravda-source-contacts` |
| `pravda-person-patricia-zlamalova` | Patrícia Zlámalová | vedúca Varechy | `pravda-unit-prilohy` | unit_lead | listed_current | current_verified | `pravda-source-contacts` |
| `pravda-person-miroslav-caplovic` | Miroslav Čaplovič | vedúci Víkendu | `pravda-unit-prilohy` | unit_lead | listed_current | current_verified | `pravda-source-contacts` |
| `pravda-person-bianka-stuppacherova` | Bianka Stuppacherová | vedúca Dobrého zdravia | `pravda-unit-prilohy` | unit_lead | listed_current | current_verified | `pravda-source-contacts` |
| `pravda-person-frantisek-steffek` | František Šteffek | vedúci Krížoviek | `pravda-unit-prilohy` | unit_lead | listed_current | current_verified | `pravda-source-contacts` |
| `pravda-person-lubica-sulejova` | Ľubica Šulejová | referentka inzercie | `pravda-unit-commercial` | commercial_staff | listed_current | current_verified | `pravda-source-contacts` |
| `pravda-person-maria-krajcovicova` | Mária Krajčovičová | referentka inzercie | `pravda-unit-commercial` | commercial_staff | listed_current | current_verified | `pravda-source-contacts` |
| `pravda-person-lubos-borovsky` | Ľuboš Borovský | Head of Print | `pravda-unit-commercial` | commercial_staff | listed_current | current_verified | `pravda-source-contacts` |
| `pravda-person-peter-hejduk` | Peter Hejduk | Key Account Manager; zahraničná inzercia | `pravda-unit-commercial` | commercial_staff | listed_current | current_verified | `pravda-source-contacts` |
| `pravda-person-xenia-valentova` | Xénia Valentová | manažérka inzercie | `pravda-unit-commercial` | commercial_staff | listed_current | current_verified | `pravda-source-contacts` |
| `pravda-person-livia-dvorska` | Lívia Dvorská | manažérka inzercie | `pravda-unit-commercial` | commercial_staff | listed_current | current_verified | `pravda-source-contacts` |
| `pravda-person-radovan-gasparik` | Radovan Gašparík | Head of Online Advertising | `pravda-unit-commercial` | commercial_staff | listed_current | current_verified | `pravda-source-contacts` |
| `pravda-person-miriam-puhova` | Miriam Puhová | Key Account Manager | `pravda-unit-commercial` | commercial_staff | listed_current | current_verified | `pravda-source-contacts` |
| `pravda-person-andrea-hevesova` | Andrea Hevešová | Senior Digital Specialist | `pravda-unit-commercial` | commercial_staff | listed_current | current_verified | `pravda-source-contacts` |

## 5. Posledné dostupné finančné fakty

| obdobie | metrika | hodnota | poznámka | source |
|---|---|---:|---|---|
| 2025 | čistý obrat | 7 858 801 EUR | Údaj celej spoločnosti OUR MEDIA SR a. s.; 2024: 8 399 548 EUR. | `pravda-source-ruz-2025` |
| 2025 | výsledok hospodárenia po zdanení | -133 896 EUR | Údaj celej spoločnosti; 2024: zisk 387 854 EUR. | `pravda-source-ruz-2025` |
| 2025 | vlastné imanie | 2 780 873 EUR |  | `pravda-source-ruz-2025` |
| 2025 | osobné náklady | 2 144 389 EUR |  | `pravda-source-ruz-2025` |

Čísla sú firemné; nie sú segmentovým účtovníctvom konkrétneho média.

## 6. Verejné zmluvy a dotácie

V tomto rýchlom prvom priechode nebol do dokumentu zaradený žiadny záznam. To nie je tvrdenie, že zmluvy alebo dotácie neexistujú; konsolidované vyhľadanie podľa IČO v CRZ a dotačných registroch zostáva otvorenou úlohou.

## 7. Explicitné medzery

- Pravda nezverejňuje na kontaktnej stránke úplný zoznam radových redaktorov, editorov, fotografov, grafikov, korektorov ani produkčných pracovníkov; nemožno preto tvrdiť úplný interný headcount redakcie.
- Verejné zmluvy a dotácie neboli v rýchlom prvom priechode konsolidovane prehľadané; žiadne sa preto neuvádzajú.
- Finančné čísla patria celej spoločnosti OUR MEDIA SR a. s., nie iba značke Pravda.

Otvorené otázky:

- Ktorí radoví redaktori, editori, fotografi, grafici, korektori a produkční pracovníci tvoria aktuálnu redakciu mimo zverejnených vedúcich kontaktov?
- Aké verejné zmluvy alebo dotácie možno priamo priradiť OUR MEDIA SR a. s. v CRZ a dotačných registroch?
- Aký podiel na firemných finančných výsledkoch tvorí samostatne značka Pravda?

## 8. Zdroje

- `pravda-source-contacts` — [Kontakty – vedenie, redakcia, prílohy a obchod](https://www.pravda.sk/info/kontakty), Pravda / OUR MEDIA SR a. s.; typ `official_roster`; prístup **2026-09-03**. Aktuálna first-party kontaktná stránka; dokument nezachytáva telefóny ani e-maily.
- `pravda-source-orsr` — [Aktuálny výpis OUR MEDIA SR a. s., IČO 51267055](https://www.orsr.sk/vypis.asp?ID=408378&SID=2&P=0), Obchodný register SR; typ `official_registry`; prístup **2026-09-03**.
- `pravda-source-ruz-entity` — [OUR MEDIA SR a. s. – účtovná jednotka a závierky](https://www.registeruz.sk/cruz-public/domain/accountingentity/show/1738996), Register účtovných závierok; typ `official_registry`; prístup **2026-09-03**.
- `pravda-source-ruz-2025` — [OUR MEDIA SR a. s. – účtovná závierka 2025](https://www.registeruz.sk/cruz-public/domain/financialreport/show/10088717/552), Register účtovných závierok; typ `financial_filing`; prístup **2026-09-03**.
- `pravda-source-rpvs-2025` — [Verifikačný dokument OUR MEDIA SR a. s. z 25. 8. 2025](https://rpvs.gov.sk/rpvs/Partner/Partner/Dokument/236564), Register partnerov verejného sektora; typ `official_registry`; prístup **2026-09-03**. Použitá len vlastnícka štruktúra a profesijný status KUV; súkromné adresy a dátumy narodenia sú vedome vynechané.
- `pravda-source-rpvs-current` — [Aktuálny výpis RPVS – OUR MEDIA SR a. s.](https://rpvs.gov.sk/rpvs/Partner/Partner/DetailPdf/33329), Register partnerov verejného sektora; typ `official_registry`; prístup **2026-09-03**. Použitý iba stav registrácie a meno KUV; súkromné údaje sú vynechané.
