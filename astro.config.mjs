import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://hriech.xvadur.com",
  output: "static",
  trailingSlash: "never",
  devToolbar: { enabled: false },
});
