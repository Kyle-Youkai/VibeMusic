import fs from 'node:fs';
import path from 'node:path';
import XLSX from 'xlsx';

const inputFile = process.argv[2] || 'Single.xlsx';
const outputFile = process.argv[3] || 'public/data/playlist.json';
const limit = Number(process.argv[4] || 100);

function clean(value) {
  if (value === undefined || value === null) return '';
  return String(value).replace(/\s+/g, ' ').trim();
}

function toNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function splitList(value) {
  return clean(value)
    .split(';')
    .map((item) => clean(item))
    .filter(Boolean);
}

function unique(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatArtists(value) {
  const artists = unique(splitList(value));
  if (artists.length === 0) return 'Unknown Artist';
  if (artists.length <= 2) return artists.join(' & ');
  return `${artists.slice(0, 2).join(' & ')} +${artists.length - 2}`;
}

function firstItem(value, fallback = 'Music') {
  return splitList(value)[0] || fallback;
}

function computeScore(row) {
  const rating = toNumber(row.rating);
  const ratingCount = toNumber(row.rating_count);
  const want = toNumber(row.want);
  const have = toNumber(row.have);
  const sharpness = toNumber(row.sharpness);
  const featureCount = toNumber(row.feature_count);
  return have * 1.2 + want * 1.6 + ratingCount * 7 + rating * 12 + Math.log1p(sharpness) * 2 + Math.log1p(featureCount);
}

if (!fs.existsSync(inputFile)) {
  console.error(`Input workbook not found: ${inputFile}`);
  process.exit(1);
}

const workbook = XLSX.readFile(inputFile);
const sheetName = workbook.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

const tracks = rows
  .map((row, index) => ({ row, index, score: computeScore(row) }))
  .filter(({ row }) => clean(row.title) && clean(row.artists) && clean(row.CoverLink))
  .sort((a, b) => b.score - a.score)
  .slice(0, limit)
  .map(({ row, score }, index) => {
    const genres = splitList(row.genres);
    const styles = splitList(row.styles);
    return {
      id: clean(row.AlbumID) || `track-${index + 1}`,
      rank: index + 1,
      title: clean(row.title) || 'Untitled Track',
      artist: formatArtists(row.artists),
      artists: splitList(row.artists),
      album: clean(row.format_descriptions) || 'Single',
      year: toNumber(row.year, null),
      country: clean(row.country) || 'US',
      genre: genres[0] || 'Music',
      genres,
      styles,
      coverUrl: clean(row.CoverLink),
      albumUrl: clean(row.AlbumLink),
      previewUrl: null,
      duration: null,
      rating: toNumber(row.rating, 0),
      ratingCount: toNumber(row.rating_count, 0),
      want: toNumber(row.want, 0),
      have: toNumber(row.have, 0),
      numForSale: toNumber(row.num_for_sale, 0),
      lowestPrice: row.lowest_price === '' ? null : toNumber(row.lowest_price, null),
      featureCount: toNumber(row.feature_count, 0),
      imageWidth: toNumber(row.image_width, null),
      imageHeight: toNumber(row.image_height, null),
      colorCount: toNumber(row.color_count, 0),
      popularityScore: Number(score.toFixed(2))
    };
  });

const payload = {
  appName: 'Vibe Music',
  playlistTitle: 'Curated 2025 Singles',
  description: 'A data-driven playlist selected from Discogs single-release metadata.',
  sourceWorkbook: inputFile,
  generatedAt: new Date().toISOString(),
  totalTracks: tracks.length,
  tracks
};

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(payload, null, 2), 'utf8');
console.log(`Generated ${tracks.length} tracks -> ${outputFile}`);
