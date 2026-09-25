import {getPublications,entryUrl} from "../lib/content";
import {outlets,sections,outletUrl} from "../lib/newsrooms";
import {PAGE_SIZE,kinds,selectEntries} from "../lib/publication-policy.mjs";
import {xml} from "../lib/xml";
export async function GET({site}: {site:URL}) {
 const all=await getPublications();
 const routes=["/","/mapy","/mapy/redakcie","/o-hriechu",...all.map(entryUrl),...outlets.flatMap(o=>sections.map(s=>outletUrl(o.id,s.slug)))];
 for(const kind of ["",...Object.keys(kinds)]){
  const count=Math.max(1,Math.ceil(selectEntries(all,kind).length/PAGE_SIZE));
  for(let page=1;page<=count;page++)if(kind||page>1)routes.push(kind?"/publikacie/typ/"+kind+(page>1?"/strana/"+page:""):"/publikacie/strana/"+page);
 }
 return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+[...new Set(routes)].map(p=>'<url><loc>'+xml(new URL(p,site))+'</loc></url>').join("")+'</urlset>',{headers:{"Content-Type":"application/xml; charset=utf-8"}});
}
