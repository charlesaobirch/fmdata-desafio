import type { Scrobble } from "../types";
import { normalizarNome } from "./filters";

/* ---------- 1 · A maratona ---------- */

export interface Maratona {
  faixa: string;
  artista: string;
  vezes: number;
}

/**
 * A maior sequência da MESMA faixa tocada seguidas vezes.
 * Ordena por data porque a ordem do ficheiro não é garantida.
 * Ignora reproduções sem data (nowplaying): não se sabe onde
 * encaixam na sequência.
 */
export function maiorSequenciaRepetida(
  scrobbles: Scrobble[],
): Maratona | null {
  const ordenados = scrobbles
    .filter((s): s is Scrobble & { date_uts: number } => s.date_uts !== null)
    .sort((a, b) => a.date_uts - b.date_uts);

  if (ordenados.length === 0) return null;

  const chave = (s: Scrobble) =>
    `${normalizarNome(s.artist_name)}::${normalizarNome(s.track_name)}`;

  let melhor: Maratona = {
    faixa: ordenados[0].track_name,
    artista: ordenados[0].artist_name,
    vezes: 1,
  };
  let corrente = 1;

  for (let i = 1; i < ordenados.length; i += 1) {
    if (chave(ordenados[i]) === chave(ordenados[i - 1])) {
      corrente += 1;
      if (corrente > melhor.vezes) {
        melhor = {
          faixa: ordenados[i].track_name,
          artista: ordenados[i].artist_name,
          vezes: corrente,
        };
      }
    } else {
      corrente = 1;
    }
  }

  return melhor;
}