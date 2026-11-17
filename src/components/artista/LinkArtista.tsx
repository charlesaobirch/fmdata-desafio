"use client";

import Link from "next/link";
import {
  LINK_ARTISTA,
  LINK_ARTISTA_SOBRE_IMAGEM,
} from "@/components/ui/estilos";
import { useScrobbles } from "@/hooks/useScrobbles";
import { normalizarNome } from "@/lib/filters";
import type { Scrobble } from "@/types";
import { caminhoDoArtista } from "./caminho";

// os artistas do histórico, calculados uma vez por histórico e partilhados
const cache = new WeakMap<Scrobble[], Set<string>>();

function artistasDe(todos: Scrobble[]): Set<string> {
  let artistas = cache.get(todos);
  if (!artistas) {
    artistas = new Set(todos.map((s) => normalizarNome(s.artist_name)));
    cache.set(todos, artistas);
  }
  return artistas;
}

interface LinkArtistaProps {
  nome: string;
  /** Sobre uma capa: texto e foco brancos. */
  sobreImagem?: boolean;
  className?: string;
}

/**
 * Quem corta o texto (truncate) tem de ser o próprio link, não um pai:
 * um pai com overflow escondido cortaria o contorno de foco.
 *
 * O nome de um artista, com link para a página dele quando existe no
 * histórico (a mesma regra da página: com ou sem data); senão, texto.
 * O nome vai codificado no URL (caminhoDoArtista).
 */
export function LinkArtista({
  nome,
  sobreImagem = false,
  className = "",
}: LinkArtistaProps) {
  const { data } = useScrobbles();
  if (!artistasDe(data).has(normalizarNome(nome))) {
    // sem página: texto, com a mesma forma (p.ex. truncate) que o link teria
    return className ? <span className={className}>{nome}</span> : <>{nome}</>;
  }

  return (
    <Link
      href={caminhoDoArtista(nome)}
      className={`${sobreImagem ? LINK_ARTISTA_SOBRE_IMAGEM : LINK_ARTISTA} ${className}`}
    >
      {nome}
    </Link>
  );
}
