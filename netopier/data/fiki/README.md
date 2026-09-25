# Fiki Unchained — korpus titulkov

Prehľadávateľný korpus videí YouTube kanála [Fiki Unchained](https://www.youtube.com/@fikiunchained)
(channel `UC8SC3sB2-FNRc3awzVJu_jA`) s časovými značkami. Slúži na klipovanie: pasáž
sa nájde fulltextom a odkaz `https://youtu.be/<id>?t=<s>` otvorí video na danom mieste.

Kód: `netopier/fiki/fiki.py` (iba Python stdlib + `yt-dlp` v PATH). Videá sa nesťahujú, iba titulky.

## Príkazy (z `netopier/`)

```sh
python3 fiki/fiki.py sync              # nové videá z kanála → titulky → DB (opakovateľné)
python3 fiki/fiki.py search liberáli   # výsledky s časom od–do, odkazom a textom odseku
python3 fiki/fiki.py search -s -n 20 '"sexuálne obťažovanie"'   # -s iba výrez, fráza v úvodzovkách
python3 fiki/fiki.py stats             # pokrytie
python3 fiki/fiki.py reparse           # znovu rozparsuje raw/ bez siete (po zmene parsera)
```

Hľadanie ignoruje diakritiku. Obyčajné slová sa hľadajú ako predpona (`liberál` nájde aj
`liberálov`, `liberálne`). Syntax FTS5 (`"fráza"`, `AND`, `OR`, `NOT`, `NEAR`, `*`) sa odovzdá bez zmeny.
Pri každom výsledku je „zásah“ — čas prvého riadku titulkov v odseku, ktorý obsahuje hľadané slovo;
odkaz ukazuje 2 s pred ním.

## Dáta

| Súbor | V gite | Obsah |
|---|---|---|
| `videos.json` | áno | id, názov, dátum, reálna dĺžka YouTube verzie, stav a jazyk titulkov, pokrytie |
| `raw/<id>.<lang>.vtt` | nie | surové titulky z YouTube |
| `raw/<id>.meta.json` | nie | jazyk, druh (auto/manual), dátum z yt-dlp |
| `fiki.sqlite` | nie | tabuľky `videos`, `lines`, `segments`, FTS5 `segments_fts` |

- `lines` — jemné riadky titulkov (start, end, text) bez opakovaní, ktoré auto-titulky YouTube
  zdvojujú pri rolovaní.
- `segments` — čitateľné odseky 20–40 s (uzavreté na konci vety alebo pri pauze > 1,5 s, najneskôr po 40 s).
- Jazyk: `sk-orig` (automatický slovenský prepis YouTube), fallback `sk`, `cs`, `en`.

## Obmedzenia

- Titulky sú automatický prepis (ASR): mená a slang môžu byť skomolené, hľadaj aj varianty.
- Popisy videí uvádzajú „Zvyšok videa na fiki.sk“ — YouTube verzie môžu byť skrátené oproti plnej
  verzii na fiki.sk. Korpus pokrýva iba to, čo je na YouTube; `duration` je dĺžka YouTube verzie.
- Surové prepisy sú celé transkripty cudzieho obsahu — ostávajú lokálne, do gitu ani na web nejdú.
