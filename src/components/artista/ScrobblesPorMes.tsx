"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatarNumero } from "@/components/descobertas/formatar";
import { Bloco } from "@/components/ui/Bloco";
import { scrobblesPorMes } from "@/lib/artist";
import { formatarMes } from "@/lib/dates";
import type { PontoMensal, Scrobble } from "@/types";

/**
 * Marcas do eixo X conforme a extensão: até um ano, todos os meses;
 * até três, um por trimestre; acima disso, só janeiro (o ano).
 */
function marcas(pontos: PontoMensal[]): { ticks: string[]; soAno: boolean } {
  if (pontos.length <= 12)
    return { ticks: pontos.map((p) => p.mes), soAno: false };
  if (pontos.length <= 36) {
    return {
      ticks: pontos
        .filter((p) => ["01", "04", "07", "10"].includes(p.mes.slice(5)))
        .map((p) => p.mes),
      soAno: false,
    };
  }
  return {
    ticks: pontos.filter((p) => p.mes.endsWith("-01")).map((p) => p.mes),
    soAno: true,
  };
}

interface Props {
  doArtista: Scrobble[];
  className?: string;
}

/**
 * Bloco 5 da página do artista: audições por mês, com os meses sem
 * audições a 0 (vem de scrobblesPorMes) para a linha não "saltar".
 */
export function ScrobblesPorMes({ doArtista, className }: Props) {
  const { pontos, pico, eixo } = useMemo(() => {
    const pontos = scrobblesPorMes(doArtista);
    const pico = pontos.reduce<PontoMensal | null>(
      (max, p) => (max === null || p.contagem > max.contagem ? p : max),
      null,
    );
    return { pontos, pico, eixo: marcas(pontos) };
  }, [doArtista]);

  return (
    <Bloco
      className={className}
      titulo="Audições por mês"
      contexto="meses em UTC"
      estado={pico === null ? "vazio" : "sucesso"}
      mensagemVazia="Nenhuma audição deste artista tem data."
    >
      {pico && (
        <figure className="flex flex-col gap-3">
          <figcaption className="text-sm text-foreground/70">
            O mês com mais audições foi{" "}
            <span className="font-semibold text-foreground">
              {formatarMes(pico.mes)}
            </span>{" "}
            ({formatarNumero(pico.contagem)}{" "}
            {pico.contagem === 1 ? "audição" : "audições"}).
          </figcaption>

          <div className="text-foreground/70" aria-hidden="true">
            <AreaChart
              data={pontos}
              responsive
              style={{ width: "100%", height: 240 }}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              accessibilityLayer={false}
            >
              <CartesianGrid
                vertical={false}
                stroke="currentColor"
                strokeOpacity={0.15}
              />
              <XAxis
                dataKey="mes"
                ticks={eixo.ticks}
                interval="preserveStartEnd"
                tickFormatter={(mes: string) =>
                  eixo.soAno ? mes.slice(0, 4) : formatarMes(mes)
                }
                tick={{ fill: "currentColor", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                minTickGap={16}
              />
              <YAxis
                tickFormatter={(v: number) => formatarNumero(v)}
                tick={{ fill: "currentColor", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={48}
              />
              <Tooltip
                cursor={{ stroke: "currentColor", strokeOpacity: 0.3 }}
                content={({ active, payload }) => {
                  const p = payload?.[0]?.payload as PontoMensal | undefined;
                  if (!active || !p) return null;
                  return (
                    <div className="rounded-lg border border-foreground/10 bg-background px-3 py-2 text-xs text-foreground shadow-sm">
                      <p className="font-medium">{formatarMes(p.mes)}</p>
                      <p className="tabular-nums">
                        {formatarNumero(p.contagem)}{" "}
                        {p.contagem === 1 ? "audição" : "audições"}
                      </p>
                    </div>
                  );
                }}
              />
              <Area
                dataKey="contagem"
                type="linear"
                stroke="var(--foreground)"
                strokeWidth={1.5}
                fill="var(--foreground)"
                fillOpacity={0.12}
                // com um só mês não há linha: mostra o ponto
                dot={pontos.length === 1 ? { r: 3 } : false}
                isAnimationActive={false}
              />
            </AreaChart>
          </div>

          {/* os mesmos dados em texto, para leitores de ecrã; o sr-only
              vai num div porque uma tabela ignora height: 1px e, com
              100+ meses, esticava o scroll da página */}
          <div className="sr-only">
            <table>
              <caption>Audições por mês, em UTC</caption>
              <thead>
                <tr>
                  <th scope="col">Mês</th>
                  <th scope="col">Audições</th>
                </tr>
              </thead>
              <tbody>
                {pontos.map((p) => (
                  <tr key={p.mes}>
                    <th scope="row">{formatarMes(p.mes)}</th>
                    <td>{p.contagem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </figure>
      )}
    </Bloco>
  );
}
