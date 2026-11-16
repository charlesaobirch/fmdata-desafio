"use client";

import { valorEstimado } from "@/lib/analise";
import { CartaoDescoberta } from "./CartaoDescoberta";
import {
  formatarNumero,
  formatarTaxa,
  formatarUSD,
  formatarValor,
} from "./formatar";
import { useDescoberta } from "./useDescoberta";

export function CartaoValor() {
  const { resultado: valor, cartao } = useDescoberta(valorEstimado);
  const artista = valor?.artistaPrincipal;

  return (
    <CartaoDescoberta
      {...cartao}
      pergunta="Quanto terão recebido os artistas pelas tuas audições?"
      titulo={artista ? `E a ${artista.nome}, ficou com quê?` : undefined}
      subtitulo={
        artista
          ? "nove anos deram para um café. Ou quinze, se tiveres ouvido no Tidal."
          : undefined
      }
      nota={
        valor &&
        "As taxas por reprodução são uma assunção nossa, a partir de médias divulgadas publicamente. Não vêm da API e variam com o país, o contrato e o ano."
      }
    >
      {valor && artista && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-foreground/70">
            <span className="block text-2xl font-semibold tabular-nums tracking-tight text-foreground">
              {formatarUSD(artista.minimo)} a {formatarUSD(artista.maximo)}
            </span>
            pelas tuas {formatarNumero(artista.reproducoes)} audições, conforme
            a plataforma
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm tabular-nums">
              <caption className="sr-only">
                Valor estimado por plataforma, para {artista.nome} e para todas
                as tuas audições
              </caption>
              <thead className="text-foreground/70">
                <tr className="border-b border-foreground/10">
                  <th scope="col" className="py-1.5 pr-3 font-normal">
                    Plataforma
                  </th>
                  <th
                    scope="col"
                    className="py-1.5 pr-3 text-right font-normal"
                  >
                    USD por reprodução
                  </th>
                  <th
                    scope="col"
                    className="py-1.5 pr-3 text-right font-normal"
                  >
                    {artista.nome} (USD)
                  </th>
                  <th scope="col" className="py-1.5 text-right font-normal">
                    Tudo (USD)
                  </th>
                </tr>
              </thead>
              <tbody>
                {artista.porPlataforma.map((p) => (
                  <tr
                    key={p.plataforma}
                    className="border-b border-foreground/5 last:border-0"
                  >
                    <th scope="row" className="py-1.5 pr-3 font-medium">
                      {p.rotulo}
                    </th>
                    <td className="py-1.5 pr-3 text-right">
                      {formatarTaxa(p.taxa)}
                    </td>
                    <td className="py-1.5 pr-3 text-right">
                      {formatarValor(p.valor)}
                    </td>
                    <td className="py-1.5 text-right">
                      {formatarValor(
                        valor.total.porPlataforma.find(
                          (x) => x.plataforma === p.plataforma,
                        )?.valor ?? 0,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </CartaoDescoberta>
  );
}
