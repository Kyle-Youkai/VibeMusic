import { useMemo, useState } from 'react';
import { ArrowLeft, Globe2, Heart, Home, Library, Play, Search, X } from 'lucide-react';
import { CoverArt } from './CoverArt';
import { MiniPlayer } from './MiniPlayer';
import { SongBlock } from './SongBlock';
import { useAudioPreview } from '../hooks/useAudioPreview';
import type { PlaylistPayload, Song } from '../types';

type PlaylistPageProps = {
  payload: PlaylistPayload;
};

function shuffleSongs(songs: Song[]) {
  const shuffled = [...songs];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled.map((song, index) => ({ ...song, rank: index + 1 }));
}

export function PlaylistPage({ payload }: PlaylistPageProps) {
  const player = useAudioPreview();
  const songs = useMemo(() => shuffleSongs(payload.songs), [payload.songs]);
  const [wishlist, setWishlist] = useState<Set<string>>(() => new Set());
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [detailSong, setDetailSong] = useState<Song | null>(null);
  const wishlistSongs = songs.filter((song) => wishlist.has(song.id));

  const toggleWishlist = (songId: string) => {
    setWishlist((current) => {
      const next = new Set(current);
      if (next.has(songId)) {
        next.delete(songId);
      } else {
        next.add(songId);
      }
      return next;
    });
  };

  const openWishlist = () => setIsWishlistOpen(true);

  const playRelativeSong = (offset: number) => {
    const activeSong = player.currentSong ?? songs[0];
    const activeIndex = songs.findIndex((song) => song.id === activeSong?.id);
    const nextIndex = activeIndex >= 0 ? (activeIndex + offset + songs.length) % songs.length : 0;
    const nextSong = songs[nextIndex];
    if (nextSong) {
      player.playSong(nextSong);
      if (detailSong) {
        setDetailSong(nextSong);
      }
    }
  };

  return (
    <>
    <div className="mobile-only-message">
      <img src="/LOGO.png" alt="Vibe Music logo" />
      <h1>Sorry, Vibe Music is desktop only.</h1>
      <p>This experience is designed for a computer screen. Please open it on a desktop or laptop.</p>
    </div>
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand">
          <img className="brand-logo" src="/LOGO.png" alt="Vibe Music logo" />
          <strong>Vibe Music</strong>
        </div>
        <nav>
          <a href="#top"><Home size={19} /> Home</a>
          <a href="#songs"><Library size={19} /> Library</a>
          <button type="button" onClick={openWishlist}><Heart size={19} /> Saved</button>
        </nav>
        <div className="sidebar-panel">
          <span>Personal Mix</span>
          <strong>Recommended for You</strong>
        </div>
        <div className="sidebar-footer" aria-label="Footer links">
          <div className="footer-links">
            <a href="#top">Legal</a>
            <a href="#top">Safety & Privacy Center</a>
            <a href="#top">Privacy Policy</a>
            <a href="#top">Cookies</a>
            <a href="#top">About Ads</a>
            <a href="#top">Accessibility</a>
          </div>
          <a className="footer-cookie" href="#top">Cookies</a>
          <button className="language-button" type="button"><Globe2 size={20} /> English</button>
        </div>
      </aside>

      <main className="page" id="top">
        <header className="topbar">
          <div className="nav-dots" aria-hidden="true"><span /><span /></div>
          <label className="search">
            <Search size={18} />
            <input type="search" placeholder="What do you want to play?" />
          </label>
          <button type="button" className="wishlist-counter" onClick={openWishlist} aria-label={`${wishlist.size} songs in wishlist`}>
            <Heart size={18} fill={wishlist.size ? 'currentColor' : 'none'} />
            <span>Wishlist</span>
            <strong>{wishlist.size}</strong>
          </button>
        </header>

        {detailSong ? (
          <section className="detail-page" aria-label="Song detail">
            <button className="back-button" type="button" onClick={() => setDetailSong(null)}>
              <ArrowLeft size={18} /> Back to playlist
            </button>
            <div className="detail-layout">
              <button
                className={`detail-save-button ${wishlist.has(detailSong.id) ? 'is-saved' : ''}`}
                type="button"
                onClick={() => toggleWishlist(detailSong.id)}
              >
                <Heart size={20} fill={wishlist.has(detailSong.id) ? 'currentColor' : 'none'} />
                {wishlist.has(detailSong.id) ? 'Saved' : 'Wishlist'}
              </button>
              <CoverArt className="detail-cover" src={detailSong.coverUrl} alt={`${detailSong.title} cover`} />
              <div className="detail-copy">
                <span>Song Detail</span>
                <h1>{detailSong.title}</h1>
                <p>{detailSong.artist}</p>
                <div className="detail-facts">
                  {detailSong.genre && <span>{detailSong.genre}</span>}
                  {detailSong.year && <span>{detailSong.year}</span>}
                  {detailSong.previewUrl && <span>15-second preview available</span>}
                </div>
                <div className="detail-actions">
                  <button className="primary-play" type="button" onClick={() => player.playSong(detailSong)}>
                    <Play size={24} fill="currentColor" /> Play
                  </button>
                </div>
              </div>
            </div>
            <MiniPlayer
              song={player.currentSong ?? detailSong}
              isPlaying={player.isPlaying}
              progress={player.progress}
              message={player.message}
              className="detail-mini-player"
              onToggle={player.playSong}
              onPrevious={() => playRelativeSong(-1)}
              onNext={() => playRelativeSong(1)}
              onDetail={setDetailSong}
            />
          </section>
        ) : (
          <>
            <section className="hero">
              <div className="hero-glow" aria-hidden="true" />
              <div className="hero-illustration">
                <img src="/hero-illustration.png" alt="Listener wearing headphones illustration" />
              </div>
              <div className="hero-copy">
                <span>Personalized Playlist</span>
                <h1>{payload.playlist.title}</h1>
                <p>Songs selected to fit your taste, your pace, and the vibe you might want next.</p>
                <strong>{songs.length} songs · refreshed every visit</strong>
              </div>
            </section>

            <section className="song-section" id="songs">
              <div className="section-heading">
                <span>Curated Selection</span>
              </div>
              <div className="song-grid">
                {songs.map((song) => (
                  <SongBlock
                    key={song.id}
                    song={song}
                    isActive={player.currentSong?.id === song.id}
                    isPlaying={player.currentSong?.id === song.id && player.isPlaying}
                    isWishlisted={wishlist.has(song.id)}
                    onPlay={player.playSong}
                    onOpenDetail={setDetailSong}
                    onToggleWishlist={toggleWishlist}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {!detailSong && (
        <MiniPlayer
          song={player.currentSong}
          isPlaying={player.isPlaying}
          progress={player.progress}
          message={player.message}
          onToggle={player.playSong}
          onPrevious={() => playRelativeSong(-1)}
          onNext={() => playRelativeSong(1)}
          onDetail={setDetailSong}
        />
      )}

      {isWishlistOpen && (
        <section className="wishlist-drawer" aria-label="Wishlist songs">
          <div className="wishlist-panel">
            <div className="wishlist-panel-header">
              <div>
                <span>Wishlist</span>
                <h2>Saved Songs</h2>
                <p>{wishlistSongs.length} songs added</p>
              </div>
              <button type="button" onClick={() => setIsWishlistOpen(false)} aria-label="Close wishlist">
                <X size={22} />
              </button>
            </div>
            {wishlistSongs.length ? (
              <div className="wishlist-list">
                {wishlistSongs.map((song) => (
                  <button className="wishlist-row" type="button" key={song.id} onClick={() => player.playSong(song)}>
                    <img src={song.coverUrl ?? '/LOGO.png'} alt={`${song.title} cover`} />
                    <span>
                      <strong>{song.title}</strong>
                      <small>{song.artist}</small>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="wishlist-empty">
                <Heart size={32} />
                <strong>No saved songs yet</strong>
                <p>Add tracks with the Wishlist button on each song card.</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
    </>
  );
}
