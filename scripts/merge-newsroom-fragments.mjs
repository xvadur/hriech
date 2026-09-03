import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const fixturePath = path.join(repositoryRoot, "src/data/editorial-organization-map.json");
const schemaPath = path.join(repositoryRoot, "contracts/media/v1/editorial-organization-map.schema.json");
const fragmentDirectory = path.join(repositoryRoot, "research/newsrooms/fragments");

const outletOrder = [
  "dennik-n",
  "sme",
  "aktuality",
  "startitup",
  "refresher",
  "pravda",
  "hospodarske-noviny",
  "trend",
  "standard",
  "postoj",
];

const fragmentSlugs = outletOrder.slice(2);
const parseJson = async (filePath) => JSON.parse(await readFile(filePath, "utf8"));

const [fixture, schema, ...fragments] = await Promise.all([
  parseJson(fixturePath),
  parseJson(schemaPath),
  ...fragmentSlugs.map((slug) => parseJson(path.join(fragmentDirectory, `${slug}.json`))),
]);

for (const [index, fragment] of fragments.entries()) {
  const expectedId = fragmentSlugs[index];
  if (fragment?.outlet?.id !== expectedId || !Array.isArray(fragment.sources)) {
    throw new Error(`Fragment ${expectedId}.json musí obsahovať outlet.id=${expectedId} a pole sources.`);
  }
}

const replacementIds = new Set(fragmentSlugs);
const outletsById = new Map(
  [...fixture.outlets.filter(({ id }) => !replacementIds.has(id)), ...fragments.map(({ outlet }) => outlet)]
    .map((outlet) => [outlet.id, outlet]),
);

const sourcesById = new Map(fixture.sources.map((source) => [source.id, source]));
for (const { sources } of fragments) {
  for (const source of sources) {
    const existing = sourcesById.get(source.id);
    if (existing && JSON.stringify(existing) !== JSON.stringify(source)) {
      throw new Error(`Kolízia rozdielnych zdrojov s ID ${source.id}.`);
    }
    sourcesById.set(source.id, source);
  }
}

const missingOutlets = outletOrder.filter((id) => !outletsById.has(id));
if (missingOutlets.length) throw new Error(`Chýbajú médiá: ${missingOutlets.join(", ")}`);

const merged = {
  ...fixture,
  generatedAt: "2026-09-03T00:00:00+02:00",
  observedAt: "2026-09-03T00:00:00+02:00",
  scope: "Verejne doložiteľná organizačná, profesijná, vlastnícka, finančná a inštitucionálna mapa desiatich prioritných slovenských redakcií.",
  outlets: outletOrder.map((id) => outletsById.get(id)),
  sources: [...sourcesById.values()],
};

const ajv = new Ajv2020({ allErrors: true, allowUnionTypes: true });
ajv.addFormat("date-time", (value) => !Number.isNaN(Date.parse(value)));
ajv.addFormat("uri", (value) => {
  try { return Boolean(new URL(value)); } catch { return false; }
});
const validate = ajv.compile(schema);
if (!validate(merged)) throw new Error(`Neplatná zlúčená mapa:\n${JSON.stringify(validate.errors, null, 2)}`);

await writeFile(fixturePath, `${JSON.stringify(merged, null, 2)}\n`);
console.log(`Zlúčených ${merged.outlets.length} médií a ${merged.sources.length} zdrojov do ${fixturePath}.`);
