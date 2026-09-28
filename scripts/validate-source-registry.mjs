import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const registryPath = path.join(ROOT, "src", "data", "sourceRegistry.js");
const registryModule = await import(pathToFileURL(registryPath).href + "?v=" + Date.now());
const sources = registryModule.sourceRegistry || [];
const errors = [];
const warnings = [];
const ids = new Map();
const urls = new Map();
const categories = new Set();

const remember = (map, key, id) => {
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(id);
};

for (const source of sources) {
  const required = ["id", "category", "publisher", "title", "url", "supports", "verified"];
  const missing = required.filter((key) => !source[key]);
  if (missing.length) {
    errors.push(`Source ${source.id || "(missing id)"} missing: ${missing.join(", ")}`);
    continue;
  }

  remember(ids, source.id, source.id);
  remember(urls, source.url, source.id);
  categories.add(source.category);

  if (!/^https:\/\//.test(source.url)) {
    errors.push(`Source ${source.id} must use an https URL: ${source.url}`);
  }
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(source.verified)) {
    errors.push(`Source ${source.id} has invalid verified date: ${source.verified}`);
  }
}

for (const [id, members] of ids) {
  if (members.length > 1) errors.push(`Duplicate source id: ${id}`);
}
for (const [url, members] of urls) {
  if (members.length > 1) errors.push(`Duplicate source URL used by: ${members.join(", ")} -> ${url}`);
}

const pagesDir = path.join(ROOT, "src", "pages");
const sourceBlockCategories = new Map();
for (const file of fs.readdirSync(pagesDir).filter((name) => name.endsWith(".astro"))) {
  const text = fs.readFileSync(path.join(pagesDir, file), "utf8");
  for (const match of text.matchAll(/<SourcesAssumptionsBlock\s+category=["']([^"']+)["']/g)) {
    const category = match[1];
    if (!sourceBlockCategories.has(category)) sourceBlockCategories.set(category, []);
    sourceBlockCategories.get(category).push("/" + file.replace(/\.astro$/, "") + "/");
  }
}

for (const [category, routes] of sourceBlockCategories) {
  if (!categories.has(category)) {
    errors.push(`SourcesAssumptionsBlock category has no registry source: ${category} used by ${routes.join(", ")}`);
  }
}

for (const category of categories) {
  if (!sourceBlockCategories.has(category)) {
    warnings.push(`Registry category currently unused by SourcesAssumptionsBlock: ${category}`);
  }
}

if (errors.length) {
  console.error("SIS source registry validation FAILED");
  for (const error of errors) console.error("- " + error);
  for (const warning of warnings) console.warn("- WARNING: " + warning);
  process.exit(1);
}

console.log(
  `SIS source registry validation PASS sources=${sources.length} categories=${categories.size} sourceBlockCategories=${sourceBlockCategories.size} warnings=${warnings.length}`
);
for (const warning of warnings) console.warn("- WARNING: " + warning);
