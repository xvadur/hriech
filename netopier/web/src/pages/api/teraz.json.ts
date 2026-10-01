import type { APIRoute } from 'astro';
import { teraz } from '../../lib/netopier';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(teraz()), { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
