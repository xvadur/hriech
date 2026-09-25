import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
const publication = z.object({
  title: z.string(), description: z.string(),
  kind: z.enum(["clanok", "postreh", "pripad"]),
  status: z.enum(["draft", "review", "published"]).default("draft"),
  publishedAt: z.coerce.date().optional(), updatedAt: z.coerce.date().optional(),
  author: z.string(), aiDisclosure: z.string(),
  approvedBy: z.string().optional(),
  cover: z.object({ src: z.string(), alt: z.string(), caption: z.string().optional() }).optional(),
  caseId: z.string().optional(), moduleId: z.string().optional(),
  sources: z.array(z.object({ id: z.string(), title: z.string(), url: z.url() })).default([]),
}).superRefine((data, ctx) => {
  if (data.status === "published" && (!data.publishedAt || !data.approvedBy?.trim()))
    ctx.addIssue({ code: "custom", message: "Publikácia potrebuje dátum a schvaľovateľa." });
});
export const collections = {
  publications: defineCollection({ loader: glob({ pattern: "**/*.md", base: "./src/content/publications" }), schema: publication }),
  cases: defineCollection({ loader: glob({ pattern: "**/*.md", base: "./src/content/cases" }), schema: publication }),
  modules: defineCollection({ loader: glob({ pattern: "**/*.json", base: "./src/content/modules" }),
    schema: z.object({ title: z.string(), description: z.string(), href: z.string(), caseId: z.string(), available: z.boolean() }) }),
};
