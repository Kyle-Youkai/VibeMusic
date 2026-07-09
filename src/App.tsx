import { useEffect, useState } from 'react';
import { PlaylistPage } from './components/PlaylistPage';
import type { PlaylistPayload } from './types';

export default function App() {
  const [payload, setPayload] = useState<PlaylistPayload | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/playlist.json`)
      .then((response) => {
        if (!response.ok) throw new Error('Playlist data has not been generated yet.');
        return response.json();
      })
      .then(setPayload)
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) {
    return (
      <main className="empty-state">
        <p>{error}</p>
        <span>Run npm run generate:data, then restart the development server.</span>
      </main>
    );
  }

  if (!payload) {
    return <main className="empty-state">Loading playlist...</main>;
  }

  return <PlaylistPage payload={payload} />;
}
