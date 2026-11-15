"use client";

import { useMemo } from "react";
import { filtrarPorArtista } from "../lib/filters";
import type { Scrobble, Status } from "../types";
import { useScrobbles } from "./useScrobbles";

/**
 * Scrobbles de um artista a partir do histórico COMPLETO,
 * sem filtro de período: a página do artista é all-time.
 */
export function useScrobblesDoArtista(nome: string): {
  doArtista: Scrobble[];
  todos: Scrobble[];
  status: Status;
} {
  const { data: todos, status } = useScrobbles();

  const doArtista = useMemo(
    () => filtrarPorArtista(todos, nome),
    [todos, nome],
  );

  return { doArtista, todos, status };
}
