// Netopier web: lokálne okno nad data/netopier.sqlite (čítanie, nič nezapisuje).
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  server: { host: '127.0.0.1', port: 4400 },
  vite: { plugins: [tailwindcss()] },
});
