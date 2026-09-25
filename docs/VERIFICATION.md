# Overenie nového frontendu Hriechu

Dátum: 5. september 2026. Stav: implementované, nasadené a overené na produkčnej doméne.

## Automatické overenie

`pnpm qa` po finálnych úpravách skončilo úspešne:

- Astro: 0 chýb, 0 upozornení, 0 odporúčaní.
- 6 testov pre dátový kontrakt a publikačnú politiku.
- 59 statických HTML stránok; všetkých 10 médií a ich päť sekcií.
- Všetky lokálne odkazy, obrazové referencie a fragmenty smerujú na existujúce ciele; bez duplicitných ID.
- Verejný build, RSS, sitemap a index vyhľadávania neobsahujú draft ani súkromné markery.
- Titulka má 4 733 bajtov HTML a neobsahuje skryté zoznamy všetkých redakcií.
- Pôvodný súbor `src/data/editorial-organization-map.json` zostal nezmenený.

Test publikačnej politiky pokrýva draft, stav review, chýbajúce schválenie alebo dátum a budúce vydanie. Overuje chronologické poradie, filtrovanie pred stránkovaním a delenie 14 filtrovaných položiek na strany 12 + 2. Aktuálna titulka má jeden pripravený prípad; ďalšie články sa nevytvárali ako výplň.

## Kontrola v prehliadači

- Desktop 1 440 px, mobil 390 px a úzky mobil 320 px; zachytený aj používateľov aktuálny viewport.
- Vyhľadávanie bez diakritiky: `dennik n` nájde jedno médium, `kostolny` jednu osobu.
- Kombinovanie tímu a funkcie, prázdny výsledok, zrušenie filtrov a návrat históriou fungujú.
- Priamy odkaz na osobu otvorí jej detail. Vlastnícka väzba vedie ku konkrétnemu zdrojovému záznamu.
- Starý odkaz `/#dennik-n-vazby` sa prevedie na `/mapy/redakcie/dennik-n/vztahy`.
- Bez JavaScriptu sa zobrazí základný obsah a natívne detaily osôb sa otvárajú; filtre majú vysvetlenú závislosť od JavaScriptu.
- Klávesnicová navigácia má viditeľné zaostrenie. Pri obmedzenom pohybe sú prechody vypnuté.
- Samostatné ovládanie má dotykové plochy najmenej 44 px; súvislý mobilný text má 18 px.
- Mobilné financie ukazujú obdobie a hodnotu spolu, následne ukazovateľ, poznámku a zdroj. Všetkých šesť faktov Postoja je kompletných a pri 320 px nevzniká vodorovné posúvanie celej stránky.
- Lokálny náhľad `/nahlad/publications/ukazka-formatovania` je funkčný a jasne označený ako technický draft Codexu. V produkčnom builde táto adresa nevzniká.

## Vizuálna kontrola

Opravený wordmark zachováva plastický charakter a uzavreté vodorovné čierne kontúry písmen r, c a oboch h. Originál zostáva v `public/brand/hriech-original.png`.

Nezávislá kontrola overila ružovú identitu, prvú obrazovku, čítanie článku, mapu a rozlíšenie vlastníctva, vedenia a konečných užívateľov výhod. Následné opravy dotykových plôch, mobilných financií, mapového vstupu, ikon a typografie päty boli uzavreté verdiktom `ship` v rozsahu tejto kontroly.

Overovacie zábery sú lokálne v `.impeccable/review/` a sú ignorované Gitom. Dlhé stránky boli zachytené súvisle; chybné skladané snímky boli nahradené.

## Produkčné nasadenie

Adam výslovne autorizoval nasadenie 5. septembra 2026. Cloudflare Worker `hriech-web` obsluhuje `https://hriech.xvadur.com`; Pages ostáva samostatný starší náhľad.

- Produkčná verzia: `55c88a7d-21b7-4012-a480-213305b441ed`, 100 % prevádzky od `2026-09-05T11:22:06.125Z`.
- Predchádzajúca verzia: `fb34b832-63c7-4ab4-87ff-bb71ccfca540`.
- Pred nasadením prešlo čerstvé `pnpm qa` a `wrangler deploy --dry-run`.
- Konfigurácia používa `drop-trailing-slash`, aby obsluhované adresy zodpovedali canonical odkazom Astro webu.
- Pri kontrole `2026-09-05T11:23:46.100Z` všetkých 83 produkčných súborov vrátane 59 HTML stránok vrátilo HTTP 200 a ich SHA-256 sa zhodoval s overeným lokálnym buildom.
- Lokálny draft, jeho možná publikačná adresa aj neexistujúca stránka vrátili vlastnú stránku 404; draftový obsah nebol sprístupnený.
- Produkčná titulka bola vizuálne skontrolovaná v prehliadači. Priamy odkaz na Gábora Borosa v Refresheri otvoril detail; vyhľadávanie `boros` zobrazilo 1 z 34 osôb. Fonty sa načítali.
- Úplný výsledok porovnania a produkčný záber sú lokálne v `.impeccable/review/production-check.json` a `.impeccable/review/production-desktop.png`.

Nasadený bol priamo overený build; Git commit ani GitHub push neprebehli. Publikovanie ďalších autorských textov pokračuje podľa `docs/PUBLISHING.md`.
