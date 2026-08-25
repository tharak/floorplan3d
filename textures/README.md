# Texture library

Add square JPG, PNG, or WebP files to this folder, then register them in the `MATERIALS` array at the top of `app.js`.

For best results, use seamless, evenly lit images at 1024×1024 or 2048×2048. Keep each compressed file below 1 MB for fast loading on GitHub Pages.

The included images were generated as sample visualization materials and are not manufacturer product samples.

## ARAUCO Melamina catalog

Official product swatches downloaded from the [ARAUCO Melamina catalog](https://arauco.com.br/categoria/arauco-melamina/) are stored in `textures/arauco/`. The accompanying `source-manifest.json` records each product name, collection, finish, product page, original image URL, dimensions, and downloaded size.

Refresh the catalog with:

```bash
node scripts/download-arauco-textures.mjs
```

The ARAUCO images remain the property of ARAUCO. Confirm permission before redistribution or production use beyond this visualization prototype.
