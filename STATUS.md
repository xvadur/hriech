# STATUS — hriech

## Živé
- `hriech.xvadur.com` live (Cloudflare Worker `hriech-web`, Astro statický): publikácie, prípady, mapa redakcií (10 médií, 558 osôb, 586 rolí), RSS, vyhľadávanie
- Frontend v gite je bajt po bajte zhodný so živým webom (overené 25. 9. 2026: CSS aj úvodná stránka, `pnpm qa` 59 stránok bez chyby)
- Backend: Netopier v2 v `netopier/` beží lokálne na Macu nad lokálnou D1 (28. 9., XDR-275, krok I0): 14 299 záznamov, 13 479 normalizovaných dátumov, 2 024 entít, 4 700 väzieb, fulltext, meranie 3 SK redakcií; balík `@netopier/redakcia` (skóre zvodov s paritou proti openclaw `scoring.js`, meranie médií); voľby 24. 10. v lokálnej D1 (28. 9., XDR-276: 8 krajov, 79 okresov, 47 obcí, 104 kandidatúr, 16 prieskumov, 14 termínov, geo hranice; `pnpm run volby`); od 29. 9. jednotná schéma a príjem RSS s celými textmi nad SQLite súborom `netopier/data/netopier.sqlite` (XDR-299: 20 164 dokumentov z 208 zdrojov, 2 191 článkov s celým textom, príkaz pre službu `pnpm run prijem`); cloudový Worker nenasadený (pozri `netopier/STATUS.md`)

## Rozhodnutia
- 2026-09-29 — **Dizajn:** Hriech a Netopier stoja na tom istom dizajnovom systéme ako XVADUR (BoldKit, neobrutalizmus, rovnaké komponenty), iba vo vlastných farbách a písme cez tému (BoldKit Theme Builder). Knižnice a katalóg: `projekty/xvadur-ui/`, most na tokeny ako vzor: `projekty/xvadur.com/src/styles/boldkit.css` (vetva `v7-zaklad`). XDR-230 (redizajn Hriechu) stavať na tomto. [A]
- 2026-09-29 — brána Netopiera je Jev (TypeSafe AI) cez OpenRouter, vstupný filter XVADUR ako matica otázok; čítací model (zatiaľ Gemini 2.5 Flash-Lite) iba nad označeným; rozpočet do 10 € mesačne; do cloudu iba verejné texty; lokálny model možno neskôr; Hostinger GPU a Hermes v cloude zamietnuté (XDR-283, `docs/redakcia/ROZHODNUTIE.md`) [A]
- 2026-09-28 — termín: spojené komunálne a župné voľby 24. 10. 2026, dovtedy má byť Hriech vonku s volebnými modulmi (XDR-280); kandidáti sa zobrazujú menom, sledujú sa aj mestá nad 20 000 obyvateľov a mestské časti Bratislavy a Košíc (XDR-282); Netopier pobeží ako služba na Macu (XDR-279); cieľ Netopiera nie je informovať, ale merať, ako médiá pracujú [A]
- 2026-09-28 — Claude smie čítať verejné texty médií celé; prepisy cez entitný a fulltextový filter; „skóre“ = meranie médií podľa registra, openclaw iba kontrola [A]
- 2026-09-27 — AI redakcia: návrh architektúry, register 124 funkcií a medzery v `docs/redakcia/`; beží lokálne na Macu, na Cloudflare zadarmo iba zobrazovacia D1 a web, Minúta bez meškania, bez GitHub Actions, bez platených služieb; meno Hriech dočasné; jadro pred Živé: kalendár a anticipácia, filter relevancie, kauzy, prepisy, aktéri a sociálne siete, meranie médií [A]
- 2026-09-26 — nový článok má výskum aj draft v `research/<téma>/` v repozitári Hriechu; osobné podklady ostávajú v jadre [A]
- 2026-07-02 — mediálna kritika ako línia; 2026-09-01 genéza Hriechu cez Kyseľ/Blaha + Mediaboard [A]
- 2026-09-03 — Hriech = autorstvo a publikácia; Netopier = monitoring a dôkazy [A]
- 2026-09-05 — ružový plastický vizuál podľa loga (DESIGN.md), nasadený [A]
- 2026-09-25 — Hriech je XVADUR spravodajská služba: Hriech frontend, Netopier backend; projekt vyčistený od minulých verzií (shadcn vrstva, mock „Vydanie“, staré koncepcie → `xvadur_core/zdroje/hriech/archiv-2026-09/`); v0 Netopiera zmazaný [A]
- 2026-09-25 — Hriech dostane redizajn [A]

## Ďalší krok
- Netopier, poradie (jeden agent naraz, bez workflowov): zvody XDR-278 (agent zastavený 28. 9., nič nezapísané, spustiť znova) → osoby a tlačovky XDR-277 → rozšírenie volieb XDR-282 (listiny vyšli 29. 9.) → matica filtra XDR-283 (návrh ide bez kľúča) → meranie nad rámec I0 XDR-281 → služba XDR-279 → volebné moduly na webe XDR-280 (čaká na knižnicu komponentov)
- Hotové 28. 9.: I0 lokálny beh (XDR-275), volebné dáta (XDR-276)
- Článok **Zeitgeber — kto vlastní hodiny** (cykly, kalendár, globálna kontrola bez sprisahania): výskum v `research/zeitgeber/`, overiť zdroje, potom draft; píše sa cez Vianoce a Nový rok. Main obsahuje nepublikovaný research — push iba po Adamovom schválení.
- Určiť nový stack a roadmapu pre moduly (mapa s vrstvami, štátny dashboard, voľby a prieskumy, kalendár a odpočet, minúta po minúte, analýza spravodajstva, rebríček redakcií, Chronos, demografia, Opus Major)

## Blokované
- OpenRouter kľúč a kredit 10 $ do `netopier/.env` (XDR-284) — na Adamovi; bez neho nejde brána ani test slovenčiny
- Nasadenie Netopiera do cloudu (XDR-228) čaká na Adama: Workers Paid a pokyn na deploy

## Inbox
- Draft „Fico nemusí čítať vaše články“ v3 (`xvadur_core/07_texty/drafty/`) — overenia (CRZ 0,00 € vs. 48 073,32 €) a oslovenie redakcií pred publikovaním
- Draft 04 Karol — súkromný, rozhodnutie o anonymizácii
- Klik corpus 50 — validačný backlog (`xvadur_core/zdroje/hriech/research/`)
