"use client";

import { useFiltradosPor } from "@/hooks/useFiltradosPor";
import { formatarData } from "@/lib/dates";

/**
 * O rodapé das duas páginas: de onde vêm os dados, até quando e em que
 * fuso. Uma linha discreta; a data só aparece quando o histórico chegou.
 */
export function Rodape() {
  const { referencia } = useFiltradosPor("tudo");

  return (
    <footer className="mx-auto w-full max-w-5xl px-8 py-10">
      <p className="text-pretty border-t border-foreground/10 pt-6 text-xs text-foreground/70">
        Dados da API fmdata, a partir do Last.fm
        {referencia && <> · última audição a {formatarData(referencia)}</>} ·
        horas em UTC
      </p>
    </footer>
  );
}
