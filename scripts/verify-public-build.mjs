import fs from "node:fs";
import path from "node:path";

const dist = path.resolve("dist");
if (!fs.existsSync(dist)) throw new Error("Chýba dist/. Najprv spusti Astro build.");

const forbidden = [
  "/Users/",
  "adam.xvadur.com/api",
  "observer.sqlite",
  "raw prompt",
  "authorization: bearer",
  "private/licensed",
];

const files = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else files.push(full);
  }
};
walk(dist);

for (const file of files.filter((item) => /\.(html|js|css|json|xml|txt)$/i.test(item))) {
  const content = fs.readFileSync(file, "utf8").toLowerCase();
  for (const marker of forbidden) {
    if (content.includes(marker.toLowerCase())) throw new Error(`Verejný build obsahuje zakázaný marker ${marker} v ${file}`);
  }
}

const index = fs.readFileSync(path.join(dist, "index.html"), "utf8");
for (const expected of ["Hriech", "555", "Denník N", "Konzervatívny denník Postoj"]) {
  if (!index.includes(expected)) throw new Error(`V indexe chýba očakávaný obsah: ${expected}`);
}

console.log(`Public build verified: ${files.length} files, no private markers.`);
