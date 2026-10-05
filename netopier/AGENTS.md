# Netopier — pravidlá pre agentov

Smer: `SMER.md` (5. 10. 2026). Archív `docs/archiv-2026-10-05/` je história, nie zadanie.

## Dáta
- Iba verejné zdroje. Pri každom dokumente zachovať URL, čas zverejnenia, čas zberu, id zdroja,
  hash surových dát a verziu algoritmu. Surová vrstva oddelene od odvodenej.
- Celé chránené texty (napr. Denník N cez Adamovo predplatné) iba lokálne, nikdy do gitu ani von.
- Súkromné dáta (korpus, Dia, zdravie, realitný trh, `xvadur_core`) nikdy do externých nástrojov ani modelov mimo Macu.
- Fyzické osoby z registrov verejne nie (`entity.verejne = 0`).

## Merania
- Každé verejné číslo má uložený dotaz, verziu algoritmu, snímku dát a stav overenia; inak nejde von.
- Každé číslo má porovnávaciu základňu (žáner, skupina médií, objem).
- Model zaraďuje, Adam overuje vzorku; zhoda sa uvádza pri čísle.
- Navonok neutrálne názvy nálezov; ľudia z médií iba v záznamoch merania, s možnosťou reakcie.
- Profesijná, vlastnícka alebo inštitucionálna väzba sama osebe nie je dôkaz vplyvu ani konfliktu.

## Kód
- Hotové open source pred vlastným kódom; AGPL kód do tohto verejného repozitára bez licencie nie.
- Každé nové správanie má test na úrovni rozhrania a dôkaz nad skutočnými dátami.
- Rozlišovať stavy dôkazu: napísané, testované, spustené nad dátami, zapísané, overené v cieli.
- Bez pokynu: žiadny push nasadenia, deploy, LaunchAgent, nová platená služba, nový kľúč.
