import { type ReactNode, useId } from "react";
import type { EstadoDescoberta } from "./useDescoberta";

interface CartaoDescobertaProps {
  /** A pergunta a que o cartão responde: é sempre o título. */
  pergunta: string;
  /** A resposta, em tom de manchete, logo abaixo da pergunta. */
  titulo?: string;
  subtitulo?: string;
  /** Assunções e definições que têm de ficar visíveis junto do resultado. */
  nota?: ReactNode;
  /** Ocupa as duas colunas da grelha (cartões com mais dados). */
  largo?: boolean;
  estado: EstadoDescoberta;
  /** Mensagem técnica do erro, se a houver. */
  erro?: string | null;
  aoRepetir?: () => void;
  /** Texto do estado vazio, se o cartão precisar de um próprio. */
  mensagemVazia?: string;
  children?: ReactNode;
}

/**
 * Moldura comum às descobertas: a pergunta é o título e a resposta
 * vem por baixo (guia, etapa 9.3). Quatro estados: loading
 * (esqueleto), erro (com "tentar de novo"), vazio e sucesso.
 * Só apresenta: não calcula nem vai buscar dados — isso fica nos
 * cartões, via useDescoberta.
 */
export function CartaoDescoberta({
  pergunta,
  titulo,
  subtitulo,
  nota,
  largo = false,
  estado,
  erro,
  aoRepetir,
  mensagemVazia = "Ainda não há audições suficientes para esta descoberta. Volta depois de ouvires mais música.",
  children,
}: CartaoDescobertaProps) {
  const sucesso = estado === "sucesso";
  const idTitulo = useId();

  return (
    <article
      aria-labelledby={idTitulo}
      aria-busy={estado === "loading"}
      className={`flex min-w-0 flex-col gap-5 rounded-2xl border border-foreground/10 bg-background p-6 ${
        largo ? "md:col-span-2" : ""
      }`}
    >
      <header className="flex flex-col gap-1.5">
        <h3
          id={idTitulo}
          className="text-balance text-lg font-semibold leading-snug tracking-tight"
        >
          {pergunta}
        </h3>
        {sucesso && titulo && (
          <p className="text-balance text-xl font-semibold leading-snug tracking-tight">
            {titulo}
          </p>
        )}
        {sucesso && subtitulo && (
          <p className="text-pretty text-sm text-foreground/70">{subtitulo}</p>
        )}
      </header>

      {estado === "loading" && (
        <div className="flex flex-col gap-2.5">
          <output className="sr-only">A carregar o teu histórico…</output>
          <span className="h-4 w-3/4 rounded bg-foreground/10 motion-safe:animate-pulse" />
          <span className="h-4 w-1/2 rounded bg-foreground/10 motion-safe:animate-pulse" />
          <span className="h-4 w-2/3 rounded bg-foreground/10 motion-safe:animate-pulse" />
        </div>
      )}

      {estado === "erro" && (
        <div role="alert" className="flex flex-col items-start gap-3 text-sm">
          <p>
            Não conseguimos carregar o teu histórico, por isso esta descoberta
            ficou por fazer.
            {erro && (
              <span className="block text-foreground/70">Detalhe: {erro}</span>
            )}
          </p>
          {aoRepetir && (
            <button
              type="button"
              onClick={aoRepetir}
              className="rounded-full bg-foreground px-4 py-1.5 font-medium text-background transition-colors duration-150 hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              Tentar de novo
            </button>
          )}
        </div>
      )}

      {estado === "vazio" && (
        <p className="text-pretty text-sm text-foreground/70">
          {mensagemVazia}
        </p>
      )}

      {sucesso && children}

      {sucesso && nota && (
        <p className="mt-auto border-t border-foreground/10 pt-3 text-xs text-foreground/70">
          {nota}
        </p>
      )}
    </article>
  );
}
