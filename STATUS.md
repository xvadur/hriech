# STATUS — hriech

## Živé
- `hriech.xvadur.com` live (Cloudflare Worker `hriech-web`, Astro statický): publikácie, prípady, mapa redakcií (10 médií, 558 osôb, 586 rolí), RSS, vyhľadávanie
- Frontend v gite je bajt po bajte zhodný so živým webom (overené 25. 9. 2026: CSS aj úvodná stránka, `pnpm qa` 59 stránok bez chyby)
- Backend: Netopier v2 v `netopier/` beží lokálne na Macu nad lokálnou D1 (28. 9., XDR-275, krok I0): 14 299 záznamov, 13 479 normalizovaných dátumov, 2 024 entít, 4 700 väzieb, fulltext, meranie 3 SK redakcií; balík `@netopier/redakcia` (skóre zvodov s paritou proti openclaw `scoring.js`, meranie médií); voľby 24. 10. v lokálnej D1 (28. 9., XDR-276: 8 krajov, 79 okresov, 47 obcí, 104 kandidatúr, 16 prieskumov, 14 termínov, geo hranice; `pnpm run volby`); cloudový Worker nenasadený (pozri `netopier/STATUS.md`)

## Rozhodnutia
- 2026-09-28 — Claude smie čítať verejné texty médií celé; prepisy cez entitný a fulltextový filter; „skóre“ = meranie médií podľa registra, openclaw iba kontrola [A]
- 2026-09-27 — AI redakcia: návrh architektúry, register 124 funkcií a medzery v `docs/redakcia/`; beží lokálne na Macu, na Cloudflare zadarmo iba zobrazovacia D1 a web, Minúta bez meškania, bez GitHub Actions, bez platených služieb; meno Hriech dočasné; jadro pred Živé: kalendár a anticipácia, filter relevancie, kauzy, prepisy, aktéri a sociálne siete, meranie médií [A]
- 2026-09-26 — nový článok má výskum aj draft v `research/<téma>/` v repozitári Hriechu; osobné podklady ostávajú v jadre [A]
- 2026-07-02 — mediálna kritika ako línia; 2026-09-01 genéza Hriechu cez Kyseľ/Blaha + Mediaboard [A]
- 2026-09-03 — Hriech = autorstvo a publikácia; Netopier = monitoring a dôkazy [A]
- 2026-09-05 — ružový plastický vizuál podľa loga (DESIGN.md), nasadený [A]
- 2026-09-25 — Hriech je XVADUR spravodajská služba: Hriech frontend, Netopier backend; projekt vyčistený od minulých verzií (shadcn vrstva, mock „Vydanie“, staré koncepcie → `xvadur_core/zdroje/hriech/archiv-2026-09/`); v0 Netopiera zmazaný [A]
- 2026-09-25 — Hriech dostane redizajn [A]

## Ďalší krok
- AI redakcia: I0 hotové (XDR-275), návrh prepísaný na lokálny režim (`docs/redakcia/navrh-architektury.md`, časť 1L). Ďalej XDR-279 (služba na Macu), I2 (migrácie 0003–0005, zvody, SK zdroje), I3 (udalosti), zobrazovacia D1 pre web
- Článok **Zeitgeber — kto vlastní hodiny** (cykly, kalendár, globálna kontrola bez sprisahania): výskum v `research/zeitgeber/`, overiť zdroje, potom draft; píše sa cez Vianoce a Nový rok. Main obsahuje nepublikovaný research — push iba po Adamovom schválení.
- Určiť nový stack a roadmapu pre moduly (mapa s vrstvami, štátny dashboard, voľby a prieskumy, kalendár a odpočet, minúta po minúte, analýza spravodajstva, rebríček redakcií, Chronos, demografia, Opus Major)

## Blokované
- Nasadenie Netopiera do cloudu (XDR-228) čaká na Adama: Workers Paid a pokyn na deploy

## Inbox
- Draft „Fico nemusí čítať vaše články“ v3 (`xvadur_core/07_texty/drafty/`) — overenia (CRZ 0,00 € vs. 48 073,32 €) a oslovenie redakcií pred publikovaním
- Draft 04 Karol — súkromný, rozhodnutie o anonymizácii
- Klik corpus 50 — validačný backlog (`xvadur_core/zdroje/hriech/research/`)
