# Hriech Agent Rules

## Purpose

Hriech je kanonický verejný projekt pre Adamovu mediálnu kritiku. Mapa redakcií
je prvá vrstva; ďalšie prípady, sourcebooky, metodika a verejné texty patria sem.

## Boundaries

- Drž oddelene zdrojový výrok, Adamov komentár, analytickú syntézu, hypotézu,
  právny status a evidence gap.
- Profesijná, vlastnícka alebo inštitucionálna väzba sama osebe nie je dôkazom
  vplyvu, konfliktu ani protiprávneho konania.
- Raw Dia chaty, licencované fulltexty, celé transkripty a súkromné poznámky
  patria do ignorovaného `private/`; do verejného Gitu smú iba redigované,
  zdrojovo podopreté výstupy.
- Netopier môže dodávať verejný archív, udalosti a receipts, ale editoriálne
  prípady a verejný mediálno-kritický povrch vlastní Hriech.
- Bez explicitného súhlasu nerob push, deploy, DNS zmenu ani publikáciu.

## Engineering

- Verejný web je Astro projekt v koreňovom adresári.
- Zachovaj zdrojové URL, čas publikácie a zberu, identifikátor zdroja a hranicu
  medzi raw a odvodenou vrstvou.
- Pred odovzdaním webovej zmeny spusti `pnpm qa`.
