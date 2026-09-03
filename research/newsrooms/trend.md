# TREND — mapa redakcie a vydavateľa

> Stav overenia: **2026-09-03**
> Stabilné ID média: `trend`
> Verejný web: <https://www.trend.sk/>
> Mapping state: `public_roster_mapped`
> Scope: profesionálna a inštitucionálna mapa z verejných primárnych zdrojov. Neobsahuje súkromné adresy osôb, dátumy narodenia, rodinné väzby, súkromné kontakty ani osobný majetok.

Zmapovaný celý aktuálny first-party autorovský adresár TRENDU: 48 položiek, z toho 43 ľudí a 5 nepersonálnych atribúcií. Oddelene je pridané vedenie, governance a verejne pomenovaná spoločná podpora vydavateľa.

## 1. Identita a právny rámec

| Pole | Hodnota | Stav | Zdroj |
|---|---|---|---|
| Médium | TREND | current_verified | `trend-source-authors` |
| Vydavateľ | News and Media Holding a.s. | current_verified | `trend-source-nmh-contacts`, `trend-source-orsr` |
| IČO | 47256281 | current_verified | `trend-source-nmh-contacts`, `trend-source-orsr` |
| Právna forma | akciová spoločnosť | current_verified | `trend-source-nmh-contacts`, `trend-source-orsr` |
| Sídlo právnickej osoby | Einsteinova 25, 851 01 Bratislava – mestská časť Petržalka | current_verified | `trend-source-nmh-contacts`, `trend-source-orsr` |

### Vlastníctvo a governance

Aktuálny ORSR uvádza ako jediného akcionára **MEDIA SK HOLDINGS LIMITED**. Predstavenstvo: Michal Teplica a Marián Koreň. Dozorná rada: Martin Danko, Martina Kánová, Miloš Baranec. RPVS potvrdzuje aktívny zápis vydavateľa; osobné a rodinné údaje z registra sa nepreberajú.

### Štruktúra autorovského adresára

Aktuálny adresár obsahuje **48 položiek**: **43 fyzických osôb** a **5 nepersonálnych atribučných účtov** (ČTK, SITA, TASR, Tlačová správa, We Know How). V people tabuľke sú len fyzické osoby. Internosť sa priznáva iba pri explicitnej redakčnej roli; externisti a osoby bez roly zostávajú oddelené.


## 2. Produkty

| product_id | produkt | typ | vzťah | stav | sources |
|---|---|---|---|---|---|
| `trend-product-print` | Týždenník TREND | print | ekonomický a podnikateľský týždenník | current_verified | `trend-source-about`, `trend-source-nmh-products` |
| `trend-product-web` | TREND.sk | publication | denný ekonomický web | current_verified | `trend-source-advertising` |
| `trend-product-medialne` | Mediálne | publication | špecializovaný web súčasťou portálu TREND | current_verified | `trend-source-advertising` |
| `trend-product-reality` | TREND Reality | publication | špecializovaný realitný web/vertikála | current_verified | `trend-source-advertising` |
| `trend-product-enjoy` | Enjoy | magazine | špecializovaný lifestylový web/vertikála | current_verified | `trend-source-advertising` |
| `trend-product-analyses` | TREND Analyses | software | ekonomické a firemné dáta/analýzy | current_verified | `trend-source-nmh-contacts` |
| `trend-product-konferencie` | TREND konferencie | events | podujatia značky TREND | current_verified | `trend-source-nmh-contacts` |
| `trend-product-app` | Aplikácia TREND | software | mobilná distribučná aplikácia | current_verified | `trend-source-advertising` |

## 3. Verejné organizačné jednotky

| unit_id | názov | typ | parent | stav | sources |
|---|---|---|---|---|---|
| `trend-unit-publisher` | News and Media Holding a.s. | publisher | — | current_verified | `trend-source-nmh-about`, `trend-source-orsr` |
| `trend-unit-governance` | Predstavenstvo a dozorná rada | governance | `trend-unit-publisher` | current_verified | `trend-source-orsr` |
| `trend-unit-ownership` | Vlastníctvo | ownership | `trend-unit-publisher` | current_verified | `trend-source-orsr`, `trend-source-rpvs-2025` |
| `trend-unit-newsroom` | Redakcia TRENDU | newsroom | `trend-unit-publisher` | current_verified | `trend-source-authors` |
| `trend-unit-leadership` | Vedenie redakcie | leadership | `trend-unit-newsroom` | current_verified | `trend-source-authors` |
| `trend-unit-editorial` | Redaktori a editori | editorial | `trend-unit-newsroom` | current_verified | `trend-source-authors` |
| `trend-unit-digital` | Webová a online editácia | desk | `trend-unit-newsroom` | current_verified | `trend-source-authors` |
| `trend-unit-design` | Grafika | design | `trend-unit-newsroom` | current_verified | `trend-source-authors` |
| `trend-unit-external` | Externí a ostatní verejne uvedení autori | editorial | `trend-unit-newsroom` | current_verified | `trend-source-authors` |
| `trend-unit-attribution` | Nepersonálne atribučné účty | support | `trend-unit-newsroom` | current_verified | `trend-source-authors` |
| `trend-unit-publisher-executive` | Executive Board vydavateľa | leadership | `trend-unit-publisher` | current_verified | `trend-source-nmh-about` |
| `trend-unit-commercial` | Spoločný obchod a marketing vydavateľa | commercial | `trend-unit-publisher` | current_verified | `trend-source-nmh-contacts` |
| `trend-unit-support` | Spoločná prevádzka, HR, výroba, distribúcia a eventy | support | `trend-unit-publisher` | current_verified | `trend-source-nmh-contacts` |

## 4. Verejne pomenované osoby a roly

Počet unikátnych osôb v tomto zbere: **64**. Počet explicitných rolí: **66**. Počet jednotiek: **13**.

| person_id | meno | verejná rola | unit_id | role_level | roster_status | evidence_state | sources |
|---|---|---|---|---|---|---|---|
| `trend-person-ronald-izip` | Ronald Ižip | šéfredaktor | `trend-unit-leadership` | editorial_leadership | listed_current | current_verified | `trend-source-authors` |
| `trend-person-lubor-kysely` | Ľubor Kyselý | hlavný editor, zástupca šéfredaktora | `trend-unit-leadership` | editorial_leadership | listed_current | current_verified | `trend-source-authors` |
| `trend-person-peter-scherhaufer` | Peter Scherhaufer | editor a redaktor | `trend-unit-editorial` | editorial_staff | listed_current | current_verified | `trend-source-authors` |
| `trend-person-benita-feketeova` | Benita Feketeová | redaktorka | `trend-unit-editorial` | editorial_staff | listed_current | current_verified | `trend-source-authors` |
| `trend-person-tomas-mikulik` | Tomáš Mikulík | externý spolupracovník | `trend-unit-external` | external_contributor | external_listed | current_verified | `trend-source-authors` |
| `trend-person-veronika-vankova` | Veronika Vaňková | redaktorka | `trend-unit-editorial` | editorial_staff | listed_current | current_verified | `trend-source-authors` |
| `trend-person-adam-valcek` | Adam Valček | webový redaktor | `trend-unit-digital` | editorial_staff | listed_current | current_verified | `trend-source-authors` |
| `trend-person-andrej-horvath` | Andrej Horváth | externý redaktor | `trend-unit-external` | external_contributor | external_listed | current_verified | `trend-source-authors` |
| `trend-person-branislav-toma` | Branislav Toma | redaktor | `trend-unit-editorial` | editorial_staff | listed_current | current_verified | `trend-source-authors` |
| `trend-person-cyril-choma` | Cyril Choma | redaktor | `trend-unit-editorial` | editorial_staff | listed_current | current_verified | `trend-source-authors` |
| `trend-person-dana-jelinkova-dudzikova` | Dana Jelinková Dudzíková | sudkyňa Správneho súdu v Bratislave; autorovský profil bez redakčnej roly | `trend-unit-external` | external_contributor | external_listed | current_verified | `trend-source-authors` |
| `trend-person-dana-minova` | Dana Miňová | rola v adresári neuvedená | `trend-unit-external` | unknown | unknown | current_verified | `trend-source-authors` |
| `trend-person-daniel-ivancak` | Daniel Ivančák | online editor | `trend-unit-digital` | editorial_staff | listed_current | current_verified | `trend-source-authors` |
| `trend-person-dominika-komarova` | Dominika Komárová | externá redaktorka | `trend-unit-external` | external_contributor | external_listed | current_verified | `trend-source-authors` |
| `trend-person-ivan-kotuliak` | Ivan Kotuliak | rola v adresári neuvedená | `trend-unit-external` | unknown | unknown | current_verified | `trend-source-authors` |
| `trend-person-ivo-hlavacek` | Ivo Hlaváček | externý autor | `trend-unit-external` | external_contributor | external_listed | current_verified | `trend-source-authors` |
| `trend-person-jana-ovesna` | Jana Ovesná | externá redaktorka | `trend-unit-external` | external_contributor | external_listed | current_verified | `trend-source-authors` |
| `trend-person-janko-michal` | Janko Michal | externý autor | `trend-unit-external` | external_contributor | external_listed | current_verified | `trend-source-authors` |
| `trend-person-jozef-slivka` | Jozef Slivka | rola v adresári neuvedená | `trend-unit-external` | unknown | unknown | current_verified | `trend-source-authors` |
| `trend-person-juraj-filin` | Juraj Filin | editor printu | `trend-unit-editorial` | production_staff | listed_current | current_verified | `trend-source-authors` |
| `trend-person-juraj-skacan` | Juraj Skačan | redaktor | `trend-unit-editorial` | editorial_staff | listed_current | current_verified | `trend-source-authors` |
| `trend-person-karol-krpala` | Karol Krpala | spoločensko-politický analytik; autorovský profil bez redakčnej roly | `trend-unit-external` | external_contributor | external_listed | current_verified | `trend-source-authors` |
| `trend-person-katarina-hrncarova` | Katarína Hrnčárová | rola v adresári neuvedená | `trend-unit-external` | unknown | unknown | current_verified | `trend-source-authors` |
| `trend-person-laura-kuricova` | Laura Kuricová | redaktorka | `trend-unit-editorial` | editorial_staff | listed_current | current_verified | `trend-source-authors` |
| `trend-person-lucia-filcikova` | Lucia Filčíková | externá redaktorka | `trend-unit-external` | external_contributor | external_listed | current_verified | `trend-source-authors` |
| `trend-person-lukas-kovanda` | Lukáš Kovanda | externý autor | `trend-unit-external` | external_contributor | external_listed | current_verified | `trend-source-authors` |
| `trend-person-marek-borovsky` | Marek Borovský | grafik | `trend-unit-design` | production_staff | listed_current | current_verified | `trend-source-authors` |
| `trend-person-marek-janitor` | Marek Janitor | webový editor | `trend-unit-digital` | editorial_staff | listed_current | current_verified | `trend-source-authors` |
| `trend-person-mario-kormendy` | Mário Körmendy | externý redaktor | `trend-unit-external` | external_contributor | external_listed | current_verified | `trend-source-authors` |
| `trend-person-martin-polonyi` | Martin Polónyi | externý autor | `trend-unit-external` | external_contributor | external_listed | current_verified | `trend-source-authors` |
| `trend-person-martina-starkova` | Martina Štarková | rola v adresári neuvedená | `trend-unit-external` | unknown | unknown | current_verified | `trend-source-authors` |
| `trend-person-miroslav-homola` | Miroslav Homola | redaktor | `trend-unit-editorial` | editorial_staff | listed_current | current_verified | `trend-source-authors` |
| `trend-person-nina-bacharova` | Nina Bacharová | rola v adresári neuvedená | `trend-unit-external` | unknown | unknown | current_verified | `trend-source-authors` |
| `trend-person-pavel-peterka` | Pavel Peterka | rola v adresári neuvedená | `trend-unit-external` | unknown | unknown | current_verified | `trend-source-authors` |
| `trend-person-petra-adamekova` | Petra Adámeková | rola v adresári neuvedená | `trend-unit-external` | unknown | unknown | current_verified | `trend-source-authors` |
| `trend-person-petra-smith` | Petra Smith | externá autorka | `trend-unit-external` | external_contributor | external_listed | current_verified | `trend-source-authors` |
| `trend-person-radovan-vavra` | Radovan Vávra | rola v adresári neuvedená | `trend-unit-external` | unknown | unknown | current_verified | `trend-source-authors` |
| `trend-person-radovan-zuffa` | Radovan Žuffa | redaktor | `trend-unit-editorial` | editorial_staff | listed_current | current_verified | `trend-source-authors` |
| `trend-person-roman-magerko` | Roman Magerko | grafik | `trend-unit-design` | production_staff | listed_current | current_verified | `trend-source-authors` |
| `trend-person-slavka-ciganova` | Slávka Cigáňová | redaktorka | `trend-unit-editorial` | editorial_staff | listed_current | current_verified | `trend-source-authors` |
| `trend-person-stanislav-panis` | Stanislav Pánis | analytik J&T Banky; autorovský profil bez redakčnej roly | `trend-unit-external` | external_contributor | external_listed | current_verified | `trend-source-authors` |
| `trend-person-tomas-szmrecsanyi` | Tomáš Szmrecsányi | redaktor | `trend-unit-editorial` | editorial_staff | listed_current | current_verified | `trend-source-authors` |
| `trend-person-viktor-sedlak` | Viktor Sedlák | externý redaktor | `trend-unit-external` | external_contributor | external_listed | current_verified | `trend-source-authors` |
| `trend-person-michal-teplica` | Michal Teplica | Chief Executive Officer | `trend-unit-publisher-executive` | publisher_leadership | listed_current | current_verified | `trend-source-nmh-about` |
| `trend-person-michal-teplica` | Michal Teplica | predseda predstavenstva | `trend-unit-governance` | governance | listed_current | current_verified | `trend-source-orsr` |
| `trend-person-filip-kadlecik` | Filip Kadlečík | Chief Content Officer | `trend-unit-publisher-executive` | publisher_leadership | listed_current | current_verified | `trend-source-nmh-about` |
| `trend-person-marian-koren` | Marián Koreň | Chief Financial Officer | `trend-unit-publisher-executive` | publisher_leadership | listed_current | current_verified | `trend-source-nmh-about` |
| `trend-person-marian-koren` | Marián Koreň | podpredseda predstavenstva | `trend-unit-governance` | governance | listed_current | current_verified | `trend-source-orsr` |
| `trend-person-jana-vargicova` | Jana Vargicová | Chief HR Officer | `trend-unit-publisher-executive` | publisher_leadership | listed_current | current_verified | `trend-source-nmh-about` |
| `trend-person-juraj-velicka` | Juraj Velička | Director of Innovations | `trend-unit-publisher-executive` | technology_staff | listed_current | current_verified | `trend-source-nmh-about` |
| `trend-person-milan-vysopal` | Milan Vysopal | Chief Sales Officer | `trend-unit-commercial` | publisher_leadership | listed_current | current_verified | `trend-source-nmh-about` |
| `trend-person-marcela-putalova-bobekova` | Marcela Putalová Bobeková | Head of Print Sales | `trend-unit-commercial` | commercial_staff | listed_current | current_verified | `trend-source-nmh-contacts` |
| `trend-person-miroslava-andrasova` | Miroslava Andrášová | Head of Online Sales | `trend-unit-commercial` | commercial_staff | listed_current | current_verified | `trend-source-nmh-contacts` |
| `trend-person-nina-hrusovska` | Nina Hrušovská | Head of B2B Sales | `trend-unit-commercial` | commercial_staff | listed_current | current_verified | `trend-source-nmh-contacts` |
| `trend-person-anna-olexova` | Anna Olexová | Event Account Manager | `trend-unit-support` | commercial_staff | listed_current | current_verified | `trend-source-nmh-contacts` |
| `trend-person-martin-stanecky` | Martin Stanecký | Head of Production | `trend-unit-support` | support_staff | listed_current | current_verified | `trend-source-nmh-contacts` |
| `trend-person-igor-racicky` | Igor Račický | Deputy Head of Distribution | `trend-unit-support` | support_staff | listed_current | current_verified | `trend-source-nmh-contacts` |
| `trend-person-katarina-slezakova` | Katarína Slezáková | Chief Marketing Officer | `trend-unit-commercial` | publisher_leadership | listed_current | current_verified | `trend-source-nmh-contacts` |
| `trend-person-andrea-kubalakova` | Andrea Kubaľáková | Senior Brand Manager | `trend-unit-commercial` | commercial_staff | listed_current | current_verified | `trend-source-nmh-contacts` |
| `trend-person-martina-polkova` | Martina Polková | Senior Brand Manager | `trend-unit-commercial` | commercial_staff | listed_current | current_verified | `trend-source-nmh-contacts` |
| `trend-person-nikola-zimanova` | Nikola Zimanová | Senior Brand Manager | `trend-unit-commercial` | commercial_staff | listed_current | current_verified | `trend-source-nmh-contacts` |
| `trend-person-sandra-adamek-conortova` | Sandra Adámek Conortová | Brand Manager | `trend-unit-commercial` | commercial_staff | listed_current | current_verified | `trend-source-nmh-contacts` |
| `trend-person-silvia-kis` | Silvia Kis | Marketing Support | `trend-unit-commercial` | support_staff | listed_current | current_verified | `trend-source-nmh-contacts` |
| `trend-person-martin-danko` | Martin Danko | člen dozornej rady | `trend-unit-governance` | governance | listed_current | current_verified | `trend-source-orsr` |
| `trend-person-martina-kanova` | Martina Kánová | členka dozornej rady | `trend-unit-governance` | governance | listed_current | current_verified | `trend-source-orsr` |
| `trend-person-milos-baranec` | Miloš Baranec | člen dozornej rady | `trend-unit-governance` | governance | listed_current | current_verified | `trend-source-orsr` |

## 5. Posledné dostupné finančné fakty

| obdobie | metrika | hodnota | poznámka | source |
|---|---|---:|---|---|
| 2025 | čistý obrat | 41 772 679 EUR | Údaj celej News and Media Holding a.s.; 2024: 43 409 210 EUR. | `trend-source-ruz-2025` |
| 2025 | výsledok hospodárenia po zdanení | 2 460 114 EUR | Údaj celej spoločnosti; 2024: 1 147 112 EUR. | `trend-source-ruz-2025` |
| 2025 | osobné náklady | 9 770 125 EUR |  | `trend-source-ruz-2025` |
| 2025 | výsledok hospodárenia z hospodárskej činnosti | 6 177 793 EUR |  | `trend-source-ruz-2025` |

Čísla sú firemné; nie sú segmentovým účtovníctvom konkrétneho média.

## 6. Verejné zmluvy a dotácie

V tomto rýchlom prvom priechode nebol do dokumentu zaradený žiadny záznam. To nie je tvrdenie, že zmluvy alebo dotácie neexistujú; konsolidované vyhľadanie podľa IČO v CRZ a dotačných registroch zostáva otvorenou úlohou.

## 7. Explicitné medzery

- Autorovský adresár mieša interných redaktorov, externistov, profesijných hostí a osoby bez roly; samotná prítomnosť v adresári nedokazuje pracovný pomer.
- Adresár nemusí obsahovať všetky neverejné produkčné, korektorské, foto/video, dátové, administratívne alebo technické roly priradené priamo TRENDU.
- Publisher support roly sú spoločné pre celé portfólio News and Media Holding; okrem explicitného marketingového priradenia nemožno tvrdiť výlučnú väzbu na TREND.
- Finančné čísla patria celej News and Media Holding, nie iba TRENDU.
- Verejné zmluvy a dotácie neboli v rýchlom prvom priechode konsolidovane prehľadané.

Otvorené otázky:

- Ktoré osoby v autorovskom adresári sú interní zamestnanci, pravidelní externisti, jednorazoví hostia alebo historické profily?
- Ktoré produkčné, foto/video, korektorské, dátové, administratívne a technické roly sú pridelené priamo TRENDU?
- Aký podiel na firemných výsledkoch News and Media Holding tvorí TREND?
- Aká je aktuálna úplná korporátna vlastnícka reťaz za MEDIA SK HOLDINGS LIMITED?
- Aké verejné zmluvy alebo dotácie možno priamo priradiť vydavateľovi v CRZ a dotačných registroch?

## 8. Zdroje

- `trend-source-authors` — [TREND.sk – zoznam autorov](https://www.trend.sk/autori/), TREND / News and Media Holding a.s.; typ `official_roster`; prístup **2026-09-03**. Aktuálny 48-položkový adresár: 43 fyzických osôb a 5 nepersonálnych atribučných účtov.
- `trend-source-about` — [O nás – Týždenník TREND](https://www.trend.sk/o-nas), TREND; typ `official_outlet`; prístup **2026-09-03**.
- `trend-source-advertising` — [Prečo inzerovať na TREND.sk](https://www.trend.sk/inzercia), TREND; typ `official_outlet`; prístup **2026-09-03**.
- `trend-source-nmh-contacts` — [News and Media Holding – kontakty](https://www.newsandmedia.sk/kontakty/), News and Media Holding a.s.; typ `official_roster`; prístup **2026-09-03**. Spoločné publisher support roly; nie všetky sú výlučne pridelené TRENDU.
- `trend-source-nmh-about` — [News and Media Holding – o nás](https://www.newsandmedia.sk/o-nas/), News and Media Holding a.s.; typ `official_outlet`; prístup **2026-09-03**.
- `trend-source-nmh-products` — [News and Media Holding – produkty](https://www.newsandmedia.sk/produkty/), News and Media Holding a.s.; typ `official_outlet`; prístup **2026-09-03**.
- `trend-source-orsr` — [Aktuálny výpis News and Media Holding a.s., IČO 47256281](https://www.orsr.sk/vypis.asp?ID=318406&SID=2&P=0), Obchodný register SR; typ `official_registry`; prístup **2026-09-03**.
- `trend-source-ruz-entity` — [News and Media Holding a.s. – účtovná jednotka a závierky](https://www.registeruz.sk/cruz-public/domain/accountingentity/show/1565246), Register účtovných závierok; typ `official_registry`; prístup **2026-09-03**.
- `trend-source-ruz-2025` — [News and Media Holding a.s. – účtovná závierka 2025](https://www.registeruz.sk/cruz-public/domain/financialreport/show/10185246/552), Register účtovných závierok; typ `financial_filing`; prístup **2026-09-03**.
- `trend-source-rpvs` — [Aktuálny výpis RPVS – News and Media Holding a.s.](https://rpvs.gov.sk/rpvs/Partner/Partner/DetailPdf/25307), Register partnerov verejného sektora; typ `official_registry`; prístup **2026-09-03**. Súkromné údaje osôb sa nepreberajú.
- `trend-source-rpvs-2025` — [Verifikačný dokument News and Media Holding k 31. 12. 2025](https://rpvs.gov.sk/rpvs/Partner/Partner/Dokument/248851), Register partnerov verejného sektora; typ `official_registry`; prístup **2026-09-03**. Používa sa iba firemná vlastnícka vrstva; súkromné a rodinné údaje sú vynechané.
