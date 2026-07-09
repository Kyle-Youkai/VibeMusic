# Vibe Music

A one-page dark-mode music playlist website inspired by modern desktop music apps without using Spotify branding, logos, or assets.

## Project Structure

- `src/`: React frontend source code. It controls the page layout, playlist UI, search, cover cards, and play buttons.
- `scripts/`: Data generation scripts. `generate-playlist-data.mjs` reads the Excel workbook and creates the JSON file used by the website.
- `public/`: Static assets copied directly to the deployed site, including `LOGO.png` and `data/playlist.json`.

## Data Mapping

The app uses `Single.xlsx` as the source workbook. The generator maps:

- Song title: `title`
- Artist: `artists`
- Album/release descriptor: `format_descriptions`
- Cover image: `CoverLink`
- Audio preview: no matching column was found, so `previewUrl` is generated as `null`
- Ranking: `have`, `want`, `rating_count`, `rating`, and image metrics
- Genre/year: `genres`, `styles`, and `year`

## Install

```bash
npm install
```

## Generate Playlist Data

```bash
npm run generate:data
```

This reads `Single.xlsx` and writes `public/data/playlist.json`. You can pass a different workbook and output path:

```bash
node scripts/generate-playlist-data.mjs Discogs2025USData.xlsx public/data/playlist.json
```

## Run Locally

```bash
npm run dev
```

Open the local URL printed by Vite.

## Build

```bash
npm run build
```

## GitHub Pages

The repository is configured for GitHub Pages through `.github/workflows/deploy.yml` and `vite.config.ts` with `base: '/VibeMusic/'`.

After deployment, the site URL should be:

```text
https://kyle-youkai.github.io/VibeMusic/
```
