"use client";

import { useMemo } from "react";
import { filtrarPorArtista, removerSemData } from "../lib/filters";
import type { Scrobble, Status } from "../types";
import { useFiltradosPor } from "./useFiltradosPor";

/**
 * Scrobbles de um artista a partir do histórico COMPLETO, sem filtro
 * de período: a página do artista é all-time.
 *
 * Duas perguntas, duas bases:
 * - existe? → o histórico todo, com ou sem data: um artista só com
 *   audições sem data abre (com os blocos vazios), não é "não encontrado";
 * - quantas? → só audições com data, a mesma base do dashboard, para os
 *   números e as percentagens baterem nas duas páginas.
 */
export function useScrobblesDoArtista(nome: string): {
  /** As audições do artista com data: a base de todas as contas. */
  doArtista: Scrobble[];
  /** O histórico com data (base das percentagens, como no dashboard). */
  comData: Scrobble[];
  /** O histórico completo, com ou sem data. */
  todos: Scrobble[];
  /** O artista aparece no histórico, com ou sem data. */
  existe: boolean;
  /** O nome como está nos dados (o que a API reconhece). */
  nomeCanonico: string | null;
  status: Status;
  error: string | null;
  recarregar: () => void;
} {
  const {
    scrobbles: comData,
    todos,
    status,
    error,
    recarregar,
  } = useFiltradosPor("tudo");

  const { doArtista, existe, nomeCanonico } = useMemo(() => {
    const todasDele = filtrarPorArtista(todos, nome);
    return {
      existe: todasDele.length > 0,
      nomeCanonico: todasDele[0]?.artist_name ?? null,
      doArtista: removerSemData(todasDele),
    };
  }, [todos, nome]);

  return {
    doArtista,
    comData,
    todos,
    existe,
    nomeCanonico,
    status,
    error,
    recarregar,
  };
}
