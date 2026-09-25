# Hriech

Hriech je hlavný verejný projekt Adama Rudavského pre mediálnu kritiku.
Web [hriech.xvadur.com](https://hriech.xvadur.com) spája mapu slovenských
redakcií, zdrojovo ohraničené prípady, metodiku, sourcebooky a postupne ďalšie
verejné výstupy.

Prvá publikovaná vrstva mapuje personálnu, organizačnú, vlastnícku, finančnú a
inštitucionálnu štruktúru desiatich slovenských online médií. Mapa je začiatok
projektu, nie jeho konečný rozsah.

## Vlastníctvo obsahu

Začni podľa práce, ktorú ideš robiť:

| Práca | Vstup |
|---|---|
| Písanie článku, interné prípady a zdroje | Lokálny `private/README.md` |
| Verejné výskumné podklady | [Výskum Hriechu](research/README.md) |
| Aktualizácia mapy médií | [Mapa redakcií](research/newsrooms/README.md) |
| Úprava webu | `src/pages/index.astro`, komponenty v `src/components/` |

Súkromný rozcestník je dostupný iba v lokálnom projekte.

- `src/` — verejný web a jeho kurátorované dáta.
- `research/newsrooms/` — verejné podklady k mapovaniu redakcií.
- `research/editorial/` — produktové a investigatívne briefy.
- `contracts/` — verejné dátové kontrakty Hriechu.
- `private/research/compiled/` — interný analytický rámec a case files.
- `private/research/sourcebooks/` — pracovné argumentačné a dôkazové balíky.
- `private/drafts/` — verzie rozpracovaných článkov; verzia neurčuje schválenie.
- `private/` — raw poznámky, celé transkripty a ďalšie nepublikovateľné
  zdroje; adresár je lokálny a Git ho ignoruje.

Netopier dodáva zdrojový archív a event intelligence. Hriech vlastní mediálnu
kritiku, prípady, argumenty a verejnú prezentáciu. Obsidian a Adam.xvadur už nie
sú kanonické úložiská Hriechu; ostávajú v nich iba navigačné odkazy alebo
dočasné kompatibilné projekcie.

## Dôkazová hranica

Oddeľujeme pôvodný zdroj, Adamov komentár, analytickú syntézu, hypotézu a
chýbajúci dôkaz. Celé licencované alebo autorskoprávne chránené transkripty sa
nepublikujú do verejného repozitára. Profesijná väzba sama osebe nie je dôkazom
vplyvu, konfliktu ani protiprávneho konania.

## Lokálne spustenie

```bash
pnpm install
pnpm dev
```

## Overenie

```bash
pnpm qa
```

Produkčný statický build vznikne v `dist/`. `hriech.pages.dev` je preview;
produkčný `hriech.xvadur.com` obsluhuje Cloudflare Worker. Lokálna zmena,
commit, GitHub push a nasadenie sú samostatné stavy.
