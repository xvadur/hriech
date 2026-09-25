# Hriech

Web a publikácia XVADUR spravodajskej služby: [hriech.xvadur.com](https://hriech.xvadur.com).
Mediálna kritika, mapy verejného prostredia a investigatívne dáta. Prvý modul je
mapa desiatich slovenských online redakcií (ľudia, vlastníci, financie, vzťahy, zdroje).

Backend je [Netopier](netopier/README.md) v `netopier/`: monitoring zdrojov, archív,
udalosti a korpusy.

| Práca | Vstup |
|---|---|
| Úprava webu | `src/pages/`, `src/components/`, vizuál v `DESIGN.md` |
| Publikovanie textu | `docs/PUBLISHING.md` |
| Aktualizácia mapy médií | `research/newsrooms/README.md` |
| Backend | `netopier/README.md` |

## Dôkazová hranica

Oddeľujeme pôvodný zdroj, Adamov komentár, analytickú syntézu, hypotézu a
chýbajúci dôkaz. Celé licencované alebo autorskoprávne chránené transkripty sa
nepublikujú. Profesijná väzba sama osebe nie je dôkazom vplyvu, konfliktu ani
protiprávneho konania.

## Lokálne

```bash
pnpm install
pnpm dev
pnpm qa   # check + test + build + overenie buildu
```

Produkčný `hriech.xvadur.com` obsluhuje Cloudflare Worker `hriech-web`. Lokálna
zmena, commit, push a nasadenie sú samostatné kroky.
