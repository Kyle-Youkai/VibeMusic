import { Heart, Pause, Play } from 'lucide-react';
import { CoverArt } from './CoverArt';
import type { Song } from '../types';

type SongBlockProps = {
  song: Song;
  isActive: boolean;
  isPlaying: boolean;
  isWishlisted: boolean;
  onPlay: (song: Song) => void;
  onOpenDetail: (song: Song) => void;
  onToggleWishlist: (songId: string) => void;
};

export function SongBlock({ song, isActive, isPlaying, isWishlisted, onPlay, onOpenDetail, onToggleWishlist }: SongBlockProps) {
  return (
    <article className={`song-card ${isActive ? 'is-active' : ''}`}>
      <div className="song-visual">
        <div className="song-rank">{String(song.rank).padStart(2, '0')}</div>
        <div className="song-cover-wrap">
          <CoverArt className="song-cover" src={song.coverUrl} alt={`${song.title} cover`} />
          <button
            className="cover-play"
            type="button"
            onClick={() => onPlay(song)}
            onDoubleClick={() => onOpenDetail(song)}
            aria-label={`Play ${song.title}`}
          >
            {isActive && isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </button>
        </div>
      </div>
      <div className="song-details">
        <div className="song-main">
          <h3>{song.title}</h3>
          <p>{song.artist}</p>
          <div className="song-tags">
            {song.genre && <span>{song.genre}</span>}
            {song.year && <span>{song.year}</span>}
          </div>
        </div>
      </div>
      <button
        className={`wishlist-button ${isWishlisted ? 'is-saved' : ''}`}
        type="button"
        onClick={() => onToggleWishlist(song.id)}
        aria-label={`${isWishlisted ? 'Remove from' : 'Add to'} wishlist`}
      >
        <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
        {isWishlisted ? 'Saved' : 'Wishlist'}
      </button>
    </article>
  );
}
