"use client";

import { HeartIcon } from "@solar-icons/react/linear/heart";
import { useMemo } from "react";
import { Bloco } from "@/components/ui/Bloco";
import { ultimasAudicoes } from "@/lib/artist";
import { formatarData, parseDataScrobble } from "@/lib/dates";
import type { Scrobble } from "@/types";

const doisDigitos = (n: number) => String(n).padStart(2, "0");

interface Props {
  doArtista: Scrobble[];
  className?: string;
}

/** Bloco 7 da página do artista: as 10 audições mais recentes. */
export function UltimasAudicoes({ doArtista, className }: Props) {
  const audicoes = useMemo(
    () =>
      ultimasAudicoes(doArtista).map((s) => ({
        s,
        // ultimasAudicoes já descarta as sem data; o null fica tratado
        // na mesma, para nunca aparecer "Invalid Date"
        data: parseDataScrobble(s),
      })),
    [doArtista],
  );

  return (
    <Bloco
      className={className}
      titulo="Últimas audições"
      contexto="horas em UTC"
      estado={audicoes.length === 0 ? "vazio" : "sucesso"}
      mensagemVazia="Nenhuma audição deste artista tem data."
    >
      <ol className="flex flex-col divide-y divide-foreground/10">
        {audicoes.map(({ s, data }, i) => (
          <li
            key={`${s.date_uts ?? s.date_iso}-${i}`}
            className="flex flex-col gap-0.5 py-2 first:pt-0 last:pb-0"
          >
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <span className="truncate">{s.track_name}</span>
              {s.loved === 1 && (
                <>
                  <HeartIcon className="size-3.5 shrink-0 text-foreground/70" />
                  <span className="sr-only">(favorita)</span>
                </>
              )}
            </p>
            <p className="flex justify-between gap-3 text-xs text-foreground/70">
              <span className="truncate">{s.album_name || "Sem álbum"}</span>
              {data ? (
                <time
                  dateTime={data.toISOString()}
                  className="shrink-0 tabular-nums"
                >
                  {formatarData(data)}, {doisDigitos(data.getUTCHours())}:
                  {doisDigitos(data.getUTCMinutes())}
                </time>
              ) : (
                <span className="shrink-0">Sem data</span>
              )}
            </p>
          </li>
        ))}
      </ol>
    </Bloco>
  );
}
