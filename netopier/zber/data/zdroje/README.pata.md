## Poznámky k zberu

- **Poctivý user-agent.** Overenie aj príjem majú používať `Netopier/2 (+https://hriech.xvadur.com; zber verejnych zdrojov)`. Kde web tento UA odmietne a pustí prehliadačový, je to v `poznamka`; Cloudflare výzvy („Just a moment“, „Security Verification“) sa neobchádzajú.
- **TLS.** Niektoré štátne a regionálne weby posielajú neúplný reťazec certifikátov (Node ich neoverí, prehliadač áno). Také zdroje majú `overene_at = null` a chybu v `poznamka`; pri príjme treba rozhodnúť, či sa pripojiť s doplneným reťazcom.
- **SME / Petit Press.** Web je za Cloudflare výzvou; pri väčšom tempe vracia 429/403. Overené sú iba feedy, ktoré prešli pri pokuse; príjem musí byť pomalý (rozostup rádovo sekúnd) alebo cez iný kanál.
- **Zdroje, ktoré už zbiera existujúci konektor** (`crz`, `ted`, `kataster`, `statistika`) sú v registri kvôli úplnosti; ich API sú overené alebo označené ako overené konektorom.
- **Národná rada SR** je v registri iba zaznačená (rieši ju iný agent).
- Súvisiace: rozbor webov redakcií (news sitemapy, JSON-LD, live) v `docs/redakcie-weby.md` (XDR-298), kartičky zdrojov v D1 (`zdroje`, `zdroj_kanaly`) sa plnia z `register.json`.
