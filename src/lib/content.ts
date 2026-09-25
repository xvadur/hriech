import { getCollection, type CollectionEntry } from "astro:content";
import { publishedEntries } from "./publication-policy.mjs";
export type Publication = CollectionEntry<"publications"> | CollectionEntry<"cases">;
export async function getPublications(): Promise<Publication[]> {
  return publishedEntries([...(await getCollection("publications")), ...(await getCollection("cases"))]);
}
export { entryUrl } from "./publication-policy.mjs";
export const formatDate = (value: Date | string) => new Intl.DateTimeFormat("sk-SK", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Bratislava" }).format(new Date(value));
export const kindLabel = (kind: string) => ({clanok: "Článok", postreh: "Postreh", pripad: "Prípad"}[kind] ?? kind);
