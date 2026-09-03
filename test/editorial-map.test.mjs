import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const data = JSON.parse(fs.readFileSync(new URL("../src/data/editorial-organization-map.json", import.meta.url), "utf8"));
const normalizeName = (name) => name.normalize("NFKC").trim().toLocaleLowerCase("sk-SK");

test("verejná projekcia má očakávaný rozsah", () => {
  assert.equal(data.schemaVersion, "hriech.editorial-organization-map.v1");
  assert.equal(data.visibility, "public");
  assert.equal(data.outlets.length, 10);
  const people = new Set(data.outlets.flatMap((outlet) => outlet.people.map((person) => normalizeName(person.name))));
  assert.equal(people.size, 555);
  assert.deepEqual(data.outlets.map(({ id }) => id), [
    "dennik-n", "sme", "aktuality", "startitup", "refresher",
    "pravda", "hospodarske-noviny", "trend", "standard", "postoj",
  ]);
});

test("všetky referencie smerujú na existujúce verejné zdroje", () => {
  const sourceIds = new Set(data.sources.map(({ id }) => id));
  assert.equal(sourceIds.size, data.sources.length);
  for (const source of data.sources) assert.match(source.url, /^https?:\/\//);

  const refs = [];
  for (const outlet of data.outlets) {
    refs.push(...outlet.legalEntity.sourceRefIds);
    for (const product of outlet.products) refs.push(...product.sourceRefIds);
    for (const unit of outlet.units) refs.push(...unit.sourceRefIds);
    for (const person of outlet.people) {
      refs.push(...person.sourceRefIds);
      for (const role of person.roles) refs.push(...role.sourceRefIds);
    }
    for (const relationship of outlet.relationships) refs.push(...relationship.sourceRefIds);
    for (const fact of outlet.financialFacts) refs.push(...fact.sourceRefIds);
  }
  for (const ref of refs) assert.ok(sourceIds.has(ref), `Neznámy sourceRefId: ${ref}`);
});

test("dataset neobsahuje súkromné identifikátory ani lokálne cesty", () => {
  const serialized = JSON.stringify(data);
  for (const marker of ["/Users/", "file://", "private/licensed", "observer.sqlite"]) {
    assert.equal(serialized.includes(marker), false, `Zakázaný marker: ${marker}`);
  }
  const forbiddenKeys = /^(email|phone|birthDate|dateOfBirth|privateAddress|family)$/i;
  const walk = (value) => {
    if (Array.isArray(value)) return value.forEach(walk);
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      assert.equal(forbiddenKeys.test(key), false, `Zakázaný kľúč: ${key}`);
      walk(child);
    }
  };
  walk(data);
});
