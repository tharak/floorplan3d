import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

const SOURCE_PAGE = "https://arauco.com.br/categoria/arauco-melamina/";
const OUTPUT_DIR = new URL("../textures/arauco/", import.meta.url);
const CONCURRENCY = 6;

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseProducts(html) {
  const productPattern = /<a href="([^"]+)" class="post-item[^>]*data-collection="([^"]*)" data-texture="([^"]*)" data-title="([^"]*)">([\s\S]*?)<\/a>/g;
  const products = [];
  let match;

  while ((match = productPattern.exec(html))) {
    const gallery = match[5].match(/data-gallery='([^']+)'/);
    if (!gallery) continue;

    const [primaryImage] = JSON.parse(gallery[1]);
    if (!primaryImage?.url) continue;

    const extension = extname(new URL(primaryImage.url).pathname).toLowerCase() || ".jpg";
    const filename = `${slugify(match[4])}-${slugify(match[3])}${extension}`;
    products.push({
      name: match[4],
      collection: match[2],
      finish: match[3],
      productUrl: match[1],
      sourceUrl: primaryImage.url,
      filename,
      width: primaryImage.width,
      height: primaryImage.height
    });
  }

  return products;
}

async function download(product) {
  const response = await fetch(product.sourceUrl);
  if (!response.ok) throw new Error(`${response.status} ${product.sourceUrl}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(new URL(product.filename, OUTPUT_DIR), bytes);
  return { ...product, bytes: bytes.length };
}

async function main() {
  const page = await fetch(SOURCE_PAGE);
  if (!page.ok) throw new Error(`Could not fetch catalog: ${page.status}`);

  const products = parseProducts(await page.text());
  if (!products.length) throw new Error("No product textures found; the page structure may have changed.");

  await mkdir(OUTPUT_DIR, { recursive: true });
  const downloaded = [];
  let cursor = 0;

  async function worker() {
    while (cursor < products.length) {
      const product = products[cursor++];
      downloaded.push(await download(product));
      process.stdout.write(`Downloaded ${downloaded.length}/${products.length}: ${product.name} (${product.finish})\n`);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  downloaded.sort((a, b) => a.name.localeCompare(b.name, "pt-BR") || a.finish.localeCompare(b.finish));

  const manifest = {
    sourcePage: SOURCE_PAGE,
    downloadedAt: new Date().toISOString(),
    usageNotice: "Official ARAUCO product imagery. Copyright remains with ARAUCO; verify permission for redistribution and client-facing production use.",
    count: downloaded.length,
    textures: downloaded
  };
  await writeFile(new URL("source-manifest.json", OUTPUT_DIR), `${JSON.stringify(manifest, null, 2)}\n`);
  process.stdout.write(`Saved ${downloaded.length} textures to ${join("textures", "arauco")}\n`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
