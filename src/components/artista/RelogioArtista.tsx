"use client";

import { useMemo } from "react";
import { Bloco } from "@/components/ui/Bloco";
import { calcularRelogio, FiguraRelogio } from "@/components/ui/Relogio24h";
import type { Scrobble } from "@/types";

interface Props {
  doArtista: Scrobble[];
  className?: string;
}

/**
 * Bloco 6 da página do artista: a mesma scrobblesPorHora do dashboard,
 * aplicada às audições do artista (24 buckets UTC).
 */
export function RelogioArtista({ doArtista, className }: Props) {
  const relogio = useMemo(() => calcularRelogio(doArtista), [doArtista]);

  return (
    <Bloco
      className={className}
      titulo="A que horas o ouves"
      contexto="horas em UTC"
      estado={relogio.pico === null ? "vazio" : "sucesso"}
      mensagemVazia="Nenhuma audição deste artista tem data."
    >
      <FiguraRelogio relogio={relogio} />
    </Bloco>
  );
}
