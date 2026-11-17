"use client";

import { LinkArtista } from "@/components/artista/LinkArtista";
import { formatarNumero } from "@/components/descobertas/formatar";
import { Bloco } from "@/components/ui/Bloco";
import { Capa } from "@/components/ui/Capa";
import { EsqueletoLista } from "@/components/ui/EsqueletoLista";
import { classePosicao } from "@/components/ui/estilos";
import { topArtistas } from "@/lib/stats";
import type { ItemRanking } from "@/types";
import { useBlocoFiltrado } from "./useBlocoFiltrado";

const semArtistas = (artistas: ItemRanking[]) => artistas.length === 0;

/** Bloco 3 do dashboard: os 20 artistas mais ouvidos no período. */
export function TopArtistas({ className }: { className?: string }) {
  const { resultado: artistas, bloco } = useBlocoFiltrado(
    topArtistas,
    semArtistas,
  );

  return (
    <Bloco
      className={className}
      titulo="Top 20 artistas"
      contexto="audições"
      {...bloco}
      esqueleto={<EsqueletoLista linhas={8} redondo />}
      mensagemVazia="Sem artistas neste período. Escolhe um período maior no topo do bloco."
    >
      <ol className="flex flex-col gap-2.5">
        {artistas.map((a, i) => (
          <li key={a.chave} className="flex items-center gap-3">
            <span className={classePosicao(i)}>{i + 1}</span>
            {/*
              Imagem: o image_url que já vem nos scrobbles (guia, 7.3
              permite este ou o perfil da API). Escolhido para o
              dashboard abrir sem pedidos extra: o perfil via
              useArtistInfo eram 20 pedidos à API por período. É a capa
              de um álbum do artista; quando falta, o Capa mostra a
              inicial.
            */}
            <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
              <Capa
                src={a.imagem}
                alt={`Capa de um álbum de ${a.nome}`}
                nome={a.nome}
                sizes="40px"
              />
            </div>
            <LinkArtista
              nome={a.nome}
              className="min-w-0 flex-1 truncate font-medium"
            />
            <span className="shrink-0 text-sm tabular-nums text-foreground/70">
              {formatarNumero(a.contagem)}
              <span className="sr-only">
                {a.contagem === 1 ? " audição" : " audições"}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </Bloco>
  );
}
