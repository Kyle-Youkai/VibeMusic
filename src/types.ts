export type Song = {
  id: string;
  rank: number;
  sourceNumber: number;
  title: string;
  artist: string;
  album: string;
  coverUrl: string | null;
  previewUrl: string | null;
  duration: string | null;
  genre: string | null;
  year: string | null;
  rating: number | null;
  ratingCount: number | null;
  want: number | null;
  have: number | null;
  popularityScore: number;
  releaseUrl: string | null;
};

export type PlaylistPayload = {
  playlist: {
    label: string;
    title: string;
    description: string;
    updated: string;
    sourceFile: string;
    sourceSheet: string;
    selectionMethod: string;
  };
  songs: Song[];
};

export type PlayerState = {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  message: string;
};
