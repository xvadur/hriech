import test from "node:test";
import assert from "node:assert/strict";
import {publishedEntries,selectEntries,pageEntries,legacyDestination,entryUrl} from "../src/lib/publication-policy.mjs";
const now=new Date("2026-09-05T12:00:00Z");
const entry=(id,changes={})=>({id,collection:"publications",data:{title:"Médiá a štát",description:"Verejné zdroje",kind:"clanok",status:"published",approvedBy:"Adam",publishedAt:"2026-09-03T10:00:00Z",...changes}});
test("Public output excludes drafts, review, missing approval, missing dates and future entries",()=>{
 const rows=[entry("ok"),entry("draft",{status:"draft"}),entry("review",{status:"review"}),entry("missing",{approvedBy:""}),entry("whitespace",{approvedBy:" "}),entry("date",{publishedAt:undefined}),entry("future",{publishedAt:"2027-01-01"})];
 assert.deepEqual(publishedEntries(rows,now).map(e=>e.id),["ok"]);
});
test("Newest first, deterministic same-date order; filters before pagination",()=>{
 const rows=Array.from({length:27},(_,i)=>entry(String(i).padStart(2,"0"),{publishedAt:new Date(2026,7,i+1),kind:i%2?"postreh":"clanok"}));
 const sorted=publishedEntries(rows,now);
 assert.equal(sorted[0].id,"26");
 const filtered=selectEntries(sorted,"clanok","media");
 assert.equal(filtered.length,14);
 assert.equal(pageEntries(filtered,1).entries.length,12);
 assert.equal(pageEntries(filtered,2).entries.length,2);
 assert.equal(pageEntries(filtered,999).current,2);
 assert.equal(pageEntries([],1).pages,1);
 assert.equal(selectEntries(rows,"","neexistujúce").length,0);
});
test("Case URLs and all legacy sections map to real static destinations",()=>{
 assert.equal(entryUrl({...entry("redakcie"),collection:"cases"}),"/pripady/redakcie");
 const ids=["dennik-n","hospodarske-noviny"];
 assert.equal(legacyDestination("#outlet-dennik-n",ids),"/mapy/redakcie/dennik-n");
 assert.equal(legacyDestination("#dennik-n-vazby",ids),"/mapy/redakcie/dennik-n/vztahy");
 assert.equal(legacyDestination("#hospodarske-noviny-ludia",ids),"/mapy/redakcie/hospodarske-noviny/ludia");
 assert.equal(legacyDestination("#dennik-n-unknown",ids),null);
 assert.equal(legacyDestination("#https://evil.example",ids),null);
});
