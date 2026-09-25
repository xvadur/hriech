# Publikovanie cez Codex

Hriech je statický Astro web. Netopier vlastní monitoring, pamäť a získavanie dôkazov. Tento projekt vlastní verejné texty, prípady a mapy.

## Lokálny postup

1. Priprav redigovaný Markdown v src/content/publications alebo src/content/cases so stavom draft. Súkromné podklady nechaj v ignorovanom private/; neprekopíruj ich do kolekcie.
2. Spusti pnpm dev --host 127.0.0.1. Náhľad draftu je na /nahlad/publications/SLUG, prípad na /nahlad/cases/SLUG. Tieto cesty existujú iba v dev režime a majú noindex.
3. Adam skontroluje konkrétny text, citácie, autorstvo, rozsah AI a súvisiace odkazy.
4. Až na výslovný pokyn k publikovaniu nastav status: published, publishedAt a approvedBy. Dátum nesmie byť v budúcnosti. Aktualizácie označ updatedAt.
5. Spusti pnpm qa, skontroluj lokálny náhľad. Push a produkčné nasadenie sú samostatné externé kroky vyžadujúce výslovný pokyn.

Samotný stav published v dátach nenahrádza Adamov pokyn. Skript vie overiť metadáta, nie vôľu autora.

## Polia

title, description, kind (clanok/postreh/pripad), status (draft/review/published), publishedAt, updatedAt, author, aiDisclosure, approvedBy, voliteľný cover (src, alt, caption), caseId, moduleId a sources (id, title, url).

AI autorstvo vypíš pravdivo. Ak text vytvorila AI, neoznač ho automaticky ako Adamov článok. Zdrojový fakt, citácia, komentár a hypotéza zostávajú rozlíšené v texte.

Zdroje prepájaj pri tvrdení cez #zdroj-ID aj na záverečný zoznam. Odkazy na mapu majú tvar /mapy/redakcie/MEDIUM/ludia#osoba-ID, /vztahy#vztah-ID a /zdroje#zdroj-ID.

Ukážku typografie otvor na /nahlad/publications/ukazka-formatovania. Je úmyselne draftom a obsahuje kontrolný marker. QA overuje, že sa jej text ani adresa nedostali do dist, RSS, sitemap či vyhľadávacieho indexu.

## Verejné výstupy

Titulka, filtre, stránkovanie, detail, RSS, sitemap a search.json používajú jednu publikačnú politiku. Každá stránka obsahuje najviac 12 publikácií. Mapový modul má samostatné statické stránky pre každé médium a sekciu.

Nové mapové moduly dostanú vlastný adaptér dát. Záznam v kolekcii modules má title, description, href, caseId a available; samotné pridanie modulu vyžaduje funkčnú implementáciu jeho stránok.

Tento frontendový návrh nie je nasadenie. Existujúce verejné mapové podklady sú presunuté do novej navigácie bez zmeny datasetu.
