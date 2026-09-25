# Mapa slovenských redakcií

Stav: `public_source_research`
Aktualizované: 2026-09-03

## Prioritný scope

1. Denník N
2. SME
3. Aktuality.sk
4. Startitup
5. Refresher
6. Pravda
7. Hospodárske noviny
8. Trend
9. Štandard
10. Postoj

TA3 a STVR Správy sú v druhej vlne.

## Rýchly prvý priechod

Médium vstúpi do mapy Hriechu po overení aktuálneho verejného rosteru, organizačných
jednotiek, vydavateľa a IČO. Finančné fakty sa berú z poslednej dostupnej
účtovnej závierky. CRZ, granty, súdy a historické profesijné väzby sa dopĺňajú
ako ďalšia vrstva a nesmú blokovať základný organigram.

Mená a roly sa preberajú dávkovo z oficiálnej tímovej stránky. Individuálne sa
preveruje vedenie, zákonné orgány, vlastníctvo a konfliktné alebo neaktuálne
záznamy. Chýbajúce údaje sa označia ako medzera; nedopĺňajú sa domnienkou.

## Hranica

Mapa používa iba verejné profesijné a inštitucionálne údaje. Neobsahuje
súkromné adresy fyzických osôb, rodné údaje, rodinu, osobné kontakty ani
majetkové lustrovanie fyzických osôb.

Kanonický strojový kontrakt je
`contracts/media/v1/editorial-organization-map.schema.json`; publikovaná dátová
projekcia je `src/data/editorial-organization-map.json`.

## Úprava dát

Osem médií od Aktualít po Postoj má vstupné JSON fragmenty v `fragments/`.
Denník N a SME sú zatiaľ priamo v `src/data/editorial-organization-map.json`.
Po úprave fragmentu spusti z koreňa projektu `pnpm sync:newsrooms`, skontroluj
diff výslednej projekcie a potom `pnpm qa`.

Synchronizácia prepisuje osem médií ich fragmentmi, preto ich zmeny rob vo
fragmentoch. Skript zachováva dátum snapshotu 2026-09-03; jeho spustenie samo
osebe nepredstavuje nové overenie zdrojov. Markdown podklady aktualizuj spolu
s príslušnými dátami.
