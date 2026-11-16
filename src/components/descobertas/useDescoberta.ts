"use client";

import { useMemo } from "react";
import { useScrobbles } from "@/hooks/useScrobbles";
import type { Scrobble } from "@/types";

export type EstadoDescoberta = "loading" | "erro" | "vazio" | "sucesso";

/**
 * Liga uma função pura de lib/analise.ts ao histórico completo.
 *
 * As descobertas são sobre o histórico todo, por isso usam
 * useScrobbles e ignoram o seletor de período. `calcular` e
 * `estaVazio` têm de ser estáveis (funções de módulo), senão o
 * useMemo recalcula a cada render sobre dezenas de milhares de
 * audições.
 *
 * Devolve o resultado e, em `cartao`, as props de estado prontas a
 * passar ao PainelDescoberta.
 */
export function useDescoberta<T>(
  calcular: (scrobbles: Scrobble[]) => T | null,
  estaVazio?: (resultado: T) => boolean,
) {
  const { data, status, error, recarregar } = useScrobbles();

  const resultado = useMemo(
    () => (status === "success" ? calcular(data) : null),
    [calcular, data, status],
  );

  let estado: EstadoDescoberta;
  if (status === "idle" || status === "loading") estado = "loading";
  else if (status === "error" || status === "not-found") estado = "erro";
  else if (resultado === null || estaVazio?.(resultado)) estado = "vazio";
  else estado = "sucesso";

  return {
    resultado: estado === "sucesso" ? resultado : null,
    cartao: { estado, erro: error, aoRepetir: recarregar },
  };
}
