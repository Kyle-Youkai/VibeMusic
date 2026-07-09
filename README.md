# Vibe Music

A one-page dark-mode music playlist website inspired by modern desktop music apps without using Spotify branding, logos, or assets.

## Data Mapping

The app uses `Single.xlsx` as the source workbook. The generator maps:

- Song title: `title`
- Artist: `artists`
- Album/release descriptor: `format_descriptions` because no dedicated album column exists
- Cover image: `CoverLink`
- Audio preview: no matching column was found, so `previewUrl` is generated as `null`
- Ranking: `have`, `want`, `rating_count`, and `rating`
- Duration: no matching column was found, so `duration` is generated as `null`
- Genre/year: `genres`, `styles`, and `year`

## Install

```bash
npm install
```

If you prefer pnpm:

```bash
pnpm install
```

## Generate Playlist Data

```bash
npm run generate:data
```

With pnpm:

```bash
pnpm run generate:data
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

With pnpm:

```bash
pnpm run dev
```

## Build

```bash
npm run build
```

With pnpm:

```bash
pnpm run build
```
