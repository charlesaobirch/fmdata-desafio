"use client";

import { useMemo } from "react";
import { useScrobbles } from "@/hooks/useScrobbles";
import type { Scrobble } from "@/types";

/**
 * Liga uma função pura de lib/analise.ts ao histórico completo.
 *
 * As descobertas são sobre o histórico todo, por isso usam
 * useScrobbles e ignoram o seletor de período. `calcular` tem de ser
 * estável (uma função de módulo), senão o useMemo recalcula a cada
 * render sobre dezenas de milhares de audições.
 */
export function useDescoberta<T>(
  calcular: (scrobbles: Scrobble[]) => T | null,
) {
  const { data, status } = useScrobbles();

  const resultado = useMemo(
    () => (status === "success" ? calcular(data) : null),
    [calcular, data, status],
  );

  return { resultado };
}
