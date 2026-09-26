# Fiki — korpus titulkov

Prehľadávateľný korpus Fikiho (Filip Sulík) s časovými značkami: videá YouTube kanála
[Fiki Unchained](https://www.youtube.com/@fikiunchained) (channel `UC8SC3sB2-FNRc3awzVJu_jA`)
a jeho vystúpenia na iných kanáloch (rozhovory, podcasty, duely, Pofel). Slúži na klipovanie:
pasáž sa nájde fulltextom a odkaz `https://youtu.be/<id>?t=<s>` otvorí video na danom mieste.

Kód: `netopier/fiki/fiki.py` (iba Python stdlib + `yt-dlp` v PATH). Videá sa nesťahujú, iba titulky.

## Príkazy (z `netopier/`)

```sh
python3 fiki/fiki.py sync              # nové videá z kanála → titulky → DB (opakovateľné)
python3 fiki/fiki.py vystupenia        # vystúpenia zo zoznamu vystupenia.txt → titulky → DB
python3 fiki/fiki.py vystupenia <id|url> ...   # pridá vystúpenie do zoznamu a načíta ho
python3 fiki/fiki.py search liberáli   # výsledky s kanálom, časom od–do, odkazom a textom odseku
python3 fiki/fiki.py search -s -n 20 '"sexuálne obťažovanie"'   # -s iba výrez, fráza v úvodzovkách
python3 fiki/fiki.py search -v feminizmus   # -v iba vystúpenia, -k iba kanál Fiki Unchained
python3 fiki/fiki.py stats             # pokrytie, aj podľa kanála
python3 fiki/fiki.py reparse           # znovu rozparsuje raw/ bez siete (po zmene parsera)
```

Hľadanie ignoruje diakritiku. Obyčajné slová sa hľadajú ako predpona (`liberál` nájde aj
`liberálov`, `liberálne`). Syntax FTS5 (`"fráza"`, `AND`, `OR`, `NOT`, `NEAR`, `*`) sa odovzdá bez zmeny.
Pri každom výsledku je „zásah“ — čas prvého riadku titulkov v odseku, ktorý obsahuje hľadané slovo;
odkaz ukazuje 2 s pred ním.

## Vystúpenia mimo kanála

`vystupenia.txt` je ručne vedený zoznam: jeden riadok = `<id alebo URL>  <kanál> | <názov>`,
`#` je komentár. Príkaz `vystupenia` načíta videá, ktoré ešte nie sú v DB, rovnakou cestou ako `sync`
(titulky → riadky → odseky → FTS) a uloží ich so `source='vystupenie'` a kanálom zdroja.

Pravidlá výberu:
- iba originálny zdroj, kde je Fiki na obraze ako hosť alebo moderátor (vrátane výrezov, ktoré
  zverejnil sám vydavateľ, keď celý diel na YouTube nie je);
- nie reuploady a kompilácie (napr. „Fiki Klipy“), reakcie, reportáže a videá, kde o ňom iba niekto hovorí;
- nie zámena s Richardom Sulíkom (SaS);
- nie zdroje zakázané pravidlami Fikiho programu pre kliperov: BarZaBar, Samuel Galovič / Fiki a Galovič,
  Menučko, Speed, OSKISHOW a čokoľvek o Oskarovi (Oski, Barami) a Kiare Fujakovej. Príkaz tieto
  odmietne aj sám podľa názvu videa a kanála.

Vylúčené kandidáty sú zapísané v spodnej časti zoznamu aj s dôvodom, aby sa pri ďalšom hľadaní
neposudzovali znova.

## Dáta

| Súbor | V gite | Obsah |
|---|---|---|
| `videos.json` | áno | id, názov, kanál, zdroj (`kanal`/`vystupenie`), dátum, reálna dĺžka YouTube verzie, stav a jazyk titulkov, pokrytie |
| `vystupenia.txt` | áno | zoznam vystúpení mimo kanála a zdokumentované vylúčenia |
| `raw/<id>.<lang>.vtt` | nie | surové titulky z YouTube |
| `raw/<id>.meta.json` | nie | jazyk, druh (auto/manual), dátum z yt-dlp |
| `fiki.sqlite` | nie | tabuľky `videos`, `lines`, `segments`, FTS5 `segments_fts` |

- `lines` — jemné riadky titulkov (start, end, text) bez opakovaní, ktoré auto-titulky YouTube
  zdvojujú pri rolovaní.
- `segments` — čitateľné odseky 20–40 s (uzavreté na konci vety alebo pri pauze > 1,5 s, najneskôr po 40 s).
- `videos.channel`, `videos.channel_id`, `videos.source` — kanál zdroja; `source` je `kanal`
  (Fiki Unchained, plní `sync`) alebo `vystupenie` (plní `vystupenia`).
- Jazyk: `sk-orig` (automatický slovenský prepis YouTube), potom `cs-orig`, `sk`, `cs`, `en`.
  Pôvodný prepis má prednosť, aby české video nedostalo strojový preklad do slovenčiny.

## Obmedzenia

- Titulky sú automatický prepis (ASR): mená a slang môžu byť skomolené, hľadaj aj varianty.
- Vo vystúpeniach hovoria aj iní (moderátor, hostia); prepis nerozlišuje, kto hovorí.
- Niektoré vystúpenia sú na YouTube iba ako zostrih alebo výrez (Pohofka #47, OFAck, Startitup,
  Temná pravda, Premlčané); celý diel je za platenou stenou vydavateľa.
- Popisy videí uvádzajú „Zvyšok videa na fiki.sk“ — YouTube verzie môžu byť skrátené oproti plnej
  verzii na fiki.sk. Korpus pokrýva iba to, čo je na YouTube; `duration` je dĺžka YouTube verzie.
- Surové prepisy sú celé transkripty cudzieho obsahu — ostávajú lokálne, do gitu ani na web nejdú.
