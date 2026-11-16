"use client";

import { formatarNumero } from "@/components/descobertas/formatar";
import { Bloco } from "@/components/ui/Bloco";
import { Capa } from "@/components/ui/Capa";
import { topAlbuns } from "@/lib/stats";
import type { ItemRanking } from "@/types";
import { useBlocoFiltrado } from "./useBlocoFiltrado";

const semAlbuns = (albuns: ItemRanking[]) => albuns.length === 0;

function Esqueleto() {
  return (
    <div aria-hidden="true" className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {["a", "b", "c", "d", "e", "f", "g", "h"].map((k) => (
        <span
          key={k}
          className="aspect-square rounded-xl bg-foreground/10 motion-safe:animate-pulse"
        />
      ))}
    </div>
  );
}

/** Bloco 5 do dashboard: os 8 álbuns mais ouvidos no período. */
export function TopAlbuns({ className }: { className?: string }) {
  const { resultado: albuns, bloco } = useBlocoFiltrado(topAlbuns, semAlbuns);

  return (
    <Bloco
      className={className}
      titulo="Top 8 álbuns"
      {...bloco}
      esqueleto={<Esqueleto />}
      mensagemVazia="Sem álbuns neste período. Escolhe um período maior no topo do bloco."
    >
      <ol className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {albuns.map((album, i) => (
          <li
            key={album.chave}
            // o n.º 1 com contorno rosa: marca, não texto (rosa sobre capa falharia 4,5:1)
            className={`relative aspect-square overflow-hidden rounded-xl ${
              i === 0
                ? "ring-2 ring-destaque ring-offset-2 ring-offset-background"
                : ""
            }`}
          >
            <Capa
              src={album.imagem}
              alt={`Capa de ${album.nome}${album.subtitulo ? `, de ${album.subtitulo}` : ""}`}
              nome={album.nome}
              sizes="(min-width: 768px) 25vw, 50vw"
              // a capa maior da página varia com a largura; são só 8
              carregarJa
            />
            {/* sobreposição escura: texto legível sobre qualquer capa */}
            <div className="absolute inset-0 flex flex-col justify-between bg-linear-to-t from-black/85 via-black/30 to-transparent p-3 text-white">
              <span className="self-start rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium tabular-nums">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-semibold leading-snug">
                  {album.nome}
                </p>
                {album.subtitulo && (
                  <p className="truncate text-xs text-white/85">
                    {album.subtitulo}
                  </p>
                )}
                <p className="text-xs tabular-nums text-white/85">
                  {formatarNumero(album.contagem)}{" "}
                  {album.contagem === 1 ? "audição" : "audições"}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Bloco>
  );
}
