export const PAGE_SIZE = 12;
export const kinds = { clanok: "Články", postreh: "Postrehy", pripad: "Prípady" };
export const fold = (value = "") => value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("sk");
export function isPublic(data, now = new Date()) {
  return data.status === "published" && Boolean(data.approvedBy?.trim()) && Boolean(data.publishedAt) && new Date(data.publishedAt) <= now;
}
export function publishedEntries(entries, now = new Date()) {
  return entries.filter(({ data }) => isPublic(data, now)).sort((a, b) => new Date(b.data.publishedAt) - new Date(a.data.publishedAt) || a.id.localeCompare(b.id));
}
export function selectEntries(entries, kind = "", query = "") {
  return entries.filter(({ data }) => (!kind || data.kind === kind) && fold(data.title + " " + data.description).includes(fold(query)));
}
export function pageEntries(entries, page = 1) {
  const pages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const current = Math.min(pages, Math.max(1, Math.floor(Number(page)) || 1));
  return { entries: entries.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE), current, pages };
}
export const entryUrl = (entry) => (entry.collection === "cases" ? "/pripady/" : "/publikacie/") + entry.id;
export function legacyDestination(hash, ids) {
  const value = hash.replace(/^#/, "").replace(/^outlet-/, "");
  for (const id of [...ids].sort((a, b) => b.length - a.length)) {
    if (value === id) return "/mapy/redakcie/" + id;
    const section = value.startsWith(id + "-") ? value.slice(id.length + 1) : "";
    const sections = { prehlad: "", ludia: "/ludia", vztahy: "/vztahy", vazby: "/vztahy", financie: "/financie", zdroje: "/zdroje", struktura: "" };
    if (Object.hasOwn(sections, section)) return "/mapy/redakcie/" + id + sections[section];
  }
  return null;
}
