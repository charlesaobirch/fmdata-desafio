export interface Scrobble {
  track_name: string;
  artist_name: string;
  album_name: string;

  date_iso: string | null;
  date_uts: number | null;

  tags: string;
  loved: 0 | 1;

  image_url: string | null;
  nowplaying: boolean;

  // Campos extra que a API devolve mas que as funções do domínio não usam
  artist_mbid?: string;
  album_mbid?: string;
  track_mbid?: string;
  track_url?: string;
}

/* ---------- Tipos da API (perfis) ---------- */

export interface ArtistInfo {
  name: string;
  image_url: string;
  tags: string;
  listeners_global: number;
  bio_summary: string;
  bio_content: string;
  similar_artists: string;
  url_lastfm: string;
  url_wikipedia: string | null;
  url_musicbrainz: string | null;
}

export interface AlbumInfo {
  album_name: string;
  artist_name: string;
  image_url: string;
  track_count: number;
  tracklist_names: string;
  tags: string;
  release_date: string;
}

/* ---------- Tipos do domínio ---------- */

type Periodo = "tudo" | "30d" | "14d" | "7d" | "24h";
export type { Periodo };

// Estado de qualquer dado que vem da rede: idle (ainda não pedido),
// loading, success, error ou not-found (artista/álbum não existe)
type Status = "idle" | "loading" | "success" | "error" | "not-found";
export type { Status };

/** Envelope com a mesma forma para qualquer resposta da rede. */
interface Entry<T> {
  data: T | null;
  status: Status;
  error: string | null;
  updatedAt: number | null;
}
export type { Entry };

/** Linha de um ranking (top artistas, top músicas, top álbuns). */
export interface ItemRanking {
  chave: string; // identificador único (ex.: "artista::faixa")
  nome: string; // o que se mostra
  subtitulo?: string; // ex.: artista de uma faixa
  contagem: number;
  imagem?: string | null;
}

/** Ponto do gráfico de scrobbles por mês. */
export interface PontoMensal {
  mes: string; // "2024-03"
  contagem: number;
}

/** Artista semelhante, marcado com "ouvido" se existir nos nossos scrobbles. */
export interface ArtistaSemelhante {
  nome: string;
  ouvido: boolean;
}
