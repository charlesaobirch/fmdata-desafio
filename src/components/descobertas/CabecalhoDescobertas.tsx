"use client";

import { HistoryIcon } from "@solar-icons/react/linear/history";
import { useMemo } from "react";
import { PeriodoFixo, ROTULOS_PERIODO } from "@/components/ui/SeletorPeriodo";
import { useFiltradosPor } from "@/hooks/useFiltradosPor";
import { formatarData, parseDataScrobble } from "@/lib/dates";
import type { Scrobble } from "@/types";
import { formatarNumero } from "./formatar";

/** A primeira audição com data (o histórico não vem ordenado). */
function primeiraData(scrobbles: Scrobble[]): Date | null {
  let primeira: Date | null = null;
  for (const s of scrobbles) {
    const data = parseDataScrobble(s);
    if (data && (primeira === null || data < primeira)) primeira = data;
  }
  return primeira;
}

/**
 * Agora que cada bloco de cima tem seletor, a falta dele aqui tem de
 * se ler como intenção. Diz-se uma vez, no topo da faixa: o marcador
 * com a forma do seletor mas sem escolha, o intervalo real e o porquê
 * (guia, 9.1: o que se responde mudando o período já está em cima).
 */
export function CabecalhoDescobertas() {
  const { scrobbles, referencia } = useFiltradosPor("tudo");
  const inicio = useMemo(() => primeiraData(scrobbles), [scrobbles]);

  return (
    <header className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:items-end md:gap-12">
      <h2
        id="descobertas-titulo"
        className="max-w-3xl text-balance text-3xl font-semibold tracking-tight sm:text-5xl"
      >
        Descobertas — o que os teus dados sabem sobre ti
      </h2>

      <div className="flex flex-col items-start gap-3">
        <PeriodoFixo>
          <HistoryIcon className="size-3.5" />
          {ROTULOS_PERIODO.tudo}
        </PeriodoFixo>
        {inicio && referencia && (
          <p className="text-sm font-medium tabular-nums">
            {formatarData(inicio)} a {formatarData(referencia)} ·{" "}
            {formatarNumero(scrobbles.length)} audições
          </p>
        )}
        <p className="text-pretty text-sm leading-relaxed text-foreground/75">
          Sem seletor de período, de propósito. Cada descoberta procura um
          hábito que só se vê ao longo de anos de audições. Numa janela de dias
          seria outra pergunta, e essas já estão nos blocos de cima.
        </p>
      </div>
    </header>
  );
}
