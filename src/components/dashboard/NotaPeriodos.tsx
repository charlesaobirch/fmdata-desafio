"use client";

import { useFiltradosPor } from "@/hooks/useFiltradosPor";
import { formatarData } from "@/lib/dates";

/**
 * Responde à pergunta que vários períodos diferentes levantam: onde se
 * muda, e a contar de quando. "Últimos 7 dias" conta a partir da
 * última audição, não de hoje (guia, 15: "24h" a partir de agora).
 */
export function NotaPeriodos() {
  const { inicio, referencia } = useFiltradosPor("tudo");

  return (
    <p className="max-w-prose text-pretty text-sm text-foreground/70">
      {inicio && referencia && (
        <>
          De{" "}
          <span className="font-medium text-foreground">
            {formatarData(inicio)}
          </span>{" "}
          a{" "}
          <span className="font-medium text-foreground">
            {formatarData(referencia)}
          </span>
          .{" "}
        </>
      )}
      Cada bloco tem o seu período, que se muda no topo do bloco; os períodos
      contam a partir da tua última audição, e não de hoje.
    </p>
  );
}
