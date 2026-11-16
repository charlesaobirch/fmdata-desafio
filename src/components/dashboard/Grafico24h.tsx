"use client";

import { Bloco } from "@/components/ui/Bloco";
import { EstadoCarregar } from "@/components/ui/EstadoCarregar";
import {
  calcularRelogio,
  FiguraRelogio,
  type Relogio,
} from "@/components/ui/Relogio24h";
import { useBlocoFiltrado } from "./useBlocoFiltrado";

// sem pico = todas as horas a zero
const semAudicoes = (r: Relogio) => r.pico === null;

/** Bloco 6 do dashboard: audições por hora do dia (UTC) no período. */
export function Grafico24h({ className }: { className?: string }) {
  const { resultado, bloco } = useBlocoFiltrado(calcularRelogio, semAudicoes);

  return (
    <Bloco
      className={className}
      titulo="A que horas ouves"
      contexto="horas em UTC"
      {...bloco}
      esqueleto={<EstadoCarregar altura="h-60" />}
    >
      <FiguraRelogio relogio={resultado} />
    </Bloco>
  );
}
