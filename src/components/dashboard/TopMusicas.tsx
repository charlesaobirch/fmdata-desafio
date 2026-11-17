"use client";

import { LinkArtista } from "@/components/artista/LinkArtista";
import { formatarNumero } from "@/components/descobertas/formatar";
import { Bloco } from "@/components/ui/Bloco";
import { Capa } from "@/components/ui/Capa";
import { EsqueletoLista } from "@/components/ui/EsqueletoLista";
import { classePosicao } from "@/components/ui/estilos";
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
      mensagemVazia="Sem músicas neste período. Escolhe um período maior no topo do bloco."
    >
      <ol className="flex flex-col gap-3">
        {musicas.map((m, i) => (
          <li key={m.chave} className="flex items-center gap-3">
            <span className={classePosicao(i)}>{i + 1}</span>
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
                <LinkArtista
                  nome={m.subtitulo}
                  className="block w-fit max-w-full truncate text-sm text-foreground/70"
                />
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
