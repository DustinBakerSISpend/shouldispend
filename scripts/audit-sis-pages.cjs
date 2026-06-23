const fs = require("fs");
const path = require("path");

const pagesDir = path.join(__dirname, "../src/pages");

const excludedFiles = new Set([
  "404.astro",
  "about.astro",
  "contact.astro",
  "privacy-policy.astro",
  "disclaimer.astro",
  "methodology.astro",
  "index.astro",
]);

const files = fs
  .readdirSync(pagesDir)
  .filter((file) => file.endsWith(".astro"))
  .filter((file) => !excludedFiles.has(file));

const results = files.map((file) => {
  const filePath = path.join(pagesDir, file);
  const content = fs.readFileSync(filePath, "utf8");
  const sizeKb = fs.statSync(filePath).size / 1024;

  return {
    file,
    sizeKb,
    hasFAQ: content.includes("FAQSection"),
    hasMethodology: content.includes("MethodologySection"),
    hasRedFlags: content.includes("FinancialRedFlags"),
    hasReduceTips: content.includes("ReduceCostTips"),
    hasKeyCosts: content.includes("KeyCostCategories"),
    hasAssumptions: content.includes("CalculatorAssumptions"),
    hasRelated: content.includes("RelatedCalculators"),
    internalLinks: (content.match(/href="\//g) || []).length,
  };
});

results
  .sort((a, b) => a.sizeKb - b.sizeKb)
  .forEach((page) => {
    console.log(
      `${page.file.padEnd(62)} ${page.sizeKb.toFixed(1).padStart(6)} KB | ` +
        `FAQ:${page.hasFAQ ? "Y" : "N"} ` +
        `Meth:${page.hasMethodology ? "Y" : "N"} ` +
        `Red:${page.hasRedFlags ? "Y" : "N"} ` +
        `Tips:${page.hasReduceTips ? "Y" : "N"} ` +
        `Costs:${page.hasKeyCosts ? "Y" : "N"} ` +
        `Assump:${page.hasAssumptions ? "Y" : "N"} ` +
        `Rel:${page.hasRelated ? "Y" : "N"} ` +
        `Links:${page.internalLinks}`
    );
  });

console.log(`\nAudited ${results.length} pages.`);