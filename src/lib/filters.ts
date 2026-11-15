import type { Periodo, Scrobble } from "../types";
import {
  dataDeReferencia,
  inicioDoPeriodo,
  parseDataScrobble,
  temDataValida,
} from "./dates";

/**
 * trim + minúsculas + sem acentos.
 * Base de todas as comparações por nome: "Beyoncé" === "beyonce".
 */
export function normalizarNome(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD") // separa acentos dos caracteres ("é" -> "e" + "́")
    .replace(/[\u0300-\u036f]/g, ""); // remove as marcas de acento
}

/**
 * Transforma texto com separadores numa lista limpa.
 * "rock, indie ,pop" -> ["rock", "indie", "pop"]
 * Funciona com vírgula (tags, similar_artists) e com ";" (tracklist_names).
 */
export function separarLista(texto: string, separador = ","): string[] {
  return texto
    .split(separador)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/** Descarta "a tocar agora" e audições sem data válida. */
export function removerSemData(scrobbles: Scrobble[]): Scrobble[] {
  return scrobbles.filter(temDataValida);
}

/**
 * Devolve só as audições dentro do período.
 * A referência (audição mais recente) é calculada sobre o array COMPLETO,
 * nunca sobre o já filtrado.
 */
export function filtrarPorPeriodo(
  scrobbles: Scrobble[],
  periodo: Periodo,
): Scrobble[] {
  if (periodo === "tudo") return scrobbles;

  const referencia = dataDeReferencia(scrobbles);
  if (referencia === null) return [];

  const inicio = inicioDoPeriodo(periodo, referencia);
  if (inicio === null) return scrobbles;

  return scrobbles.filter((scrobble) => {
    const data = parseDataScrobble(scrobble);
    if (data === null) return false; // sem data: nunca entra num período
    return data >= inicio && data <= referencia;
  });
}

/** Audições de um artista, comparando com nomes normalizados. */
export function filtrarPorArtista(
  scrobbles: Scrobble[],
  nome: string,
): Scrobble[] {
  const alvo = normalizarNome(nome);
  return scrobbles.filter(
    (scrobble) => normalizarNome(scrobble.artist_name) === alvo,
  );
}
