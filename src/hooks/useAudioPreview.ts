import { useEffect, useRef, useState } from 'react';
import type { PlayerState, Song } from '../types';

const PREVIEW_SECONDS = 15;

export function useAudioPreview() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedAtRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const [state, setState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    progress: 0,
    message: '',
  });

  const stopTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopCurrent = () => {
    stopTimer();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setState((prev) => ({ ...prev, isPlaying: false, progress: 0 }));
  };

  const startTimer = () => {
    stopTimer();
    startedAtRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startedAtRef.current) / 1000;
      const progress = Math.min(100, (elapsed / PREVIEW_SECONDS) * 100);
      setState((prev) => ({ ...prev, progress }));
      if (elapsed >= PREVIEW_SECONDS) {
        stopCurrent();
      }
    }, 150);
  };

  const playSong = (song: Song) => {
    if (!song.previewUrl) {
      stopCurrent();
      setState({ currentSong: song, isPlaying: false, progress: 0, message: '' });
      return;
    }

    if (state.currentSong?.id === song.id && audioRef.current) {
      if (state.isPlaying) {
        audioRef.current.pause();
        stopTimer();
        setState((prev) => ({ ...prev, isPlaying: false, message: '' }));
      } else {
        audioRef.current.play();
        startTimer();
        setState((prev) => ({ ...prev, isPlaying: true, message: '' }));
      }
      return;
    }

    stopCurrent();
    const audio = new Audio(song.previewUrl);
    audioRef.current = audio;
    audio.addEventListener('ended', stopCurrent, { once: true });
    audio.play()
      .then(() => {
        startTimer();
        setState({ currentSong: song, isPlaying: true, progress: 0, message: '' });
      })
      .catch(() => {
        setState({ currentSong: song, isPlaying: false, progress: 0, message: '' });
      });
  };

  useEffect(() => stopCurrent, []);

  return {
    ...state,
    playSong,
    stopCurrent,
  };
}
