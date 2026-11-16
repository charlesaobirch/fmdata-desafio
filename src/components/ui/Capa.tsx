"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * A Last.fm devolve esta imagem genérica (uma estrela cinzenta) quando
 * não tem capa. Mostrá-la como capa seria enganador: trata-se como
 * imagem em falta.
 */
const SEM_CAPA_LASTFM = "2a96cbd8b46e442fc41c2b86b821562f";

interface CapaProps {
  src: string | null | undefined;
  alt: string;
  /** Texto de recurso quando não há imagem (p.ex. o nome do álbum). */
  nome: string;
  sizes?: string;
}

/**
 * Imagem que preenche o contentor (que tem de ser `relative`), com
 * alternativa quando falta, é a genérica da Last.fm ou falha a carregar.
 * `unoptimized`: as capas vêm de um CDN externo já em 300×300, e assim
 * não é preciso configurar remotePatterns.
 */
export function Capa({ src, alt, nome, sizes = "25vw" }: CapaProps) {
  const [falhou, setFalhou] = useState(false);
  const temImagem = !!src && !src.includes(SEM_CAPA_LASTFM) && !falhou;

  if (!temImagem) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="absolute inset-0 flex items-center justify-center bg-foreground/10"
      >
        <span
          aria-hidden="true"
          className="text-4xl font-semibold uppercase text-foreground/40"
        >
          {nome.trim().charAt(0) || "?"}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      sizes={sizes}
      onError={() => setFalhou(true)}
      className="object-cover"
    />
  );
}
