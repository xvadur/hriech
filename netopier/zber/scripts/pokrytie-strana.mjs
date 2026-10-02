#!/usr/bin/env node
// Stránka pokrytia (vzor Ground News, vzhľad online denníka) z výstupu pokrytie-node.mjs.
// Statické HTML bez JavaScriptu: netopier/data/pokrytie/<den>.html (mimo gitu).
// Použitie: node scripts/pokrytie-strana.mjs [cesta k JSON]   (predvolene najnovší v data/pokrytie/)
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DB_CESTA } from './lib/db.mjs';

const priecinok = join(dirname(DB_CESTA), 'pokrytie');
const vstup = process.argv[2] ?? join(priecinok, readdirSync(priecinok).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort().at(-1));
const d = JSON.parse(readFileSync(vstup, 'utf8'));

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const cislo = (n) => n.toLocaleString('sk-SK');
const cas = (iso, s) =>
  new Intl.DateTimeFormat('sk-SK', { timeZone: 'Europe/Bratislava', day: 'numeric', month: 'numeric', ...(s ? { hour: '2-digit', minute: '2-digit' } : {}) }).format(new Date(iso));
const datumDlho = (iso) => new Intl.DateTimeFormat('sk-SK', { timeZone: 'Europe/Bratislava', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
const SK = ['hlavny', 'agentury', 'alternativne'];
const nazovSk = Object.fromEntries(SK.map((s) => [s, d.skupiny[s].nazov]));
const medii = (n) => (n === 1 ? 'médium' : n >= 2 && n <= 4 ? 'médiá' : 'médií');

// pruh pokrytia: šírka podľa počtu médií (voči najväčšiemu príbehu), farba podľa skupiny
const pruh = (p, max) => {
  const casti = SK.filter((s) => p.pocty[s] > 0)
    .map((s) => `<span class="c ${s}" style="flex:${p.pocty[s]}" title="${esc(nazovSk[s])}: ${p.pocty[s]}">${p.pocty[s] >= 2 ? p.pocty[s] : ''}</span>`)
    .join('');
  return `<div class="pruh-obal"><div class="pruh" style="width:${Math.max(8, (100 * p.medii) / max).toFixed(1)}%">${casti}</div></div>`;
};
const zoznamMedii = (p) =>
  `<details><summary>Kto písal (${p.medii})</summary><ol class="media">${p.media
    .map((m) => `<li><span class="bod ${m.skupina}"></span><b>${esc(m.nazov)}</b> <time>${cas(m.cas, true)}</time> <a href="${esc(m.url)}">${esc(m.titulok)}</a></li>`)
    .join('')}</ol></details>`;

const max = d.pribehy[0]?.medii ?? 1;
const TOP = 15;
const hlavne = d.pribehy.slice(0, TOP);
const altMlcia = d.slepe.alternativne_mlcia.slice(0, 10);
const hpMlci = d.slepe.hlavny_prud_mlci;
const pozornost = d.pozornost.filter((a) => a.skupina !== 'agentury' && (a.top_pokrytych >= 3 || a.clankov >= 60));
const maxClankov = Math.max(...d.pozornost.map((a) => a.clankov));

const riadokPribehu = (p, i) => `
  <li class="pribeh">
    <div class="poradie">${i + 1}</div>
    <div class="telo">
      <h3>${esc(p.titulok)}</h3>
      <p class="meta"><b>${p.medii} ${medii(p.medii)}</b> · ${cislo(p.clankov)} článkov · ${cas(p.od)}–${cas(p.do)} · prvé <b>${esc(p.prvy.nazov)}</b> ${cas(p.prvy.cas, true)}</p>
      ${pruh(p, max)}
      ${zoznamMedii(p)}
    </div>
  </li>`;

const slepeRiadok = (p, mlci) => `
  <li>
    <h4>${esc(p.titulok)}</h4>
    <p class="meta">${SK.map((s) => `<span class="bod ${s}"></span>${p.pocty[s]}`).join(' ')} · ${cas(p.od)} · ${mlci === 'alternativne' ? `alternatívne: ${p.pocty.alternativne}` : `hlavný prúd: ${p.pocty.hlavny}`}</p>
    ${zoznamMedii(p)}
  </li>`;

const html = `<!doctype html>
<html lang="sk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Netopier · Pokrytie</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rubik:wght@800&family=Source+Serif+4:opsz,wght@8..60,400;8..60,700;8..60,800&family=Source+Sans+3:wght@400;600;700&display=swap">
<style>
:root{--ink:#181616;--siva:#6b6563;--linka:#d9d4d2;--papier:#fff;--ruzova:#F18FA0;--blush:#FBE8EC;--hlavny:#181616;--agentury:#a9a3a1;--alternativne:#F18FA0;--cervena:#9e1b2b}
*{box-sizing:border-box}
body{margin:0;background:var(--papier);color:var(--ink);font:16px/1.5 "Source Sans 3",system-ui,sans-serif}
.strana{max-width:1180px;margin:0 auto;padding:0 16px 64px}
header.hlava{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;padding:18px 0 10px;border-bottom:1px solid var(--ink)}
.logo{font:800 44px/1 Rubik,sans-serif;color:var(--ruzova);-webkit-text-stroke:1.5px var(--ink);letter-spacing:-.5px}
.hlava small{display:block;color:var(--siva);font-size:14px;text-align:right}
nav{display:flex;flex-wrap:wrap;gap:6px 22px;padding:10px 0;border-bottom:3px double var(--ink);font-size:15px}
nav span{color:var(--siva)} nav b{border-bottom:2px solid var(--ruzova)}
h1,h2,h3,h4{font-family:"Source Serif 4",Georgia,serif;margin:0}
h1{font-size:clamp(30px,4.6vw,52px);line-height:1.05;font-weight:800;letter-spacing:-.5px;margin:28px 0 10px;max-width:24ch}
.perex{font:400 clamp(18px,2vw,22px)/1.4 "Source Serif 4",serif;max-width:60ch;margin:0 0 10px}
.podpis{font-size:14px;color:var(--siva);margin:0 0 22px}
.legenda{display:flex;flex-wrap:wrap;gap:8px 22px;font-size:14px;padding:10px 0;border-top:1px solid var(--linka);border-bottom:1px solid var(--linka)}
.bod{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:5px;vertical-align:0}
.bod.hlavny,.c.hlavny{background:var(--hlavny)} .bod.agentury,.c.agentury{background:var(--agentury)} .bod.alternativne,.c.alternativne{background:var(--alternativne)}
section{margin-top:38px}
h2{font-size:26px;font-weight:800;padding-bottom:6px;border-bottom:2px solid var(--ink);margin-bottom:4px}
.pod-h2{color:var(--siva);font-size:15px;margin:6px 0 10px}
ol.zoznam{list-style:none;margin:0;padding:0}
.pribeh{display:grid;grid-template-columns:34px 1fr;gap:10px;padding:14px 0;border-bottom:1px solid var(--linka)}
.poradie{font:800 22px/1.2 "Source Serif 4",serif;color:var(--siva)}
.pribeh h3{font-size:20px;line-height:1.25;font-weight:700}
.meta{font-size:14px;color:var(--siva);margin:4px 0 8px}
.meta b{color:var(--ink)}
.pruh-obal{background:#f3f0ef;height:22px}
.pruh{display:flex;height:22px}
.c{display:flex;align-items:center;justify-content:center;color:#fff;font:700 12px/1 "Source Sans 3",sans-serif;min-width:3px;border-right:1px solid #fff}
.c.alternativne{color:var(--ink)} .c.agentury{color:var(--ink)}
details{margin-top:6px;font-size:14px}
summary{cursor:pointer;color:var(--siva)}
ol.media{margin:6px 0 0;padding-left:0;list-style:none;columns:2 320px;column-gap:28px}
ol.media li{break-inside:avoid;padding:3px 0;border-bottom:1px dotted var(--linka)}
ol.media time{color:var(--siva);font-size:13px}
ol.media a{color:var(--ink);text-decoration:none} ol.media a:hover{text-decoration:underline}
.dva{display:grid;grid-template-columns:1fr 1fr;gap:36px}
.slepe ul{list-style:none;padding:0;margin:0}
.slepe li{padding:12px 0;border-bottom:1px solid var(--linka)}
.slepe h4{font-size:17px;line-height:1.3;font-weight:700}
.velke{font:800 64px/1 "Source Serif 4",serif;color:var(--cervena);letter-spacing:-1px}
.velke small{font:600 15px/1.3 "Source Sans 3",sans-serif;color:var(--ink);display:block;letter-spacing:0;margin-top:4px}
table.poz{width:100%;border-collapse:collapse;font-size:14px}
.poz th{text-align:left;font-weight:600;color:var(--siva);border-bottom:1px solid var(--ink);padding:6px 8px 6px 0}
.poz td{padding:5px 8px 5px 0;border-bottom:1px solid var(--linka);vertical-align:middle}
.poz td.n{text-align:right;font-variant-numeric:tabular-nums;width:56px}
.mini{height:12px;background:#f3f0ef;min-width:120px}
.mini span{display:block;height:12px}
.zdroj{font-size:13px;color:var(--siva);margin-top:8px}
.metodika{margin-top:44px;padding-top:12px;border-top:1px solid var(--ink);font-size:14px;color:var(--siva);max-width:80ch}
@media (max-width:760px){.dva{grid-template-columns:1fr;gap:10px}.logo{font-size:34px}.hlava small{font-size:12px}.poz .skryt{display:none}}
</style>
</head>
<body>
<div class="strana">
<header class="hlava">
  <div class="logo">netopier</div>
  <small>${esc(datumDlho(d.vytvorene_at))}<br>meranie slovenských médií</small>
</header>
<nav><b>Pokrytie</b><span>Shitometer</span><span>Ľudia</span><span>Relácie</span><span>Debata</span></nav>

<h1>Kto o čom písal: týždeň slovenských médií</h1>
<p class="perex">Netopier spojil ${cislo(d.clankov)} článkov z ${d.medii} médií do ${d.pribehov} príbehov. Nečíta, čo v nich je. Meria, kto o čom písal, kto bol prvý a kto mlčal.</p>
<p class="podpis"><b>Netopier · meranie</b> · ${cas(d.od, true)} – ${cas(d.vytvorene_at, true)}</p>
<div class="legenda">${SK.map((s) => `<span><span class="bod ${s}"></span>${esc(nazovSk[s])} (${d.medii_podla_skupin[s]} médií)</span>`).join('')}<span>skupiny podľa kategórie v registri zdrojov</span></div>

<section>
  <h2>Najväčšie príbehy týždňa</h2>
  <p class="pod-h2">Poradie podľa počtu médií, ktoré o príbehu písali. Pruh: koľko z nich je z ktorej skupiny.</p>
  <ol class="zoznam">${hlavne.map(riadokPribehu).join('')}</ol>
  <p class="zdroj">Zdroj: Netopier, RSS ${d.medii} slovenských médií, ${esc(d.algoritmus)}</p>
</section>

<section class="slepe">
  <h2>Slepé miesta</h2>
  <p class="pod-h2">Príbeh, o ktorom písali ${esc(d.slepe.pravidlo)}.</p>
  <div class="dva">
    <div>
      <div class="velke">${d.slepe.alternativne_mlcia.length}<small>príbehov, o ktorých písal hlavný prúd a alternatívne médiá mlčali</small></div>
      <ul>${altMlcia.map((p) => slepeRiadok(p, 'alternativne')).join('')}</ul>
      <p class="zdroj">Prvých 10 podľa počtu médií.</p>
    </div>
    <div>
      <div class="velke">${hpMlci.length}<small>príbehy, o ktorých písali alternatívne médiá a hlavný prúd mlčal</small></div>
      <ul>${hpMlci.map((p) => slepeRiadok(p, 'hlavny')).join('')}</ul>
    </div>
  </div>
</section>

<section>
  <h2>Pozornosť redakcií</h2>
  <p class="pod-h2">Koľko z ${d.top} najväčších príbehov týždňa médium malo, a v koľkých príbehoch bolo prvé.</p>
  <table class="poz">
    <thead><tr><th>Médium</th><th>Z ${d.top} najväčších</th><th class="n"></th><th class="n">prvé</th><th class="n skryt">článkov</th></tr></thead>
    <tbody>${pozornost
      .map(
        (a) => `<tr><td><span class="bod ${a.skupina}"></span>${esc(a.nazov)}</td><td><div class="mini"><span class="c ${a.skupina}" style="width:${((100 * a.top_pokrytych) / d.top).toFixed(1)}%"></span></div></td><td class="n">${a.top_pokrytych}</td><td class="n">${a.prvy_v_pribehoch}</td><td class="n skryt">${cislo(a.clankov)}</td></tr>`,
      )
      .join('')}</tbody>
  </table>
  <p class="zdroj">SME je v Netopierovi zatiaľ iba z rubrík Ekonomika a Komentáre (web odmieta robotov), jeho číslo je preto nízke. Agentúry TASR a SITA majú takmer všetko, v tabuľke nie sú.</p>
</section>

<p class="metodika">Metodika: články, minúty a tlačové správy slovenských médií z RSS za ${d.dni} dní (${cislo(d.clankov)} kusov). Príbehy vznikajú klastrovaním titulku, perexu a začiatku textu (TF-IDF, slovenská normalizácia, časové okno 36 hodín), bez jazykového modelu. Médium sa v príbehu ráta raz. Šport je vynechaný. Skupiny médií sú podľa kategórie v registri zdrojov Netopiera, nie podľa hodnotenia obsahu. Prebraný článok s rovnakým titulkom sa pri slepých miestach ráta ako jeden vlastný titulok.</p>
</div>
</body>
</html>
`;

const cesta = vstup.replace(/\.json$/, '.html');
writeFileSync(cesta, html);
console.log(cesta);
