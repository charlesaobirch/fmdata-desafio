"use client";

import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";
import type { ReactNode } from "react";
import type { Periodo } from "@/types";

/**
 * Glossário dos períodos: o mesmo nome para o mesmo período em toda a
 * app, sempre por extenso ("Últimos 7 dias", não "7d"), para se ler de
 * relance e sem conhecer a convenção.
 */
export const ROTULOS_PERIODO: Record<Periodo, string> = {
  tudo: "Todo o histórico",
  "30d": "Últimos 30 dias",
  "14d": "Últimos 14 dias",
  "7d": "Últimos 7 dias",
  "24h": "Últimas 24 horas",
};

const ORDEM: Periodo[] = ["tudo", "30d", "14d", "7d", "24h"];

// forma comum ao controlo e ao marcador fixo: quem vê um reconhece o outro
const FORMA =
  "inline-flex h-7 shrink-0 items-center rounded-full text-xs leading-none";

interface SeletorPeriodoProps {
  valor: Periodo;
  aoMudar: (periodo: Periodo) => void;
  /** Nome acessível: diz a que bloco pertence o período. */
  rotulo: string;
}

/**
 * O período de um bloco. É um <select> nativo desenhado como texto: o
 * valor está sempre escrito (lê-se sem abrir nada) e a escolha usa o
 * menu do sistema, com teclado e leitores de ecrã de graça.
 *
 * Duas variantes, para vários blocos com períodos diferentes não se
 * confundirem: "Todo o histórico" é uma pílula só com contorno,
 * discreta; um período recortado é preenchida a rosa e com peso, e salta à
 * vista quais blocos estão filtrados. O texto muda também: a distinção
 * nunca depende só da cor.
 */
export function SeletorPeriodo({
  valor,
  aoMudar,
  rotulo,
}: SeletorPeriodoProps) {
  const recortado = valor !== "tudo";

  return (
    <span
      className={`group relative ${FORMA} ${
        recortado ? "font-medium text-destaque-texto" : "text-foreground/70"
      }`}
    >
      <select
        aria-label={rotulo}
        value={valor}
        onChange={(e) => aoMudar(e.target.value as Periodo)}
        className={`h-full cursor-pointer appearance-none rounded-full pr-7 pl-3 field-sizing-content transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
          recortado
            ? "bg-destaque/12 ring-1 ring-destaque ring-inset hover:bg-destaque/20"
            : "bg-transparent ring-1 ring-foreground/20 ring-inset group-hover:text-foreground hover:bg-foreground/5"
        }`}
      >
        {ORDEM.map((p) => (
          <option key={p} value={p}>
            {ROTULOS_PERIODO[p]}
          </option>
        ))}
      </select>
      <AltArrowDownIcon className="pointer-events-none absolute top-1/2 right-2.5 size-3 -translate-y-1/2" />
    </span>
  );
}

/**
 * O mesmo marcador, sem escolha: para secções que são sempre sobre o
 * histórico completo (as Descobertas). A forma igual à do controlo
 * diz "isto é um período", a falta da seta diz "e não muda".
 */
export function PeriodoFixo({ children }: { children: ReactNode }) {
  return (
    <span className={`${FORMA} gap-1.5 bg-foreground/10 px-3 font-medium`}>
      {children}
    </span>
  );
}
