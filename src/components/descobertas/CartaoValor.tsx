"use client";

import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";
import { useState } from "react";
import { LinkArtista } from "@/components/artista/LinkArtista";
import { valorEstimado } from "@/lib/analise";
import { contar, formatarTaxa, formatarUSD, formatarValor } from "./formatar";
import { PainelDescoberta } from "./PainelDescoberta";
import { useDescoberta } from "./useDescoberta";

/**
 * A mesma pílula de escolha dos filtros de período, aplicada ao
 * artista do cartão: um <select> nativo desenhado como texto, com o
 * valor sempre à vista e o menu do sistema de graça.
 */
const SELETOR_ARTISTA = `h-full cursor-pointer appearance-none rounded-full pr-7 pl-3 field-sizing-content text-xs leading-none text-foreground ring-1 ring-foreground/20 ring-inset transition-colors duration-150 hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground`;

export function CartaoValor() {
  const { resultado: valor, cartao } = useDescoberta(valorEstimado);
  const top = valor?.topArtistas ?? [];
  // null = o artista principal (o 1.º do top); a escolha do visitante
  // sobrepõe-se e cai no principal se o nome sair da lista
  const [escolhido, setEscolhido] = useState<string | null>(null);
  const artista =
    top.find((a) => a.nome === escolhido) ?? valor?.artistaPrincipal;

  return (
    <PainelDescoberta
      {...cartao}
      pergunta="Quanto terão recebido os artistas pelas tuas audições?"
      titulo={
        artista ? (
          <>
            E a <LinkArtista nome={artista.nome} />, ficou com quê?
          </>
        ) : undefined
      }
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
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor="artista-do-valor"
              className="text-sm text-foreground/70"
            >
              Ver para outro artista:
            </label>
            <span className="relative inline-flex h-7 items-center rounded-full leading-none">
              <select
                id="artista-do-valor"
                aria-label="Artista do cartão de valor estimado"
                value={artista.nome}
                onChange={(e) => setEscolhido(e.target.value)}
                className={SELETOR_ARTISTA}
              >
                {top.map((a) => (
                  <option key={a.nome} value={a.nome}>
                    {a.nome}
                  </option>
                ))}
              </select>
              <AltArrowDownIcon className="pointer-events-none absolute top-1/2 right-2.5 size-3 -translate-y-1/2" />
            </span>
          </div>

          <p className="text-sm text-foreground/70">
            <span className="mb-2 block text-balance text-3xl font-semibold tabular-nums tracking-[-0.03em] text-destaque-texto sm:text-5xl">
              {formatarUSD(artista.minimo)} a {formatarUSD(artista.maximo)}
            </span>
            pelas tuas {contar(artista.reproducoes, "audição", "audições")},
            conforme a plataforma
          </p>

          <div className="max-w-3xl overflow-x-auto">
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
                    <LinkArtista nome={artista.nome} /> (USD)
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
    </PainelDescoberta>
  );
}
