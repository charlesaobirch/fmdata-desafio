import type { ItemRanking, Scrobble } from "../types";
import { horaUTC, parseDataScrobble } from "./dates";
import { normalizarNome, separarLista } from "./filters";

/* ---------- Motor genérico de contagens ---------- */

/** Conta ocorrências de uma chave extraída de cada item. */
export function contarPor<T>(
  itens: T[],
  chave: (item: T) => string,
): Map<string, number> {
  const contagens = new Map<string, number>();

  for (const item of itens) {
    const k = chave(item);
    if (k === "") continue; // chaves vazias não contam
    contagens.set(k, (contagens.get(k) ?? 0) + 1);
  }

  return contagens;
}

/**
 * Para cada chave, um exemplo real do array — serve para mostrar o
 * nome original (não o normalizado) e a imagem de cada entrada.
 */
export function exemplosDe(
  scrobbles: Scrobble[],
  chave: (s: Scrobble) => string,
): Map<string, Scrobble> {
  const exemplos = new Map<string, Scrobble>();
  for (const s of scrobbles) {
    const k = chave(s);
    if (k !== "" && !exemplos.has(k)) exemplos.set(k, s);
  }
  return exemplos;
}

/**
 * Converte um Map de contagens num ranking ordenado.
 * Empates: ordem alfabética pela chave, para o ranking ser estável
 * entre renders.
 */
export function paraRanking(
  contagens: Map<string, number>,
  limite: number,
): ItemRanking[] {
  return [...contagens.entries()]
    .sort(([chaveA, contA], [chaveB, contB]) => {
      if (contB !== contA) return contB - contA; // contagem, do maior
      return chaveA.localeCompare(chaveB); // desempate alfabético
    })
    .slice(0, limite)
    .map(([chave, contagem]) => ({ chave, nome: chave, contagem }));
}

/* ---------- Totais ---------- */

export function totalScrobbles(scrobbles: Scrobble[]): number {
  return scrobbles.length;
}

/** Artistas distintos por nome normalizado ("Adele" e "adele " são um). */
export function totalArtistasDistintos(scrobbles: Scrobble[]): number {
  const artistas = new Set(scrobbles.map((s) => normalizarNome(s.artist_name)));
  return artistas.size;
}

/* ---------- Rankings do dashboard ---------- */

export function topArtistas(scrobbles: Scrobble[], n = 20): ItemRanking[] {
  const chaveDoArtista = (s: Scrobble) => normalizarNome(s.artist_name);
  const contagens = contarPor(scrobbles, chaveDoArtista);
  const exemplos = exemplosDe(scrobbles, chaveDoArtista);

  return paraRanking(contagens, n).map((item) => {
    const exemplo = exemplos.get(item.chave);
    return {
      ...item,
      nome: exemplo?.artist_name ?? item.nome,
      imagem: exemplo?.image_url ?? null,
    };
  });
}

export function topMusicas(scrobbles: Scrobble[], n = 10): ItemRanking[] {
  // chave artista + faixa: duas músicas com o mesmo título de
  // artistas diferentes NÃO são a mesma música
  const chaveDaMusica = (s: Scrobble) =>
    `${normalizarNome(s.artist_name)}::${normalizarNome(s.track_name)}`;

  const contagens = contarPor(scrobbles, chaveDaMusica);
  const exemplos = exemplosDe(scrobbles, chaveDaMusica);

  return paraRanking(contagens, n).map((item) => {
    const exemplo = exemplos.get(item.chave);
    return {
      ...item,
      nome: exemplo?.track_name ?? item.nome,
      subtitulo: exemplo?.artist_name,
      imagem: exemplo?.image_url ?? null,
    };
  });
}

export function topAlbuns(scrobbles: Scrobble[], n = 8): ItemRanking[] {
  // scrobbles sem álbum têm album_name "" → chave "artista::" nunca é
  // vazia, por isso o guarda do contarPor não apanha; filtramos aqui
  const comAlbum = scrobbles.filter((s) => s.album_name.trim() !== "");
  const chaveDoAlbum = (s: Scrobble) =>
    `${normalizarNome(s.artist_name)}::${normalizarNome(s.album_name)}`;

  const contagens = contarPor(comAlbum, chaveDoAlbum);
  const exemplos = exemplosDe(comAlbum, chaveDoAlbum);

  return paraRanking(contagens, n).map((item) => {
    const exemplo = exemplos.get(item.chave);
    return {
      ...item,
      nome: exemplo?.album_name ?? item.nome,
      subtitulo: exemplo?.artist_name,
      imagem: exemplo?.image_url ?? null,
    };
  });
}

/* ---------- Gráfico 24h ---------- */

/**
 * Sempre 24 posições (0-23 UTC), com 0 nas horas sem audições —
 * o gráfico precisa das 24 barras mesmo quando há buracos.
 */
export function scrobblesPorHora(scrobbles: Scrobble[]): number[] {
  const porHora = new Array<number>(24).fill(0);

  for (const s of scrobbles) {
    const data = parseDataScrobble(s);
    if (data === null) continue;
    porHora[horaUTC(data)] += 1;
  }

  return porHora;
}

/** Índice da hora com mais audições; null se tudo for zero. */
export function horaDePico(porHora: number[]): number | null {
  let indice = -1;
  let maximo = 0;

  porHora.forEach((contagem, i) => {
    if (contagem > maximo) {
      maximo = contagem;
      indice = i;
    }
  });

  return indice >= 0 ? indice : null;
}

/* ---------- Género ---------- */

/** O género (tag) mais contado; null se não houver tags. */
export function generoMaisOuvido(
  scrobbles: Scrobble[],
): { genero: string; contagem: number } | null {
  // cada audição contribui para TODAS as suas tags
  const contagens = new Map<string, number>();

  for (const s of scrobbles) {
    for (const tag of separarLista(s.tags)) {
      const k = tag.toLowerCase(); // "Rock" e "rock" contam juntas
      contagens.set(k, (contagens.get(k) ?? 0) + 1);
    }
  }

  if (contagens.size === 0) return null;

  let melhor: [string, number] | null = null;
  for (const entrada of contagens.entries()) {
    if (
      melhor === null ||
      entrada[1] > melhor[1] ||
      (entrada[1] === melhor[1] && entrada[0] < melhor[0]) // desempate alfabético
    ) {
      melhor = entrada;
    }
  }

  return melhor ? { genero: melhor[0], contagem: melhor[1] } : null;
}
