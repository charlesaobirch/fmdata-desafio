"use client";

import { useFiltradosPor } from "@/hooks/useFiltradosPor";
import { formatarData } from "@/lib/dates";

/**
 * Responde à pergunta que vários períodos diferentes levantam: onde se
 * muda, e a contar de quando. "Últimos 7 dias" conta a partir da
 * última audição, não de hoje (guia, 15: "24h" a partir de agora).
 */
export function NotaPeriodos() {
  const { referencia } = useFiltradosPor("tudo");

  return (
    <p className="max-w-prose text-pretty text-sm text-foreground/70">
      Cada bloco tem o seu período, escolhido no canto do bloco. Os períodos
      contam a partir da tua última audição
      {referencia && (
        <>
          , a{" "}
          <span className="font-medium text-foreground">
            {formatarData(referencia)}
          </span>
        </>
      )}
      , e não de hoje.
    </p>
  );
}
