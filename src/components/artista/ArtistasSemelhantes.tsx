"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Bloco } from "@/components/ui/Bloco";
import { EstadoCarregar } from "@/components/ui/EstadoCarregar";
import { estadoDe } from "@/components/ui/estado";
import { useArtistInfo } from "@/hooks/useArtistInfo";
import { artistasSemelhantes } from "@/lib/artist";
import type { Scrobble } from "@/types";
import { caminhoDoArtista } from "./caminho";

interface Props {
  nome: string;
  todos: Scrobble[];
  className?: string;
}

/**
 * Bloco 8 da página do artista: os semelhantes segundo a Last.fm.
 * Só os que já ouviste são links (para a página deles); os outros
 * aparecem sem link e com outro aspeto, sem depender só da cor.
 */
export function ArtistasSemelhantes({ nome, todos, className }: Props) {
  const { data: info, status, error, recarregar } = useArtistInfo(nome);

  const semelhantes = useMemo(
    () => (info ? artistasSemelhantes(info, todos) : []),
    [info, todos],
  );

  // um 404 do perfil não é falha técnica: não há semelhantes a mostrar
  const estado =
    status === "not-found"
      ? "vazio"
      : estadoDe(status, semelhantes.length === 0);

  return (
    <Bloco
      className={className}
      titulo="Artistas semelhantes"
      estado={estado}
      erro={error}
      mensagemErro="Não conseguimos carregar os artistas semelhantes."
      aoRepetir={recarregar}
      esqueleto={<EstadoCarregar linhas={2} />}
      mensagemVazia={
        status === "not-found"
          ? "A Last.fm não tem perfil deste artista, por isso não há semelhantes."
          : "A Last.fm não indica artistas semelhantes."
      }
    >
      <div className="flex flex-col gap-3">
        <ul className="flex flex-wrap gap-2">
          {semelhantes.map((a) => (
            <li key={a.nome}>
              {a.ouvido ? (
                <Link
                  href={caminhoDoArtista(a.nome)}
                  className="inline-flex rounded-full bg-foreground px-3 py-1 text-sm font-medium text-background transition-colors duration-150 hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                >
                  {a.nome}
                </Link>
              ) : (
                <span className="inline-flex rounded-full border border-dashed border-foreground/30 px-3 py-1 text-sm text-foreground/60">
                  {a.nome}
                  <span className="sr-only"> (não ouvido)</span>
                </span>
              )}
            </li>
          ))}
        </ul>
        <p className="text-xs text-foreground/70">
          A cheio, os que já ouviste: abrem a página do artista. A tracejado, os
          que ainda não ouviste.
        </p>
      </div>
    </Bloco>
  );
}
