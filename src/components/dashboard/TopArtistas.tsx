"use client";

import Link from "next/link";
import { caminhoDoArtista } from "@/components/artista/caminho";
import { formatarNumero } from "@/components/descobertas/formatar";
import { Bloco } from "@/components/ui/Bloco";
import { Capa } from "@/components/ui/Capa";
import { EsqueletoLista } from "@/components/ui/EsqueletoLista";
import { useArtistInfo } from "@/hooks/useArtistInfo";
import { topArtistas } from "@/lib/stats";
import type { ItemRanking } from "@/types";
import { useBlocoFiltrado } from "./useBlocoFiltrado";

const semArtistas = (artistas: ItemRanking[]) => artistas.length === 0;

/**
 * A foto vem do perfil do artista (useArtistInfo, em cache e
 * persistido), não do image_url dos scrobbles: esse é a capa de um
 * álbum. Enquanto carrega, um disco vazio; se faltar, a inicial.
 */
function FotoArtista({ nome }: { nome: string }) {
  const { data, status } = useArtistInfo(nome);
  const aCarregar = status === "idle" || status === "loading";

  return (
    <div
      className={`relative size-10 shrink-0 overflow-hidden rounded-full ${
        aCarregar ? "bg-foreground/10 motion-safe:animate-pulse" : ""
      }`}
    >
      {!aCarregar && (
        <Capa
          src={data?.image_url}
          alt={`Fotografia de ${nome}`}
          nome={nome}
          sizes="40px"
        />
      )}
    </div>
  );
}

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
      mensagemVazia="Sem artistas neste período. Experimenta um período maior."
    >
      <ol className="flex flex-col gap-2.5">
        {artistas.map((a, i) => (
          <li key={a.chave} className="flex items-center gap-3">
            <span className="w-5 shrink-0 text-right text-sm tabular-nums text-foreground/60">
              {i + 1}
            </span>
            <FotoArtista nome={a.nome} />
            <Link
              href={caminhoDoArtista(a.nome)}
              className="min-w-0 flex-1 truncate rounded font-medium underline-offset-4 transition-colors duration-150 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              {a.nome}
            </Link>
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
