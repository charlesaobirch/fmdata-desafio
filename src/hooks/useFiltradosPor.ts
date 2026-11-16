"use client";

import { useMemo } from "react";
import { dataDeReferencia } from "../lib/dates";
import { filtrarPorPeriodo, removerSemData } from "../lib/filters";
import type { Periodo, Scrobble, Status } from "../types";
import { useScrobbles } from "./useScrobbles";

interface Filtrados {
  scrobbles: Scrobble[];
  referencia: Date | null;
}

interface CalculosDoHistorico {
  limpos: Scrobble[];
  referencia: Date | null;
  porPeriodo: Map<Periodo, Scrobble[]>;
}

/*
 * Cache partilhada por todos os blocos, indexada pelo array do
 * histórico: limpar (removerSemData) e achar a referência faz-se uma
 * vez; cada período filtra-se uma vez, e os blocos com o mesmo período
 * recebem o MESMO array (guia, armadilha 12 da secção 15). WeakMap:
 * quando o histórico é recarregado, o array antigo e os seus cálculos
 * ficam livres para o garbage collector.
 */
const cache = new WeakMap<Scrobble[], CalculosDoHistorico>();

/** O cálculo puro por trás do hook (exportado para se poder testar). */
export function filtradosPor(todos: Scrobble[], periodo: Periodo): Filtrados {
  let calculos = cache.get(todos);
  if (!calculos) {
    const limpos = removerSemData(todos);
    calculos = {
      limpos,
      // a referência (audição mais recente) vem dos dados completos
      referencia: dataDeReferencia(limpos),
      porPeriodo: new Map(),
    };
    cache.set(todos, calculos);
  }

  let scrobbles = calculos.porPeriodo.get(periodo);
  if (!scrobbles) {
    scrobbles = filtrarPorPeriodo(calculos.limpos, periodo);
    calculos.porPeriodo.set(periodo, scrobbles);
  }

  return { scrobbles, referencia: calculos.referencia };
}

/**
 * Dados limpos (sem nowplaying/sem data) e filtrados pelo período
 * pedido. Cada bloco passa o seu próprio período; blocos com o mesmo
 * período partilham o cálculo através da cache acima.
 */
export function useFiltradosPor(periodo: Periodo): {
  scrobbles: Scrobble[];
  todos: Scrobble[];
  referencia: Date | null;
  status: Status;
  error: string | null;
  recarregar: () => void;
} {
  const { data: todos, status, error, recarregar } = useScrobbles();

  const { scrobbles, referencia } = useMemo(
    () => filtradosPor(todos, periodo),
    [todos, periodo],
  );

  return { scrobbles, todos, referencia, status, error, recarregar };
}
