import type { Song } from './types';

declare global {
  interface Window {
    _hmt?: unknown[][];
  }
}

const BAIDU_TONGJI_ID = '7c242651ccf497067a1bcbdf89f698e0';

export function initBaiduAnalytics() {
  if (typeof window === 'undefined') return;
  if (document.querySelector(`script[src*="${BAIDU_TONGJI_ID}"]`)) return;

  window._hmt = window._hmt || [];

  const script = document.createElement('script');
  script.src = `https://hm.baidu.com/hm.js?${BAIDU_TONGJI_ID}`;
  script.async = true;

  const firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode?.insertBefore(script, firstScript);
}

export function trackBaiduEvent(category: string, action: string, label?: string, value?: number) {
  if (typeof window === 'undefined') return;
  window._hmt = window._hmt || [];
  window._hmt.push(['_trackEvent', category, action, label || '', value || 0]);
}

export function trackSongEvent(action: string, song: Song) {
  trackBaiduEvent('song', action, `${song.title} - ${song.artist}`, song.rank);
}
