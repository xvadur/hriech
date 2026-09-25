# Hriech Agent Rules

## Purpose

Hriech je web a publikácia XVADUR spravodajskej služby (mediálna kritika, mapy,
dáta, investigatíva). Backend je Netopier v `netopier/`. Mapa redakcií je prvý modul.

## Boundaries

- Drž oddelene zdrojový výrok, Adamov komentár, analytickú syntézu, hypotézu,
  právny status a evidence gap.
- Profesijná, vlastnícka alebo inštitucionálna väzba sama osebe nie je dôkazom
  vplyvu, konfliktu ani protiprávneho konania.
- Raw Dia chaty, licencované fulltexty, celé transkripty a súkromné poznámky
  do repozitára nepatria (sú v `xvadur_core/zdroje/hriech/`); do verejného Gitu
  smú iba redigované, zdrojovo podopreté výstupy.
- Netopier (`netopier/`) dodáva archív, udalosti a dáta; editoriálne prípady
  a verejný povrch vlastní Hriech.
- Bez explicitného súhlasu nerob push, deploy, DNS zmenu ani publikáciu.

## Engineering

- Verejný web je Astro projekt v koreňovom adresári.
- Zachovaj zdrojové URL, čas publikácie a zberu, identifikátor zdroja a hranicu
  medzi raw a odvodenou vrstvou.
- Pred odovzdaním webovej zmeny spusti `pnpm qa`.
