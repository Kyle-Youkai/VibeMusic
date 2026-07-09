import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, Search, Sparkles, Volume2 } from 'lucide-react';

type Track = {
  id: string;
  rank: number;
  title: string;
  artist: string;
  album: string;
  year: number | null;
  country: string;
  genre: string;
  genres: string[];
  styles: string[];
  coverUrl: string;
  albumUrl: string;
  previewUrl: string | null;
  duration: string | null;
  rating: number;
  ratingCount: number;
  want: number;
  have: number;
  numForSale: number;
  lowestPrice: number | null;
  featureCount: number;
  colorCount: number;
  popularityScore: number;
};

type PlaylistData = {
  appName: string;
  playlistTitle: string;
  description: string;
  totalTracks: number;
  tracks: Track[];
};

const baseUrl = import.meta.env.BASE_URL;

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US').format(value);
}

function formatPrice(value: number | null) {
  if (value === null || Number.isNaN(value)) return '—';
  return `$${value.toFixed(2)}`;
}

function TrackCard({
  track,
  active,
  onPlay
}: {
  track: Track;
  active: boolean;
  onPlay: (track: Track) => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const styleText = track.styles?.slice(0, 2).join(' · ') || track.genre;

  return (
    <article className={`track-card ${active ? 'is-active' : ''}`}>
      <div className="rank">{String(track.rank).padStart(2, '0')}</div>
      <button className="cover-button" onClick={() => onPlay(track)} aria-label={`Play ${track.title}`}>
        {imageFailed ? (
          <div className="cover-fallback">{track.title.slice(0, 1)}</div>
        ) : (
          <img src={track.coverUrl} alt={`${track.title} cover`} onError={() => setImageFailed(true)} />
        )}
        <span className="cover-play">
          {active ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
        </span>
      </button>
      <div className="track-main">
        <div className="track-title-row">
          <h3>{track.title}</h3>
          <span className="pill">{track.year || '2025'}</span>
        </div>
        <p className="artist">{track.artist}</p>
        <p className="track-meta">{track.genre} · {styleText}</p>
      </div>
      <div className="metric wide">
        <span>Rating</span>
        <strong>{track.rating ? track.rating.toFixed(2) : '—'}</strong>
      </div>
      <div className="metric">
        <span>Want</span>
        <strong>{formatNumber(track.want)}</strong>
      </div>
      <div className="metric">
        <span>Have</span>
        <strong>{formatNumber(track.have)}</strong>
      </div>
      <div className="metric hide-mobile">
        <span>Price</span>
        <strong>{formatPrice(track.lowestPrice)}</strong>
      </div>
      <button className="small-play" onClick={() => onPlay(track)}>
        {active ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        <span>{active ? 'Pause' : 'Play'}</span>
      </button>
    </article>
  );
}

function App() {
  const [data, setData] = useState<PlaylistData | null>(null);
  const [query, setQuery] = useState('');
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [status, setStatus] = useState('Ready to vibe. Audio previews can be connected later.');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewTimer = useRef<number | null>(null);

  useEffect(() => {
    fetch(`${baseUrl}data/playlist.json`)
      .then((response) => {
        if (!response.ok) throw new Error('Playlist data failed to load');
        return response.json();
      })
      .then(setData)
      .catch((error) => {
        console.error(error);
        setStatus('Playlist data could not be loaded.');
      });

    return () => {
      if (previewTimer.current) window.clearTimeout(previewTimer.current);
      audioRef.current?.pause();
    };
  }, []);

  const tracks = data?.tracks || [];

  const filteredTracks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return tracks;
    return tracks.filter((track) => {
      const target = [track.title, track.artist, track.genre, track.album, ...track.styles].join(' ').toLowerCase();
      return target.includes(normalized);
    });
  }, [tracks, query]);

  const topGenres = useMemo(() => {
    const counts = new Map<string, number>();
    tracks.forEach((track) => counts.set(track.genre, (counts.get(track.genre) || 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [tracks]);

  const handlePlay = (track: Track) => {
    if (activeTrackId === track.id) {
      audioRef.current?.pause();
      setActiveTrackId(null);
      setStatus('Paused.');
      return;
    }

    if (previewTimer.current) window.clearTimeout(previewTimer.current);
    audioRef.current?.pause();

    if (!track.previewUrl) {
      setActiveTrackId(track.id);
      setStatus(`Selected: ${track.title}. No 15-second preview URL is connected yet.`);
      window.setTimeout(() => setActiveTrackId((current) => (current === track.id ? null : current)), 900);
      return;
    }

    const audio = new Audio(track.previewUrl);
    audioRef.current = audio;
    setActiveTrackId(track.id);
    setStatus(`Playing 15-second preview: ${track.title}`);
    audio.play().catch(() => {
      setStatus('Preview could not be played in this browser.');
      setActiveTrackId(null);
    });
    previewTimer.current = window.setTimeout(() => {
      audio.pause();
      setActiveTrackId(null);
      setStatus('Preview ended after 15 seconds.');
    }, 15000);
  };

  const heroCover = tracks[0]?.coverUrl;
  const totalWant = tracks.reduce((sum, track) => sum + track.want, 0);
  const totalHave = tracks.reduce((sum, track) => sum + track.have, 0);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <img src={`${baseUrl}LOGO.png`} alt="Vibe Music logo" />
          <span>Vibe Music</span>
        </div>
        <nav>
          <a href="#playlist">Playlist</a>
          <a href="#genres">Genres</a>
          <a href="https://github.com/Kyle-Youkai/VibeMusic" target="_blank" rel="noreferrer">GitHub</a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={16} /> Data-curated playlist</div>
          <h1>{data?.playlistTitle || 'Curated 2025 Singles'}</h1>
          <p>
            A one-page music discovery experience for Vibe Music, built from Discogs release metadata.
            Large covers, quick play controls, and a dark mint-blue interface keep the focus on the tracks.
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => tracks[0] && handlePlay(tracks[0])} disabled={!tracks.length}>
              <Play size={18} fill="currentColor" /> Play Top Track
            </button>
            <span className="status"><Volume2 size={16} /> {status}</span>
          </div>
        </div>
        <div className="hero-art">
          <div className="glass-card">
            {heroCover ? <img src={heroCover} alt="Featured cover" /> : <div className="cover-fallback">V</div>}
            <div>
              <span>Now highlighting</span>
              <strong>{tracks[0]?.title || 'Loading playlist'}</strong>
              <p>{tracks[0]?.artist || 'Vibe Music'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-grid" aria-label="Playlist stats">
        <div><span>Tracks</span><strong>{formatNumber(data?.totalTracks || tracks.length || 100)}</strong></div>
        <div><span>Total Want</span><strong>{formatNumber(totalWant)}</strong></div>
        <div><span>Total Have</span><strong>{formatNumber(totalHave)}</strong></div>
        <div><span>Source</span><strong>Discogs</strong></div>
      </section>

      <section className="playlist-panel" id="playlist">
        <div className="section-head">
          <div>
            <span className="section-kicker">Vibe queue</span>
            <h2>100-track curated playlist</h2>
          </div>
          <label className="search-box">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search songs, artists, genres" />
          </label>
        </div>

        <div className="track-list">
          {filteredTracks.map((track) => (
            <TrackCard key={track.id} track={track} active={activeTrackId === track.id} onPlay={handlePlay} />
          ))}
        </div>

        {!filteredTracks.length && <p className="empty">No tracks matched your search.</p>}
      </section>

      <section className="genres" id="genres">
        <div className="section-head simple">
          <div>
            <span className="section-kicker">Genre mix</span>
            <h2>Most represented sounds</h2>
          </div>
        </div>
        <div className="genre-chips">
          {topGenres.map(([genre, count]) => (
            <span key={genre}>{genre}<strong>{count}</strong></span>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
