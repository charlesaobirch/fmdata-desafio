"use client";

import { formatarNumero } from "@/components/descobertas/formatar";
import { Bloco } from "@/components/ui/Bloco";
import { EstadoCarregar } from "@/components/ui/EstadoCarregar";
import { generoMaisOuvido } from "@/lib/stats";
import type { Scrobble } from "@/types";
import { useBlocoFiltrado } from "./useBlocoFiltrado";

interface Genero {
  genero: string;
  contagem: number;
  total: number;
}

/** O género do período e o total de audições, para a percentagem. */
function calcularGenero(scrobbles: Scrobble[]): Genero | null {
  const g = generoMaisOuvido(scrobbles);
  return g ? { ...g, total: scrobbles.length } : null;
}

const semGenero = (g: Genero | null) => g === null;

/** Bloco 7 do dashboard: o género (tag) mais ouvido no período. */
export function GeneroMaisOuvido() {
  const { resultado: g, bloco } = useBlocoFiltrado(calcularGenero, semGenero);

  return (
    <Bloco
      titulo="Género mais ouvido"
      {...bloco}
      esqueleto={<EstadoCarregar linhas={2} />}
      mensagemVazia="Sem géneros para mostrar neste período: as audições não têm etiquetas. Experimenta um período maior."
    >
      {g && (
        <div className="flex flex-col gap-1">
          <p className="text-3xl font-semibold capitalize tracking-tight">
            {g.genero}
          </p>
          <p className="text-sm text-foreground/70">
            em{" "}
            <span className="font-medium tabular-nums text-foreground">
              {formatarNumero(g.contagem)}
            </span>{" "}
            de {formatarNumero(g.total)} audições deste período (
            {Math.round((g.contagem / g.total) * 100)}%)
          </p>
        </div>
      )}
    </Bloco>
  );
}
