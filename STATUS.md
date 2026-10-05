# STATUS — hriech

**Smer od 5. 10. 2026:** `netopier/SMER.md` — Netopier je prístroj na vyšetrenie Slovenska, Hriech jeho
verejný povrch: moderný OSINT dashboard o Slovensku na úrovni SaaS 2027 (mapa krajov, príbehy dňa
s pokrytím, slepé miesta, živý príjem, voľby, Národná rada, barometre). Staré STATUS a návrhy redakcie
z 27. 9. sú v `netopier/docs/archiv-2026-10-05/`.

## Živé
- `hriech.xvadur.com` (Cloudflare Worker `hriech-web`, Astro statický): publikácie, prípad a mapa
  redakcií (10 médií, 558 osôb, 586 rolí), RSS, vyhľadávanie. Vizuál ružový plastický (`DESIGN.md`,
  5. 9.) — od 4. 10. zamietnutý, nahradí ho dashboard; dovtedy beží bez zmeny.
- Backend Netopier beží lokálne na Macu, stav v `netopier/STATUS.md`.

## Rozhodnutia
- 2026-10-05 — matica reči „Kto hovorí sám“ (`netopier/podcasty/matica_reci.py`), kalibrovaná na Adamovom svedectve 2020 a denníku 2017 proti 19 kázňam KZ, pustená na Klik 405–407, Tridsiatnik a V redakcii: médiá sa neskrývajú za citácie, ale za vatu (váhacie slová 65–102 na tisíc; kázne 36; Adam 48). Výstup `netopier/data/matica/kto-hovori-sam-2026-10-05.md` (mimo gitu). Stránka merania v Hriechu iba na pokyn. [A]
- 2026-10-05 — hlavný smer projektu je `netopier/SMER.md`; staré texty do archívu, dáta a história ostávajú [A]
- 2026-10-04 — verejný web = OSINT dashboard o Slovensku na úrovni SaaS 2027 (vzor World Monitor);
  nie ružový, nie titulky o jednotlivcoch; predloha `netopier/data/predlohy/2026-10-04/hriech-osint.png` [A]
- 2026-10-04 — model sveta: jednotka je udalosť; témy (energia, dlh, obrana, AI, suroviny) a váhy určuje Adam [A]
- 2026-10-03 — vzťah médií a AI k spoločnosti, nie výsmech relácií; najprv AI, potom celé médiá,
  politika a NR SR; MVP určuje Adam [A]
- 2026-10-02 — páka (meranie médií po ľuďoch, reláciách a redakciách v čase) a hlas (päť otázok:
  za koho peniaze, prečo teraz, kde je Slovensko, odkiaľ to ide, kam to vedie) [A]
- 2026-10-02 — princíp: Hriech nekomentuje a neútočí, zverejňuje merania; autorita je záznam, nie titul [A]
- 2026-10-02 — frontend z populárneho stacku a svetových predlôh; Evidence zamietnutý [A]
- 2026-09-29 — Hriech je publikácia, Netopier backend; Netopier lokálne [A]
- 2026-09-28 — termín: voľby 24. 10. 2026, Hriech má byť vonku s volebnými modulmi [A]
- 2026-09-26 — nový článok má výskum aj draft v `research/<téma>/`; osobné podklady ostávajú v jadre [A]
- 2026-09-25 — Hriech je XVADUR spravodajská služba; staré koncepcie v `xvadur_core/zdroje/hriech/archiv-2026-09/` [A]
- 2026-09-07 — Hriech = autorstvo a publikácia, Netopier = monitoring a dôkazy [A]
- 2026-09-05 — ružový plastický vizuál (`DESIGN.md`), nasadený [A]; od 4. 10. zamietnutý
- 2026-09-01 — genéza Hriechu cez Kyseľ/Blaha a Mediaboard; 2026-07-02 mediálna kritika ako línia [A]

## Ďalší krok
- Adam vyberie prvý modul zo `netopier/SMER.md` a schváli stack verejného dashboardu
  (návrh: Astro, MapLibre + deck.gl, tmavá téma shadcn namiesto BoldKitu).
- Záloha archívu Netopiera (jediná kópia, Time Machine zlyháva).
- Termín: prieskumy smú byť zverejnené iba do 9. 10.; voľby 24. 10.

## Blokované
- OpenRouter kľúč do `netopier/.env` — na Adamovi.
- Nasadenie Netopiera a zobrazovacia D1 (Workers Paid) — iba na Adamov pokyn.

## Inbox
- Článok **Zeitgeber — kto vlastní hodiny**: výskum v `research/zeitgeber/`, draft cez Vianoce a Nový rok.
- Draft „Fico nemusí čítať vaše články“ v3 (`xvadur_core/07_texty/drafty/`) — overenia a oslovenie redakcií.
- Draft 04 Karol — súkromný, rozhodnutie o anonymizácii.
- Klik corpus 50 — validačný backlog (`xvadur_core/zdroje/hriech/research/`).
