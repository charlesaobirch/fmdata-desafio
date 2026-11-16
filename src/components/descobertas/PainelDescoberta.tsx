"use client";

import { type ReactNode, useId } from "react";
import type { EstadoDescoberta } from "./useDescoberta";
import { useRevelar } from "./useRevelar";

interface PainelDescobertaProps {
  /** A pergunta a que o painel responde: é sempre o título. */
  pergunta: string;
  /** A resposta em tom de manchete: a protagonista, em letra gigante. */
  titulo?: string;
  subtitulo?: string;
  /** Assunções e definições que têm de ficar visíveis junto do resultado. */
  nota?: ReactNode;
  estado: EstadoDescoberta;
  /** Texto do estado vazio, se o painel precisar de um próprio. */
  mensagemVazia?: string;
  children?: ReactNode;
}

/**
 * Painel editorial de uma descoberta, a toda a largura: a pergunta é o
 * título (guia, 9.3), a resposta vem por baixo em letra gigante e o
 * detalhe em corpo pequeno. Estados: loading (esqueleto com a forma
 * da manchete), sem histórico (lugar quieto; o aviso no topo explica),
 * vazio e sucesso.
 * Só apresenta: o cálculo fica nos painéis, via useDescoberta.
 */
export function PainelDescoberta({
  pergunta,
  titulo,
  subtitulo,
  nota,
  estado,
  mensagemVazia = "Ainda não há audições suficientes para esta descoberta. Volta depois de ouvires mais música.",
  children,
}: PainelDescobertaProps) {
  const sucesso = estado === "sucesso";
  const idTitulo = useId();
  const { ref, revelar } = useRevelar<HTMLElement>();

  return (
    <article
      ref={ref}
      data-revelar={revelar}
      aria-labelledby={idTitulo}
      aria-busy={estado === "loading"}
      className="flex min-w-0 flex-col gap-10"
    >
      <header className="flex flex-col gap-6">
        <h3
          id={idTitulo}
          className="max-w-3xl text-balance text-xl font-medium leading-snug text-foreground/75 sm:text-2xl"
        >
          {pergunta}
        </h3>
        {sucesso && titulo && (
          <p
            data-manchete
            className="max-w-4xl text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-7xl"
          >
            {titulo}
          </p>
        )}
        {sucesso && subtitulo && (
          <p
            data-detalhe
            className="max-w-2xl text-pretty text-lg leading-snug text-foreground/75 sm:text-xl"
          >
            {subtitulo}
          </p>
        )}
      </header>

      {estado === "loading" && (
        <div aria-hidden="true" className="flex flex-col gap-4">
          <span className="h-10 w-4/5 rounded-lg bg-foreground/10 motion-safe:animate-pulse sm:h-16" />
          <span className="h-10 w-3/5 rounded-lg bg-foreground/10 motion-safe:animate-pulse sm:h-16" />
          <span className="mt-2 h-4 w-1/2 rounded bg-foreground/10 motion-safe:animate-pulse" />
        </div>
      )}

      {/* o histórico falhou: o AvisoHistorico explica no topo da página */}
      {estado === "sem-historico" && (
        <div aria-hidden="true" className="flex flex-col gap-4">
          <span className="h-10 w-4/5 rounded-lg bg-foreground/5 sm:h-16" />
          <span className="h-10 w-3/5 rounded-lg bg-foreground/5 sm:h-16" />
        </div>
      )}

      {estado === "vazio" && (
        <p className="max-w-prose text-pretty text-foreground/75">
          {mensagemVazia}
        </p>
      )}

      {sucesso && <div data-detalhe>{children}</div>}

      {sucesso && nota && (
        <p
          data-detalhe
          className="max-w-prose border-t border-foreground/15 pt-4 text-xs leading-relaxed text-foreground/65"
        >
          {nota}
        </p>
      )}
    </article>
  );
}
