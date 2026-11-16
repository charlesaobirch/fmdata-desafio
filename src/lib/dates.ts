import type { Periodo, Scrobble } from "../types";

export function parseDataScrobble(scrobble: Scrobble): Date | null {
  // 1. Ignorar músicas atualmente em reprodução
  if (scrobble.nowplaying) {
    return null;
  }

  // 2. Tentar utilizar o Unix Timestamp
  if (
    typeof scrobble.date_uts === "number" &&
    Number.isFinite(scrobble.date_uts)
  ) {
    const data = new Date(scrobble.date_uts * 1000);

    if (!Number.isNaN(data.getTime())) {
      return data;
    }
  }

  // 3. Utilizar a data ISO como alternativa
  if (!scrobble.date_iso || scrobble.date_iso === "nowplaying") {
    return null;
  }

  const data = new Date(scrobble.date_iso);

  // 4. Confirmar se a data é válida
  if (Number.isNaN(data.getTime())) {
    return null;
  }

  return data;
}

/* ---------- Filtros de validade ---------- */

/** Uma audição só entra em cálculos temporais se tiver data válida. */
export function temDataValida(scrobble: Scrobble): boolean {
  return parseDataScrobble(scrobble) !== null;
}

/* ---------- Períodos ---------- */

/**
 * A âncora de todos os períodos: a data da audição mais recente.
 * "Últimas 24h" conta a partir daqui, não a partir de agora.
 * Array vazio devolve null.
 */
export function dataDeReferencia(scrobbles: Scrobble[]): Date | null {
  let maisRecente: Date | null = null;

  for (const scrobble of scrobbles) {
    const data = parseDataScrobble(scrobble);
    if (data && (maisRecente === null || data > maisRecente)) {
      maisRecente = data;
    }
  }

  return maisRecente;
}

/** Tabela única de durações: acrescentar "90d" é só mexer aqui. */
export function duracaoDoPeriodoMs(periodo: Periodo): number | null {
  const msPorDia = 24 * 60 * 60 * 1000;

  switch (periodo) {
    case "30d":
      return 30 * msPorDia;
    case "14d":
      return 14 * msPorDia;
    case "7d":
      return 7 * msPorDia;
    case "24h":
      return msPorDia;
    case "tudo":
      return null; // sem limite temporal
  }
}

/** Início do período = referência - duração. null para "tudo". */
export function inicioDoPeriodo(
  periodo: Periodo,
  referencia: Date,
): Date | null {
  const duracao = duracaoDoPeriodoMs(periodo);
  if (duracao === null) return null;
  return new Date(referencia.getTime() - duracao);
}

/* ---------- Agrupamentos em UTC ---------- */

/** Hora do dia (0-23) em UTC — alinha com a API e o gráfico 24h. */
export function horaUTC(data: Date): number {
  return data.getUTCHours();
}

/** Chave "2024-03" (ano-mês em UTC); ordena-se por ordem alfabética. */
export function chaveDoMes(data: Date): string {
  const ano = data.getUTCFullYear();
  const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
  return `${ano}-${mes}`;
}

/* ---------- Apresentação ---------- */

const MESES_PT = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

/** "12 mar 2024" */
export function formatarData(data: Date): string {
  const dia = data.getUTCDate();
  const mes = MESES_PT[data.getUTCMonth()];
  const ano = data.getUTCFullYear();
  return `${dia} ${mes} ${ano}`;
}

/** "mar 2024" — recebe a chave "2024-03" */
export function formatarMes(chave: string): string {
  const [, mes] = chave.split("-");
  const indice = Number(mes) - 1;
  if (indice < 0 || indice > 11) return chave; // chave inesperada: mostrar como vem
  return `${MESES_PT[indice]} ${chave.slice(0, 4)}`;
}
