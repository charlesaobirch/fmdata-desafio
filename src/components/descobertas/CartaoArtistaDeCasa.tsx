"use client";

import { artistaDeCasa } from "@/lib/analise";
import { CartaoDescoberta } from "./CartaoDescoberta";
import { formatarNumero } from "./formatar";
import { useDescoberta } from "./useDescoberta";

export function CartaoArtistaDeCasa() {
  const { resultado: casa, cartao } = useDescoberta(artistaDeCasa);

  const maximo = Math.max(1, ...(casa?.porAno.map((a) => a.audicoes) ?? []));

  return (
    <CartaoDescoberta
      {...cartao}
      pergunta="Quem é o artista mais presente no teu dia a dia?"
      titulo={
        casa
          ? `A ${casa.nome} não é tua artista favorita. É tua coinquilina.`
          : undefined
      }
      subtitulo={
        casa
          ? `${formatarNumero(casa.audicoes)} audições de ${formatarNumero(casa.faixasDistintas)} músicas, acordou-te ${formatarNumero(
              casa.manhasQueAbriu,
            )} manhãs, adormeceu-te ${formatarNumero(casa.noitesQueFechou)} noites`
          : undefined
      }
    >
      {casa && (
        <div className="flex flex-col gap-4">
          <ul className="flex h-28 items-end gap-1.5">
            {casa.porAno.map(({ ano, audicoes }) => {
              const pico = ano === casa.anoDePico?.ano;
              return (
                <li
                  key={ano}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                >
                  {/* a barra cresce dentro deste espaço; a etiqueta fica por baixo */}
                  <span
                    aria-hidden="true"
                    className="flex w-full flex-1 items-end"
                  >
                    <span
                      className={`w-full rounded-t-sm ${
                        pico ? "bg-foreground" : "bg-foreground/25"
                      }`}
                      style={{ height: `${(audicoes / maximo) * 100}%` }}
                    />
                  </span>
                  <span className="sr-only">
                    {`${ano}: ${formatarNumero(audicoes)} audições${
                      pico ? " (ano de pico)" : ""
                    }`}
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-[0.65rem] tabular-nums text-foreground/70"
                  >
                    {String(ano).slice(2)}
                  </span>
                </li>
              );
            })}
          </ul>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <dt className="text-foreground/70">Do que ouviste</dt>
              <dd className="font-medium tabular-nums">
                {casa.percentagemDoTotal.toFixed(1).replace(".", ",")}%
              </dd>
            </div>
            <div>
              <dt className="text-foreground/70">Músicas diferentes</dt>
              <dd className="font-medium tabular-nums">
                {formatarNumero(casa.faixasDistintas)}
              </dd>
            </div>
            {casa.albumPrincipal && (
              <div>
                <dt className="text-foreground/70">Álbum da casa</dt>
                <dd className="font-medium">
                  {casa.albumPrincipal.nome}{" "}
                  <span className="font-normal tabular-nums text-foreground/70">
                    ({formatarNumero(casa.albumPrincipal.audicoes)})
                  </span>
                </dd>
              </div>
            )}
            {casa.anoDePico && (
              <div>
                <dt className="text-foreground/70">Ano de pico</dt>
                <dd className="font-medium tabular-nums">
                  {casa.anoDePico.ano}{" "}
                  <span className="font-normal text-foreground/70">
                    ({formatarNumero(casa.anoDePico.audicoes)})
                  </span>
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </CartaoDescoberta>
  );
}
