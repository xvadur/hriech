import {getPublications,entryUrl} from "../lib/content";
export async function GET(){return new Response(JSON.stringify((await getPublications()).map(e=>({title:e.data.title,description:e.data.description,kind:e.data.kind,url:entryUrl(e),publishedAt:e.data.publishedAt}))),{headers:{"Content-Type":"application/json; charset=utf-8"}});}
