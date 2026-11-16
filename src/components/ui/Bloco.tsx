import { type ReactNode, useId } from "react";
import type { Periodo } from "@/types";
import { EstadoCarregar } from "./EstadoCarregar";
import { EstadoErro } from "./EstadoErro";
import { EstadoSemHistorico } from "./EstadoSemHistorico";
import { EstadoVazio } from "./EstadoVazio";
import type { EstadoDoBloco } from "./estado";
import { SeletorPeriodo } from "./SeletorPeriodo";

interface BlocoProps {
  titulo: string;
  /** Nota curta por baixo do título, a seguir ao período (p.ex. "horas em UTC"). */
  contexto?: string;
  /** Período do bloco; com aoMudarPeriodo, aparece o controlo no cabeçalho. */
  periodo?: Periodo;
  aoMudarPeriodo?: (periodo: Periodo) => void;
  estado: EstadoDoBloco;
  erro?: string | null;
  /** O que falhou, quando não é o histórico (p.ex. o perfil da API). */
  mensagemErro?: string;
  aoRepetir?: () => void;
  mensagemVazia?: string;
  /**
   * Vazio em "Todo o histórico": não há período maior para escolher,
   * por isso a mensagem não pode mandar mudar o período.
   */
  mensagemVaziaHistorico?: string;
  /** Esqueleto com a forma do conteúdo; por omissão, três linhas. */
  esqueleto?: ReactNode;
  className?: string;
  children?: ReactNode;
}

/**
 * Moldura de um bloco do dashboard: título, período (opcional) e um
 * dos quatro estados.
 * Só apresenta; o cálculo vem de uma função pura via hook.
 */
export function Bloco({
  titulo,
  contexto,
  periodo,
  aoMudarPeriodo,
  estado,
  erro,
  mensagemErro,
  aoRepetir,
  mensagemVazia,
  mensagemVaziaHistorico = "O teu histórico ainda não tem audições para mostrar aqui.",
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
      {/*
        O período fica sempre no mesmo sítio, colado ao título e por
        baixo dele: em colunas estreitas não disputa a linha com o
        título, e a borda esquerda dos blocos lê-se como uma lista de
        "título, período".
      */}
      <header className="flex flex-col items-start gap-2">
        <h2 id={idTitulo} className="text-lg font-semibold tracking-tight">
          {titulo}
        </h2>
        {((periodo && aoMudarPeriodo) || contexto) && (
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            {periodo && aoMudarPeriodo && (
              <SeletorPeriodo
                valor={periodo}
                aoMudar={aoMudarPeriodo}
                rotulo={`Período de ${titulo}`}
              />
            )}
            {contexto && (
              <p className="text-xs text-foreground/70">{contexto}</p>
            )}
          </div>
        )}
      </header>

      {estado === "loading" && (esqueleto ?? <EstadoCarregar />)}
      {estado === "erro" && (
        <EstadoErro
          mensagem={mensagemErro}
          detalhe={erro}
          aoRepetir={aoRepetir}
        />
      )}
      {estado === "sem-historico" && <EstadoSemHistorico />}
      {estado === "vazio" && (
        <EstadoVazio
          mensagem={periodo === "tudo" ? mensagemVaziaHistorico : mensagemVazia}
        />
      )}
      {/* a key remonta o conteúdo ao mudar de período: a entrada volta a correr */}
      {estado === "sucesso" && (
        <div key={periodo ?? "fixo"} className="entrada min-w-0">
          {children}
        </div>
      )}
    </section>
  );
}
