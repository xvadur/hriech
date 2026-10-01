import type { APIRoute } from 'astro';
import { hladaj } from '../../lib/netopier';

export const GET: APIRoute = ({ url }) =>
  new Response(JSON.stringify(hladaj(url.searchParams.get('q') ?? '')), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
