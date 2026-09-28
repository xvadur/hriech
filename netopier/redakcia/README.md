# @netopier/redakcia — čisté funkcie redakcie

Balík bez siete, bez databázy a bez LLM. Zber (`../zber/`) ho používa v odvodení
(`link:../redakcia`), agenti a terminál ho budú používať na to isté počítanie.

| Modul | Čo robí |
|---|---|
| `src/skore.ts` | skóre zvodu (EKG): `vypocitajSkore(dokazy)` → −100…100, istota, rozklad; `urciStav`, `odporucanyStav`, `povolenyPrechod`, `odporucanie`; adaptér nad tvarom openclaw `signals/<den>.json` |
| `src/normalize.ts` | `normalizujDatum` (5 formátov zo zdrojov → ISO UTC), `denVBratislave` |
| `src/entity.ts` | `entityZoZaznamu(source, data)` — IČO z CRZ (strana_a, strana_b) a TED (obstarávateľ, víťaz), druh z názvu |
| `src/text.ts` | tokeny, lexika bez stop slov, `znakyTitulku` (otázka, dvojbodka, citácia, čísla, veľké písmená, poplašné, vata) |
| `src/meranie.ts` | `meranie(zaznamy)` — riadky pre tabuľku `meranie`: redakcia × deň, redakcia × celok, autor × celok |
| `data/politika-merania.json` | verzované zoznamy (stop slová, poplašné, vata); verzia ide do `meranie.algoritmus` |

Skóre zvodov je port klientskeho `scoring.js` + `status.js` z openclaw.sk (kópie v
`test/fixtures/openclaw/`). Openclaw je kontrola, nie definícia: server `api.openclaw.lu`
(`/api/scores`, `/api/prediction-scores`) dáva iné čísla než ten istý `scoring.js` nad tými
istými signálmi (28. 9. 2026: 0 zo 43 predikcií zhodných), preto parita platí pre `scoring.js`.

```bash
npx -y pnpm@11.19.0 install
pnpm run check      # tsc
pnpm test           # vitest: parita 20 článkov, normalizácia, entity, meranie
pnpm run qa
```

Fixtures (28. 9. 2026): `clanky-20.json` (20 signálov z `api.openclaw.lu/api/signals/<den>`,
každá kombinácia smer/sila/relevancia/istota), `predictions.json` (`/api/predictions`),
`scores.json` (`/api/scores`, serverové čísla na porovnanie), `scoring.js`, `status.js`
(`openclaw.sk/js/`). Obnova: `curl https://api.openclaw.lu/api/signals` → dátumy → `/api/signals/<den>`.
