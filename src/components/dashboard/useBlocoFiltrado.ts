"use client";

import { useMemo, useState } from "react";
import { estadoDe } from "@/components/ui/estado";
import { useFiltradosPor } from "@/hooks/useFiltradosPor";
import type { Periodo, Scrobble } from "@/types";

/**
 * A receita de cada bloco do dashboard (guia, 7.2): useFiltradosPor
 * dá os scrobbles do período, uma função pura calcula dentro de
 * useMemo, e o resultado vem com o estado do bloco.
 *
 * Cada bloco guarda o SEU período em estado local: mudar um não toca
 * nos outros. Os que coincidem no período partilham o filtro (cache do
 * useFiltradosPor); só o cálculo próprio de cada bloco corre à parte.
 *
 * `calcular` e `estaVazio` têm de ser estáveis (funções de módulo),
 * senão o useMemo recalcula a cada render.
 */
export function useBlocoFiltrado<T>(
  calcular: (scrobbles: Scrobble[]) => T,
  estaVazio: (resultado: T) => boolean,
) {
  const [periodo, setPeriodo] = useState<Periodo>("tudo");
  const { scrobbles, status } = useFiltradosPor(periodo);

  const resultado = useMemo(() => calcular(scrobbles), [calcular, scrobbles]);

  return {
    resultado,
    bloco: {
      // o histórico falhou: o aviso único no topo fala por todos os blocos
      estado:
        status === "error"
          ? ("sem-historico" as const)
          : estadoDe(status, estaVazio(resultado)),
      periodo,
      aoMudarPeriodo: setPeriodo,
    },
  };
}
