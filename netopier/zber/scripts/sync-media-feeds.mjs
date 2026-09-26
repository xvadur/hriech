#!/usr/bin/env node
// Prevedie register slovenských médií (../sources/slovak-core.yaml) do data/media-feeds.json,
// aby ho Worker mal zabalený bez YAML parsera za behu.
import { readFile, writeFile } from 'node:fs/promises';
import { parse } from 'yaml';

const register = parse(await readFile(new URL('../../sources/slovak-core.yaml', import.meta.url), 'utf8'));
const feeds = register.sources.map((s) => ({
  id: s.id,
  name: s.name,
  url: s.resolved_feed_url ?? s.feed_url,
  site_url: s.site_url,
  family: s.source_family,
  lang: s.language,
  country: s.country,
}));
await writeFile(
  new URL('../data/media-feeds.json', import.meta.url),
  JSON.stringify({ source: 'netopier/sources/slovak-core.yaml', reviewed_at: register.reviewed_at, feeds }, null, 2) + '\n',
);
console.log(`media-feeds.json: ${feeds.length} kanálov`);
