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
import { contar, formatarNumero } from "@/components/descobertas/formatar";
import { horaDePico, scrobblesPorHora } from "@/lib/stats";
import type { Scrobble } from "@/types";

interface PontoHora {
  hora: number;
  audicoes: number;
  pico: boolean;
}

export interface Relogio {
  pontos: PontoHora[];
  pico: number | null;
}

/** As 24 horas UTC, com a hora de pico marcada (sem pico = tudo a 0). */
export function calcularRelogio(scrobbles: Scrobble[]): Relogio {
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

const intervalo = (h: number) => `${h}h–${h + 1}h`;

// marcas de 3 em 3 horas: regulares e legíveis de 375px a desktop
const MARCAS_HORA = [0, 3, 6, 9, 12, 15, 18, 21];

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
        (payload as PontoHora).pico ? "fill-destaque" : "fill-foreground/40"
      }
    />
  );
}

/**
 * Gráfico de barras das 24 horas (UTC), partilhado pelo dashboard e
 * pela página do artista. Só desenha: o cálculo vem de calcularRelogio.
 */
export function FiguraRelogio({ relogio }: { relogio: Relogio }) {
  const { pontos, pico } = relogio;
  if (pico === null) return null;

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="text-sm text-foreground/70">
        Ouves mais entre as{" "}
        <span className="font-semibold text-foreground">{intervalo(pico)}</span>{" "}
        UTC ({contar(pontos[pico].audicoes, "audição", "audições")}).
      </figcaption>

      <div className="text-foreground/70" aria-hidden="true">
        <BarChart
          data={pontos}
          responsive
          style={{ width: "100%", height: 240 }}
          margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
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
            ticks={MARCAS_HORA}
            interval={0}
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
                    {contar(ponto.audicoes, "audição", "audições")}
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey="audicoes" shape={BarraHora} isAnimationActive={false} />
        </BarChart>
      </div>

      {/* os mesmos dados em texto, para leitores de ecrã; o sr-only vai
          num div porque uma tabela ignora height: 1px e esticava o scroll */}
      <div className="sr-only">
        <table>
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
      </div>
    </figure>
  );
}
