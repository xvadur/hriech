#!/usr/bin/env python3
"""Korpus videí YouTube kanála Fiki Unchained s časovými značkami.

Použitie:
  python3 netopier/fiki/fiki.py sync            # zoznam videí, nové titulky, načítanie do DB
  python3 netopier/fiki/fiki.py search liberáli # fulltext s časmi a odkazmi
  python3 netopier/fiki/fiki.py stats           # pokrytie

Iba stdlib + yt-dlp v PATH. Videá sa nesťahujú, iba titulky (VTT).
Opakované spustenie `sync` stiahne a načíta iba videá, ktoré ešte nemá.
"""
from __future__ import annotations

import argparse
import html
import json
import re
import sqlite3
import subprocess
import sys
import time
from pathlib import Path

CHANNEL_ID = "UC8SC3sB2-FNRc3awzVJu_jA"
CHANNEL_URL = f"https://www.youtube.com/channel/{CHANNEL_ID}/videos"

ROOT = Path(__file__).resolve().parents[1]  # netopier/
DATA = ROOT / "data" / "fiki"
RAW = DATA / "raw"
DB_PATH = DATA / "fiki.sqlite"
VIDEOS_JSON = DATA / "videos.json"

# poradie pokusov o jazyk titulkov; prvý úspešný vyhráva
LANG_ATTEMPTS = ["sk-orig", "sk", "cs-orig,cs", "en-orig,en"]

PARA_MIN = 20.0  # s
PARA_MAX = 40.0  # s

SCHEMA = """
CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  upload_date TEXT,            -- YYYY-MM-DD
  duration INTEGER,            -- s, reálna dĺžka YouTube verzie
  view_count INTEGER,
  subs_status TEXT NOT NULL DEFAULT 'pending',  -- pending | ok | none | age_restricted | error
  subs_lang TEXT,
  subs_kind TEXT,              -- auto | manual
  subs_file TEXT,
  covered_seconds REAL,        -- súčet dĺžok odsekov
  first_seen TEXT NOT NULL DEFAULT (datetime('now')),
  loaded_at TEXT
);
CREATE TABLE IF NOT EXISTS lines (      -- jemné riadky titulkov bez duplicít
  id INTEGER PRIMARY KEY,
  video_id TEXT NOT NULL REFERENCES videos(id),
  start REAL NOT NULL,
  end REAL NOT NULL,
  text TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS lines_video ON lines(video_id, start);
CREATE TABLE IF NOT EXISTS segments (   -- čitateľné odseky ~20–40 s
  id INTEGER PRIMARY KEY,
  video_id TEXT NOT NULL REFERENCES videos(id),
  idx INTEGER NOT NULL,
  start REAL NOT NULL,
  end REAL NOT NULL,
  text TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS segments_video ON segments(video_id, idx);
CREATE VIRTUAL TABLE IF NOT EXISTS segments_fts USING fts5(
  text, content='segments', content_rowid='id',
  tokenize='unicode61 remove_diacritics 2'
);
CREATE TRIGGER IF NOT EXISTS segments_ai AFTER INSERT ON segments BEGIN
  INSERT INTO segments_fts(rowid, text) VALUES (new.id, new.text);
END;
CREATE TRIGGER IF NOT EXISTS segments_ad AFTER DELETE ON segments BEGIN
  INSERT INTO segments_fts(segments_fts, rowid, text) VALUES ('delete', old.id, old.text);
END;
"""


def db() -> sqlite3.Connection:
    DATA.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    con.executescript(SCHEMA)
    return con


# ---------- zoznam videí ----------

def list_channel() -> list[dict]:
    out = subprocess.run(
        ["yt-dlp", "--flat-playlist", "-J", CHANNEL_URL],
        capture_output=True, text=True, check=True,
    ).stdout
    return [e for e in json.loads(out).get("entries", []) if e.get("id")]


def upsert_videos(con: sqlite3.Connection, entries: list[dict]) -> int:
    new = 0
    for e in entries:
        cur = con.execute("SELECT 1 FROM videos WHERE id=?", (e["id"],))
        if cur.fetchone():
            con.execute(
                "UPDATE videos SET title=?, duration=COALESCE(?, duration), view_count=? WHERE id=?",
                (e.get("title"), e.get("duration"), e.get("view_count"), e["id"]),
            )
        else:
            con.execute(
                "INSERT INTO videos(id, title, duration, view_count) VALUES (?,?,?,?)",
                (e["id"], e.get("title") or "", e.get("duration"), e.get("view_count")),
            )
            new += 1
    con.commit()
    return new


# ---------- titulky ----------

def fetch_subs(video_id: str) -> dict | None:
    """Stiahne VTT do raw/. Vráti {file, lang, kind, upload_date, duration} alebo None."""
    RAW.mkdir(parents=True, exist_ok=True)
    meta: dict = {}
    for langs in LANG_ATTEMPTS:
        proc = subprocess.run(
            [
                "yt-dlp", "--no-simulate", "--skip-download",
                "--write-subs", "--write-auto-subs",
                "--sub-langs", langs, "--sub-format", "vtt",
                "--sleep-subtitles", "1",
                "-o", str(RAW / "%(id)s.%(ext)s"),
                "--print", "%(.{upload_date,duration})j",
                "--print", "%(requested_subtitles)j",
                f"https://www.youtube.com/watch?v={video_id}",
            ],
            capture_output=True, text=True,
        )
        printed = [l for l in proc.stdout.splitlines() if l.strip()]
        if printed:
            try:
                meta = json.loads(printed[0])
            except json.JSONDecodeError:
                pass
        req = {}
        if len(printed) > 1:
            try:
                req = json.loads(printed[1]) or {}
            except json.JSONDecodeError:
                req = {}
        for lang in langs.split(","):
            f = RAW / f"{video_id}.{lang}.vtt"
            if f.exists() and f.stat().st_size > 0:
                url = (req.get(lang) or {}).get("url", "")
                kind = "auto" if ("kind=asr" in url or lang.endswith("-orig")) else "manual"
                info = {"file": f.name, "lang": lang, "kind": kind, **meta}
                (RAW / f"{video_id}.meta.json").write_text(json.dumps(info), encoding="utf-8")
                return info
        if "confirm your age" in proc.stderr:
            return {"file": None, "blocked": "age_restricted", **meta}
        if proc.returncode != 0 and "429" in proc.stderr:
            raise RuntimeError(f"YouTube 429 pri {video_id}: {proc.stderr.strip()[-300:]}")
    return {"file": None, **meta}


# ---------- parsovanie VTT ----------

TS = re.compile(r"(\d+):(\d\d):(\d\d)\.(\d{3})")
CUE = re.compile(r"^(\S+)\s+-->\s+(\S+)")
TAG = re.compile(r"<[^>]+>")


def ts(s: str) -> float:
    m = TS.match(s)
    if not m:
        raise ValueError(s)
    h, mi, se, ms = map(int, m.groups())
    return h * 3600 + mi * 60 + se + ms / 1000


def clean(line: str) -> str:
    line = html.unescape(TAG.sub("", line))
    line = line.replace(">>", "").replace("[Hudba]", "").replace("[hudba]", "")
    return re.sub(r"\s+", " ", line).strip()


def parse_vtt(path: Path) -> list[tuple[float, float, str]]:
    """Riadky bez opakovaní, ktoré auto-titulky YouTube zdvojujú (rolovanie)."""
    cues: list[tuple[float, float, list[str]]] = []
    block: list[str] = []
    for raw in path.read_text(encoding="utf-8").splitlines() + [""]:
        if raw.rstrip("\r") == "":  # riadok s medzerou je súčasť cue, nie oddeľovač
            if block:
                for i, b in enumerate(block):
                    m = CUE.match(b)
                    if m:
                        cues.append((ts(m.group(1)), ts(m.group(2)), block[i + 1:]))
                        break
            block = []
        else:
            block.append(raw)

    out: list[list] = []
    recent: list[str] = []  # posledné vydané riadky (ochrana proti opakovaniu)
    for start, end, lines in cues:
        for ln in lines:
            t = clean(ln)
            if not t or t in recent:
                continue
            out.append([start, end, t])
            recent = (recent + [t])[-3:]
    # koniec riadku = začiatok ďalšieho (auto-titulky majú prekrývajúce sa cue)
    for i in range(len(out) - 1):
        nxt = out[i + 1][0]
        if nxt > out[i][0]:
            out[i][1] = min(out[i][1], nxt)
    return [(round(s, 3), round(max(e, s), 3), t) for s, e, t in out]


def paragraphs(lines: list[tuple[float, float, str]]) -> list[tuple[float, float, str]]:
    paras: list[tuple[float, float, str]] = []
    cur: list[tuple[float, float, str]] = []
    for i, ln in enumerate(lines):
        cur.append(ln)
        dur = cur[-1][1] - cur[0][0]
        nxt = lines[i + 1] if i + 1 < len(lines) else None
        gap = (nxt[0] - ln[1]) if nxt else 99
        sentence_end = ln[2].rstrip().endswith((".", "?", "!", "…"))
        if nxt is None or dur >= PARA_MAX or (dur >= PARA_MIN and (sentence_end or gap > 1.5)):
            paras.append((cur[0][0], cur[-1][1], " ".join(x[2] for x in cur)))
            cur = []
    return paras


def load_video(con: sqlite3.Connection, vid: str, info: dict) -> None:
    con.execute("DELETE FROM segments WHERE video_id=?", (vid,))
    con.execute("DELETE FROM lines WHERE video_id=?", (vid,))
    ud = info.get("upload_date")
    if ud and len(ud) == 8:
        ud = f"{ud[:4]}-{ud[4:6]}-{ud[6:]}"
    if not info.get("file"):
        con.execute(
            f"UPDATE videos SET subs_status='{info.get('blocked') or 'none'}', upload_date=COALESCE(?, upload_date), "
            "duration=COALESCE(?, duration), loaded_at=datetime('now') WHERE id=?",
            (ud, info.get("duration"), vid),
        )
        con.commit()
        return
    lines = parse_vtt(RAW / info["file"])
    paras = paragraphs(lines)
    con.executemany(
        "INSERT INTO lines(video_id, start, end, text) VALUES (?,?,?,?)",
        [(vid, s, e, t) for s, e, t in lines],
    )
    con.executemany(
        "INSERT INTO segments(video_id, idx, start, end, text) VALUES (?,?,?,?,?)",
        [(vid, i, s, e, t) for i, (s, e, t) in enumerate(paras)],
    )
    covered = sum(e - s for s, e, _ in paras)
    con.execute(
        "UPDATE videos SET subs_status='ok', subs_lang=?, subs_kind=?, subs_file=?, "
        "covered_seconds=?, upload_date=COALESCE(?, upload_date), duration=COALESCE(?, duration), "
        "loaded_at=datetime('now') WHERE id=?",
        (info["lang"], info["kind"], info["file"], round(covered, 1), ud, info.get("duration"), vid),
    )
    con.commit()


def existing_raw(vid: str) -> dict | None:
    m = RAW / f"{vid}.meta.json"
    if m.exists():
        info = json.loads(m.read_text(encoding="utf-8"))
        if info.get("file") and (RAW / info["file"]).exists():
            return info
    for langs in LANG_ATTEMPTS:
        for lang in langs.split(","):
            f = RAW / f"{vid}.{lang}.vtt"
            if f.exists() and f.stat().st_size > 0:
                return {"file": f.name, "lang": lang,
                        "kind": "auto" if lang.endswith("-orig") else "manual"}
    return None


def write_videos_json(con: sqlite3.Connection) -> None:
    rows = con.execute(
        "SELECT id, title, upload_date, duration, subs_status, subs_lang, subs_kind, covered_seconds "
        "FROM videos ORDER BY upload_date DESC, id"
    ).fetchall()
    VIDEOS_JSON.write_text(
        json.dumps([dict(r) for r in rows], ensure_ascii=False, indent=1) + "\n", encoding="utf-8"
    )


def cmd_sync(args) -> None:
    con = db()
    entries = list_channel()
    new = upsert_videos(con, entries)
    print(f"kanál: {len(entries)} videí, nových v DB: {new}")
    todo = [r["id"] for r in con.execute(
        "SELECT id FROM videos WHERE subs_status IN ('pending','error') "
        + ("" if not args.retry_none else "OR subs_status IN ('none','age_restricted') ")
        + "ORDER BY id"
    )]
    if args.limit:
        todo = todo[: args.limit]
    for n, vid in enumerate(todo, 1):
        try:
            info = existing_raw(vid)
            if info and not args.refetch:
                # metadáta (dátum) doplníme iba ak chýbajú
                have = con.execute("SELECT upload_date FROM videos WHERE id=?", (vid,)).fetchone()
                if not have["upload_date"]:
                    info = fetch_subs(vid) or info
            else:
                info = fetch_subs(vid)
                time.sleep(args.sleep)
            load_video(con, vid, info or {})
            st = con.execute("SELECT subs_status, subs_lang FROM videos WHERE id=?", (vid,)).fetchone()
            print(f"[{n}/{len(todo)}] {vid} {st['subs_status']} {st['subs_lang'] or ''}", flush=True)
        except RuntimeError as e:
            print(f"STOP: {e}", file=sys.stderr)
            con.execute("UPDATE videos SET subs_status='error' WHERE id=?", (vid,))
            con.commit()
            break
        except Exception as e:  # noqa: BLE001
            print(f"[{n}/{len(todo)}] {vid} chyba: {e}", file=sys.stderr)
            con.execute("UPDATE videos SET subs_status='error' WHERE id=?", (vid,))
            con.commit()
    write_videos_json(con)
    cmd_stats(args, con)


def cmd_reparse(args) -> None:
    """Znovu rozparsuje všetky raw VTT (po zmene parsera), bez sieťových volaní."""
    con = db()
    for r in con.execute("SELECT id, upload_date, duration FROM videos WHERE subs_status='ok'").fetchall():
        info = existing_raw(r["id"])
        if info:
            load_video(con, r["id"], info)
    write_videos_json(con)
    cmd_stats(args, con)


def fmt(t: float) -> str:
    t = int(t)
    h, m, s = t // 3600, t % 3600 // 60, t % 60
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"


def cmd_stats(args, con: sqlite3.Connection | None = None) -> None:
    con = con or db()
    r = con.execute(
        "SELECT COUNT(*) n, SUM(subs_status='ok') ok, SUM(subs_status IN ('none','age_restricted')) none, "
        "SUM(subs_status IN ('pending','error')) todo, SUM(duration) dur, "
        "SUM(CASE WHEN subs_status='ok' THEN duration END) dur_ok, SUM(covered_seconds) cov "
        "FROM videos"
    ).fetchone()
    segs = con.execute("SELECT COUNT(*) FROM segments").fetchone()[0]
    lns = con.execute("SELECT COUNT(*) FROM lines").fetchone()[0]
    age = con.execute("SELECT COUNT(*) FROM videos WHERE subs_status='age_restricted'").fetchone()[0]
    h = lambda s: f"{(s or 0) / 3600:.1f} h"  # noqa: E731
    print(
        f"videá: {r['n']} | s titulkami: {r['ok'] or 0} | bez titulkov: {r['none'] or 0} "
        f"(z toho vekovo obmedzené: {age}) | "
        f"čaká/chyba: {r['todo'] or 0}\n"
        f"dĺžka všetkých: {h(r['dur'])} | dĺžka videí s titulkami: {h(r['dur_ok'])} | "
        f"pokryté odsekmi: {h(r['cov'])}\n"
        f"odseky: {segs} | riadky: {lns}"
    )


def fts_query(q: str) -> str:
    """Obyčajné slová → prefixové termy (skloňovanie). Syntax FTS5 sa nechá tak."""
    if any(c in q for c in '"*()') or re.search(r"\b(AND|OR|NOT|NEAR)\b", q):
        return q
    return " ".join(f'"{w}"*' for w in q.split())


def cmd_search(args) -> None:
    con = db()
    q = " ".join(args.query)
    rows = con.execute(
        "SELECT s.id, s.video_id, s.start, s.end, s.text, v.title, v.upload_date, "
        "snippet(segments_fts, 0, '[', ']', '…', 24) snip "
        "FROM segments_fts JOIN segments s ON s.id = segments_fts.rowid "
        "JOIN videos v ON v.id = s.video_id "
        "WHERE segments_fts MATCH ? ORDER BY rank LIMIT ?",
        (fts_query(q), args.limit),
    ).fetchall()
    terms = [w.strip('"*()').lower() for w in q.split() if w not in ("AND", "OR", "NOT")]
    for r in rows:
        # presný čas: prvý riadok v odseku, ktorý obsahuje hľadaný výraz
        hit = r["start"]
        for ln in con.execute(
            "SELECT start, text FROM lines WHERE video_id=? AND start>=? AND start<? ORDER BY start",
            (r["video_id"], r["start"] - 0.01, r["end"]),
        ):
            if any(t and t[:5] in ln["text"].lower() for t in terms):
                hit = ln["start"]
                break
        t0 = max(0, int(hit) - 2)
        print(
            f"— {r['title']} ({r['upload_date'] or '?'})\n"
            f"  {fmt(r['start'])}–{fmt(r['end'])}  zásah {fmt(hit)}  https://youtu.be/{r['video_id']}?t={t0}\n"
            f"  {r['snip'] if args.snippet else r['text']}\n"
        )
    print(f"{len(rows)} výsledkov pre: {q}")


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("sync", help="stiahne nové titulky a načíta ich do DB")
    s.add_argument("--limit", type=int, default=0)
    s.add_argument("--sleep", type=float, default=2.0, help="pauza medzi videami (s)")
    s.add_argument("--retry-none", action="store_true", help="skús znovu aj videá bez titulkov")
    s.add_argument("--refetch", action="store_true", help="stiahni VTT aj keď už je v raw/")
    s.set_defaults(func=cmd_sync)
    r = sub.add_parser("reparse", help="znovu rozparsuje raw VTT bez siete")
    r.set_defaults(func=cmd_reparse)
    st = sub.add_parser("stats", help="pokrytie korpusu")
    st.set_defaults(func=cmd_stats)
    q = sub.add_parser("search", help="fulltext (FTS5, bez diakritiky)")
    q.add_argument("query", nargs="+")
    q.add_argument("-n", "--limit", type=int, default=10)
    q.add_argument("-s", "--snippet", action="store_true", help="iba výrez okolo zásahu")
    q.set_defaults(func=cmd_search)
    args = p.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
