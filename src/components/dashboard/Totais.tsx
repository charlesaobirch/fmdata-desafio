"use client";

import { formatarNumero } from "@/components/descobertas/formatar";
import { Bloco } from "@/components/ui/Bloco";
import { EstadoCarregar } from "@/components/ui/EstadoCarregar";
import { totalArtistasDistintos, totalScrobbles } from "@/lib/stats";
import type { Scrobble } from "@/types";
import { useBlocoFiltrado } from "./useBlocoFiltrado";

interface Contagens {
  audicoes: number;
  artistas: number;
}

function calcularTotais(scrobbles: Scrobble[]): Contagens {
  return {
    audicoes: totalScrobbles(scrobbles),
    artistas: totalArtistasDistintos(scrobbles),
  };
}

const semAudicoes = (t: Contagens) => t.audicoes === 0;

/** Bloco 2 do dashboard: audições e artistas distintos no período. */
export function Totais({ className }: { className?: string }) {
  const { resultado: t, bloco } = useBlocoFiltrado(calcularTotais, semAudicoes);

  return (
    <Bloco
      className={className}
      titulo="Totais"
      {...bloco}
      esqueleto={<EstadoCarregar linhas={2} />}
    >
      <p className="flex flex-wrap items-baseline gap-x-8 gap-y-3 text-foreground/70">
        <span>
          <span className="text-4xl font-semibold tabular-nums tracking-tight text-foreground">
            {formatarNumero(t.audicoes)}
          </span>{" "}
          {t.audicoes === 1 ? "audição" : "audições"}
        </span>
        <span>
          de{" "}
          <span className="text-4xl font-semibold tabular-nums tracking-tight text-foreground">
            {formatarNumero(t.artistas)}
          </span>{" "}
          {t.artistas === 1 ? "artista" : "artistas distintos"}
        </span>
      </p>
    </Bloco>
  );
}
