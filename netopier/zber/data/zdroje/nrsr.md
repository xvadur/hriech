# Národná rada SR — čo ponúka a ako to Netopier berie

Úloha XDR-297. Stav overený živými dotazmi 29. 9. 2026 (Mac v Bratislave, User-Agent `Netopier/2 (+https://hriech.xvadur.com; zber verejnych zdrojov)`). Konektor `zber/src/nrsr/`, migrácia `0005_nrsr.sql`, príkaz `pnpm run nrsr`.

## Zhrnutie

NR SR má **oficiálne JSON API** (`https://www.nrsr.sk/opendata/1/sk/…`), ktoré je v Národnom katalógu otvorených dát iba sčasti popísané. Katalóg drží 14 datasetov Kancelárie NR SR (poskytovateľ IČO 00151491): zoznamy poslancov, schôdzí, tlačí a programov schôdzí pre 7.–9. obdobie, zoznam volebných období a zákonodarných zborov. Hlasovania, členstvá v kluboch a výboroch a zoznam všetkých tlačí sú na tom istom API, ale v katalógu nie sú (endpointy sa dali nájsť podľa mien; nie sú nikde dokumentované, preto ich Netopier overuje testom). **Hlas každého poslanca v hlasovaní, zmeny v zložení, prepisy vystúpení a videozáznamy API nemá** — sú iba na HTML stránkach `www.nrsr.sk/web/` a `tv.nrsr.sk`, ktoré konektor číta a stránkuje.

| Čo Adam chce | Odkiaľ | Formát | Obdobia | Krok konektora → tabuľka |
|---|---|---|---|---|
| Poslanci (profil, strana kandidatúry, bydlisko, kontakt) | API `MP/MembersOfParliament?termNr=N` | JSON, jedna požiadavka | 1.–9. (9.: 194 poslancov vrátane tých, čo mandát stratili) | `poslanci` → `nrsr_poslanci`, `nrsr_mandaty`, `entity` (`osoba:<slug>`) |
| História klubov a výborov s dátumami | API `MP/MemberOfParliament?id=<mpId>` (`memberships` s `validFrom`/`validTo`) | JSON, jedna požiadavka na poslanca | podľa poslanca | `funkcie` → `nrsr_funkcie`, pohľad `nrsr_clenstvo_aktualne` |
| Kluby a výbory (názov, vznik, počet členov, farba) | API `MP/Clubs?termNr=N`, `Committee/Committees?termNr=N` | JSON | 9. overené | `organy` → `nrsr_organy` |
| Zmeny v zložení (mandát získaný, zaniknutý, náhradník, sľub, dôvod) | HTML `sid=poslanci/zmeny` (stránkovanie postbackom) | HTML | aktuálne obdobie | `zmeny` → `nrsr_zmeny` |
| Schôdze | API `General/Meetings?termNr=N` | JSON | 2.–9. | `schodze` → `nrsr_schodze` |
| Zoznam hlasovaní s výsledkom a súčtami | API `Voting/Votings?termNr=N` (nedokumentované) | JSON, jedna požiadavka na obdobie (3 MB) | 2.–9. (2.: 9 711, 3.: 7 042, 4.: 6 134, 5.: 2 430, 6.: 6 080, 7.: 5 294, 8.: 6 010, 9.: 4 532) | `hlasovania` → `nrsr_hlasovania` |
| **Hlas každého poslanca** a jeho klub v čase hlasovania | HTML `sid=schodze/hlasovanie/hlasklub&ID=<hlasovanie>` | HTML, ~90 kB na hlasovanie | 2.–9. (klub v čase hlasovania sa dá odvodiť z názvov blokov) | `hlasovania` → `nrsr_hlasy`, `nrsr_kluby`, pohľad `nrsr_klub_historia` |
| Parlamentné tlače (návrhy zákonov, správy, informácie, medzinárodné zmluvy) | API `Bill/Bills?termNr=N`, `Bill/BillTypes` | JSON, jedna požiadavka | 9. overené | `tlace` → `nrsr_tlace` (923 návrhov zákonov v 9. období) |
| **Stenozáznam / prepis vystúpení** s typom, rečníkom, tlačou a časom | HTML `sid=schodze/rozprava/vyhladavanie&CisObdobia=N&CisSchodze=M` (20 vystúpení na stranu, stránkovanie postbackom) | HTML, ~0,9 MB na stranu (ViewState) | **od 5. obdobia** (podľa hlášky na stránke) | `rozprava` → `nrsr_vystupenia` + fulltext `nrsr_vystupenia_fts` |
| **Video** vystúpenia a celého rokovania | `tv.nrsr.sk` — odkazy v prepise (`archiv/schodza/<obdobie>/<schodza>?id=<videoId>`) | HLS (`playlist.m3u8`) | rovnaké ako prepis | `rozprava` → `video_id`, `video_url`, `video_schodza_url` |

## Oficiálne API — čo je dokázané

- Základ `https://www.nrsr.sk/opendata/1/sk/`, odpovede `application/json`, bez kľúča a bez registrácie. Neexistujúci endpoint vracia JSON `{"Message":"No HTTP resource was found …"}` (ASP.NET Web API), stránka s dokumentáciou (help, swagger) na skúšaných adresách neexistuje.
- V katalógu (data.slovensko.sk, publisher „Kancelária Národnej rady SR“, 14 datasetov): `MP/MembersOfParliament?termNr=`, `General/Meetings?termNr=`, `General/MeetingProgram?termNr=&meetingNr=`, `Bill/BillsOfType?termNr=&typeId=`, `General/ParliamentaryTerms`, `General/Legislatures`. Metadáta datasetov pre 9. obdobie sú z 22. 2. 2024, samotné dáta API vracia aktuálne (29. 9. 2026 ~ 18:51 posledné hlasovanie 61. schôdze).
- Mimo katalógu, overené: `Voting/Votings?termNr=`, `MP/MemberOfParliament?id=`, `MP/Clubs?termNr=`, `Committee/Committees?termNr=`, `Bill/Bills?termNr=`, `Bill/BillTypes`. Parameter `meetingNr` pri `Votings` sa ignoruje (vždy celé obdobie).
- Hlasovanie v API: `id` (rovnaké ako v HTML), `date` (miestny čas bez pásma; pri 23 z 4 532 iba deň), `votingNr`, `meetingNr`, `name`, `billNr` (číslo tlače, text), `typeName` (štandardné 4 474 / tajné 36 / hromadné 22), `isConstitutionalLaw`, `stateName` (výsledok; pri tajných voľbách „Zverejnené hlasovanie“), `countPresent/Agreed/Disagreed/Abstained/NotVoting/NotPresent`. **Bez mien poslancov.**
- Nedostatky: `endDate` schôdze je často `null` alebo polnoc dňa začiatku (napr. 63. schôdza), `nrsr_schodze.do` je preto nespoľahlivé. `Bill/Bills` nemá dokumenty ani stav legislatívneho procesu (stránka `sid=zakony/zakon&CPT=` áno, zatiaľ sa nesťahuje).

## HTML stránky — čo je dokázané

- ASP.NET WebForms, XHTML 1.0; adresy stránok sú rovnaké ako v diskusii z roku 2019 (platforma.slovensko.digital), takže štruktúra je stabilná aspoň sedem rokov. Zoznamy sa stránkujú postbackom (`__VIEWSTATE`, `__EVENTTARGET`, `__EVENTARGUMENT=Page$N`), nie odkazmi; konektor si polia formulára prečíta z predchádzajúcej strany.
- `hlasklub&ID=<id>`: metadáta hlasovania, súčty a pre každý klub všetci poslanci s kódom `[Z]` za, `[P]` proti, `[?]` zdržal sa, `[N]` nehlasoval, `[0]` neprítomný. SOUCET_PLACEHOLDER Tajné a „hromadné“ hlasovania (voľby predsedu NR SR, členov rád STVR, RMS, sudcov Ústavného súdu a pod.; 36 + 22 v 9. období) sú voľby hlasovacími lístkami — stránka má iba odkaz na naskenované lístky (`sid=schodze/hlasovanie/ballots`), hlasy po poslancoch nie.
- Prepis: každé vystúpenie má čas od–do (miestny čas), „61. schôdza NR SR - 9.deň - B. popoludní“, číslo tlače, rečníka („Priezvisko, Meno“, bez ID poslanca — párovanie podľa mena), funkciu, typ (rozprava, faktická poznámka, procedurálny návrh, interpelácia, hodina otázok, vstup predsedajúceho …), príznak jazykovej úpravy a text. Odkazy na video sú v stránke aj vtedy, keď záznam ešte nie je zverejnený (`style='display:none'`); konektor ukladá `video_url` až keď je odkaz viditeľný a doplní ho pri ďalšom behu.
- Video: klip `http://tv.nrsr.sk/archiv/schodza/<obdobie>/<schodza>?id=<videoId>`; jeho stránka `https://tv.nrsr.sk/video/vystupenie/<videoId>` obsahuje HLS playlist `//tvw.nrsr.sk/events_dvr/mp4:<YYYYMMDD_HHMMSS_x>.mp4/playlist.m3u8`, celý záznam rokovania `//tvw.nrsr.sk/store/mp4:<…>.mp4/playlist.m3u8` (HEAD na `store/…` vrátil 200 bez autorizácie). Na montáže treba čas vystúpenia v rámci záznamu — ten je v prepise (`cas_od_utc`, `cas_do_utc`) a v odkaze `?id=`; sťahovanie samotného videa ani rozbor playlistu konektor nerobí.
- Blokovanie: predvolený `curl` User-Agent dostane 403, poctivý `Netopier/2 …` prejde. Stránky aj API občas odmietnu spojenie (connection refused, dôvod nevedno — pravdepodobne ochrana pred záťažou); konektor opakuje s narastajúcou pauzou (max 6 pokusov).
- `robots.txt`: `www.nrsr.sk/robots.txt` presmeruje na `/web/robots.txt`, ktorý vracia 404 (žiadne pravidlá). Licencia v katalógu otvorených dát nie je uvedená; Netopier ukladá zdrojovú URL pri každom riadku.

## Stabilita a tempo

- Tempo: začiatky požiadaviek najmenej 500 ms od seba, štyri súbežné detaily (max ~2 požiadavky za sekundu), User-Agent Netopiera. Hlasy 4 496 verejných hlasovaní 9. obdobia = ~4 500 požiadaviek po ~90 kB ≈ 1 hodina.
- Idempotencia: zoznam hlasovaní sa obnoví vždy (jedna požiadavka), hlasy sa sťahujú iba pre hlasovania bez hlasov (najnovšie prvé, `--znova` ich stiahne nanovo). Vystúpenia po schôdzach; schôdza označená ako kompletná (`nrsr_schodze.vystupenia_kompletne`) sa nabudúce prechádza od najnovších strán, kým sa nenájde strana bez zmien.
- Prepisy pribúdajú priebežne aj počas rokovania (vystúpenia z večera 29. 9. 2026 boli v prepise v ten istý večer s poznámkou „text neprešiel jazykovou úpravou“; stránka hovorí, že autorizovaný text je k dispozícii neskôr); hash textu zmenu zachytí a riadok sa aktualizuje.
- Historické obdobia: API vracia poslancov 1.–9., schôdze a hlasovania 2.–9. obdobia; konektor (`--obdobie N`) je otestovaný iba na 9. Zmeny v zložení a prepisy stránka ukazuje podľa nastavenia obdobia (postback), pre staršie obdobia zatiaľ nie je implementovaný.

## Komunitné zdroje (skontrolované, nepoužité)

| Zdroj | Stav 29. 9. 2026 |
|---|---|
| `OtvorenyParlament/nrsr-crawler` (Scrapy, EUPL-1.2) a verejné GraphQL API `api.otvorenyparlament.info` | repozitár archivovaný 11. 6. 2021, doména API sa neresolvuje |
| `KohoVolit/scraper-sk_nrsr` + Visegrad+ API (`api.parldata.eu`) | scraper pre projekt Visegrad+, vote-events a poslanci; neudržiavaný |
| `michalfapso/nrsr.sk.parser` | skripty na hlasovania a RTF dokumenty, jednorazové |
| `nationalcouncilofsr-api.appspot.com`, `nrsr.azurewebsites.net` | prvý vracia HTTP 500, druhý 403 |
| `akohlasovali.sk` | web „Ako hlasoval váš poslanec“ bez exportu a API |
| Zenodo 10.5281/zenodo.18818472 (V. Müller, Univerzita Mateja Bela, CC BY 4.0) | CSV s hlasovaniami 3.–9. obdobia (2002–2024), 14 súborov, 147,6 MB; využiteľné na spätné doplnenie bez ~33 000 požiadaviek (7 042 + 6 134 + 2 430 + 6 080 + 5 294 + 6 010 hlasovaní 3.–8. obdobia) |

## Otvorené

- Zmeny v zložení a prepisy pre staršie obdobia (postback na výber obdobia).
- Legislatívny proces tlače (`sid=zakony/zakon&CPT=`: čítania, výbory, lehoty), dokumenty tlače (PDF/DOCX; stránka `sid=zakony/cpt` ich má, API nie).
- Rozprava 9. obdobia je veľká (63 schôdz, tisíce strán po 0,9 MB); zberá sa po schôdzach na požiadanie (`node scripts/nrsr-node.mjs rozprava --schodza 61`). Plošný zber by mal ísť cez službu (XDR-279), nie ručne.
- Aliasy poslancov (`entity_alias`) pre `derive:zmienky`: tabuľka nepozná zdroj `nrsr` a jej úprava patrí k sledovaným osobám (XDR-277).
- `entity.verejne = 1` pre poslancov (verejná funkcia, údaje z oficiálneho webu NR SR); kandidáti z volieb majú `verejne = 0`, ak sa mená zhodujú, riadok sa preklopí na 1. Rozhodnutie o verejnom zobrazení meria Adam.
