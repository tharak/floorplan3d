# Texture library

The texture library currently contains only the ARAUCO Melamina catalog in `textures/arauco/`.

## ARAUCO Melamina catalog

Official product swatches downloaded from the [ARAUCO Melamina catalog](https://arauco.com.br/categoria/arauco-melamina/) are stored in `textures/arauco/`. The accompanying `source-manifest.json` records each product name, collection, finish, product page, original image URL, dimensions, and downloaded size.

Refresh the catalog with:

```bash
node scripts/download-arauco-textures.mjs
```

The ARAUCO images remain the property of ARAUCO and are included with permission for this project.
