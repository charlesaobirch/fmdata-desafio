"use client";

import { formatarPercentagem } from "@/components/descobertas/formatar";
import { Bloco } from "@/components/ui/Bloco";
import { EstadoCarregar } from "@/components/ui/EstadoCarregar";
import { type GeneroNoTop, topGeneros } from "@/lib/stats";
import { useBlocoFiltrado } from "./useBlocoFiltrado";

const semGeneros = (generos: GeneroNoTop[]) => generos.length === 0;

/**
 * Bloco 7 do dashboard: o género (tag) mais ouvido no período, em
 * manchete, e o top 5 com a fatia das audições que tem cada etiqueta.
 * Uma audição pode ter várias tags: as percentagens não somam 100.
 */
export function GeneroMaisOuvido({ className }: { className?: string }) {
  const { resultado: generos, bloco } = useBlocoFiltrado(
    topGeneros,
    semGeneros,
  );
  const maior = generos[0]?.percentagem ?? 0;

  return (
    <Bloco
      className={className}
      titulo="Género mais ouvido"
      contexto="% das audições com a etiqueta"
      {...bloco}
      esqueleto={<EstadoCarregar linhas={4} />}
      mensagemVazia="Sem géneros para mostrar neste período: as audições não têm etiquetas. Escolhe um período maior no topo do bloco."
      mensagemVaziaHistorico="As tuas audições não têm etiquetas de género."
    >
      {generos.length > 0 && (
        <div className="flex flex-col gap-4">
          <p className="text-3xl font-semibold capitalize tracking-tight">
            {generos[0].genero}
          </p>
          <ol className="flex flex-col gap-2.5 text-sm">
            {generos.map((g, i) => (
              <li key={g.genero} className="flex flex-col gap-1">
                <p className="flex items-baseline gap-2">
                  <span className="w-3 shrink-0 text-right tabular-nums text-foreground/60">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate capitalize">
                    {g.genero}
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">
                    {formatarPercentagem(g.percentagem)}
                  </span>
                </p>
                {/* barra relativa ao primeiro: a ordem lê-se sem números */}
                <span
                  aria-hidden="true"
                  className="ml-5 h-1 rounded-full bg-foreground/10"
                >
                  <span
                    className={`block h-full rounded-full ${
                      i === 0 ? "bg-destaque" : "bg-foreground/40"
                    }`}
                    style={{
                      width: `${maior ? (g.percentagem / maior) * 100 : 0}%`,
                    }}
                  />
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Bloco>
  );
}
