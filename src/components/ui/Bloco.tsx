import { type ReactNode, useId } from "react";
import { EstadoCarregar } from "./EstadoCarregar";
import { EstadoErro } from "./EstadoErro";
import { EstadoVazio } from "./EstadoVazio";
import type { EstadoDoBloco } from "./estado";

interface BlocoProps {
  titulo: string;
  /** Contexto curto ao lado do título (p.ex. "horas em UTC"). */
  contexto?: string;
  estado: EstadoDoBloco;
  erro?: string | null;
  /** O que falhou, quando não é o histórico (p.ex. o perfil da API). */
  mensagemErro?: string;
  aoRepetir?: () => void;
  mensagemVazia?: string;
  /** Esqueleto com a forma do conteúdo; por omissão, três linhas. */
  esqueleto?: ReactNode;
  className?: string;
  children?: ReactNode;
}

/**
 * Moldura de um bloco do dashboard: título e um dos quatro estados.
 * Só apresenta; o cálculo vem de uma função pura via hook.
 */
export function Bloco({
  titulo,
  contexto,
  estado,
  erro,
  mensagemErro,
  aoRepetir,
  mensagemVazia,
  esqueleto,
  className = "",
  children,
}: BlocoProps) {
  const idTitulo = useId();

  return (
    <section
      aria-labelledby={idTitulo}
      aria-busy={estado === "loading"}
      className={`flex min-w-0 flex-col gap-4 rounded-2xl border border-foreground/10 bg-background p-6 ${className}`}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id={idTitulo} className="text-lg font-semibold tracking-tight">
          {titulo}
        </h2>
        {contexto && <p className="text-xs text-foreground/70">{contexto}</p>}
      </header>

      {estado === "loading" && (esqueleto ?? <EstadoCarregar />)}
      {estado === "erro" && (
        <EstadoErro
          mensagem={mensagemErro}
          detalhe={erro}
          aoRepetir={aoRepetir}
        />
      )}
      {estado === "vazio" && <EstadoVazio mensagem={mensagemVazia} />}
      {estado === "sucesso" && children}
    </section>
  );
}
