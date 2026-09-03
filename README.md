# Hriech

Verejný frontend projektu Hriech. Prvá edícia mapuje personálnu, organizačnú,
vlastnícku, finančnú a inštitucionálnu vrstvu desiatich vybraných slovenských
online médií výhradne z verejne dostupných profesijných a firemných zdrojov.

## Hranica

Dataset neobsahuje súkromné adresy ľudí, rodné údaje, rodinné väzby, osobné
kontakty ani osobné majetkové lustrácie. Zobrazená profesionálna alebo
inštitucionálna väzba sama osebe nie je dôkazom vplyvu ani konfliktu.

Táto edícia nezahŕňa televízie, STVR, rádiá, TASR, regionálne médiá, politické
tlačové oddelenia ani platformové algoritmy. Pri médiách bez úplného verejného
rostra je rozsah explicitne označený ako čiastočný.

## Lokálne spustenie

```bash
pnpm install
pnpm dev
```

## Overenie

```bash
pnpm qa
```

Produkčný statický build vznikne v `dist/`. `hriech.pages.dev` slúži ako
Pages preview; produkčný `hriech.xvadur.com` obsluhuje Cloudflare Worker so
statickými assetmi a automaticky spravovaným Custom Domain DNS/TLS.
