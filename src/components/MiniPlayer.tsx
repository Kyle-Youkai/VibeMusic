import { Info, Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { CoverArt } from './CoverArt';
import type { Song } from '../types';

type MiniPlayerProps = {
  song: Song | null;
  isPlaying: boolean;
  progress: number;
  message: string;
  className?: string;
  onToggle: (song: Song) => void;
  onPrevious: () => void;
  onNext: () => void;
  onDetail: (song: Song) => void;
};

export function MiniPlayer({ song, isPlaying, progress, message, className = '', onToggle, onPrevious, onNext, onDetail }: MiniPlayerProps) {
  return (
    <footer className={`mini-player ${className}`} aria-live="polite">
      {song ? (
        <>
          <button className="mini-now" type="button" onClick={() => onDetail(song)} aria-label={`Open details for ${song.title}`}>
            <CoverArt className="mini-cover" src={song.coverUrl} alt={`${song.title} cover`} />
            <div className="mini-meta">
              <strong>{song.title}</strong>
              <span>{song.artist}</span>
            </div>
          </button>
          <div className="mini-controls" aria-label="Playback controls">
            <button type="button" onClick={onPrevious} aria-label="Previous song">
              <SkipBack size={18} fill="currentColor" />
            </button>
            <button className="mini-toggle" type="button" onClick={() => onToggle(song)} aria-label="Toggle preview">
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>
            <button type="button" onClick={onNext} aria-label="Next song">
              <SkipForward size={18} fill="currentColor" />
            </button>
          </div>
          <div className="mini-progress" aria-label="Preview progress">
            <span style={{ width: `${progress}%` }} />
          </div>
          <p>{isPlaying ? 'Playing 15-second preview' : message ? 'Ready' : 'Ready'}</p>
          <div className="mini-actions" aria-label="Player actions">
            <button type="button" aria-label="Volume">
              <Volume2 size={18} />
            </button>
            <button type="button" onClick={() => onDetail(song)} aria-label="Open song details">
              <Info size={18} />
            </button>
          </div>
        </>
      ) : (
        <p className="mini-idle">Select a song preview</p>
      )}
    </footer>
  );
}
