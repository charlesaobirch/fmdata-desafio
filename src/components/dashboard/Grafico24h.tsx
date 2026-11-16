"use client";

import {
  Bar,
  BarChart,
  type BarShapeProps,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatarNumero } from "@/components/descobertas/formatar";
import { Bloco } from "@/components/ui/Bloco";
import { EstadoCarregar } from "@/components/ui/EstadoCarregar";
import { horaDePico, scrobblesPorHora } from "@/lib/stats";
import type { Scrobble } from "@/types";
import { useBlocoFiltrado } from "./useBlocoFiltrado";

interface PontoHora {
  hora: number;
  audicoes: number;
  pico: boolean;
}

interface Relogio {
  pontos: PontoHora[];
  pico: number | null;
}

/** As 24 horas UTC do período, com a hora de pico marcada. */
function calcularRelogio(scrobbles: Scrobble[]): Relogio {
  const porHora = scrobblesPorHora(scrobbles);
  const pico = horaDePico(porHora);
  return {
    pico,
    pontos: porHora.map((audicoes, hora) => ({
      hora,
      audicoes,
      pico: hora === pico,
    })),
  };
}

// sem pico = todas as horas a zero
const semAudicoes = (r: Relogio) => r.pico === null;

const intervalo = (h: number) => `${h}h–${h + 1}h`;

/** Barra com cor própria na hora de pico (substitui o Cell, obsoleto). */
function BarraHora(props: BarShapeProps) {
  const { x, y, width, height, payload } = props;
  if (!height || height <= 0) return <g />;
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={2}
      className={
        (payload as PontoHora).pico ? "fill-foreground" : "fill-foreground/50"
      }
    />
  );
}

/** Bloco 6 do dashboard: audições por hora do dia (UTC) no período. */
export function Grafico24h() {
  const { resultado, bloco } = useBlocoFiltrado(calcularRelogio, semAudicoes);
  const { pontos, pico } = resultado;

  return (
    <Bloco
      titulo="A que horas ouves"
      contexto="horas em UTC"
      {...bloco}
      esqueleto={<EstadoCarregar altura="h-60" />}
    >
      {pico !== null && (
        <figure className="flex flex-col gap-3">
          <figcaption className="text-sm text-foreground/70">
            Ouves mais entre as{" "}
            <span className="font-semibold text-foreground">
              {intervalo(pico)}
            </span>{" "}
            UTC ({formatarNumero(pontos[pico].audicoes)} audições).
          </figcaption>

          <div className="text-foreground/70" aria-hidden="true">
            <BarChart
              data={pontos}
              responsive
              style={{ width: "100%", height: 240 }}
              margin={{ top: 8, right: 4, bottom: 0, left: -12 }}
              accessibilityLayer={false}
            >
              <CartesianGrid
                vertical={false}
                stroke="currentColor"
                strokeOpacity={0.15}
              />
              <XAxis
                dataKey="hora"
                tickFormatter={(h: number) => `${h}h`}
                tick={{ fill: "currentColor", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                minTickGap={4}
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
                cursor={{ fill: "currentColor", fillOpacity: 0.08 }}
                content={({ active, payload }) => {
                  const ponto = payload?.[0]?.payload as PontoHora | undefined;
                  if (!active || !ponto) return null;
                  return (
                    <div className="rounded-lg border border-foreground/10 bg-background px-3 py-2 text-xs text-foreground shadow-sm">
                      <p className="font-medium">{intervalo(ponto.hora)} UTC</p>
                      <p className="tabular-nums">
                        {formatarNumero(ponto.audicoes)} audições
                      </p>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="audicoes"
                shape={BarraHora}
                isAnimationActive={false}
              />
            </BarChart>
          </div>

          {/* os mesmos dados em texto, para leitores de ecrã */}
          <table className="sr-only">
            <caption>Audições por hora do dia, em UTC</caption>
            <thead>
              <tr>
                <th scope="col">Hora (UTC)</th>
                <th scope="col">Audições</th>
              </tr>
            </thead>
            <tbody>
              {pontos.map((p) => (
                <tr key={p.hora}>
                  <th scope="row">
                    {intervalo(p.hora)}
                    {p.pico ? " (pico)" : ""}
                  </th>
                  <td>{p.audicoes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      )}
    </Bloco>
  );
}
