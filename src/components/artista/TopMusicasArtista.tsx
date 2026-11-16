"use client";

import { useMemo } from "react";
import { formatarNumero } from "@/components/descobertas/formatar";
import { Bloco } from "@/components/ui/Bloco";
import { Capa } from "@/components/ui/Capa";
import { topMusicasDoArtista } from "@/lib/artist";
import type { Scrobble } from "@/types";

interface Props {
  doArtista: Scrobble[];
  className?: string;
}

/** Bloco 3 da página do artista: as 10 faixas mais ouvidas. */
export function TopMusicasArtista({ doArtista, className }: Props) {
  const musicas = useMemo(() => topMusicasDoArtista(doArtista), [doArtista]);

  return (
    <Bloco
      className={className}
      titulo="Top 10 músicas"
      estado={musicas.length === 0 ? "vazio" : "sucesso"}
      mensagemVazia="Sem músicas para mostrar."
    >
      <ol className="flex flex-col gap-3">
        {musicas.map((m, i) => (
          <li key={m.chave} className="flex items-center gap-3">
            <span className="w-5 shrink-0 text-right text-sm tabular-nums text-foreground/60">
              {i + 1}
            </span>
            <div className="relative size-11 shrink-0 overflow-hidden rounded-lg">
              <Capa
                src={m.imagem}
                alt={`Capa de ${m.nome}`}
                nome={m.nome}
                sizes="44px"
              />
            </div>
            <p className="min-w-0 flex-1 truncate font-medium">{m.nome}</p>
            <p className="shrink-0 text-sm tabular-nums text-foreground/70">
              {formatarNumero(m.contagem)}{" "}
              {m.contagem === 1 ? "audição" : "audições"}
            </p>
          </li>
        ))}
      </ol>
    </Bloco>
  );
}
