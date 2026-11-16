"use client";

import { HeartIcon } from "@solar-icons/react/linear/heart";
import { useMemo } from "react";
import {
  formatarNumero,
  formatarPercentagem,
} from "@/components/descobertas/formatar";
import { Bloco } from "@/components/ui/Bloco";
import { resumoDoArtista } from "@/lib/artist";
import type { Scrobble } from "@/types";

interface Props {
  doArtista: Scrobble[];
  todos: Scrobble[];
  className?: string;
}

/** Bloco 2 da página do artista: os números de resumoDoArtista. */
export function EstatisticasArtista({ doArtista, todos, className }: Props) {
  const r = useMemo(
    () => resumoDoArtista(doArtista, todos),
    [doArtista, todos],
  );

  const cartoes = [
    { rotulo: "Audições", valor: formatarNumero(r.totalAudicoes) },
    {
      rotulo: "Do teu total",
      valor: formatarPercentagem(r.percentagemDoTotal),
    },
    {
      rotulo: "Faixas favoritas",
      valor: formatarNumero(r.faixasFavoritas),
      icone: <HeartIcon className="size-3.5" />,
    },
    // null quando nenhuma audição tem data: nunca "Invalid Date"
    { rotulo: "Primeira audição", valor: r.primeiraReproducao ?? "Sem data" },
    { rotulo: "Última audição", valor: r.ultimaReproducao ?? "Sem data" },
  ];

  return (
    <Bloco
      className={className}
      titulo="Em números"
      contexto="todo o histórico"
      // só audições com data contam: sem nenhuma, não há números a mostrar
      estado={r.totalAudicoes === 0 ? "vazio" : "sucesso"}
      mensagemVazia="Nenhuma audição deste artista tem data, por isso ficam fora das contas."
    >
      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-5">
        {cartoes.map((c) => (
          <div key={c.rotulo} className="flex flex-col gap-1">
            <dt className="flex items-center gap-1 text-xs text-foreground/70">
              {"icone" in c && c.icone}
              {c.rotulo}
            </dt>
            <dd className="text-2xl font-semibold tabular-nums tracking-tight text-destaque-texto">
              {c.valor}
            </dd>
          </div>
        ))}
      </dl>
    </Bloco>
  );
}
