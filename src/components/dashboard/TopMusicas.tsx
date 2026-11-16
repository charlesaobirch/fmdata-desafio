"use client";

import Link from "next/link";
import { caminhoDoArtista } from "@/components/artista/caminho";
import { formatarNumero } from "@/components/descobertas/formatar";
import { Bloco } from "@/components/ui/Bloco";
import { Capa } from "@/components/ui/Capa";
import { EsqueletoLista } from "@/components/ui/EsqueletoLista";
import { topMusicas } from "@/lib/stats";
import type { ItemRanking } from "@/types";
import { useBlocoFiltrado } from "./useBlocoFiltrado";

const semMusicas = (musicas: ItemRanking[]) => musicas.length === 0;

/** Bloco 4 do dashboard: as 10 faixas mais ouvidas no período. */
export function TopMusicas({ className }: { className?: string }) {
  const { resultado: musicas, bloco } = useBlocoFiltrado(
    topMusicas,
    semMusicas,
  );

  return (
    <Bloco
      className={className}
      titulo="Top 10 músicas"
      {...bloco}
      esqueleto={<EsqueletoLista linhas={5} />}
      mensagemVazia="Sem músicas neste período. Experimenta um período maior."
    >
      <ol className="flex flex-col gap-3">
        {musicas.map((m, i) => (
          <li key={m.chave} className="flex items-center gap-3">
            <span className="w-5 shrink-0 text-right text-sm tabular-nums text-foreground/60">
              {i + 1}
            </span>
            {/* image_url pode ser null: o Capa mostra a inicial */}
            <div className="relative size-11 shrink-0 overflow-hidden rounded-lg">
              <Capa
                src={m.imagem}
                alt={`Capa de ${m.nome}`}
                nome={m.nome}
                sizes="44px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{m.nome}</p>
              {m.subtitulo && (
                <Link
                  href={caminhoDoArtista(m.subtitulo)}
                  className="block w-fit max-w-full truncate rounded text-sm text-foreground/70 underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                >
                  {m.subtitulo}
                </Link>
              )}
            </div>
            <span className="shrink-0 text-sm tabular-nums text-foreground/70">
              {formatarNumero(m.contagem)}
              {/* a 375px a palavra roubava o espaço ao nome da faixa */}
              <span className="sr-only sm:not-sr-only">
                {m.contagem === 1 ? " audição" : " audições"}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </Bloco>
  );
}
