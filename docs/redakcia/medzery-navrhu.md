# Medzery návrhu AI redakcie oproti registru funkcií

Stav k 27. 9. 2026 (večer). Porovnaný je `register-funkcii-redakcie.md` (127 funkcií A1–G17 vrátane C25, C26 a F22 doplnených auditom 27. 9. večer, 68 princípov P1–P68, 28 téz T1–T28) s `navrh-ai-redakcie.md` (dátový model 0002–0007, derive kroky 4.1, agenti 4.2, plochy 5.1/5.2, poradie I0–I12 / Z1–Z9 / V1–V10, rozhodnutia D1–D18).

**Kritérium stavu:** `pokryté` = v návrhu je tabuľka, krok, agent alebo plocha, ktorá funkciu plní; `čiastočne` = časť existuje, kľúčový kus chýba; `chýba` = nič v návrhu funkciu nerieši.

**Adamove rozhodnutia z 27. 9., ktoré sa premietajú do každého riadku:**

| Rozhodnutie | Čo v návrhu padá | Čím sa nahrádza |
|---|---|---|
| Všetko beží lokálne na Macu, žiadne platené služby | D1 Workers Paid, fronty `netopier-zber-jobs`/`netopier-derive`, R2, cron vo Workeri, `limits.cpu_ms`, `netopier-zber` ako Worker s API hostom, I1, I6 (Access, domény), I8 (R2), I11 (Fiki do R2), D3 cloud routine, D12, D16 | lokálny plánovač na Macu (Node, LaunchAgent `com.xvadur.netopier` — LaunchAgent je externá zmena, zakladá sa iba na Adamov pokyn), pracovná SQLite `netopier/var/netopier.sqlite` (rovnaké migrácie, `better-sqlite3`), surové dáta a archív na disku `netopier/var/raw/`, `netopier/var/archiv/`, lokálne API `127.0.0.1:7780` (rovnaký router `src/api/*` cez Node adaptér), agenti bežia v hlavnej session alebo `claude -p /redakcia` z LaunchAgentu; zálohy lokálne (Time Machine + `zalohy/` na externý disk) |
| Na Cloudflare zadarmo iba zobrazovacia databáza a web | jedna spoločná D1 s celým archívom; Access; Service Tokeny; `api.hriech.xvadur.com`, `netopier.hriech.xvadur.com`; Web Analytics (D13, zadarmo, ale mimo „iba DB a web“ → rozhodnutie Adama) | D1 free (`netopier-web`, limity: 5 GB, 5 mil. čítaných riadkov/deň, 100 tis. zapísaných riadkov/deň) drží iba **verejné** tabuľky; `hriech-web` Worker free (100 tis. požiadaviek/deň, 10 ms CPU) číta iba D1; terminál `/t/*` beží lokálne (`127.0.0.1:7781`, Astro dev alebo Node) nad pracovnou SQLite, bez Access; sync `scripts/sync-d1.mjs` tlačí zmeny verejných riadkov cez D1 REST API (token iba v `~/.config/hriech/`) |
| Žiadne GitHub Actions | D18, I12 | `wrangler deploy` z Macu iba na pokyn; rollback `wrangler rollback` z Macu |
| Minúta nesmie meškať (post na webe do sekúnd po schválení) | cron `*/30`, dva behy agentov denne, `Cache-Control: public, max-age=60` na `/minuta`, Z2 „do 60 s“ | zber SK jadra každých 5 min (Minúta po minúte Denníka N každé 2 min, podmienené GET s ETag), návrh postu deterministicky hneď pri vzniku udalosti (bez LLM), schválenie v lokálnom termináli → v tej istej transakcii sync riadku do D1 (< 3 s) → purge cache URL `/minuta`, `/`, `/api/minuta.json` (zadarmo) alebo `no-store` na týchto trasách; podmienka Z2: „schválený post je na webe do 10 s“ |
| Meno Hriech je dočasné | `hriech-web`, `PUBLIC_HOST`, wordmark, `/o-hriechu`, `docs/HLAS.md` texty | `data/znacka.json` (`nazov`, `domena`, `wordmark`, `byline`), všetky komponenty a HLAS čítajú odtiaľ; názvy tabuliek, stĺpcov a interných ciest bez slova „hriech“; premenovanie Workera a domény ako jeden krok pri builde |

---

## 1. Funkcie A1–G17: stav, kde v návrhu, čo doplniť

### A. Dopredu

| Funkcia | Stav | Kde v návrhu | Čo doplniť / zmeniť |
|---|---|---|---|
| A1 Kalendár udalostí a odpočet | čiastočne | `kalendar` (0006, Vianoce), V3 `/kalendar` + odpočet na titulke; zdroje iba TED lehoty, CRZ účinnosti, ručné termíny | Tabuľka `kalendar` do 0003 (Živé); stĺpce `zdroj_typ CHECK ('nrsr','vlada','prezident','eu','osn','sud','volby','ted','crz','statistika','ohlasenie','rucne')`, `aktor_ids`, `stav CHECK ('planovane','prebieha','skoncene','zrusene')`, `udalost_id`; konektory `nrsr-program` (program schôdzí NR SR), `vlada-program` (rokovania.gov.sk), `prezident-program` (prezident.sk), `su-sr-kalendar` (kalendár zverejňovania ŠÚ SR), `eu-kalendar` (Rada EÚ, EP), `volby` (MV SR); meranie „vedeli sme pred prvým článkom“ = `kalendar.prvy_record_id` vs `created_at`; V3 → Živé |
| A2 Anticipácia ohlásenej udalosti (Danko 13:50) | chýba | – (udalosti vznikajú až z článkov; triáž 2× denne) | `derive/ohlasenia.ts` (deterministické: regex „tlačová konferencia / tlačovka / brífing / o 14:00“ + aktér z `aktori`) → riadok `kalendar` typ `ohlasenie` + `udalosti` so `stav_zivota='ohlasena'` (nový enum) a `reakcia_na_udalost_id`; desk položka typu `pripravka` s prioritou 1 → agent reportér spustí `research_pripady` pred začiatkom; beží v lokálnom watcheri (minúty), nie v dvoch denných behoch |
| A3 Sledované témy a watch pravidlá | čiastočne | `zvody.klucove_slova` (seed), `entity.sledovane`, `sledovane` (0007, Vianoce), pravidlá `sledovana_entita`, `klucove_slovo`, `desk.dovod_triaze` | Téma ≠ hypotéza: tabuľka `temy` (id, nazov, klucove_slova JSON, entity_ids JSON, aktor_ids JSON, aktivna, vytvoril) + `udalost_temy`; `sledovane` z 0007 do 0002; `udalosti.dovod_vynorenia` (JSON why_surfaced: pravidlo, téma, entita, verzia pravidiel) na každej udalosti, nie iba na desku; `/t/temy` |
| A4 Týždenná ústredná otázka a content calendar | chýba | draft článku „iba na pokyn“ (4.2 redaktor) | Tabuľka `zasobnik` (id, tema, ustredna_otazka, pomocne_otazky JSON, tyzden, stav CHECK ('navrh','polozena','nahrate','spracovane','vydane','presunute'), vstup_adama_path, desk_id); krok týždenného behu „otázka týždňa“ (agent pripraví, Adam odpovie 45–60 min, reportér spraví claims z Adamovho vstupu); `/t/zasobnik`; import 8 tém z kalendára 30. 8. |
| A5 Pravidlo prerušenia kalendára | chýba | – | Pravidlo do `docs/HLAS.md` + `desk.dovod_triaze` s hodnotou `prerusenie:<tema_id>`; týždenný beh vypíše počet prerušení |
| A6 Reaction docket | chýba | desk typy `udalost,zvod,minuta,clanok,vydanie,narativ` | Tabuľka `reakcie` (id, artefakt_url, archiv_id, autor, medium_zdroj_id, presne_tvrdenie, co_je_pravda, chybajuca_distinkcia, silnejsi_model, najsilnejsia_namietka, chybajuci_dokaz, rodina_mechanizmu (A1–M1), os_kod (C0–C14), stav CHECK ('lead','captured','verified','scripted','recorded','published','corrected'), vstup_typ CHECK ('url','podcast_link','ig_ulozene','screenshot','video'), desk_id, vytvoril); seed R001–R019 + backlog R020–R026 z augusta–septembra (Index/Frantová platená epizóda ako rodina T14, Bežák/Newsfilter, Dobré ráno sobota Hanzelová/Filo, Index/Vízia 2040, JOJ 24 podcast, relácie z aplikácie Podcasty, MK/03 Lívia); desk typ `reakcia`; `/t/reakcie`; skill `/hriech` zapisuje sem (E10); odkaz z aplikácie Podcasty (podcasts.apple.com) a Instagram „uložené“ (cez Eden export → desk `lead` s URL a časom uloženia) sú platné vstupy (register A6 doplnenie) |
| A7 Podklady k trvalým témam | čiastočne | `research/<téma>/` v gite, V4 demografia, V5 Zeitgeber, V8 Opus, `statistika_rady` | Tvrdenia trvalých tém ako `claims` cez desk typ `tema` (ref = slug research priečinka), aby platilo „každé tvrdenie má primárny zdroj“ strojovo; do `data/statistika-datasety.json` pridať DSS/senior atlas a demografické rady; štvrťročný krok v týždennom behu; korpusy Predictive History a John Harris (Obsidian transkripty) ako `korpusy` s `korpus_id` (lokálne, nikdy do D1); tézy zo Zeitgeistu/Moora ako `claims.vrstva='hypothesis'`, do verejného textu iba s primárnym zdrojom (register A7 doplnenie, §6.25) |

### B. Teraz

| Funkcia | Stav | Kde v návrhu | Čo doplniť / zmeniť |
|---|---|---|---|
| B1 Monitoring SK médií cez RSS | pokryté | zber `rss`, D7 (14 nových kanálov, `overit-kanaly.mjs`), `zdroj_kanaly`, `raw_item` | Interval lokálne 5 min pre SK jadro, 2 min pre Minútu po minúte DN, podmienené GET (ETag/Last-Modified); beží v lokálnom plánovači, nie v crone Workera |
| B2 World Monitor | pokryté | zber `worldmonitor`, 104 kanálov, `derive-kanaly.json`, D12 nie | Lokálny beh každé 2 h; inventár do `zdroje.wm_tier/wm_risk` už je |
| B3 Full-text ingest | čiastočne | `archiv` (extrahovaný text, `paywall`) iba pre citované URL; RSS výňatok ako jediný text | `derive/fulltext.ts` lokálne: pre záznamy v sledovaných témach (A3) stiahnuť celý článok; pri Denníku N s Adamovým predplatným (cookie iba na Macu, text nikdy verejne, iba výrez ≤ 300 znakov podľa D15); `records.fulltext_archiv_id`; newsletter DN cez mail iba na pokyn (Gmail MCP pravidlo); agentúry bez RSS ostávajú medzera v `zdroje.hodnotenie_zdroje`; TASR/SITA ako `zdroje.pristup='predplatne'` s `licencia` (plný text nikdy do D1 ani do gitu, iba výrez ≤ 300 znakov) – rozhodnutie Adama o predplatnom |
| B4 Archív s provenienciou | pokryté | `records` (content_hash, raw_key), `revizie`, `archiv` | `raw_key` → cesta na lokálnom disku; lifecycle 90 dní pre `raw/rss/` ako lokálny `find -mtime` v týždennom behu |
| B5 Zhlukovanie embeddingmi | čiastočne | `RelationshipDecider` bez embeddingu (lex 0,35 + entity 0,30 + čas + akcia + miesto + titulok), „embeddingy až po I3“ | Na Macu embeddingy nie sú problém (P11 povoľuje lokálne): po benchmarku I3 pridať `derive/podobnost.ts` (lokálny model cez `sqlite-vec` alebo in-memory) ako siedmy člen skóre; benchmarkové labely (22 titulkov, 5 párov) dať Adamovi na ratifikáciu (register §6.21) |
| B6 Event Intelligence Core | pokryté | `udalosti`, `udalost_dokazy` (5 vzťahov, `suggested` nikdy nezlučuje), `udalost_rodokmen`, I3 | Ľudský merge/split z V10 presunúť do Z5 (je to bezpečnostná brzda P22, nie vianočný modul); `udalost_dokazy.record_id` musí prijímať aj záznamy typu prepis/video/podcast (B13/B14); čísla benchmarku vzťahov (5 párov, hybrid 1,0 vs lexical 0,4; `ARCH-N/benchmarks/EVENT_RELATIONS_REPORT.md`) do `docs/METODIKA.md` s poznámkou „provizórne do ratifikácie“ (I3) |
| B7 Nezávislé zdrojové rodiny | pokryté | `agentura`, `pocet_nezavislych`, per `zdroj_id` cez `zdroj_kanaly` | – |
| B8 Feed a udalosti cez API | pokryté | `/api/*.json` keyset (`before`, `next`), `vydania.snapshot` | Keyset podľa času nahrádza 24 h snapshot; stačí |
| B9 Filter relevancie (Gelnica) s why_surfaced | čiastočne | triáž agent `dovod_triaze`, `nalezy`, `udalosti.rozsah`, pravidlá registrov | Deterministický `derive/relevancia.ts` na každej udalosti (nie iba 2× denne): pravidlá v `data/relevancia.json` (verzované: inštitucionálny aktér, verejné peniaze, systémový vzorec, rozpor zdrojov, watch téma) → `udalosti.relevancia CHECK ('archiv','feed','priorita')` + `dovod_vynorenia` (A3); LLM triáž iba dopĺňa |
| B10 Tri skóre (istota, verejný následok, Adamova relevancia) | čiastočne | `udalosti.istota`, `sila_dokazov`, `pocet_nezavislych`, `blindspot_skore` | Stĺpce `udalosti.verejny_nasledok REAL`, `adam_relevancia REAL`, `momentum REAL`, `skore_vysvetlenie TEXT` (JSON: z čoho); poradie v `/udalosti` z trojice, nie z jedného čísla; ktorá verzia platí (E4) je rozhodnutie Adama |
| B11 Živý tematický dokument / klaster kauzy | čiastočne | `udalosti` s `event_update`, `zvody` ako hypotézy, `pripady` statické | Tabuľka `kauzy` (id, slug, nazov, otazka, stav CHECK ('otvorena','sleduje_sa','uzavreta'), entity_ids, aktor_ids, zvod_ids, tema_ids, pripad_slug, vytvoril) + `kauza_polozky` (kauza_id, typ CHECK ('udalost','record','prepis','vyrok','register','paralela','poznamka'), ref_id, cas, poznamka, kto); reportér pripája; `/kauzy/[slug]` verejné po `vydane`, `/t/kauzy` |
| B12 Kauza → paralelný research (research lane) | čiastočne | reportér = 1 subagent na desk položku, `podklad` JSON | Tabuľka `research_pripady` (id, kauza_id, udalost_id, otazka, falzifikatory JSON, plan_zdrojov JSON, rozpocet_tokenov, tokens_spotrebovane, stav CHECK ('otvoreny','zbiera','pack','pozicia','zmluva_clanku','zamietnuty'), evidence_pack_path, pozicia_adama, bezpecny_claim, este_overit JSON); agent `hriech-research` (ohraničený rozpočtom, spúšťa dispozícia `research` z desku alebo A2); `/t/research` |
| B13 Tlačovka → prepis → tvrdenia → research → DB | chýba | – (Fiki korpus lokálne, mimo `records`) | Konektor `youtube` (RSS kanála `youtube.com/feeds/videos.xml?channel_id=` zadarmo → záznam; titulky `yt-dlp --write-auto-subs`, fallback `whisper.cpp` lokálne); tabuľky `prepisy` (id, record_id, video_id, kanal, aktor_id, cas_vydania, dlzka_s, zdroj_prepisu CHECK ('titulky','auto_titulky','whisper','dia','rucne'), vtt_path, sha256, stav CHECK ('caka','prepisuje','hotovo','chyba','nedostupne'), overene_audio INTEGER), `prepis_segmenty` (prepis_id, poradie, od_s, do_s, hovoriaci, hovoriaci_istota, text) + `prepisy_fts`, `vyroky` (id, prepis_id, segment_od, segment_do, aktor_id, text, typ CHECK ('tvrdenie','prislub','utok','otazka','hodnotenie'), udalost_id, kauza_id, tema_ids, stav_overenia CHECK ('neoverene','overene','nepravda','nerozhodnute'), research_pripad_id, verejny); agent `hriech-prepis` (segmentácia, extrakcia tvrdení do `vyroky`, každé tvrdenie s číslom → overovateľ ako claim); `/t/prepisy`, `/t/vyroky`; verejne `/aktori/[slug]` s výrokmi; Ficove víkendové tlačovky = prvý testovací kanál |
| B14 YouTube vystúpenie → udalosť pred článkom | chýba | – | Z `prepisy.stav='hotovo'` vzniká `udalosti` riadok s `krivka='media'`, `prvy_zdroj_id` = kanál aktéra, `sila_dokazov='single_source'`; články sa nabaľujú cez bežný `RelationshipDecider` (entity + čas); „chýbajúci prepis je stav spracovania“ = `prepisy.stav` viditeľný na karte; 16 kanálov z v0 ako seed `zdroje` typ `kanal_aktera`; **audio podcasty ako trieda zdrojov** (register B14 doplnenie): konektor `podcast-rss` (feed URL relácie z Apple Podcasts / Spotify, `data/podcasty-seed.json` so zoznamom relácií SK redakcií – Index, Klik, Dobré ráno, Vizita, JOJ 24 podcast, Aréna s Dibákovou, 30tnik) → stiahnutie audia na lokálny disk → `whisper.cpp` → `prepisy` so `zdroj_prepisu='whisper'`, `zdroje.typ='podcast'`; audio sa po prepise neuchováva verejne; latencia do 2 h (L4); zoznam relácií = rozhodnutie Adama |
| B15 Vlastná Minúta bez meškania | čiastočne | `minuta_posty`, Z2 „do 60 s bez buildu“, ostrov `minuta-refresh` 60 s, cache 60 s, posty píše redaktor v behu ráno/večer | Reťaz s latenciou v sekundách: zber 2–5 min → udalosť → `derive/minuta-navrh.ts` deterministicky založí desk `minuta` s návrhom postu z claims (titulok zdroja + výrez + „podľa X“), bez LLM → Adam schváli lokálne → sync riadku do D1 v tej istej transakcii → purge cache; LLM iba na voliteľnú syntézu „15 zdrojov, jedna téma“ v behu; `minuta_posty.povod CHECK ('auto','agent','adam')`; `/minuta` a `/api/minuta.json` bez edge cache (`no-store`) alebo purge; meranie: `minuta_posty.vydane_at − records.collected_at` na `/t` |
| B16 Denný kontrakt 20–30 + 3 | čiastočne | desk ≤ 10 kandidátov/deň na agenta, `vydania.polozky` | Strop triáže pre typ `minuta` na 30; `vydania.metriky` JSON (posty, články, udalosti, latencia medián); čísla na `/o-hriechu/redakcia` a `/t`; kým nebeží 14 dní, je to cieľ, nie tvrdenie |
| B17 Kurátorská fronta NOW/WATCH/RESEARCH/LOW | čiastočne | `/t/desk` (schváliť/vrátiť/zamietnuť), `dovod_triaze`, `priorita` | `desk.dispozicia CHECK ('now','watch','research','low')` + akcie merge/split/escalate z karty; tabuľka `spatna_vazba` (desk_id, hodnotenie CHECK ('plus','minus','hviezda'), poznamka, kto, at) → vstup E3; klávesy `n/w/r/l` v `terminal-klavesy.ts` |
| B18 Notifikácie a beh bez dohľadu | chýba | – | Tabuľka `notifikacie` (id, typ CHECK ('udalost','nalez','ohlasenie','beh','chyba'), ref, kanal CHECK ('telegram','macos','mail','terminal'), text, odoslane_at, precitane_at); **primárny kanál Telegram** (vlastný bot, bez OpenClaw; token iba v `~/.config/hriech/`; Bot API sendMessage z lokálneho plánovača) pre prahy `priorita` a `ohlasenie`, lebo Adam sa o udalosti mimo Macu inak nedozvie (register B18 doplnenie: n=1255, n=1034, n=6585, n=7794); macOS notifikácia (`osascript`/`terminal-notifier`) a denný digest mailom sekundárne (mail iba ak Adam povie, Resend/Gmail pravidlo); zásada: Telegram bot je iba výstup, nikdy zdroj dát ani úložisko (P44) |
| B19 Agent „čo sa deje“ nad DB | čiastočne | `/t/zaznamy` FTS, `/hladaj`, API na čítanie pre agentov | Skill `/netopier <otázka>` v hlavnej session: číta pracovnú SQLite iba na čítanie (`sqlite3 -readonly`), odpovedá s citáciou (record/vyrok/claim id, čas, URL); uložená odpoveď ako `desk` typ `narativ` iba na pokyn; bez cloudu |
| B20 Cloudový zber bez Macu | pokryté (zrušené) | celá časť 1, I1, ADR-008 | Rozhodnutím 27. 9. sa nestavia; ADR-008 prepísať na ADR-012 „lokálny beh, cloud iba zobrazuje“; kód `netopier/zber/` ostáva (konektory bežia v Node cez `zber-node.mjs`) |
| B21 Lokálny beh na Macu, web iba zobrazuje | chýba | návrh výslovne „Mac nie“, „nič trvalé na Macu“ | Nová časť návrhu „Runtime“: (1) `netopier/zber/src/local/scheduler.ts` (intervaly per zdroj, `runJob` in-process, derive po zbere), (2) pracovná DB `better-sqlite3` s tými istými migráciami (FTS5 natívne), (3) lokálne API `127.0.0.1:7780` (rovnaký router), (4) lokálny terminál `127.0.0.1:7781`, (5) `scripts/sync-d1.mjs` (tabuľka `sync_stav` (tabulka, id, updated_at, synced_at); diff push cez D1 REST API po dávkach ≤ 100 riadkov; iba verejné tabuľky; retry; strop 100 tis. riadkov/deň sleduje `/t/sync`), (6) purge cache po synci, (7) LaunchAgent `com.xvadur.netopier` (`KeepAlive`, log do `netopier/var/log/`) — založiť iba na pokyn; (8) `wrangler deploy` webu z Macu na pokyn; hotové keď: 48 h beh bez výpadku > 15 min, `pocty` na `/t` rastú, post na webe do 10 s, plus akceptačný protokol z NIGHT_BUILD_REPORT (idempotentný replay, súbežná rekonciliácia, reštart bez straty, secret scan, zaznamenané zlyhanie; register G11 doplnenie); dvojstrojová topológia (mini vs MacBook worker cez SSH, NET-001 z `ARCH-N/work/`) = rozhodnutie Adama, návrh predpokladá jeden stroj |
| B22 Wire karta s citátom a rolou zdroja | čiastočne | `claims.citacia_vyrez`, `zdroj_typ`, `minuta_posty` | `vyroky` (B13) + `minuta_posty.vyrok_id`, `claims.hovoriaci_aktor_id`, `rola_zdroja CHECK ('source','analysis','support')`; filter `/minuta?aktor=` a `/api/minuta.json?aktor=` |
| B23 Ranný brief bez balastu | čiastočne | `GET /api/desk/triaz-vstup`, `rollup_denne.summary`, `vydania.suhrn_md` | Tabuľka `briefy` (den, typ CHECK ('rano','vecer'), text_md ≤ 60 riadkov, kto, at); výstup ranného behu; zobrazený na `/t` a v notifikácii |

### C. Meranie médií

| Funkcia | Stav | Kde v návrhu | Čo doplniť / zmeniť |
|---|---|---|---|
| C1 Aktivita redakcií a tém | čiastočne | `zdroj_pokrytie_denne` (zaznamov, udalosti, prvy, podiel), `udalost_pokrytie`, V2 rebríček, `/zdroje/[id]` | `zdroj_temy_denne` (zdroj_id, den, tema_id, pocet) z `udalost_temy`; `records.data.category` → `rubrika`; návštevnosť nie je verejný údaj → do kartičky ako `medzera`; rebríček V2 → Živé, ak N ≥ 8 redakcií po D7 |
| C2 Aktivita a preferencie autorov | chýba | – (`data.author` sa používa iba na agentúrny regex) | `autori` (id, meno, zdroj_id, map_person_id, verejny INTEGER DEFAULT 0, prah_clankov, prvy, posledny), `record_autor` (record_id, autor_id), derive `autor_profil_mesacne` (autor_id, mesiac, pocet, temy JSON, opakovane_entity JSON, opakovani_experti JSON); verejné iba osoby z mapy redakcií s rolou (P47), juniori `verejny=0`; `/t/autori` |
| C3 Sentiment | chýba | – | `zaznam_hodnotenie` (record_id, entity_id, metrika CHECK ('sentiment','ton'), hodnota REAL, metoda, verzia, vytvoril, at); lokálny model/lexikón na Macu; kalibračná vzorka 200 ručne kódovaných viet v `korpusy`; verejný graf až po zhode ≥ 0,7 v `docs/METODIKA-MEDIA.md` |
| C4 Vata a zbytočnosť | chýba | – | Vyžaduje `prepisy` (B13); `prepis_metriky` (prepis_id, metrika CHECK ('vypln','neistota_pred_zaverom','alokacia_casu'), hodnota, pozicie JSON, verzia); definícia metriky najprv v METODIKA (register §6.8), potom kód |
| C5 Nepresnosti (titulok vs telo, čísla bez zdroja, flagy) | čiastočne | `udalost_pokrytie.titulok`, `porovnanie_titulkov`, `udalost_dokazy.priznaky` | Tabuľka `kodovanie` (id, schema CHECK ('titulok_telo','jazyk','ramovanie','anketa','servisna_linia','p1_p5','vynechanie','loop','recovy_ledger'), objekt_typ CHECK ('record','prepis','segment','vyrok'), objekt_id, kod, hodnota, pozicia JSON, koder CHECK ('agent','adam','druhy_koder'), korpus_id, verzia_kodovnika, at) + `data/kodovnik.json` (headline_fit tight/partial/distorted, rám titulku, ~45 flagov); agent `hriech-koder`; vyžaduje full text (B3) |
| C6 Rámovanie a slovník (koalícia vs opozícia) | čiastočne | porovnanie titulkov per zdroj, pokrytie, blindspot | `kodovanie` schema `ramovanie` (lexika, prívlastky, hedging, kto priniesol vlastné zistenie); test asymetrie slovníka nad zmrazeným korpusom 100 článkov DN (C18) s protipríkladmi; výstup na karte udalosti ako „porovnanie rámovania“ až po METODIKE; úmysel sa neodvodzuje (P2) → HLAS |
| C7 Porovnanie záznam ↔ podanie | chýba | – | `porovnania` (id, typ CHECK ('zaznam_podanie','original_preklad'), record_id, pasaz_od, pasaz_do, prepis_id, segment_od, segment_do, original_archiv_id, flag CHECK ('source_preserved_weight_reduced','authority_appropriation','material_omission','translation_shift','ok'), zistenie, koder, at); vyžaduje B13 + B3; na karte udalosti odkaz na sekundu záznamu; variant `original_preklad` (T28: originál EN ↔ SK, posuny modality, agensa, kvantifikátorov) so spúšťačom `records.preklad_z` alebo zhoda titulku s cudzojazyčným zdrojom |
| C8 Jazykový audit | chýba | – | `kodovanie` schema `jazyk` (hedging, agentless, „aj“, nadradenosť, anakolút, pasívum); kódovník v `data/kodovnik.json`; agent `hriech-koder` |
| C9 Dezinfo weby a Telegram | chýba | `zdroje.typ` bez kategórie dezinfo; žiadny Telegram | `zdroje.kategoria CHECK ('mainstream','dezinfo','alternativne','statne','agentura','zahranicne','kanal_aktera')`, `zdroje.zoznam_zdroj_url`, `zoznam_datum` (konspiratori.sk); konektor `rss`/`html` pre 5 najväčších dezinfo webov zo zoznamu; konektor `telegram` (verejný náhľad `t.me/s/<kanal>`, bez prihlásenia) → `records source='telegram'`; rovnaké kódovanie ako mainstream; verejne iba agregáty, nikdy plný text; meranie dosahu v čase (register C9 doplnenie): `aktor_ucty.odberatelia INTEGER`, `merane_at`, derive `ucet_metriky_denne` (ucet_id, den, odberatelia, videnia); zdroj `youtube-data-api` (zadarmo, kvóta) v `zdroje`; Social Blade sekundárny; baseline dezinfo Telegramu január 2026 z Adamových poznámok ako prvý riadok |
| C10 Sociálne siete politikov 2× denne, profily | chýba | – | `aktori` (id, slug, meno, typ CHECK ('politik','institucia','novinar','influencer','strana'), strana, funkcie JSON, entity_id, map_person_id, nrsr_id, verejny), `aktor_ucty` (aktor_id, platforma CHECK ('facebook','instagram','youtube','telegram','web','nrsr','x','tiktok'), url, overene_at, sledovany), `aktor_kontroly` (aktor_id, ucet_id, at, stav CHECK ('novy','bez_zmeny','nedostupne','blokovane'), pocet_novych, record_ids) — rozlišuje „nič nové“ od „nedalo sa skontrolovať“; YouTube a Telegram cez konektory zadarmo; Facebook/Instagram = rozhodnutie Adama (Meta Content Library žiadosť / ručné zdieľanie URL do archívu / bez FB ako 16. 6.); `/aktori`, `/aktori/[slug]` (výroky, hlasovania, články, účty), `/t/aktori` |
| C11 Meta Ad Library | čiastočne | – (v návrhu nič; ručný protokol existuje v archíve: `ARCH-N/docs/research/PATRIKSYSTEMS_WEB_SOURCES_2026-09-11.md`, XDR-195) | Konektor `meta-ads` (Ad Library API, vývojársky token zadarmo — rozhodnutie Adama) → `reklamy` (id, aktor_id, platforma, ad_id, library_id, od, do, vydavky_od, vydavky_do, dosah_od, dosah_do, dosah_eu, vek_od, vek_do, inzerent, platitel, kreativa_archiv_id, cielenie JSON, utm JSON, sha256); pravidlo „dosahy sa nesčítavajú na unikátne publikum“ v METODIKE; kým nie je token, ručný protokol z 11. 9. (deterministická vzorka 12 kariet, EÚ údaje, UTM dekódovanie, vestník ako identita) ako `desk` položka typu `profil` s archívom kariet; týždenný súhrn per aktér; Vianoce |
| C12 Ledger predikcií, návratov a opráv médií | chýba | – | `predikcie` (id, record_id, zdroj_id, autor_id, text, typ CHECK ('predikcia','varovanie','expertne_tvrdenie'), horizont, stav CHECK ('otvorene','potvrdene','vyvratene','nevratene'), navrat_record_id, oprava_record_id, kto, at); zdroj `hriech` pre vlastné (F18); test C0 (50 z 250 Trump URL) ako `korpusy` riadok; `/opravy` a `/zdroje/[id]` stĺpec „návraty“ |
| C13 Test expozície vs porozumenia | chýba | – | `testy_expozicie` (id, tema, otazky JSON, medium_vrstvy JSON, verdikt, kontrolny_obraz_zdroj, at) alebo desk typ `test`; výstup živí F15; Hugging Face ako seed; komparatívny test SK vs PL/CZ (to isté AI téma v slovenskom a poľskom/českom médiu) ako `korpusy.kontrolny=1` – vyžaduje D19 `regionalne` |
| C14 Audit ankiet redakcií | chýba | – | `kodovanie` schema `anketa` (12 položiek); spúšťač: záznam s kľúčovými slovami „anketa / prieskum medzi čitateľmi“; SurveyHero DN 15. 8. ako prvý riadok |
| C15 Moderátorský loop | chýba | – | `kodovanie` schema `loop` nad `prepis_segmenty` (otázka → odpoveď → odchýlka → follow-up → vyriešenie, moderátor); vyžaduje hovoriacich v prepisoch |
| C16 Speaker asymetria | chýba | – | `prepis_segmenty.hovoriaci` + derive `prepis_metriky` (kto otvára, rámuje, validuje, uzatvára); `uncertain` hovoriaci nejde verejne |
| C17 Evidence schema (taxonómia M01–M12, flagy) | čiastočne | `claims.typ` (fakt/interpretacia/medzera), `signaly.source_fact/implication`, `nalezy.typ` | `data/taxonomia-medii.json` (osi C0–C14, kódy M01–M12, rodiny A1–M1, flagy) verzované; `kodovanie.kod` z nej; `claims.public_use INTEGER`; `claims.vrstva CHECK ('documented','coded','inference','hypothesis','unsupported')` (P28), `unsupported` blokuje `vydane`; do `data/kodovnik.json` menovite flagy z MK/13–17 (`scale_analogy_without_accounting`, `mechanism_named_then_abandoned`, `fact_kernel_to_conspiracy_riff`, `answered_privacy_question_left_open`, `valid_source_transfer`, `scope_compression`, `missing_institutional_mechanism`) so zdrojom a kódy M09–M11 (C25) |
| C18 Zmrazené vzorky, denominátor, dvojité kódovanie | chýba | – | `korpusy` (id, nazov, definicia_dopytu, zmrazene_at, manifest_sha256, pocet, public_text_policy, next_gate, kontrolny INTEGER) + `korpus_polozky` (korpus_id, objekt_typ, objekt_id, polovica); `kodovanie.koder='druhy_koder'` + derive `zhoda` (Krippendorff α) do METODIKY; import `R/corpus-register.csv` (11 korpusov); `/t/korpusy`; žiadne % verejne bez `korpus_id` |
| C19 Línia politikov v čase | chýba | – | `linie` (id, aktor_id alebo strana, tema_id, pozicia, od, do, vyrok_ids JSON, stav CHECK ('drzi','odchylka','zmena')) derive nad `vyroky`; odchýlka = lead do desku; `/aktori/[slug]` sekcia „línia“ |
| C20 Kontrolný korpus a mechanism density | chýba | – | `korpusy.kontrolny=1` + `prepis_metriky` (claim/evidence/decision rule/next action density); párové porovnanie ako výstup `kodovanie`; AI Daily Brief ako párový formát ku Klik/Gregor v seede kontrolných korpusov |
| C21 Korpusový pass P1–P5 | chýba | – | `kodovanie` schema `p1_p5` nad `korpus_polozky`; opakovateľnosť ako pole `korpusy.opakovatelnost CHECK ('lokalne','periodicke','stabilne','neurcite')` |
| C22 Test materiálneho vynechania | čiastočne | `claims.typ='medzera'`, „Nevieme:“ | `kodovanie` schema `vynechanie` so 4 testami (výsledný model, chýbajúca väzba, materiálnosť, falzifikátor); povinné pre claim `medzera` v článku typu kritika |
| C23 Audit servisnej línie | chýba | – | `kodovanie` schema `servisna_linia` (awareness / decision support / practice path / bez mosta) nad korpusom; 5 podmienok manuálu v kódovníku |
| C24 Rečový ledger epizódy a alokácia času | chýba | – | `kodovanie` schema `recovy_ledger` nad `prepis_segmenty` (ťah, vecné jadro, čo nasleduje, flag) + `prepis_metriky.alokacia_casu`; kontrolný vzorok susedných dielov ako `korpusy.kontrolny` |
| C25 Audit kritikov a vlastných textov (nové, P68) | chýba | – | `kodovanie` schema `kritik` s kódmi M09 unsupported mockery, M10 valid criticism but weak evidence, M11 source/citation gap nad `prepisy`/`archiv` cudzieho kritika (Lívia, Fiki) aj nad Hriechovým draftom; brána v `draft.ts`: článok typu kritika neprejde do `schvalene` bez self-auditu M09–M11 (riadok `kodovanie` s `objekt_typ='draft'`); seed MK/03 |
| C26 Audit postoja k technologickej revolúcii (nové) | chýba | – | `kodovanie` schema `revolucia` so 7 osami (`revolution_frame`, `operational_fluency`, `audience_activation`, `risk_balance`, `economic_mechanism`, `source_discipline`, `institutional_role`) a tabuľka `clustre` (kod A1–A10, verejna_sila, kontrolny INTEGER, mechanizmus_kod M1–M8); pravidlo: text s A-clustrami neprejde bez A8/A9; Vianoce (V-M) |

### D. Registre a OSINT

| Funkcia | Stav | Kde v návrhu | Čo doplniť / zmeniť |
|---|---|---|---|
| D1 CRZ | pokryté | zber `crz`, `register_udalosti`, `crz_ciselniky`, V1 sémantika, D14 mená | Overenie sémantiky objednávateľ/dodávateľ na 20 zmluvách presunúť z V1 do Živé (titulka ukazuje počty CRZ od Z9); lokálny beh |
| D2 TED | pokryté | zber `ted` | ÚVO vestník ako kandidát zdroja (`zdroje.stav_pristupu='kandidat'`), overiť open data ÚVO/data.gov.sk |
| D3 Kataster | pokryté | zber `kataster`, D11 (2 oblasti), V7 `/mapa` | Na Macu odpadá limit 128 MB → geometria na disk, stránkovanie WFS ostáva; výber oblastí = Adam; test nevyhnutnosti (P48) pred publikovaním údaja o parcele |
| D4 ŠÚ SR | pokryté | zber `statistika`, `statistika_rady` (V1/V4) | Kalendár zverejňovania ŠÚ SR do `kalendar` (A1) |
| D5 Ďalšie prúdy štátu | čiastočne | V9 `rpo.ts`, `ruz.ts`, `rpvs.ts` (Vianoce) | `zdroje.stav_pristupu CHECK ('kandidat','dokumentacia','vzorka','pravidelny')`, `licencia`, `technicky_kontrakt_url`; kandidáti: NBS (API kurzy, štatistiky), NCZI, MV SR, Slov-Lex (legislatíva, MPK), rokovania.gov.sk (materiály vlády), Obchodný vestník, justícia otvorené dáta (súdne rozhodnutia), ITMS2014+/ITMS21+ (čerpanie eurofondov, open data – Adam 1. 9.: „Jak sa míňajú eurofondy, jak sa míňajú peniaze z rozpočtu, jak sa hlasuje, kto čo hovorí“, n=6514), rozpocet.sk / Štátna pokladnica (výdavky pre F7 „koľko štát dnes minul a za čo“), rozhodnutia ÚS SR ako otvorený dataset (precedens ÚS chatbot, T7), data.gov.sk katalóg, ÚVO; každý má riadok v `zdroje` už teraz so stavom `kandidat`; ITMS a rozpočet pred Vianocami, lebo živia V1 |
| D6 Skener NR SR | chýba | – (v0 zmazaný; návrh nemá nrsr konektor) | Konektor `nrsr` (schôdze, program, hlasovania, hlasy poslancov, parlamentná tlač ČPT, výbory; rozprava ako `prepisy` z prepisov NR SR); tabuľky `nrsr_schodze`, `nrsr_hlasovania` (id, schodza, cislo, cas, nazov, tlac, vysledok), `nrsr_hlasy` (hlasovanie_id, aktor_id, hlas CHECK ('za','proti','zdrzal','nehlasoval','nepritomny')), `nrsr_tlace`; `register_udalosti.druh` + `nrsr_hlasovanie`, `nrsr_tlac`, `nrsr_schodza`; konektor `ustavny-sud` (tlačové správy); hlasovania v profile `/aktori/[slug]`; report zo schôdze ako desk `narativ`; **do jadra pred Živé** |
| D7 Verzovanie a diff | pokryté | `(source, external_id, content_hash)`, `revizie`, `/t/zaznamy/[id]` verzie | Diff dvoch verzií v `/t/zaznamy/[id]` (textový diff, čistá funkcia); „súkromný change feed“ = `/t/zaznamy?zmenene=1` |
| D8 Prepájanie entít (IČO) | pokryté | `entity`, `record_entity`, `entity_alias`, V9 ftm | Osoby: `entity.parovanie CHECK ('iste','navrh','otvorene')`, navrhované zlúčenie osôb nikdy automaticky (už platí) |
| D9 Alert na neobvyklú zmenu s evidence contract | čiastočne | `nalezy` (typ, dokaz, stav), `pravidla.ts` s názvom pravidla | `nalezy.pravidlo_verzia`, `neistota_parovania REAL`, `dispozicia CHECK ('routine','monitor','research','merge','split','dismiss','escalate')`, `research_pripad_id`, `pravo_na_odpoved INTEGER`; alert nikdy verejne bez `desk` položky a schválenia (už platí) |
| D10 Medzinárodná kontextová vrstva | čiastočne | `statistika_rady` iba ŠÚ SR, `prieskumy` V6 | `statistika_rady.institucia CHECK ('su_sr','eurostat','worldbank','oecd','imf','nbs','mf_sr')`, `zdroj_url`, `verzia_vydania`, `retrieved_at`; konektory `eurostat`, `worldbank`, `oecd` (API zadarmo, JSON-stat); `institucia` doplniť o `'eurobarometer'` (séria dôvery v inštitúcie a médiá vedľa DNR; Adam n=991, n=994, 25. 5.); GDELT iba ako mediálny signál, neskôr |
| D11 Mapa redakcií | pokryté | `editorial-organization-map.json`, `zdroje.outlet_id`, `entity.map_*`, `/mapy/redakcie` | Úloha „dorobiť“ (Adam 25. 9.): TA3, STVR, Markíza, JOJ, TASR, SITA; pravidlá čerstvosti ako `mapa_kontroly` (outlet_id, typ CHECK ('team_page','orsr','ruz','rpvs'), at, vysledok) v týždennom behu |
| D12 Mapovanie štátu a influencerov | čiastočne | V9 `ftm_entity` (PublicBody…) | `/mapy/stat` z `entity`+`ftm_vztah`, `/mapy/influenceri` z `aktori` typ influencer; rovnaká schéma `evidence_state`; po V9; podfunkcia „SK Instagram Top 200“ (postavené 17. 8., 201 profilov, CSV po zmazaní v0 nenájdené): obnoviť z rollout summary / Time Machine ako `datasety` riadok, metóda „dve poradia: followeri vs reálna pozornosť (medián views)“ ako `aktor_metriky` pre typ influencer; `data/aktori-seed.json` odkazuje na tento dataset; podfunkcia „profil influencera“ (Patriksystems / COR-X, 11. 9.): deterministická vzorka kariet, cesta obsah → komentár → DM → newsletter → ponuka, vestník ako identita – prvý riadok `/mapy/influenceri` |
| D13 Person resolution / OSINT na mená | čiastočne | V9 rpo/ruz/rpvs + ftm | Meta token chýba → mimo; `aktori` (C10) ako kotva; každá väzba s `ftm_vztah.neistota`; metóda „publikum reklamy“ (Adam n=8354: ľudia, ktorí lajkli reklamu) iba ako agregát `reklama_publikum` (reklama_id, pocet, typ_uctu, at) – nikdy identita súkromných osôb, `zoznam lajkujúcich` zakázané pole v HLAS (G5) |
| D14 Korpusy prepisov (Fiki, Klik, Gregor, Cangama) | čiastočne | Fiki lokálne + záloha (D16), „nikdy do D1“ | Generické `prepisy` (B13) s `korpus_id`; import Fiki ako `records source='fiki'` iba lokálne (`verejny=0`, raw nikdy do D1 sync), Klik/Gregor/Cangama CSV z `R/` ako `korpusy`; `prepisy.overene_audio` (G14); `zdroj_prepisu='dia'` pre transkripty z Dia (navigačný, nie citačný) importované z corpus stimuli; korpusy Predictive History a John Harris (Obsidian) ako `korpusy` s `korpus_id` (A7); podcasty cez `podcast-rss` (B14) |
| D15 Realitný trh | čiastočne | iba „nikdy do API ani promptu“ (D2) | `datasety` (id, nazov, cesta, zdroj, zber_at, licencia, verejny DEFAULT 0, popis) ako register analytických vrstiev; `/t/datasety` |
| D16 Súdne spory a obžalovaní politici | chýba | – | `pravne_statusy` (id, aktor_id, konanie, typ CHECK ('civilne','trestne','spravne'), stav CHECK ('vysetrovany','obvineny','obzalovany','odsudeny','oslobodeny','zastavene','pravoplatne'), od, do, zdroj_record_id, archiv_id, kto); zdroje: justícia otvorené dáta, ÚŠP/GP tlačové správy, médiá (iba s archívom); presnosť statusov v HLAS (P34, T22) |
| D17 Graf vzájomnosti pre kauzy | čiastočne | 0007 `ftm_entity`, `ftm_vztah` (Vianoce) | `/kauzy/[slug]` sekcia graf (server-side SVG z `ftm_vztah` + `kauza_polozky`), každá hrana so zdrojom; „väzba nie je dôkaz vplyvu“ ako text pod grafom (P3) |
| D18 Krížové kontroly a zdrojové registre prípadu | čiastočne | `claims` + `archiv` + `overenie` JSON | `reserse` (id, research_pripad_id, dotaz, domeny JSON, vysledok CHECK ('najdene','nenajdene','blokovane','platene'), record_ids, kto, at) — nulový výsledok je záznam, nie tvrdenie; `claims.cas_zdroj CHECK ('rss','web','youtube','podcast')` pre nesúlad časov; Wikipedia/Wikidata ako `entity` podklad s `evidence_state='documented_historical'` (nikdy primárny dôkaz, P31), `entity.wikidata_id` |
| D19 Katalóg zdrojov | pokryté | `zdroje` (typ, rozsah, bias, faktickost, hodnotenie_zdroje, wm_tier, sledovany, pozastaveny), `zdroj_kanaly`, `pocty`, `/zdroje`, `/t/zdroje` | `zdroje.pristup CHECK ('rss','html','api','predplatne','rucne')`, `kategoria` (C9) rozšírená o `'regionalne'` (V4: CZ, PL, HU, 2–3 kanály na krajinu, `zdroje.krajina`) a `'podcast'`; `stav_pristupu` (D5); zdroj `youtube-data-api` (C9) |

### E. Worldview a zvody

| Funkcia | Stav | Kde v návrhu | Čo doplniť / zmeniť |
|---|---|---|---|
| E1 Skladanie worldview (kumulatívny model) | čiastočne | `zvody` + EKG, `udalosti`, `entity` | Vrstvy modelu: actor map = `aktori` (C10), policy map = `temy`/`kauzy`, prediction ledger = `predikcie` (C12), correction ledger = `opravy` (F18), historické paralely = `kauza_polozky.typ='paralela'`; syntéza = týždenný beh zapíše `narativ` na `/seizmograf` iba z týchto tabuliek; worldview tézy zo Zeitgeistu/Moora/Predictive History/Harrisa iba ako `claims.vrstva='hypothesis'` (register E1 doplnenie, §6.25) |
| E2 Seizmograf / EKG | pokryté | 0004, `/zvody`, `/seizmograf`, Z8 | Metafora v copy cez `data/znacka.json` (pulz/EKG, nie seizmograf) |
| E3 Verzovaná redakčná politika so spätnou väzbou | čiastočne | `docs/HLAS.md`, `prompt_version` = commit, zvody zamknuté | `politika_verzie` (verzia, commit, diff_md, navrhol, schvalil, at) + `spatna_vazba` (B17); týždenný beh navrhne diff, keď ≥ 5 spätných väzieb; `/t/politika` (schváliť/zamietnuť); `hriech-redakcia` ako lokálny git bez remote |
| E4 Scoring podľa Adamovej pozície vs tri skóre | čiastočne | zvody so smerom signálov; bez `adam_relevancia` | Rozhodnutie Adama (register §6.7): návrh dáva „tri skóre“ (B10) a Adamova pozícia je iba `adam_relevancia`, nikdy vo `verejny_nasledok`; zapísať ako D19 v zozname rozhodnutí |
| E5 Register osí C0–C14 a rodín A1–M1 | chýba | – | `data/taxonomia-medii.json` (C17) + verejná stránka `/o-hriechu/metoda` (osi, kódy, hranice); každý prípad a reakcia má `os_kod` |
| E6 Kompresia obžaloby do 6–8 mechanizmov | čiastočne | pripady statické, desk `clanok` | `mechanizmy` (id, kod M1–M8, nazov, os_kod, flagship_pripad_slug, podporne JSON, kontrolne JSON, stav CHECK ('navrh','potvrdeny','oslabeny')); pravidlo: mechanizmus verejne až s flagship + podporný + kontrolný prípad (P17, P19) |
| E7 Hypotéza, falzifikátor, „čo by ich očistilo“ | čiastočne | `zvody.hypoteza` + `contradicting` signály, `claims.medzera` | Povinné polia v kontrakte reportéra a v `desk.podklad`: `falzifikator`, `najsilnejsia_obhajoba`, `co_by_ocistilo`; validátor `draft.ts` odmietne článok typu kritika bez bloku „Najsilnejšia obhajoba:“ |
| E8 Timestampovaný záznam Adamových hypotéz | čiastočne | – (existuje `corpus.sqlite` v adam.xvadur, návrh ho nepozná) | `claims.zdroj_typ` + `'adam'` a `claims.corpus_prompt_id` + `cas_utc`; reportér smie citovať „Adam pomenoval 1. 9. 14:55 UTC“ iba s id z korpusu; čítanie `corpus.sqlite` iba lokálne |
| E9 Šesťotázkový test a triedenie výhrady | chýba | – | Polia v `reakcie` (A6): `co_tvrdene`, `co_podlozene`, `co_chyba`, `prakticka_chyba`, `silnejsi_model`, `falzifikator`, `druh_vyhrady CHECK ('moralny','epistemicky','distribucny','kompetencny','dokazovy','esteticky')`; do HLAS |
| E10 Skill `/hriech` | čiastočne | – (skill existuje v `_claude/skills/hriech`, návrh ho nespája) | Skill zapíše výstup cez lokálne API do `reakcie` (+ archív artefaktu cez `POST /api/archiv`); vráti id; bez zápisu ostáva iba rozhovor |
| E11 Conversation ledger rant → podklady → článok | čiastočne | redaktor draft článku na pokyn | Desk `clanok` s `podklad.rant_path` (`research/<slug>/rant.md`), krok reportéra „z rantu“: rozdelí rant na claims, nájde zdroje, označí slabé; redaktor devulgarizuje podľa HLAS; Adamov rant sa nikdy nesyncuje do D1 |
| E12 Trhový dopad ako sledovaná hypotéza | chýba | – | Nízka priorita: `research/trhovy-dopad/` s claims typ `interpretacia`; bez tabuľky |
| E13 Vlastné omyly ako súčasť worldview | čiastočne | `revizie`, `claims.stav='nepravda'` | `opravy` (F18) s `typ='autor'`; sekcia „Kde sme sa mýlili“ na `/opravy`; seed z `core/02_dielo/hriech.md:91–103`; self-audit draftu kódmi M09–M11 (C25) ako brána pred `schvalene` |

### F. Výstupy

| Funkcia | Stav | Kde v návrhu | Čo doplniť / zmeniť |
|---|---|---|---|
| F1 Modul Minúta | pokryté | `minuta_posty`, `/minuta*`, `/minuta.xml`, `/api/minuta.json`, Z2 | Latencia podľa B15; `why_surfaced` na poste = `udalosti.dovod_vynorenia` |
| F2 Udalosť: karta a detail | pokryté | 5.1 `/udalosti/[slug]` (hlavička, prvý, pokrytie, blindspot, porovnanie titulkov, tvrdenia, registre, časová os, zdroje, proveniencia), `podklad.otvorene_otazky` | Pridať „kto nahral a kto prvý zverejnil“ z `prepisy`/`vyroky` (B13) a rozdiel „osobné hodnotenie vs súhlas“ ako claim typ `interpretacia` |
| F3 Články: writing engine, repozitárový proces | čiastočne | redaktor + validátor viet, overovateľ, claims, Adam schvaľuje, články Markdown v gite s `claimIds` | Kontrakt článku v `desk.podklad` (`otazka`, `pozicia_adama`, `adresat`, `obciansky_dosledok`, `rozsah`, `co_by_zmenilo_zaver`); research map + causal outline ako sekcie podkladu; nezávislé prechody: agent `hriech-auditor` (citácie, kauzalita/agency, kvantifikátory, alibi jazyk) a `hriech-citatel` (fresh-reader test: odpovie na 6 otázok iba z draftu, zhoda s claim mapou) medzi `napisane` a `schvalene`; `claims.autorstvo_materialu CHECK ('adam_direct','adam_edited','ai_generated','quoted_external')`; hard fail v `draft.ts` pri čísle bez claimu typu fakt |
| F4 Týždenný článok s derivátmi | chýba | – | `derivaty` (id, desk_id, typ CHECK ('teza','post','citat','vizual','otazka'), text, stav CHECK ('navrh','schvalene','vydane'), kanal, vydane_at); krok redaktora po `vydane` článku; publikovanie na siete iba na pokyn (Eden/obsah); P61 „iba so samostatnou myšlienkou“ = Adam škrtá v `/t/derivaty` |
| F5 Prípady a case file formát | pokryté | `src/content/cases/`, `/pripady/*` prerender, `ArticleView` | `kauzy.pripad_slug` (B11) spája DB kauzu so statickým prípadom; frontmatter `sendable_as_is` ostáva |
| F6 Mapy | pokryté | `/mapy/redakcie` live, V7 `/mapa`, V2 rebríček | – |
| F7 Dashboardy: štátny, briefing room, EKG | čiastočne | V1 `/stat/*`, `/seizmograf` | `/svet` (briefing room): udalosti `rozsah='medzinarodny'` z WM `derive-kanaly` zoskupené podľa `temy` (Irán, Ukrajina, EÚ, USA); zdroje pre čísla dashboardu: MF SR / ARDAL (dlh), rozpočet (rozpocet.sk open data), NBS API → `statistika_rady.institucia`; laický výklad ako claims typ `interpretacia`; téma Ukrajina s vlastnými zdrojmi (regionálne CZ/PL/HU + WM), nie iba DN „vývoj bojov“; „koľko štát dnes minul a za čo“ z ITMS a rozpocet.sk (D5) |
| F8 Kalkulačky: volebná a prieskumy | čiastočne | `prieskumy` V6 `/volby` | `src/lib/mandaty.ts` (čistá funkcia: prepočet 150 mandátov, kvórum 5/7/10 %, koalície) + `/volby/kalkulacka` formulár GET bez JS; historické voľby zo `volby.statistics.sk` do `statistika_rady`; agregácia prieskumov s váhou podľa agentúry iba s METODIKOU |
| F9 Chronos, demografia, Opus | pokryté | V4, V5, V8 | – |
| F10 Klipy | čiastočne | Fiki záloha (I11) | `vyroky.klip_ref` (montage.json v projekte obsah); reakčné klipy z `prepisy` = vstup pre projekt obsah, nie redakcie; vlastník reakčných klipov = rozhodnutie Adama (register §6.24) |
| F11 Substack a newsletter | chýba | – | Export vydania ako Markdown/e-mail (`/vydanie/[den].md`), personalizácia podľa `temy` neskôr; kanál (Substack vs web) = rozhodnutie Adama (register §6.3) |
| F12 Denný hlas | chýba | – | Zahodené 30. 8.; nezapracovať; 7 skriptov ostávajú v zásobníku (A4) |
| F13 Karta reakcie na jednu minútu | chýba | – | Súčasť `reakcie` (A6): `hovorena_kostra` generovaná z polí („Hovoria X. X má pravdivé jadro A…“); stav `scripted` |
| F14 Source card pri každom výstupe | čiastočne | `Autorstvo.astro`, `Proveniencia.astro` (behy, počty claims, archívy) | Do `desk.podklad` povinné `typ_tvrdenia CHECK ('analyticka_teza','prevalencia')`, `primarny_zdroj_potrebny`, `correction_path`, `najsilnejsia_namietka`; `Proveniencia.astro` ich vykreslí |
| F15 Encyklopedický uzol (7-krokový explainer) | chýba | – | Desk `clanok` s `podtyp='explainer'` a kontraktom 7 krokov (udalosť → relevance audit → pojmy → história → obchodný mechanizmus → strategická interpretácia → aktualizácia); `/vysvetlenia/[slug]`; spúšťač C13; „Adamova mama“ ako fresh-reader test (F3); seed tém v `data/explainery-seed.json` s dátumom prvej formulácie (E8): kybernetická bezpečnosť ako model hrozby (21.–22. 9., n=8273, n=8284, n=8288), Hugging Face (29. 8.), GitHub, RAG |
| F16 Podanie redakcii (otázky, mail) | chýba | – | `oslovenia` (id, desk_id, research_pripad_id, adresat_zdroj_id, otazky_md, odoslane_at, kanal, odpoved_md, odpoved_at, stav CHECK ('navrh','odoslane','odpovedane','bez_odpovede')); odoslanie iba na pokyn (Resend/Gmail pravidlo); 25 otázok DN ako seed |
| F17 Web Hriechu: publikačná vrstva | pokryté | `hriech-web`, publication policy, RSS, sitemap, search, print v2 | Meno cez `data/znacka.json`; Worker free plán (10 ms CPU): SSR stránky bez ťažkých dopytov, `/hladaj` limit 20; `smoke-live.mjs` meria CPU cez `wrangler tail`; redizajn „Hotové keď“ (z `ARCH-N/docs/research/FRONTEND_EXPLORATION_FRAMEWORK_2026-09-09.md`): reálne dáta zo zmrazeného fixture s reálnymi URL, žiadny mock, reflow 320 px, kontrast 4,5:1, klávesnica, Adamov výber z ≥ 2 alternatív bez zobrazenia skóre modelu; ten istý fixture pri šablóne XVADUR (XDR-230) |
| F18 Verejný correction log a ledger predikcií | čiastočne | `revizie`, stav `stiahnute` | `opravy` (id, entita_typ, entita_id, povodna_verzia, nova_verzia, dovod, podnet, typ CHECK ('oprava','doplnenie','stiahnutie','autor'), kto, at, verejna) + `/opravy`; vlastné predikcie v `predikcie` so `zdroj_id='hriech'`; pole `opravy[]` vo frontmatteri článkov; precedens F21 (nález zverejnený cudzím účtom) ako `publikacie_externe` riadok s `typ='sekundarne_zverejnenie'` a odkazom na E8 čas prvej formulácie |
| F19 Bezpečný verejný claim | čiastočne | claims so stavom, „Nevieme:“ | `research_pripady.bezpecny_claim`, `este_overit` (B12); redaktor smie použiť v článku iba `bezpecny_claim` z uzavretého prípadu |
| F20 Vizuál mechanizmu | čiastočne | SVG EKG, sparkline, časová os | `vizualy` (id, desk_id, typ CHECK ('dokument_vyrez','graf','casova_os','mapa'), zdroj_archiv_id, path, popis, verejny); výrez dokumentu iba z vlastného archívu (CRZ PDF), nikdy fotka osoby ako ilustrácia; typ `'ai_video'` (Higgsfield, Remotion) s pravidlom: nikdy fotorealistické zobrazenie reálnej osoby alebo udalosti, vždy `ai_generated` (G3), nikdy ako dôkazový vizuál |
| F21 Nález publikovaný cudzím účtom (IG „Nasratý občan“) | chýba | – | `publikacie_externe` (id, platforma, url, ucet, vlastny INTEGER DEFAULT 0, desk_id, nalez_record_id, typ CHECK ('vlastne','sekundarne_zverejnenie'), at, metriky JSON); Mediaboard = `vlastny=0`, `typ='sekundarne_zverejnenie'` (účet nie je Adamov, register F21 opravený); brána G6: pri odovzdaní nálezu tretej strane ide s ním odkaz na CRZ záznam a E8 čas; či Hriech nález cituje ako prvý výstup alebo sekundárne = Adam (§6.10) |
| F22 Experimentálne účty ako senzor publika (nové) | chýba | – | Tabuľka `experimenty` v projekte obsah (id, hypoteza, ucty JSON, varianty JSON, metriky JSON, zaver, od, do), nie v redakcii; anonymné účty (Threads „Strašne ma nasralo“, fikinec.ko rodina, faceless TikTok) v `data/ucty-experimenty.json` (lokálne, nikdy do D1); výsledky sú signál o publiku, nie dôkaz o médiu (P10) → do redakcie iba ako `claims.vrstva='hypothesis'` |

### G. Prevádzka

| Funkcia | Stav | Kde v návrhu | Čo doplniť / zmeniť |
|---|---|---|---|
| G1 Schvaľovanie: Codex/Claude píše, Adam publikuje | pokryté | desk stavový stroj, `schvalenia.kto` iba Adam, `POST /api/desk/:id/prechod`, články s `approvedBy` | Identita bez Access: lokálny terminál na `127.0.0.1` pod Adamovým macOS účtom → `schvalenia.kto='adam:local'`; agenti nikdy nedostanú cestu `prechod` (už platí cez `agenti.json`) |
| G2 Proveniencia a archív | pokryté | reťaz claim → archiv → records → runs, `behy_redakcie` | Vstup/výstup behov na disk `netopier/var/redakcia/` namiesto R2 |
| G3 AI disclosure | pokryté | `autorstvo.ts`, `Autorstvo.astro`, `/o-hriechu/redakcia` | `autorstvo_materialu` (F3) do textu byline |
| G4 Repozitár, jadro, súkromný archív | pokryté | `research/` sa nepushuje, drafty v DB, súkromný repo `hriech-redakcia` | `hriech-redakcia` ako lokálny git bez remote v `projekty/hriech-redakcia/`; pracovná SQLite a `var/` v `.gitignore` |
| G5 Hranice súkromia osôb | pokryté | `entity.verejne=0`, D14, D15 | `autori.verejny` a prah (C2); `aktori.verejny`; test nevyhnutnosti (P48) ako povinné pole podkladu pri údaji z registra o osobe; zakázané pole `zoznam lajkujúcich` (D13) v HLAS a lint |
| G6 Právo na odpoveď | čiastočne | iba v rizikách („right-of-reply“) | `oslovenia` (F16) + brána: desk `clanok` s `podtyp='investigativa'` neprejde do `schvalene` bez riadku `oslovenia` alebo Adamovej poznámky „bez oslovenia, dôvod“ |
| G7 Opravy a verzie článkov | čiastočne | `revizie` | `opravy` (F18); míľniky 01/02/03 = stavy `overene`/`napisane`/`vydane` desku typu `clanok` |
| G8 Lokálne spracovanie textov | pokryté | D2, „Worker nikdy nevolá LLM“ | Rozhodnutím 27. 9. je lokálne všetko okrem zobrazenia; D2 (Claude smie čítať verejné texty) ostáva rozhodnutím Adama, lebo Claude je cloudový model |
| G9 Kto obsluhuje redakciu | čiastočne | agenti Claude Code, cloud routine, Paperclip nie | Hlavná session + LaunchAgent `claude -p /redakcia rano|vecer|tyzden` (headless, log do `var/log`) = rozhodnutie Adama; Paperclip a OpenClaw mimo; XDR-226 uzavrieť |
| G10 Linear | pokryté | I/Z/V ako úlohy v P-XDR-6, D17 | Zrušiť I1, I6, I8 (R2 časť), I11, I12; pridať L-kroky (časť 5); štítok Adam na LaunchAgent, D2, FB/IG, Meta Ads |
| G11 Definícia hotového | pokryté | „Hotové keď“ + dôkaz pri každom kroku | L1 doplniť akceptačný protokol runtime z NIGHT_BUILD_REPORT (idempotentný replay, súbežná rekonciliácia, reštart bez straty, secret scan, zaznamenané zlyhanie) ako `scripts/akceptacia.mjs` |
| G12 Monetizácia | chýba | – | Neratifikované, nezapracovať (register §6.19) |
| G13 Raw súbory a autorské práva | pokryté | D15 (výrez ≤ 300 znakov), R2 súkromný | R2 → lokálny disk; do D1 sync ide iba `archiv` metadáta + výrez |
| G14 Validačný protokol T/A/E | čiastočne | overenie claimu = podreťazec archívneho textu (T) | `claims.overenie.audio_check CHECK ('neoverene','adam','agent')`, `prepis_segmenty.overene_audio`; claim z prepisu môže byť `overene_primarne` iba s `audio_check='adam'`, inak `nerozhodnute`; `/t/vyroky/[id]` s odkazom `youtu.be?t=` |
| G15 Frontmatter stavu spisu | pokryté | prípady a research v gite | `research_pripady.stav` je DB ekvivalent |
| G16 Redakčný mix 50/30/20 | chýba | – | `desk.kategoria_mixu CHECK ('model','kritika','operator_proof')`, mesačný podiel na `/t` a `/o-hriechu/redakcia`; rozpor s kalendárom 8 tém (register §6.6) = Adam |
| G17 Archív minulých verzií | pokryté | I10 (Python do jadra) | Poradok `hriech/private/` mimo návrhu; zapísať ako samostatnú úlohu |

**Súčet funkcií:** pokryté 33 · čiastočne 51 · chýba 43 (A 0/3/4, B 7/12/4, C 0/6/20, D 8/9/2, E 1/9/3, F 6/8/8, G 11/4/2); po audite 27. 9. pribudli C25, C26, F22 (chýba) a C11 prešla z „chýba“ na „čiastočne“ (ručný protokol v archíve).

---

## 2. Princípy P1–P67: kde ich návrh vynucuje a kde nie

| Princípy | Stav | Kde v návrhu | Čo doplniť |
|---|---|---|---|
| P1, P2, P3, P25, P34, P35, P36, P55–P59, P62–P66 (jazyk, úmysel, hriech nie lož, hlas) | čiastočne | `docs/HLAS.md` existuje ako súbor, obsah nie je v návrhu | HLAS.md musí tieto princípy obsahovať doslovne; `validate.mjs` lint: zakázané verdiktové slová („klamú“, „lož“, „koordinovane“) bez claimu typu fakt → 422 |
| P4, P21 (percentá bez denominátora, zmrazené vzorky) | čiastočne | „x z N“, nikdy % (udalost_pokrytie) | `korpusy` + `kodovanie` (C18); pravidlo v `draft.ts`: číslo s „%“ iba s `korpus_id` v claime |
| P5 (nulový výsledok ≠ neexistencia) | chýba | – | `reserse` (D18); formulácia v HLAS |
| P6, P8, P13 (stručnosť ≠ chyba, karta sa nevymieňa, žiadne ostrovy) | chýba | – | METODIKA-MEDIA.md + `korpusy.zmrazene_at`; `kodovanie` nesmie meniť `korpus_polozky` po zmrazení (trigger) |
| P7, P51, G14 (citát iba po audiu) | čiastočne | overenie podreťazca | `audio_check` (G14) |
| P9, P10, P40 (žiadny auto-publish, žiadny zliaty score, oddelené prompty) | pokryté | `schvalene` iba Adam; agenti reportér/overovateľ/redaktor oddelení; tri krivky | `adam_relevancia` oddelene (B10) |
| P11, P12, P44, P45, P50, P53 | pokryté | lokálne, v0 sa nevracia, proveniencia, D15, research/ nepushovať, jadro oddelené | – |
| P14–P16, P26 | pokryté | koncepčne v celom návrhu | – |
| P17, P18, P19, P20 (obhajoba, portfólio, 6–8 mechanizmov, kontrolné prípady) | čiastočne | – | `mechanizmy` (E6), povinné polia (E7), `korpusy.kontrolny` |
| P22 (false merge drahší) | pokryté | `suggested` nikdy nezlučuje | ľudský merge/split do Z5 |
| P23 (výpadok ≠ ticho aktéra) | čiastočne | `failing_channels`, `zdroje.pozastaveny_at` | `aktor_kontroly` (C10), `prepisy.stav` (B13) |
| P24 (objav zanechá zdroj/pravidlo) | čiastočne | – | `nalezy.vysledok CHECK ('zdroj','pravidlo','vztah','nic')`; neratifikované Adamom → HLAS iba ako odporúčanie |
| P27–P32 (štyri vrstvy, päť dôkazových vrstiev, viditeľný dôvod) | čiastočne | claims fakt/interpretacia/medzera, „Výklad:“/„Nevieme:“, `dovod_triaze` | `claims.vrstva` (documented/coded/inference/hypothesis/unsupported) + `public_use` (C17); `unsupported` nikdy `vydane`; Adamov komentár ako `claims.autorstvo_materialu='adam_direct'` |
| P33 | pokryté | text renderovaný z claims | – |
| P37–P39, P41–P43 (AI autorstvo) | pokryté | `autorstvo.ts`, `Autorstvo.astro`, prechod iba Adam | – |
| P46, P47, P54 (súkromie osôb, juniori, kataster) | pokryté / čiastočne | `entity.verejne=0`, D14 | `autori.verejny`, `aktori.verejny`; test nevyhnutnosti pri parcele (P48) |
| P48, P49 (test nevyhnutnosti, oslovenie redakcií) | čiastočne | – | `podklad.test_nevyhnutnosti` pri údaji z registra o osobe; `oslovenia` (F16) |
| P52 (čo nejde von: Karol, Polymarket, Lodová, anotácie 23. 6.) | chýba | – | `data/zakazane-temy.json` + lint vo `validate.mjs` a v `draft.ts` (kľúčové slová → 422 s odkazom na pravidlo) |
| P60, P61 (mix 50/30/20, deriváty bez vaty) | chýba | – | G16, F4 |
| P67 (zdravotník, nie policajt) | čiastočne | metafora pulz/EKG | Register jazyka celého systému (obžaloba/spis/obvinenie vs nález/diagnóza/anamnéza) = rozhodnutie Adama; názvy enumov a plôch potom podľa toho (`reakcie`, `mechanizmy`, `/opravy`) |
| P68 (kritik podlieha tej istej schéme ako médium; nový) | chýba | – | C25 schema `kritik` (M09–M11) + brána v `draft.ts` pre články typu kritika; do HLAS doslovne: nepodložený výsmech kazí dobrú kritiku |

## 3. Tézy T1–T27 → funkcie → stav

| Téza | Funkcie z registra | Stav v návrhu |
|---|---|---|
| T1 fakty a nálada | E1, F15, C4, C23 | čiastočne (E1) / chýba (F15, C4, C23) |
| T2 pravdivé fragmenty, zlý destilát | C7, C17, E6 | chýba (C7) / čiastočne (C17, E6) |
| T3 titulok vs telo | C5, C17 | čiastočne |
| T4 ukradnutý priestor na interpretáciu | C6, C15, C8 | čiastočne (C6) / chýba (C15, C8) |
| T5 meranie ako rámcovanie | C14, C12 | chýba |
| T6 objem bez akumulácie, bez ledgeru | C12, E1, G7 | chýba (C12) / čiastočne |
| T7 štát číta médiá strojovo | D1–D9, B15 | pokryté (D1–D4, D7, D8) / čiastočne (D5, D9, B15) / chýba (D6) |
| T8 objav bez senzora | D3, D9, E8, P48 | pokryté / čiastočne |
| T9 podcastové domy | D5, F7, B13 | čiastočne / chýba (B13) |
| T10 Fico ako čitateľ | C6, D18 | čiastočne |
| T11 hodnotiteľ vs praktik | C20, C16, C21 | chýba |
| T12 slizký jazyk | C8 | chýba |
| T13 kolaps kategórií | C17, E9, F15 | čiastočne / chýba |
| T14 expert cirkuluje | D11, C6, C2 | pokryté (D11) / čiastočne (C6) / chýba (C2) |
| T15 trhová brzda | E12, F15 | chýba |
| T16 gramotnosť 2023 | C13, F15 | chýba |
| T17 stratený monopol, dezinfo | C9, C15, C1 | chýba (C9, C15) / čiastočne (C1) |
| T18 slovník koalícia/opozícia | C6, C7, C18 | čiastočne (C6) / chýba (C7, C18) |
| T19 pôvod nie je kvalita | E9, G3, E13 | chýba / pokryté / čiastočne |
| T20 vízia bez mechanizmu | F15, C22 | chýba / čiastočne |
| T21 čitateľ nie je analytické oddelenie | F2, E1, B16 | pokryté / čiastočne |
| T22 tri úrovne, poslucháč skladá | F2, C8, G5 | pokryté / chýba / pokryté |
| T23 DN zainteresovaná strana | C17, E13 | čiastočne |
| T24 Ficove ekonomické argumenty | F7, B13, C15 | čiastočne / chýba |
| T25 prázdne podcasty | C15, C20, C24 | chýba |
| T26 Klik lokálny prípad | C21, G14, E6 | chýba / čiastočne |
| T27 metóda proti autorovi | E13, C18, G14 | čiastočne / chýba |
| T28 preklad ako informačná amputácia (nová) | C7 variant `original_preklad` | chýba |

Záver z téz: návrh pokrýva vetvu „stroj, ktorý číta štát“ (T7, T8) a udalosť s pokrytím (T21, T22), ale takmer celá vetva **mediálnej kritiky ako meranie** (T1–T6, T11–T20, T23–T27) stojí na tabuľkách, ktoré v návrhu nie sú: `kodovanie`, `korpusy`, `prepisy`, `autori`, `predikcie`, `reakcie`.

---

## 4. Nové tabuľky, zdroje, agenti, plochy

### 4.1 Nové tabuľky (migrácie; rovnaké pre pracovnú SQLite aj D1, do D1 sa syncujú iba označené `→D1`)

**Do jadra pred Živé (0003b_aktori.sql, 0005b_minuta.sql):**
- `aktori` →D1 (verejní), `aktor_ucty`, `aktor_kontroly` (C10)
- `prepisy`, `prepis_segmenty` + `prepisy_fts`, `vyroky` →D1 (verejné, bez raw textu) (B13, B14, C7, C16)
- `kalendar` →D1 presunúť z 0006 do 0003 s novými stĺpcami (A1, A2)
- `temy`, `udalost_temy`, `sledovane` (z 0007) (A3, B9)
- `kauzy` →D1 (vydané), `kauza_polozky` (B11)
- `research_pripady`, `reserse` (B12, D18, F19)
- `nrsr_schodze`, `nrsr_hlasovania`, `nrsr_hlasy` →D1, `nrsr_tlace` (D6)
- `notifikacie`, `briefy` (B18, B23)
- `spatna_vazba`, `politika_verzie` (B17, E3)
- `sync_stav` (B21)
- nové stĺpce: `udalosti.stav_zivota + 'ohlasena'`, `reakcia_na_udalost_id`, `relevancia`, `dovod_vynorenia`, `verejny_nasledok`, `adam_relevancia`, `momentum`, `skore_vysvetlenie`; `minuta_posty.povod`, `vyrok_id`; `desk.dispozicia`, `kategoria_mixu`; `claims.vrstva`, `public_use`, `autorstvo_materialu`, `hovoriaci_aktor_id`, `rola_zdroja`, `corpus_prompt_id`; `zdroje.kategoria`, `pristup`, `stav_pristupu`, `licencia`; `nalezy.pravidlo_verzia`, `neistota_parovania`, `dispozicia`, `research_pripad_id`; `records.fulltext_archiv_id`; `schvalenia.kto='adam:local'`

**Živé (0005c_vystupy.sql):**
- `reakcie` s `vstup_typ` (A6, E9, F13), `opravy` →D1 (F18, E13, G7), `predikcie` →D1 (C12), `oslovenia` (F16, G6), `zasobnik` (A4), `derivaty` (F4), `vizualy` (F20), `mechanizmy` (E6), `datasety` (D15), `publikacie_externe` (F21), `mapa_kontroly` (D11)

**Vianoce (0006_moduly.sql rozšírené, 0007_ftm.sql, 0008_meranie.sql):**
- `statistika_rady` s `institucia`, `zdroj_url`, `verzia_vydania` (D10, F7); `prieskumy` (V6)
- `korpusy`, `korpus_polozky`, `kodovanie`, `zaznam_hodnotenie`, `prepis_metriky`, `porovnania`, `autori`, `record_autor`, `autor_profil_mesacne`, `zdroj_temy_denne`, `testy_expozicie`, `linie` (C1–C24, C19)
- `pravne_statusy` (D16), `reklamy` s EÚ poľami a `utm` (C11), `reklama_publikum` agregát (D13), `ucet_metriky_denne` (C9), `clustre` (C26)
- `ftm_entity`, `ftm_vztah` (D8, D12, D13, D17)

**Dáta v gite:** `data/znacka.json`, `data/relevancia.json`, `data/kodovnik.json`, `data/taxonomia-medii.json`, `data/zakazane-temy.json`, `data/aktori-seed.json` (150 poslancov, vláda, prezident, strany, sledovaní influenceri, kanály z v0), `data/kalendar-seed.json`, `data/temy-seed.json`, `data/kanaly-aktera.json` (YouTube channel_id), `data/dezinfo-seed.json` (konspiratori.sk, dátum), `data/registre-kandidati.json`, `data/podcasty-seed.json` (relácie SK redakcií z Apple Podcasts / Spotify, B14), `data/regionalne-seed.json` (CZ/PL/HU kanály, D19), `data/explainery-seed.json` (F15), `data/ucty-experimenty.json` (F22, lokálne); `data/znacka.json` dostane `logo_provenance` (wordmark a ikona odvodené zo slova „hriech“, originál od Adama 5. 9. 2026 podľa `ARCH-H/docs/brand-assets.json`) a `data/aktori-seed.json` odkaz na dataset SK Instagram Top 200 (D12). V projekte obsah: `experimenty` (F22).

### 4.2 Nové zdroje (každý dostane riadok v `zdroje` so `stav_pristupu`)

| Skupina | Zdroj | Prístup | Do |
|---|---|---|---|
| Prepisy tlačoviek a vystúpení | YouTube kanály: Úrad vlády SR, SMER-SD, Hlas-SD, PS, SaS, KDH, SNS, Republika, TA3, JOJ 24, STVR (Správy), TASR TV, Denník N, SME, Aktuality, NR SR (archív rokovaní) | RSS kanála zadarmo → `yt-dlp` titulky → `whisper.cpp` lokálne | jadro pred Živé (B13, B14) |
| Sociálne siete | YouTube (vyššie), Telegram verejné kanály politikov a dezinfo (t.me/s), Facebook/Instagram politikov (Meta Content Library žiadosť alebo ručné URL → archív; rozhodnutie Adama), X/TikTok mimo | RSS / HTML náhľad / rozhodnutie | Živé (YT, Telegram), Vianoce (FB/IG) |
| Dezinfo weby | 5 najväčších podľa konspiratori.sk (zoznam s dátumom v seede), Infovojna, Daniš (Telegram) | RSS / HTML | Živé (zber), Vianoce (kódovanie) |
| Kalendáre inštitúcií | NR SR program schôdzí, rokovania.gov.sk (program vlády), prezident.sk, ŠÚ SR kalendár zverejňovania, Rada EÚ / EP, OSN GA, ÚS SR, Súdna rada, MV SR volebný kalendár, NBS kalendár | HTML / RSS / iCal | jadro pred Živé (A1, A2) |
| Štát | NR SR (schôdze, hlasovania, tlače), ÚS SR tlačové správy, rokovania.gov.sk materiály, Slov-Lex (MPK, zbierka), ÚVO vestník, Obchodný vestník, justícia otvorené dáta, RPO/RÚZ/RPVS/ORSR, ITMS, data.gov.sk, NBS API, NCZI, MV SR, MF SR / ARDAL (dlh, rozpočet) | API / export / HTML | NR SR pred Živé; ostatné kandidáti → V9 |
| Medzinárodné | Eurostat, World Bank, OECD, IMF (JSON-stat/REST zadarmo), GDELT (signál) | API | Vianoce (D10, F7) |
| Reklama | Meta Ad Library API | token (rozhodnutie Adama) | Vianoce (C11) |
| Prieskumy | weby agentúr (NMS, Focus, AKO, Ipsos) + archív každého riadku | ručné / HTML | Vianoce (V6) |
| Vlastné | `corpus.sqlite` (adam.xvadur) pre E8; Fiki korpus lokálne; `R/corpus-register.csv` (11 korpusov) | lokálne, nikdy do D1 | Živé (E8), Vianoce (korpusy) |
| Full text | Denník N s predplatným (iba Mac, iba výrez verejne), newsletter DN (Gmail iba na pokyn) | cookie / mail | Živé (B3) |
| Podcasty (audio) | Relácie SK redakcií z aplikácie Podcasty: Index, Klik, Dobré ráno, Vizita, JOJ 24 podcast, Aréna s Dibákovou, 30tnik a ďalšie podľa `data/podcasty-seed.json` (Adam) | RSS relácie (Apple Podcasts / Spotify) → audio lokálne → `whisper.cpp` | jadro pred Živé (B14, L4) |
| Regionálne médiá | CZ, PL, HU: 2–3 kanály na krajinu (výber Adama), Ukrajina ako samostatná téma briefing roomu | RSS | Živé (zber), Vianoce (C13 komparatívny test) |
| Kontext a krížová kontrola | Wikipedia/Wikidata (entity, `documented_historical`), Eurobarometer (dôvera), TASR/SITA (predplatné, licencia), YouTube Data API (odberatelia, videnia) | API / predplatné | Živé (Wikidata, YouTube Data API), Vianoce (Eurobarometer, TASR/SITA) |
| Štát – doplnené | ITMS2014+/ITMS21+ (eurofondy), rozpocet.sk / Štátna pokladnica (výdavky), rozhodnutia ÚS SR | open data / export | Vianoce (V1), kandidáti v `zdroje` už teraz |
| Výstupný kanál (nie zdroj) | Telegram bot pre notifikácie (B18) | Bot API, token lokálne | Infra (L1) |

### 4.3 Noví agenti a deterministické kroky

| Názov | Typ | Robí | Kedy beží |
|---|---|---|---|
| `derive/relevancia.ts` | deterministický | pravidlá relevancie + `dovod_vynorenia` na každej udalosti | pri každej udalosti (lokálny plánovač) |
| `derive/ohlasenia.ts` | deterministický | ohlásená tlačovka → `kalendar` + udalosť `ohlasena` + `pripravka` | pri každom SK zázname |
| `derive/minuta-navrh.ts` | deterministický | návrh postu Minúty z claims bez LLM | pri každej udalosti nad prahom |
| konektor `podcast-rss` + `hriech-prepis` | deterministický + agent | feed relácie → audio → whisper.cpp → `prepisy` (`zdroj_prepisu='whisper'`) → výroky | pri novej epizóde (L4) |
| `notify/telegram.ts` | deterministický | správa do Telegram bota pri prahu `priorita`/`ohlasenie`, iba výstup | lokálny plánovač (L1) |
| `scripts/sync-d1.mjs` | deterministický | diff push verejných riadkov do D1 free + purge cache | po každom `vydane` (sekundy) a každých 5 min |
| `hriech-prepis` | agent | segmentácia prepisu, hovoriaci, extrakcia `vyroky` (každé tvrdenie ako claim pre overovateľa) | po každom novom prepise |
| `hriech-research` | agent | ohraničený research case (otázka, falzifikátory, plán zdrojov, rozpočet, evidence pack, `reserse`) | dispozícia `research`, A2 |
| `hriech-auditor` | agent | prechody citácie / kauzalita / kvantifikátory / najsilnejšia obhajoba nad draftom, REQUEST_CHANGES | medzi `napisane` a `schvalene` pri článku |
| `hriech-citatel` | agent | fresh-reader test (6 otázok iba z draftu, zhoda s claim mapou, „Adamova mama“) | pri článku a explaineri |
| `hriech-koder` | agent | kódovanie podľa `data/kodovnik.json` nad zmrazeným korpusom, druhý koder = druhý beh s iným kontextom | Vianoce |
| `hriech-derivaty` | krok redaktora | téza, 3 posty, 5 citátov, vizuál, otázka po `vydane` článku | Živé |
| `hriech-politika` | krok týždenného behu | diff HLAS/relevancia z `spatna_vazba` (≥ 5), Adam ratifikuje | týždenne |
| `/netopier` | skill hlavnej session | otázka nad pracovnou DB iba na čítanie, odpoveď s citáciou | na otázku |
| `/hriech` (existuje) | skill | zapisuje do `reakcie` cez lokálne API | na `hriech` |
| LaunchAgent `com.xvadur.netopier` | prevádzka | plánovač zberu, derive, sync; `claude -p /redakcia` ráno/večer/týždeň | rozhodnutie Adama |

Odpadá: cloud routine `hriech-redakcia-*`, Service Tokeny, `pristup.ts` (JWT) → nahradené `Aktor` z lokálneho procesu (`adam:local`, `agent:<meno>` z `X-Beh`), Access aplikácie.

### 4.4 Nové plochy

**Verejné (Worker free, iba D1):** `/aktori`, `/aktori/[slug]` (výroky, hlasovania, línia, články, účty), `/kauzy`, `/kauzy/[slug]` (dossier, časová os, graf), `/kalendar` + odpočet na titulke (Živé, nie Vianoce), `/opravy` (correction log + vlastné predikcie), `/svet` (briefing room), `/vysvetlenia/[slug]` (explainer), `/o-hriechu/metoda` (osi, kódy, hranice), `/volby/kalkulacka`, `/minuta?aktor=`; všetko cez `data/znacka.json`.

**Lokálny terminál (`127.0.0.1:7781`, nad pracovnou SQLite):** `/t/sync` (stav syncu, počty zapísaných riadkov D1/deň, latencia Minúty), `/t/prepisy`, `/t/vyroky`, `/t/aktori`, `/t/kauzy`, `/t/research`, `/t/reakcie`, `/t/temy`, `/t/zasobnik`, `/t/politika`, `/t/oslovenia`, `/t/derivaty`, `/t/korpusy`, `/t/kodovanie`, `/t/autori`, `/t/datasety`, `/t/notifikacie`; `/t/desk` s dispozíciami now/watch/research/low a klávesami; `/t/zaznamy/[id]` s diffom verzií; `/t/udalosti/[id]` merge/split (Živé).

---

## 5. Zmeny v poradí stavby

### Padá z návrhu
I1 (Workers Paid, fronty, R2), I6 (domény, Access, Service Tokeny), I8 (záloha do R2 → lokálna), I9 v cloudovej podobe (routine, environment), I11 (Fiki do R2), I12 (GitHub Actions); rozhodnutia D1, D3 (cloud), D4, D9 (tokeny), D12, D16 (R2), D18. Cache 60 s na Minúte (časť 9 „prijaté“) sa neprijíma.

### Míľnik Infra — 31. 10. (jadro)

| # | Krok | Hotové keď |
|---|---|---|
| I0 | ako v návrhu (workspace, `@netopier/redakcia`, `skore.ts` parita, 0002, normalize, entity, `overit-kanaly`) — nad `better-sqlite3`, nie miniflare | testy zelené, počty podľa časti B návrhu |
| L1 | Lokálny runtime: plánovač, pracovná SQLite, lokálne API `7780`, lokálny terminál `7781`, `zber-node.mjs` v slučke; intervaly 5 min SK / 2 min MpM / 2 h WM / denne štát; `notify/telegram.ts` | 48 h beh bez výpadku > 15 min; `pocty` rastú; `/t` odpovedá lokálne; akceptačný protokol podľa NIGHT_BUILD_REPORT (idempotentný replay, súbežná rekonciliácia, reštart bez straty, secret scan, zaznamenané zlyhanie) prešiel; testovacia notifikácia dorazila do Telegramu |
| L2 | D1 free `netopier-web` (`wrangler d1 create`, zadarmo) iba s verejnými tabuľkami; `sync-d1.mjs` + `sync_stav` + purge cache; `hriech-web` na Workers free číta iba D1 | riadok vydaný lokálne je v D1 do 3 s; `wrangler d1 execute --remote` počty = lokálne verejné; písanie < 20 tis. riadkov/deň |
| I2 | migrácie 0003–0005 + 0003b (aktori, prepisy, kalendar, temy, kauzy, research, nrsr, sync) lokálne; seedy vrátane `aktori-seed`, `kalendar-seed`, `temy-seed`, `kanaly-aktera`, `znacka.json` | `zdroje` ≥ 120, `aktori` ≥ 170, `kalendar` ≥ 20 termínov so zdrojom |
| I3 | udalosti (port `events.py`) + `relevancia.ts` + `ohlasenia.ts` | ako v návrhu + každá udalosť má `dovod_vynorenia`; ohlásená tlačovka z testovacieho záznamu vytvorí `kalendar` riadok |
| L3 | Konektor `nrsr` (schôdze, hlasovania, hlasy, tlače) + `ustavny-sud` | posledná schôdza celá v DB v deň zverejnenia; každý poslanec z `aktori` má hlasy |
| L4 | Konektor `youtube` + `yt-dlp` titulky + `whisper.cpp` fallback; konektor `podcast-rss` (audio podcasty z Apple/Spotify feedov); `prepisy`, `prepis_segmenty`, `vyroky`; agent `hriech-prepis`; Ficova víkendová tlačovka a jedna epizóda Indexu z aplikácie Podcasty ako test | prepis do 2 h od vydania videa aj epizódy; ≥ 20 výrokov s časom; udalosť vznikla z prepisu pred článkom |
| I4 | registre, pravidlá, rollup, nálezy, pokrytie, entity-media; `nalezy.dispozicia` | ako v návrhu |
| I5 | lokálne API `/api/*` (bez JWT; aktér z procesu), kontrakty, validátor viet, `zakazane-temy` lint | ako v návrhu; `agent` dostane 403 na `prechod` |
| I7 | `hriech-web` Astro SSR na Workers free (adaptér 14, D1 binding, žiadny Access, žiadny terminál v cloude), `verify-public-build`, `smoke-live` | `pnpm qa`; druhý GET `/udalosti` HIT, `/minuta` BYPASS; CPU < 10 ms v `wrangler tail` |
| L5 | Lokálne zálohy (`zalohy/` na externý disk + Time Machine), export mesiacov na disk; skúška obnovy | obnova do test DB prešla |
| I9 | Agenti + `/redakcia --dry-run` z hlavnej session; LaunchAgent `claude -p` iba ak Adam povie | dry-run ≤ 10 kandidátov, podklad s claims pre 1 udalosť a 1 prepis |
| I10 | archív Python vrstvy, ADR-009 (dva procesy: lokálny runtime, cloud iba zobrazuje), ADR-010, ADR-011, ADR-012 (lokálny beh nahrádza ADR-008), prepísané docs | ako v návrhu |

### Míľnik Živé — 30. 11. (čo ide do jadra pred Živé)

| # | Krok | Termín | Hotové keď |
|---|---|---|---|
| Z1 | Desk, claims, archiv (lokálny disk), schvalenia (`adam:local`), revizie, `/t/desk` s dispozíciami, `spatna_vazba` | 5. 11. | ako v návrhu bez CLI tokenu |
| Z2 | Minúta live bez meškania: `minuta-navrh.ts`, schválenie → sync → purge; `/minuta`, `/api/minuta.json` bez cache; `/hladaj`; sitemapa | 8. 11. | schválený post na hriech.xvadur.com do **10 s**; medián zber→post < 15 min na `/t/sync` |
| Z-A | Aktéri a výroky verejne: `/aktori`, `/aktori/[slug]` s výrokmi z prepisov, hlasovaniami NR SR, účtami; `aktor_kontroly` 2× denne (YouTube, Telegram) | 12. 11. | ≥ 20 aktérov s výrokmi a hlasmi; každý sledovaný aktér má 2 kontrolné body denne |
| Z-K | Kalendár a odpočet na titulke z `kalendar` (NR SR, vláda, prezident, ŠÚ SR, EÚ) + ohlásené tlačovky (A2) | 12. 11. | ≥ 30 budúcich termínov so zdrojom; 1 tlačovka zaevidovaná pred začiatkom s pripravkou |
| Z3 | Zvody v1 (D6) ako v návrhu | 12. 11. | ako v návrhu |
| Z4 | Redakčná linka: triáž, reportér, overovateľ, redaktor, archivár + `hriech-prepis`, `hriech-research`; `hriech-auditor`/`hriech-citatel` pri článkoch; behy z hlavnej session (LaunchAgent iba na pokyn) | 18. 11. | 5 dní behov ok; každý vydaný text 0 viet bez claimu; 1 research case uzavretý s `bezpecny_claim` |
| Z5 | Udalosť ako Ground News + ľudský merge/split (z V10) + `/kauzy/[slug]` prvý dossier | 18. 11. | ako v návrhu + 1 merge, 1 split, 1 kauza vydaná |
| Z6 | Prvé články cez linku s kontraktom, auditorom, čitateľom, `oslovenia` pred investigatívou (CRZ článok) | 20. 11. | 2 články; CRZ článok má riadok `oslovenia` |
| Z-O | `/opravy` (correction log, vlastné predikcie), `reakcie` + `/hriech` zápis, `derivaty` po prvom článku, `zasobnik` s otázkou týždňa | 22. 11. | `/opravy` live s ≥ 1 riadkom typu `autor`; 1 reakcia `verified`; 1 sada derivátov schválená |
| Z7 | Print redizajn + kartičky zdrojov (D5, D8) s `kategoria` a `stav_pristupu`; meno cez `znacka.json` | 25. 11. | ako v návrhu |
| Z8 | Seizmograf/EKG + `/svet` (briefing room) | 27. 11. | modul živý 7 dní; `/svet` ≥ 3 témy |
| Z9 | Denná titulka ako vydanie; CRZ sémantika overená na 20 zmluvách (z V1) → sumy na titulke | 30. 11. | 7 vydaní; `register-druhy.json` `overene_at` |
| Z-D | Dezinfo weby + Telegram v zbere (bez kódovania), `zdroje.kategoria` | 30. 11. | 5 dezinfo webov a 5 Telegram kanálov v `records`; verejne iba počty |

### Míľnik Vianoce — 31. 12.

V1 (štátny dashboard bez CRZ sémantiky, tá je v Z9) + MF SR/NBS/Eurostat rady, V2 rebríček, V4–V8 ako v návrhu, V7 mapa (bez limitu izolátu), V9 OSINT (ftm, RPO/RÚZ/RPVS, `pravne_statusy`), V10 retencia (lokálne) a blindspot verejne; **nové:** V-M meranie médií (`korpusy`, `kodovanie`, `hriech-koder`, `autori`, `zaznam_hodnotenie`, `prepis_metriky`, `porovnania`, import 11 korpusov, prvá METODIKA-MEDIA so zhodou), V-P `predikcie` médií + test C0 (50 Trump URL), V-E `/vysvetlenia` (explainer, `testy_expozicie`), V-R `reklamy` (Meta Ad Library, ak Adam dá token), V-F FB/IG podľa rozhodnutia Adama, V-N `linie` politikov, V-X `/mapy/stat`, `/mapy/influenceri`.

### Rozhodnutia pre Adama, ktoré pribudli alebo sa zmenili
1. LaunchAgent `com.xvadur.netopier` (plánovač + `claude -p /redakcia`) — externá zmena systému, iba na pokyn.
2. D2 ostáva: smie Claude (cloudový model) čítať verejné texty médií a registrov; Fiki raw, jadro, realitný trh, rant nikdy.
3. Facebook/Instagram politikov: Meta Content Library žiadosť / ručné URL / bez FB; Meta Ad Library token.
4. Register jazyka a meno: obžaloba–spis–obvinenie vs zdravotnícky register; nové meno do `znacka.json`.
5. Ktorý scoring platí (E4): tri skóre s `adam_relevancia` oddelene.
6. Kanál textov (web vs Substack) a vlastník reakčných klipov (obsah vs redakcia).
7. Web Analytics na Cloudflare (zadarmo, ale mimo „iba DB a web“).
8. Zálohy: iba lokálne (Time Machine + externý disk) alebo aj druhé miesto.
9. Telegram bot pre notifikácie (B18): založiť vlastného bota bez OpenClaw; token lokálne; ktoré prahy posielať.
10. Zoznam relácií pre `podcast-rss` (B14) a regionálnych kanálov CZ/PL/HU (D19); poradie voči míľniku Živé.
11. Dvojstrojová topológia (B21): Mac mini vs MacBook worker cez SSH, NET-001 zahodené alebo otvorené.
12. Logo (§6.2): nový wordmark pri zmene mena alebo potvrdiť Hriech; ikona ostáva.
13. Zeitgeist / Moore / Predictive History / Harris: iba `hypothesis` v E1, alebo redakčná línia (§6.25); klipovanie cudzích filmov v rozsahu citácie.
14. SK Instagram Top 200: obnoviť CSV z Time Machine / rollout summary (§6.23) a určiť „index copy.md“ za kanonický index mediálnej kritiky.
15. Meta Ad Library: token pre `meta-ads`, alebo ostať pri ručnom protokole z 11. 9. (C11).
