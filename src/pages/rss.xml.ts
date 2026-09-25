import {getPublications,entryUrl} from "../lib/content";
import {xml} from "../lib/xml";
export async function GET({site}: {site:URL}) {
 const items=await getPublications();
 const body='<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Hriech</title><link>'+xml(site)+'</link><description>Publikácie a mapy súvislostí pod značkou XVADUR.</description><language>sk</language>'+items.map(e=>{
 const url=new URL(entryUrl(e),site).href;
 return '<item><title>'+xml(e.data.title)+'</title><description>'+xml(e.data.description)+'</description><link>'+xml(url)+'</link><guid isPermaLink="true">'+xml(url)+'</guid><pubDate>'+e.data.publishedAt!.toUTCString()+'</pubDate></item>';
 }).join("")+'</channel></rss>';
 return new Response(body,{headers:{"Content-Type":"application/rss+xml; charset=utf-8"}});
}
