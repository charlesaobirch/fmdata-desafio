"use client";

import { useMemo } from "react";
import { dataDeReferencia } from "../lib/dates";
import { filtrarPorPeriodo, removerSemData } from "../lib/filters";
import type { Scrobble, Status } from "../types";
import { usePeriodo } from "./usePeriodo";
import { useScrobbles } from "./useScrobbles";

/**
 * O hook que o dashboard inteiro consome:
 * dados limpos (sem nowplaying/sem data) e já filtrados pelo período.
 * O useMemo evita refazer o filtro (sobre milhares de registos)
 * em cada render.
 */
export function useFiltrados(): {
  scrobbles: Scrobble[];
  todos: Scrobble[];
  referencia: Date | null;
  status: Status;
  error: string | null;
  recarregar: () => void;
} {
  const { data: todos, status, error, recarregar } = useScrobbles();
  const { periodo } = usePeriodo();

  const { scrobbles, referencia } = useMemo(() => {
    const limpos = removerSemData(todos);
    // a referência (audição mais recente) vem dos dados completos
    return {
      scrobbles: filtrarPorPeriodo(limpos, periodo),
      referencia: dataDeReferencia(limpos),
    };
  }, [todos, periodo]);

  return { scrobbles, todos, referencia, status, error, recarregar };
}
