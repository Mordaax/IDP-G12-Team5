export type GenreKey = 'indie' | 'pop' | 'mandopop' | 'electronic' | 'hiphop' | 'ethnic';

export interface Genre {
  key: GenreKey;
  name: string;
  dot: string;    // dot / swatch colour
  label: string;  // darker shade used for the cluster labels on the graph
}

// Order matches the filter list and legend in Figma.
export const GENRES: Genre[] = [
  { key: 'indie',      name: 'Indie Rock',               dot: '#4e6df5', label: '#4b69eb' },
  { key: 'pop',        name: 'Pop Music',                dot: '#8b5cf6', label: '#8356e7' },
  { key: 'mandopop',   name: 'Contemporary Mandopop',    dot: '#ec6a9c', label: '#b8537a' },
  { key: 'electronic', name: 'Electronic',               dot: '#0fb3a1', label: '#0b8174' },
  { key: 'hiphop',     name: 'Hip-Hop',                  dot: '#f5a524', label: '#9d6a17' },
  { key: 'ethnic',     name: 'Traditional Ethnic Music', dot: '#3fa96a', label: '#318453' },
];

export const GENRE_BY_KEY = Object.fromEntries(GENRES.map((g) => [g.key, g])) as Record<GenreKey, Genre>;
