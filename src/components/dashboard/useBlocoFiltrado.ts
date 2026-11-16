"use client";

import { useMemo } from "react";
import { estadoDe } from "@/components/ui/estado";
import { useFiltrados } from "@/hooks/useFiltrados";
import type { Scrobble } from "@/types";

/**
 * A receita de cada bloco do dashboard (guia, 7.2): useFiltrados() dá
 * os scrobbles do período, uma função pura calcula dentro de useMemo,
 * e o resultado vem com o estado do bloco.
 *
 * `calcular` e `estaVazio` têm de ser estáveis (funções de módulo),
 * senão o useMemo recalcula a cada render.
 */
export function useBlocoFiltrado<T>(
  calcular: (scrobbles: Scrobble[]) => T,
  estaVazio: (resultado: T) => boolean,
) {
  const { scrobbles, status, error, recarregar } = useFiltrados();

  const resultado = useMemo(() => calcular(scrobbles), [calcular, scrobbles]);

  return {
    resultado,
    bloco: {
      estado: estadoDe(status, estaVazio(resultado)),
      erro: error,
      aoRepetir: recarregar,
    },
  };
}
