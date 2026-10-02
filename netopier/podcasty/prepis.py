#!/usr/bin/env python3
"""Prepisy podcastov z verejného RSS lokálne cez Whisper (mlx-whisper na čipe Apple), bez siete okrem stiahnutia audia.

Diel sa stiahne, prepíše po slovensky s časmi a audio sa zmaže; ostane JSON a TXT v
netopier/data/podcasty/<relacia>/ (mimo gitu). Idempotentné: hotové diely sa preskočia.

Použitie (z priečinka netopier/):
  .venv/bin/python podcasty/prepis.py zoznam klik
  .venv/bin/python podcasty/prepis.py prepis klik --pocet 100
  .venv/bin/python podcasty/prepis.py prepis tridsiatnik --pocet 100 --od-najstarsieho
"""
import argparse
import html
import json
import re
import sys
import time
import urllib.request
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

KOREN = Path(__file__).resolve().parent.parent
DATA = KOREN / "data" / "podcasty"
MODEL = "mlx-community/whisper-large-v3-turbo"

RELACIE = {
    "klik": {"nazov": "Klik (SME)", "rss": "https://www.omnycontent.com/d/playlist/67682ce6-d1e9-437d-bd7e-b12201270fe1/2fc0ef37-0584-4b64-8595-b12300acd689/bb99976e-46e9-45eb-9734-b12300acd6bd/podcast.rss"},
    "tridsiatnik": {"nazov": "Tridsiatnik (Denník N)", "rss": "https://feed.podbean.com/tridsiatnik/feed.xml"},
    "index": {"nazov": "Index (SME)", "rss": None},
}
ITUNES = {"klik": 1348382304, "tridsiatnik": 1805770548, "index": 1435732327}


def stiahni(url: str, ciel: Path | None = None) -> bytes | None:
    req = urllib.request.Request(url, headers={"User-Agent": "curl/8.7.1"})
    with urllib.request.urlopen(req, timeout=120) as r:
        if ciel is None:
            return r.read()
        with open(ciel, "wb") as f:
            while chunk := r.read(1 << 20):
                f.write(chunk)
    return None


def rss_url(relacia: str) -> str:
    url = RELACIE[relacia]["rss"]
    if url:
        return url
    data = json.loads(stiahni(f"https://itunes.apple.com/lookup?id={ITUNES[relacia]}"))
    return data["results"][0]["feedUrl"]


def text(x: str | None) -> str:
    return html.unescape(re.sub(r"<!\[CDATA\[|\]\]>", "", x or "")).strip()


def diely(relacia: str) -> list[dict]:
    try:
        x = stiahni(rss_url(relacia)).decode("utf-8")
    except Exception as e:  # zlá adresa v tabuľke: skús iTunes
        print(f"RSS {relacia}: {e}; skúšam iTunes", file=sys.stderr)
        RELACIE[relacia]["rss"] = None
        x = stiahni(rss_url(relacia)).decode("utf-8")
    out = []
    for it in re.findall(r"<item>(.*?)</item>", x, re.S):
        enc = re.search(r'<enclosure[^>]*url="([^"]+)"', it)
        if not enc:
            continue
        pub = re.search(r"<pubDate>(.*?)</pubDate>", it)
        dt = parsedate_to_datetime(pub.group(1)).astimezone(timezone.utc) if pub else None
        dur = re.search(r"<itunes:duration>([^<]+)<", it)
        guid = re.search(r"<guid[^>]*>(.*?)</guid>", it, re.S)
        popis = re.search(r"<description>(.*?)</description>", it, re.S)
        out.append({
            "relacia": relacia,
            "titulok": text(re.search(r"<title>(.*?)</title>", it, re.S).group(1)),
            "zverejnene": dt.isoformat() if dt else None,
            "trvanie_s": trvanie(dur.group(1)) if dur else None,
            "audio": html.unescape(enc.group(1)),
            "guid": text(guid.group(1)) if guid else enc.group(1),
            "popis": re.sub(r"<[^>]+>", " ", text(popis.group(1)))[:2000] if popis else "",
        })
    return sorted(out, key=lambda d: d["zverejnene"] or "", reverse=True)


def trvanie(s: str) -> int | None:
    s = s.strip()
    if s.isdigit():
        return int(s)
    casti = [int(p) for p in s.split(":") if p.isdigit()]
    t = 0
    for p in casti:
        t = t * 60 + p
    return t or None


def slug(d: dict) -> str:
    den = (d["zverejnene"] or "0000-00-00")[:10]
    s = re.sub(r"[^a-z0-9]+", "-", text(d["titulok"]).lower().encode("ascii", "ignore").decode())[:60].strip("-")
    return f"{den}_{s}"


def mmss(t: float) -> str:
    t = int(t)
    return f"{t // 3600}:{t % 3600 // 60:02d}:{t % 60:02d}" if t >= 3600 else f"{t // 60}:{t % 60:02d}"


def prepis_dielu(d: dict, priecinok: Path) -> dict:
    import mlx_whisper

    audio = priecinok / "audio" / (slug(d) + ".mp3")
    audio.parent.mkdir(parents=True, exist_ok=True)
    t0 = time.time()
    stiahni(d["audio"], audio)
    t1 = time.time()
    r = mlx_whisper.transcribe(
        str(audio),
        path_or_hf_repo=MODEL,
        language="sk",
        condition_on_previous_text=False,  # menej zacyklenia pri dlhom audiu
        verbose=None,
    )
    t2 = time.time()
    segmenty = [{"od": round(s["start"], 2), "do": round(s["end"], 2), "text": s["text"].strip()} for s in r["segments"]]
    vystup = {
        **d,
        "model": MODEL,
        "prepisane_at": datetime.now(timezone.utc).isoformat(),
        "stiahnutie_s": round(t1 - t0, 1),
        "prepis_s": round(t2 - t1, 1),
        "slov": sum(len(s["text"].split()) for s in segmenty),
        "segmenty": segmenty,
    }
    (priecinok / (slug(d) + ".json")).write_text(json.dumps(vystup, ensure_ascii=False, indent=1))
    (priecinok / (slug(d) + ".txt")).write_text(
        f"{d['titulok']}\n{d['zverejnene']}\n\n" + "\n".join(f"[{mmss(s['od'])}] {s['text']}" for s in segmenty) + "\n"
    )
    audio.unlink(missing_ok=True)
    return vystup


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("prikaz", choices=["zoznam", "prepis"])
    ap.add_argument("relacia", choices=list(RELACIE))
    ap.add_argument("--pocet", type=int, default=10)
    ap.add_argument("--od-najstarsieho", action="store_true")
    a = ap.parse_args()

    zoznam = diely(a.relacia)
    priecinok = DATA / a.relacia
    priecinok.mkdir(parents=True, exist_ok=True)
    (priecinok / "diely.json").write_text(json.dumps(zoznam, ensure_ascii=False, indent=1))
    if a.prikaz == "zoznam":
        for d in zoznam:
            print(d["zverejnene"][:10] if d["zverejnene"] else "?", mmss(d["trvanie_s"] or 0), d["titulok"])
        print(f"{len(zoznam)} dielov", file=sys.stderr)
        return

    vyber = zoznam[::-1] if a.od_najstarsieho else zoznam
    vyber = vyber[: a.pocet]
    log = DATA / "log.jsonl"
    for i, d in enumerate(vyber, 1):
        if (priecinok / (slug(d) + ".json")).exists():
            continue
        try:
            v = prepis_dielu(d, priecinok)
            riadok = {"relacia": a.relacia, "diel": slug(d), "slov": v["slov"], "trvanie_s": d["trvanie_s"], "prepis_s": v["prepis_s"], "ok": True}
        except Exception as e:
            riadok = {"relacia": a.relacia, "diel": slug(d), "ok": False, "chyba": str(e)[:300]}
        riadok["cas"] = datetime.now(timezone.utc).isoformat()
        with open(log, "a") as f:
            f.write(json.dumps(riadok, ensure_ascii=False) + "\n")
        print(f"{i}/{len(vyber)} {json.dumps(riadok, ensure_ascii=False)}", flush=True)


if __name__ == "__main__":
    main()
