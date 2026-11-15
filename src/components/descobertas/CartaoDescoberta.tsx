import type { ReactNode } from "react";

interface CartaoDescobertaProps {
  /** A pergunta a que o cartão responde: título enquanto não há resposta. */
  pergunta: string;
  /** A resposta, em tom de manchete. */
  titulo?: string;
  subtitulo?: string;
  /** Assunções e definições que têm de ficar visíveis junto do resultado. */
  nota?: ReactNode;
  /** Ocupa as duas colunas da grelha (cartões com mais dados). */
  largo?: boolean;
  children?: ReactNode;
}

/**
 * Moldura comum às descobertas. Só apresenta: não calcula nem vai
 * buscar dados — isso fica nos cartões, via useDescoberta.
 */
export function CartaoDescoberta({
  pergunta,
  titulo,
  subtitulo,
  nota,
  largo = false,
  children,
}: CartaoDescobertaProps) {
  return (
    <article
      aria-label={pergunta}
      className={`flex flex-col gap-5 rounded-2xl border border-foreground/10 bg-background p-6 ${
        largo ? "md:col-span-2" : ""
      }`}
    >
      <header className="flex flex-col gap-1.5">
        <h3 className="text-balance text-xl font-semibold leading-snug tracking-tight">
          {titulo ?? pergunta}
        </h3>
        {subtitulo && (
          <p className="text-pretty text-sm text-foreground/70">{subtitulo}</p>
        )}
      </header>

      {children}

      {nota && (
        <p className="mt-auto border-t border-foreground/10 pt-3 text-xs text-foreground/70">
          {nota}
        </p>
      )}
    </article>
  );
}
