#!/usr/bin/env python3
"""Matica reči: kto hovorí sám a kto sa skrýva za text, kolektív a cudzie autority.

Kalibrované 5. 10. 2026 na Adamovom svedectve (KZ Bratislava, 29. 1. 2020), denníku 2017
a 19 kázňach zboru; potom pustené na prepisy podcastov z Netopiera. Miery na 1000 slov,
diakritika zotretá. Použitie: .venv/bin/python podcasty/matica_reci.py > data/matica/kto-hovori-sam.md
"""
import re, glob, json, os, sys, unicodedata, statistics as st

def norm(s):
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn").lower()

JA = {"ja","som","mi","ma","mna","mne","moj","moja","moje","mojej","mojou","mojich","mojho","mojim","mojom"}
TY = {"ty","ti","ta","teba","tebe","tvoj","tvoja","tvoje","tvojho","tvojej"}
VY = {"vy","vam","vas","vas","vase","vasu","vasom","vasa","vasich"}
MY = {"my","nam","nas","nas","nase","nasu","nasom","nasa","nasich","sme"}
ZIVOT = {"mama","mamy","matka","otec","rodicia","babka","sestra","brat","kamarat","kamarati","kamaratov","priatel","kolega","skola","skole","ucitel","maturita","praca","prace","robota","robote","pracovat","domov","doma","dom","byt","auto","les","nemocnica","nemocnici","dieta","deti","zena","muz","frajerka","rodina","peniaze","vyplata","najom"}
POCIT = {"plakat","plakal","slzy","pokoj","radost","strach","stres","bal","bojim","hanbim","hanba","trapi","trapenie","trpel","bolest","bolelo","prijaty","sam","sebecky","citil","citim","citit","pocit","stastny","stastie","smutny","laska","lubim","milovat","zufaly","nadej","vdacny","dakujem","nenavidim","ziarlivy","hnev","unaveny","unava"}
VAH = {"teda","tak","nejak","nejako","akoze","vlastne","proste","hm","no","ehm","eh","ze"}
CASOV = {"potom","vtedy","kedysi","neskor","najprv","nakoniec","rokov","roku","roky","rok","mesiac","dni","den","leto","zima","rano","vecer","noc","teraz","dnes","vcera","zrazu"}
AUTORITA = r"podla (studie|analytik|expert|odbornik|prieskum|agentur|firm|spolocnost|vlad|ministerstv|uradu|zdroj|reuters|bloomberg|financial|new york|guardian|wired|verge|techcrunch)|\bstudia\b|\bstudie\b|\bexpert|odbornik|analytik|prieskum|\bzdroj|\bvraj\b|udajne|hovori sa|\bpodla\b"
CITACIE_PISMA = r"kapitol|\bvers|evanjeli|evanieli|epistol|\blist\b|\bkniha|\bknihe|zalm|mojzisov|rimanom|galat|efez|matus|marek|lukas|\bjan\b|pisme|pisma"

def stat(name, text, skupina):
    tx = norm(text); w = re.findall(r"[a-z0-9]+", tx); n = max(len(w), 1)
    k = lambda S: round(1000 * sum(1 for x in w if x in S) / n, 1)
    minul = sum(1 for x in w if x.endswith(("al","il","el","ol","ul","ala","ila","ela","ola","ula")) and len(x) > 3)
    return {"text": name, "skupina": skupina, "slov": n, "ja": k(JA), "ty": k(TY), "vy": k(VY), "my": k(MY),
            "cudzia autorita": round(1000 * len(re.findall(AUTORITA, tx)) / n, 1),
            "citacie Pisma": round(1000 * len(re.findall(CITACIE_PISMA, tx)) / n, 1),
            "zivot": k(ZIVOT), "pocity": k(POCIT), "cas": k(CASOV),
            "roky (abs.)": len(re.findall(r"\b(19[5-9]\d|20[0-2]\d)\b", tx)),
            "minuly cas": round(1000 * minul / n), "vahanie": k(VAH), "bohatost": round(len(set(w)) / n, 3)}

def prepis(path):
    t = open(path, encoding="utf-8", errors="ignore").read()
    t = re.sub(r"^\[\d+:\d\d(:\d\d)?\]\s*", "", t, flags=re.M)
    return "\n".join(t.split("\n")[3:])  # bez hlavičky

KOREN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JADRO = os.path.expanduser("~/xvadur_workspace/xvadur_core/zdroje/hlas")
rows = []
sv = json.load(open(f"{JADRO}/svedectvo/svedectvo.json"))
rows.append(stat("Adam, svedectvo 29. 1. 2020", " ".join(s["text"] for s in sv["segments"]), "Adam"))
rows.append(stat("Adam, denník máj–aug 2017", open(f"{JADRO}/krestanstvo/keep-dennik.md").read(), "Adam"))
kz = [stat(os.path.basename(f)[:-4], open(f).read(), "KZ") for f in glob.glob(f"{JADRO}/svedectvo/porovnanie/2*.txt")]
for f in sorted(glob.glob(f"{KOREN}/data/podcasty/*/*.txt")):
    rel = f.split("/podcasty/")[1]
    txt = prepis(f)
    if len(txt.split()) < 300:
        continue
    rows.append(stat(rel[:-4].replace("_", " ")[:48], txt, "médiá"))
# medián KZ ako jeden riadok
keys = [k for k in rows[0] if k not in ("text", "skupina")]
med = {k: round(st.median(r[k] for r in kz), 1) for k in keys}; med.update(text="Medián 19 kázní KZ Bratislava", skupina="KZ"); rows.insert(2, med)
# os: seba v reči (+) vs úkryt (−); z-skóre naprieč všetkými riadkami
allr = rows
def z(k):
    v = [r[k] for r in allr]; m = st.mean(v); s = st.pstdev(v) or 1
    return {r["text"]: (r[k] - m) / s for r in allr}
plus = ["ja", "zivot", "pocity", "minuly cas", "cas"]; minus = ["my", "cudzia autorita", "citacie Pisma"]
Z = {k: z(k) for k in plus + minus}
for r in allr:
    p = sum(Z[k][r["text"]] for k in plus) / len(plus); m = sum(Z[k][r["text"]] for k in minus) / len(minus)
    r["seba (+)"] = round(p, 2); r["úkryt (−)"] = round(m, 2); r["hovorí sám"] = round(p - m, 2)
cols = ["text", "slov", "ja", "my", "cudzia autorita", "citacie Pisma", "zivot", "pocity", "minuly cas", "vahanie", "seba (+)", "úkryt (−)", "hovorí sám"]
print("# Kto hovorí sám\n\nMiery na 1000 slov, diakritika zotretá. Os „hovorí sám“ = seba v reči (ja, život, pocity, minulý čas, čas) mínus úkryt (my, cudzia autorita: podľa/štúdia/expert/vraj, citácie Písma). Z-skóre naprieč všetkými riadkami. Kalibrácia: Adam 2020 a 2017 a kázne KZ; potom podcasty z Netopiera. Skript `podcasty/matica_reci.py`.\n")
print("| " + " | ".join(cols) + " |\n|" + "---|" * len(cols))
for r in sorted(allr, key=lambda r: -r["hovorí sám"]):
    print("| " + " | ".join(str(r[c]) for c in cols) + " |")
