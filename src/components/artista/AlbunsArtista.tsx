"use client";

import { useMemo } from "react";
import { contar, formatarNumero } from "@/components/descobertas/formatar";
import { Bloco } from "@/components/ui/Bloco";
import { Capa } from "@/components/ui/Capa";
import { useAlbumInfo } from "@/hooks/useAlbumInfo";
import {
  type AlbumDoArtista,
  albunsDoArtista,
  faixasOuvidasDoAlbum,
} from "@/lib/artist";
import type { Scrobble } from "@/types";

// um pedido à API por álbum: só os mais ouvidos (há artistas com 40
// "álbuns", muitos deles singles)
const MAXIMO = 6;

interface LinhaProps {
  artista: string;
  album: AlbumDoArtista;
  doArtista: Scrobble[];
}

/**
 * Um álbum: "Ouviste X de Y faixas" quando o perfil traz a tracklist;
 * enquanto carrega, se falhar ou se não houver tracklist, degrada para
 * "X faixas ouvidas" (guia, 8.3) — sem mensagem de erro por álbum.
 */
function LinhaAlbum({ artista, album, doArtista }: LinhaProps) {
  const { data } = useAlbumInfo(artista, album.nome);
  const ouvidas = useMemo(
    () =>
      data
        ? faixasOuvidasDoAlbum(
            doArtista,
            album.nome,
            data.tracklist_names,
            data.track_count,
          )
        : null,
    [data, doArtista, album.nome],
  );

  return (
    <li className="flex min-w-0 items-center gap-3">
      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg">
        <Capa
          src={album.imagem ?? data?.image_url}
          alt={`Capa de ${album.nome}`}
          nome={album.nome}
          sizes="48px"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate font-medium">{album.nome}</p>
        {data && ouvidas !== null ? (
          <>
            <p className="text-xs text-foreground/70">
              Ouviste{" "}
              <span className="font-medium tabular-nums text-foreground">
                {formatarNumero(ouvidas)}
              </span>{" "}
              de {contar(data.track_count, "faixa", "faixas")}
            </p>
            <span
              aria-hidden="true"
              className="h-1 rounded-full bg-foreground/10"
            >
              <span
                className="block h-full rounded-full bg-foreground/60"
                style={{ width: `${(ouvidas / data.track_count) * 100}%` }}
              />
            </span>
          </>
        ) : (
          <p className="text-xs text-foreground/70">
            {contar(
              album.faixasDistintasOuvidas,
              "faixa ouvida",
              "faixas ouvidas",
            )}
          </p>
        )}
      </div>
      <span className="shrink-0 text-sm tabular-nums text-foreground/70">
        {formatarNumero(album.totalAudicoes)}
        {/* a 375px a palavra roubava o espaço ao nome do álbum */}
        <span className="sr-only sm:not-sr-only">
          {album.totalAudicoes === 1 ? " audição" : " audições"}
        </span>
      </span>
    </li>
  );
}

interface Props {
  /** O nome canónico: é o que a API reconhece. */
  artista: string;
  doArtista: Scrobble[];
  className?: string;
}

/** Bloco 4 da página do artista: os álbuns mais ouvidos e quanto de cada. */
export function AlbunsArtista({ artista, doArtista, className }: Props) {
  const albuns = useMemo(
    () => albunsDoArtista(doArtista).slice(0, MAXIMO),
    [doArtista],
  );

  return (
    <Bloco
      className={className}
      titulo="Álbuns"
      contexto="os mais ouvidos"
      estado={albuns.length === 0 ? "vazio" : "sucesso"}
      mensagemVazia="Nenhuma audição deste artista tem álbum."
    >
      {/* grid-cols-1 = minmax(0, 1fr): um nome longo não alarga a coluna */}
      <ol className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        {albuns.map((album) => (
          <LinhaAlbum
            key={album.chave}
            artista={artista}
            album={album}
            doArtista={doArtista}
          />
        ))}
      </ol>
    </Bloco>
  );
}
