import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
const dist = path.resolve("dist");
if (!fs.existsSync(dist)) throw new Error("Chýba dist/. Najprv spusti Astro build.");
const forbidden = ["/Users/","adam.xvadur.com/api","observer.sqlite","raw prompt","authorization: bearer","private/licensed","HRIECH_DRAFT_SENTINEL_2026","ukazka-formatovania","/nahlad/"];
const files = fs.readdirSync(dist,{recursive:true}).map(f=>path.join(dist,f)).filter(f=>fs.statSync(f).isFile());
const html = new Map();
for(const file of files.filter(f=>/\.(html|js|css|json|xml|txt)$/i.test(f))){
 const content=fs.readFileSync(file,"utf8");
 for(const marker of forbidden)assert(!content.toLowerCase().includes(marker.toLowerCase()),"Private marker "+marker+" in "+file);
 if(file.endsWith(".html"))html.set(file,content);
}
function destination(url) {
 const pathname=decodeURIComponent(url.pathname);
 return [path.join(dist,pathname),path.join(dist,pathname,"index.html"),path.join(dist,pathname+".html")].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());
}
for(const [file,content] of html){
 const ids=[...content.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length,"Duplicate DOM id in "+file);
 for(const match of content.matchAll(/\b(?:href|src)="([^"]+)"/g)){
  const raw=match[1].replaceAll("&amp;","&");
  if(!raw.startsWith("/")&&!raw.startsWith("#"))continue;
  const base="https://hriech.xvadur.com/"+path.relative(dist,file).replace(/index\.html$/,"");
  const url=new URL(raw,base);
  const dest=destination(url);
  assert(dest,"Missing local destination "+raw+" from "+file);
  if(url.hash&&html.has(dest))assert(html.get(dest).includes('id="'+decodeURIComponent(url.hash.slice(1))+'"'),"Missing fragment "+raw+" from "+file);
 }
 assert(content.includes('lang="sk"'),"Missing Slovak lang: "+file);
 assert(content.includes('rel="canonical"'),"Missing canonical: "+file);
}
const data=JSON.parse(fs.readFileSync("src/data/editorial-organization-map.json","utf8"));
for(const outlet of data.outlets){
 for(const section of ["","ludia","vztahy","financie","zdroje"])assert(destination(new URL("/mapy/redakcie/"+outlet.id+(section?"/"+section:""),"https://hriech.xvadur.com")),"Missing media section");
 const people=html.get(destination(new URL("/mapy/redakcie/"+outlet.id+"/ludia","https://hriech.xvadur.com")));
 for(const person of outlet.people)assert(people.includes('id="osoba-'+person.id+'"'),"Missing person "+person.id);
 const rel=html.get(destination(new URL("/mapy/redakcie/"+outlet.id+"/vztahy","https://hriech.xvadur.com")));
 for(const relationship of outlet.relationships)assert(rel.includes('id="vztah-'+relationship.id+'"'),"Missing relationship "+relationship.id);
}
const index=fs.readFileSync(path.join(dist,"index.html"),"utf8");
assert(Buffer.byteLength(index)<40000,"Homepage unexpectedly includes large datasets");
assert(!index.includes('id="osoba-'),"Homepage includes people dataset");
for(const name of ["rss.xml","sitemap.xml","search.json","404.html"])assert(fs.existsSync(path.join(dist,name)),"Missing "+name);
const sitemap=fs.readFileSync(path.join(dist,"sitemap.xml"),"utf8");
for(const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g))assert(destination(new URL(match[1])),"Missing sitemap destination "+match[1]);
console.log("Public build verified: "+html.size+" HTML pages, all local links/fragments valid, all 10 media, no draft/private markers; homepage "+Buffer.byteLength(index)+" bytes.");
