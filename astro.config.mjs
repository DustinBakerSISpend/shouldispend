// @ts-check
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const pagesDir = fileURLToPath(new URL("./src/pages/", import.meta.url));

function listAstroFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      return listAstroFiles(fullPath);
    }

    if (entry.isFile() && entry.name.endsWith(".astro")) {
      return [fullPath];
    }

    return [];
  });
}

function routeFromPageFile(filePath) {
  const rel = relative(pagesDir, filePath).split(sep).join("/");
  const withoutExt = rel.replace(/\.astro$/, "");

  if (withoutExt === "index") {
    return "/";
  }

  if (withoutExt.endsWith("/index")) {
    return `/${withoutExt.replace(/\/index$/, "")}/`;
  }

  return `/${withoutExt}/`;
}

const noindexRoutes = new Set(
  listAstroFiles(pagesDir)
    .filter((filePath) => readFileSync(filePath, "utf8").includes("noindex={true}"))
    .map(routeFromPageFile)
);

export default defineConfig({
  site: "https://shouldispend.com",
  integrations: [
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname;
        return !noindexRoutes.has(pathname);
      },
    }),
  ],
});