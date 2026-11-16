import { type ReactNode, useId } from "react";
import type { Periodo } from "@/types";
import { EstadoCarregar } from "./EstadoCarregar";
import { EstadoErro } from "./EstadoErro";
import { EstadoVazio } from "./EstadoVazio";
import type { EstadoDoBloco } from "./estado";
import { SeletorPeriodo } from "./SeletorPeriodo";

interface BlocoProps {
  titulo: string;
  /** Nota curta por baixo do título (p.ex. "horas em UTC"). */
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
      {/* o período fica sempre no mesmo sítio: no canto, à altura do título */}
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 id={idTitulo} className="text-lg font-semibold tracking-tight">
            {titulo}
          </h2>
          {contexto && <p className="text-xs text-foreground/70">{contexto}</p>}
        </div>
        {periodo && aoMudarPeriodo && (
          <div className="-mt-0.5">
            <SeletorPeriodo
              valor={periodo}
              aoMudar={aoMudarPeriodo}
              rotulo={`Período de ${titulo}`}
            />
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
      {estado === "vazio" && <EstadoVazio mensagem={mensagemVazia} />}
      {estado === "sucesso" && children}
    </section>
  );
}
