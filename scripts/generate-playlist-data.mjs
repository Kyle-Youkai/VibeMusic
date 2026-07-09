import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const SOURCE_FILE = process.argv[2] || 'Single.xlsx';
const OUTPUT_FILE = process.argv[3] || path.join('public', 'data', 'playlist.json');
const PLAYLIST_SIZE = 100;
const FALLBACK_SEED = 2026;

const columnAliases = {
  title: ['title', 'track', 'song', 'name'],
  artist: ['artists', 'artist', 'performer', 'creator'],
  album: ['album', 'release', 'release_title', 'format_descriptions', 'format'],
  cover: ['CoverLink', 'cover', 'cover_url', 'image', 'image_url', 'artwork', 'artwork_url'],
  preview: ['preview_url', 'audio_preview_url', 'preview', 'audio', 'mp3', 'sample_url'],
  duration: ['duration', 'duration_ms', 'length', 'track_length'],
  genre: ['genres', 'genre'],
  style: ['styles', 'style'],
  year: ['year', 'release_year'],
  rating: ['rating', 'score'],
  ratingCount: ['rating_count', 'ratings', 'votes'],
  want: ['want', 'wants'],
  have: ['have', 'haves', 'owned'],
  listens: ['listens', 'plays', 'play_count', 'streams', 'popularity'],
  releaseUrl: ['AlbumLink', 'url', 'link', 'release_url'],
};

function normalizeKey(value) {
  return String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function findColumn(headers, aliases) {
  const normalized = new Map(headers.map((header) => [normalizeKey(header), header]));
  for (const alias of aliases) {
    const exact = normalized.get(normalizeKey(alias));
    if (exact) return exact;
  }
  for (const header of headers) {
    const normalizedHeader = normalizeKey(header);
    if (aliases.some((alias) => normalizedHeader.includes(normalizeKey(alias)))) {
      return header;
    }
  }
  return null;
}

function asText(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\s+/g, ' ').trim();
}

function asNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function splitList(value, limit = 4) {
  const seen = new Set();
  return asText(value)
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => {
      const key = part.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}

function cleanArtist(value) {
  const artists = splitList(value, 3);
  return artists.length ? artists.join(', ') : 'Unknown Artist';
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function completenessScore(item) {
  return [
    item.title,
    item.artist,
    item.album,
    item.coverUrl,
    item.genre,
    item.year,
    item.releaseUrl,
  ].filter(Boolean).length;
}

function popularityScore(row, columns) {
  const have = asNumber(row[columns.have]);
  const want = asNumber(row[columns.want]);
  const ratingCount = asNumber(row[columns.ratingCount]);
  const rating = asNumber(row[columns.rating]);
  const listens = asNumber(row[columns.listens]);
  return listens * 4 + have * 3 + want * 2 + ratingCount * 8 + rating * 50;
}

function buildPlaylist() {
  if (!fs.existsSync(SOURCE_FILE)) {
    throw new Error(`Source Excel file not found: ${SOURCE_FILE}`);
  }

  const workbook = XLSX.readFile(SOURCE_FILE, { cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], { defval: '' });
  const headers = rows.length ? Object.keys(rows[0]) : [];

  const columns = Object.fromEntries(
    Object.entries(columnAliases).map(([key, aliases]) => [key, findColumn(headers, aliases)])
  );

  const hasRanking = ['rating', 'ratingCount', 'want', 'have', 'listens'].some((key) => columns[key]);
  const random = seededRandom(FALLBACK_SEED);

  const songs = rows
    .map((row, index) => {
      const title = asText(row[columns.title]);
      const artist = cleanArtist(row[columns.artist]);
      const album = asText(row[columns.album]) || 'Independent Release';
      const genreParts = [...splitList(row[columns.genre], 2), ...splitList(row[columns.style], 2)];
      const item = {
        id: asText(row.AlbumID) || `${index + 1}`,
        sourceNumber: asNumber(row.number) || index + 1,
        title,
        artist,
        album,
        coverUrl: asText(row[columns.cover]) || null,
        previewUrl: asText(row[columns.preview]) || null,
        duration: asText(row[columns.duration]) || null,
        genre: genreParts.join(' / ') || null,
        year: asText(row[columns.year]) || null,
        rating: columns.rating ? asNumber(row[columns.rating]) : null,
        ratingCount: columns.ratingCount ? asNumber(row[columns.ratingCount]) : null,
        want: columns.want ? asNumber(row[columns.want]) : null,
        have: columns.have ? asNumber(row[columns.have]) : null,
        releaseUrl: asText(row[columns.releaseUrl]) || null,
      };
      return {
        ...item,
        completeness: completenessScore(item),
        popularityScore: popularityScore(row, columns),
        randomTieBreaker: random(),
      };
    })
    .filter((song) => song.title && song.artist !== 'Unknown Artist');

  const withCompleteCore = songs.filter((song) => song.title && song.artist && song.coverUrl);
  const candidates = withCompleteCore.length >= PLAYLIST_SIZE ? withCompleteCore : songs;

  const sorted = candidates.sort((a, b) => {
    if (b.completeness !== a.completeness) return b.completeness - a.completeness;
    if (hasRanking && b.popularityScore !== a.popularityScore) return b.popularityScore - a.popularityScore;
    return a.randomTieBreaker - b.randomTieBreaker;
  });

  const selected = sorted.slice(0, PLAYLIST_SIZE).map((song, index) => {
    const { completeness, randomTieBreaker, ...cleanSong } = song;
    return {
      ...cleanSong,
      rank: index + 1,
    };
  });

  return {
    playlist: {
      label: 'Curated Playlist',
      title: 'Global Curated Hits',
      description: 'A handpicked selection of standout tracks from the music dataset.',
      updated: '2026',
      sourceFile: SOURCE_FILE,
      sourceSheet: firstSheetName,
      selectionMethod: hasRanking
        ? 'Selected from complete title, artist, and cover rows; sorted by Discogs have, want, rating count, and rating signals.'
        : `Selected from complete title, artist, and cover rows using stable random seed ${FALLBACK_SEED}.`,
      columns,
    },
    songs: selected,
  };
}

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(buildPlaylist(), null, 2));
console.log(`Generated ${OUTPUT_FILE} from ${SOURCE_FILE}`);
