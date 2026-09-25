export interface SourceRef {
  id: string;
  title: string;
  publisher: string;
  url: string;
  sourceKind: string;
  capturedAt: string;
  note?: string;
}

export interface Role {
  title: string;
  unitId: string;
  roleLevel: string;
  rosterStatus: string;
  evidenceState: string;
  sourceRefIds: string[];
}

export interface Person {
  id: string;
  name: string;
  profileUrl?: string;
  roles: Role[];
  professionalNote?: string;
  observedAt: string;
  sourceRefIds: string[];
}

export interface Unit {
  id: string;
  name: string;
  kind: string;
  parentId?: string;
  description?: string;
  evidenceState: string;
  sourceRefIds: string[];
}

export interface Relationship {
  id: string;
  subjectType: string;
  subjectId: string;
  predicate: string;
  objectType: string;
  objectId?: string;
  objectLabel: string;
  note?: string;
  evidenceState: string;
  observedAt: string;
  sourceRefIds: string[];
}

export interface FinancialFact {
  id: string;
  period: string;
  metric: string;
  value: number | string;
  unit: string;
  note?: string;
  evidenceState: string;
  sourceRefIds: string[];
}

export interface Outlet {
  id: string;
  name: string;
  website: string;
  mappingState: string;
  legalEntity: {
    name: string;
    registrationId: string;
    legalForm: string;
    registeredOffice: string;
    sourceRefIds: string[];
  };
  coverage: {
    summary: string;
    knownGaps: string[];
    rosterObservedAt: string;
  };
  products: Array<{ id: string; name: string; kind: string; relationship: string; url?: string; evidenceState: string; sourceRefIds: string[] }>;
  units: Unit[];
  people: Person[];
  relationships: Relationship[];
  financialFacts: FinancialFact[];
  openQuestions: string[];
}

export interface EditorialMapData {
  schemaVersion: string;
  observedAt: string;
  scope: string;
  sourcePolicy: { allowed: string[]; forbidden: string[]; secondarySourcesAreLeadsOnly: boolean };
  privacy: Record<string, boolean>;
  outlets: Outlet[];
  sources: SourceRef[];
}


import raw from "../data/editorial-organization-map.json";
export const data: EditorialMapData = raw;
export const outlets = data.outlets;
export const sourcesById = new Map(data.sources.map(s => [s.id, s]));
export const sections = [{slug:"",label:"Prehľad"},{slug:"ludia",label:"Ľudia"},{slug:"vztahy",label:"Vzťahy"},{slug:"financie",label:"Financie"},{slug:"zdroje",label:"Zdroje"}];
export const outletUrl = (id: string, section = "") => "/mapy/redakcie/" + id + (section ? "/" + section : "");
export const personUrl = (outlet: Outlet, id: string) => outletUrl(outlet.id,"ludia") + "#osoba-" + id;
export const sourceUrl = (outlet: Outlet, id: string) => outletUrl(outlet.id,"zdroje") + "#zdroj-" + id;
export const relationUrl = (outlet: Outlet, id: string) => outletUrl(outlet.id,"vztahy") + "#vztah-" + id;
export const evidenceLabel = (state: string) => ({current_verified:"Overené k dátumu zachytenia",documented_historical:"Historický záznam",inference:"Odvodený záver",unknown:"Neoverené"}[state] ?? state);
export const predicateLabel = (p: string) => ({
leads:"vedie",member_of:"je členom",works_for:"pracuje pre",executive_of:"je konateľom",chair_of_board:"predsedá predstavenstvu",board_member_of:"je členom predstavenstva",supervisory_board_member_of:"je členom dozornej rady",editorial_council_member_of:"je členom redakčnej rady",beneficial_owner_of:"je konečným užívateľom výhod",shareholder_of:"je akcionárom",owns:"vlastní",owns_share_in:"má podiel v",minority_owner_of:"má menšinový podiel v",co_owner_of:"je spoluvlastníkom",owns_via_subsidiary:"vlastní cez dcérsku spoločnosť",partner_public_sector:"je zapísaný v",cooperates_with:"spolupracuje s",received_public_funds_from:"má verejnú finančnú väzbu na",contracted_with:"uzavrel zmluvu s",publishes:"vydáva",operates:"prevádzkuje"
}[p] ?? p);
export const roleLabel = (r: string) => ({editorial_leadership:"Vedenie redakcie",unit_lead:"Vedenie tímov",editorial_staff:"Redakcia",production_staff:"Produkcia",support_staff:"Podpora",publisher_leadership:"Vedenie vydavateľa",governance:"Orgány a redakčná rada",owner:"Vlastnícka vrstva",commercial_staff:"Obchod",technology_staff:"Technológie",external_contributor:"Externí spolupracovníci"}[r] ?? r);
export const ownershipPredicates = new Set(["owns","owns_share_in","minority_owner_of","co_owner_of","owns_via_subsidiary","shareholder_of"]);
export function relationKind(predicate: string) {
  if (ownershipPredicates.has(predicate)) return "Vlastníctvo";
  if (predicate === "beneficial_owner_of") return "Konečný užívateľ výhod";
  if (["leads","works_for","member_of"].includes(predicate)) return "Profesijná funkcia";
  if (["executive_of","chair_of_board","board_member_of","supervisory_board_member_of","editorial_council_member_of"].includes(predicate)) return "Vedenie a orgány";
  return "Inštitucionálna väzba";
}
export function subjectLabel(outlet: Outlet, r: Relationship) {
  const person = outlet.people.find(p => p.id === r.subjectId);
  const unit = outlet.units.find(u => u.id === r.subjectId);
  const entity = outlet.relationships.find(v => v.objectId === r.subjectId);
  if (person) return person.name;
  if (unit) return unit.name;
  if (entity) return entity.objectLabel;
  if (r.subjectId === outlet.id) return outlet.name;
  if (r.subjectType === "legal_entity" && r.objectType === "outlet") return outlet.legalEntity.name;
  return "Subjekt " + r.subjectId;
}
export function subjectHref(outlet: Outlet, r: Relationship) {
  if (outlet.people.some(p => p.id === r.subjectId)) return personUrl(outlet,r.subjectId);
  if (outlet.units.some(u => u.id === r.subjectId)) return outletUrl(outlet.id) + "#tim-" + r.subjectId;
  return undefined;
}
export function outletSources(outlet: Outlet) {
  const ids = new Set([...outlet.legalEntity.sourceRefIds, ...outlet.products.flatMap(x=>x.sourceRefIds),
    ...outlet.units.flatMap(x=>x.sourceRefIds), ...outlet.people.flatMap(x=>[...x.sourceRefIds,...x.roles.flatMap(r=>r.sourceRefIds)]),
    ...outlet.relationships.flatMap(x=>x.sourceRefIds), ...outlet.financialFacts.flatMap(x=>x.sourceRefIds)]);
  return data.sources.filter(s=>ids.has(s.id));
}
export const formatValue = (value: number|string, unit: string) => (typeof value === "number" ? new Intl.NumberFormat("sk-SK").format(value) : value) + " " + unit;
export const rosterLabel = (status: string) => ({listed_current:"uvedená v zachytenom zozname",external_listed:"externá spolupráca",historical:"historická rola",unknown:"stav nie je doložený"}[status] ?? "stav nie je doložený");
export function publisherOwnership(outlet: Outlet) {
  const candidates=outlet.relationships.filter(r=>ownershipPredicates.has(r.predicate));
  const normalize=(s:string)=>s.toLocaleLowerCase("sk").replace(/[^\p{L}\p{N}]/gu,"");
  const targets=new Set([outlet.legalEntity.name,...outlet.units.filter(u=>u.kind==="publisher").map(u=>u.name)].map(normalize));
  const selected: Relationship[]=[];
  let changed=true;
  while(changed){
    changed=false;
    for(const r of candidates){
      if(selected.includes(r))continue;
      const object=normalize(r.objectLabel);
      if([...targets].some(t=>object===t||object.startsWith(t))){
        selected.push(r);targets.add(normalize(subjectLabel(outlet,r)));changed=true;
      }
    }
  }
  return selected;
}
