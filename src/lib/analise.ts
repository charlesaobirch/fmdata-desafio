import type { Scrobble } from "../types";
import { horaUTC, parseDataScrobble } from "./dates";
import { normalizarNome, separarLista } from "./filters";

/* ---------- auxiliares partilhados ---------- */

type ComData = Scrobble & { date_uts: number };

/**
 * As audições com data válida, com date_uts sempre preenchido. A data
 * vem de parseDataScrobble, a regra única da app (date_uts, recurso a
 * date_iso, nowplaying fora): assim as descobertas contam as mesmas
 * audições que o dashboard.
 */
function comDatas(scrobbles: Scrobble[]): ComData[] {
  const resultado: ComData[] = [];
  for (const s of scrobbles) {
    const data = parseDataScrobble(s);
    if (data) resultado.push({ ...s, date_uts: data.getTime() / 1000 });
  }
  return resultado;
}

/**
 * Para cada dia UTC ("AAAA-MM-DD"), a primeira e a última audição.
 * Ignora audições sem data. Em empate de timestamp fica a que aparece
 * primeiro no array (comparação estrita).
 */
function extremosDoDia(
  scrobbles: Scrobble[],
): Map<string, { primeira: ComData; ultima: ComData }> {
  const dias = new Map<string, { primeira: ComData; ultima: ComData }>();
  for (const c of comDatas(scrobbles)) {
    const dia = new Date(c.date_uts * 1000).toISOString().slice(0, 10);
    const atual = dias.get(dia);
    if (!atual) {
      dias.set(dia, { primeira: c, ultima: c });
      continue;
    }
    if (c.date_uts < atual.primeira.date_uts) atual.primeira = c;
    if (c.date_uts > atual.ultima.date_uts) atual.ultima = c;
  }
  return dias;
}

/* ---------- 1 · A maratona ---------- */

export interface Maratona {
  faixa: string;
  artista: string;
  vezes: number;
}

/**
 * A maior sequência da MESMA faixa tocada seguidas vezes.
 * Ordena por data porque a ordem do ficheiro não é garantida.
 * Ignora reproduções sem data (nowplaying): não se sabe onde
 * encaixam na sequência.
 */
export function maiorSequenciaRepetida(scrobbles: Scrobble[]): Maratona | null {
  const ordenados = comDatas(scrobbles).sort((a, b) => a.date_uts - b.date_uts);

  if (ordenados.length === 0) return null;

  const chave = (s: Scrobble) =>
    `${normalizarNome(s.artist_name)}::${normalizarNome(s.track_name)}`;

  let melhor: Maratona = {
    faixa: ordenados[0].track_name,
    artista: ordenados[0].artist_name,
    vezes: 1,
  };
  let corrente = 1;

  for (let i = 1; i < ordenados.length; i += 1) {
    if (chave(ordenados[i]) === chave(ordenados[i - 1])) {
      corrente += 1;
      if (corrente > melhor.vezes) {
        melhor = {
          faixa: ordenados[i].track_name,
          artista: ordenados[i].artist_name,
          vezes: corrente,
        };
      }
    } else {
      corrente = 1;
    }
  }

  return melhor;
}

/* ---------- 2 · O artista de casa ---------- */

export interface ArtistaDeCasa {
  nome: string;
  audicoes: number;
  percentagemDoTotal: number;
  faixasDistintas: number;
  manhasQueAbriu: number;
  noitesQueFechou: number;
  albumPrincipal: { nome: string; audicoes: number } | null;
  anoDePico: { ano: number; audicoes: number } | null;
  porAno: { ano: number; audicoes: number }[];
}

/**
 * Perfil completo do artista mais ouvido de sempre.
 *
 * "Manhã que abriu" = foi a primeira audição de um dia (UTC);
 * "noite que fechou" = foi a última. O dia é UTC porque a API
 * também é, e misturar fusos desalinharia a contagem.
 *
 * Audições sem data contam para o total do artista mas não para
 * manhãs, noites nem anos — não se sabe quando aconteceram.
 */
export function artistaDeCasa(scrobbles: Scrobble[]): ArtistaDeCasa | null {
  if (scrobbles.length === 0) return null;

  const porArtista = new Map<string, Scrobble[]>();
  for (const s of scrobbles) {
    const k = normalizarNome(s.artist_name);
    const lista = porArtista.get(k);
    if (lista) lista.push(s);
    else porArtista.set(k, [s]);
  }

  let dele: Scrobble[] = [];
  let chaveDele = "";
  for (const [k, lista] of porArtista) {
    // empate: ordem alfabética da chave normalizada, como o paraRanking e
    // os outros rankings, para o resultado não depender da ordem do ficheiro
    const empataEAntes =
      lista.length === dele.length && k.localeCompare(chaveDele) < 0;
    if (lista.length > dele.length || empataEAntes) {
      dele = lista;
      chaveDele = k;
    }
  }
  if (dele.length === 0) return null;

  const comData = comDatas(dele);

  const nomeNorm = normalizarNome(dele[0].artist_name);
  const ehDele = (s: Scrobble) => normalizarNome(s.artist_name) === nomeNorm;

  let manhas = 0;
  let noites = 0;
  // primeira e última audição de cada dia, em todo o histórico
  for (const { primeira, ultima } of extremosDoDia(scrobbles).values()) {
    if (ehDele(primeira)) manhas += 1;
    if (ehDele(ultima)) noites += 1;
  }

  // agrupa pelo nome normalizado (como o artista e as faixas);
  // mostra o nome tal como apareceu na primeira audição
  const albuns = new Map<string, { nome: string; audicoes: number }>();
  for (const s of dele) {
    const k = normalizarNome(s.album_name);
    if (k === "") continue; // há audições sem álbum
    const atual = albuns.get(k);
    if (atual) atual.audicoes += 1;
    else albuns.set(k, { nome: s.album_name, audicoes: 1 });
  }
  let albumPrincipal: { nome: string; audicoes: number } | null = null;
  for (const album of albuns.values()) {
    if (!albumPrincipal || album.audicoes > albumPrincipal.audicoes) {
      albumPrincipal = album;
    }
  }

  const anos = new Map<number, number>();
  for (const s of comData) {
    const ano = new Date(s.date_uts * 1000).getUTCFullYear();
    anos.set(ano, (anos.get(ano) ?? 0) + 1);
  }
  const porAno = [...anos.entries()]
    .map(([ano, audicoes]) => ({ ano, audicoes }))
    .sort((a, b) => a.ano - b.ano);

  const anoDePico = porAno.reduce<{ ano: number; audicoes: number } | null>(
    (melhor, atual) =>
      !melhor || atual.audicoes > melhor.audicoes ? atual : melhor,
    null,
  );

  return {
    nome: dele[0].artist_name,
    audicoes: dele.length,
    percentagemDoTotal: (dele.length / scrobbles.length) * 100,
    faixasDistintas: new Set(dele.map((s) => normalizarNome(s.track_name)))
      .size,
    manhasQueAbriu: manhas,
    noitesQueFechou: noites,
    albumPrincipal,
    anoDePico,
    porAno,
  };
}

/* ---------- 3 · Como abres e fechas o dia ---------- */

export interface ContagemDeArtista {
  artista: string;
  dias: number;
}

export interface ContagemDeFaixa {
  faixa: string;
  artista: string;
  dias: number;
}

export interface AberturaEFecho {
  diasComMusica: number;
  quemAbre: ContagemDeArtista[];
  quemFecha: ContagemDeArtista[];
  faixaQueMaisAbre: ContagemDeFaixa | null;
  faixaQueMaisFecha: ContagemDeFaixa | null;
  diasComMesmaFaixa: number;
}

/** Ordena por dias (desc.) e desempata alfabeticamente pela chave. */
function ordenarPorDias<T extends { dias: number }>(mapa: Map<string, T>): T[] {
  return [...mapa.entries()]
    .sort(([ka, a], [kb, b]) => b.dias - a.dias || ka.localeCompare(kb))
    .map(([, v]) => v);
}

/**
 * Para cada dia UTC, olha só para a primeira e a última audição
 * (ver extremosDoDia para o critério em empates de timestamp).
 *
 * - Artistas agrupados por nome normalizado; faixas pela chave
 *   artista+faixa ("Hello" da Adele ≠ "Hello" de outro artista).
 * - Rankings por número de dias, do maior para o menor. Em empate,
 *   ordem alfabética da chave normalizada (o mesmo critério do
 *   paraRanking), para o resultado não depender da ordem dos dados.
 * - "Mesma faixa": a primeira e a última do dia têm a mesma chave.
 *   Um dia com uma só audição conta, porque abriu e fechou com ela.
 */
export function primeiraEUltimaDoDia(
  scrobbles: Scrobble[],
): AberturaEFecho | null {
  const dias = extremosDoDia(scrobbles);
  if (dias.size === 0) return null;

  const chaveFaixa = (s: Scrobble) =>
    `${normalizarNome(s.artist_name)}::${normalizarNome(s.track_name)}`;

  const abre = new Map<string, ContagemDeArtista>();
  const fecha = new Map<string, ContagemDeArtista>();
  const faixaAbre = new Map<string, ContagemDeFaixa>();
  const faixaFecha = new Map<string, ContagemDeFaixa>();
  let mesmaFaixa = 0;

  const somarArtista = (mapa: Map<string, ContagemDeArtista>, s: Scrobble) => {
    const k = normalizarNome(s.artist_name);
    const atual = mapa.get(k);
    if (atual) atual.dias += 1;
    else mapa.set(k, { artista: s.artist_name, dias: 1 });
  };
  const somarFaixa = (mapa: Map<string, ContagemDeFaixa>, s: Scrobble) => {
    const k = chaveFaixa(s);
    const atual = mapa.get(k);
    if (atual) atual.dias += 1;
    else mapa.set(k, { faixa: s.track_name, artista: s.artist_name, dias: 1 });
  };

  for (const { primeira, ultima } of dias.values()) {
    somarArtista(abre, primeira);
    somarArtista(fecha, ultima);
    somarFaixa(faixaAbre, primeira);
    somarFaixa(faixaFecha, ultima);
    if (chaveFaixa(primeira) === chaveFaixa(ultima)) mesmaFaixa += 1;
  }

  return {
    diasComMusica: dias.size,
    quemAbre: ordenarPorDias(abre),
    quemFecha: ordenarPorDias(fecha),
    faixaQueMaisAbre: ordenarPorDias(faixaAbre)[0] ?? null,
    faixaQueMaisFecha: ordenarPorDias(faixaFecha)[0] ?? null,
    diasComMesmaFaixa: mesmaFaixa,
  };
}

/* ---------- 4 · Género por faixa do dia ---------- */

export type MomentoDoDia = "madrugada" | "manha" | "tarde" | "noite";

/** Horas UTC (inclusivas) de cada momento do dia. */
export const MOMENTOS_DO_DIA: {
  momento: MomentoDoDia;
  rotulo: string;
  de: number;
  ate: number;
}[] = [
  { momento: "madrugada", rotulo: "Madrugada", de: 0, ate: 5 },
  { momento: "manha", rotulo: "Manhã", de: 6, ate: 11 },
  { momento: "tarde", rotulo: "Tarde", de: 12, ate: 17 },
  { momento: "noite", rotulo: "Noite", de: 18, ate: 23 },
];

export interface IndiceDeTag {
  tag: string;
  ocorrencias: number;
  quota: number;
  quotaTotal: number;
  indice: number;
}

export interface GeneroDoMomento {
  momento: MomentoDoDia;
  rotulo: string;
  audicoes: number;
  tags: IndiceDeTag[];
}

/**
 * Que géneros pesam mais em cada momento do dia do que no total?
 *
 * índice = quota da tag no momento ÷ quota da tag no histórico todo.
 * 1 = igual ao habitual; 1.3 = 30% acima; 0.7 = 30% abaixo.
 *
 * - quota = audições com a tag ÷ audições com pelo menos uma tag.
 *   As audições sem tags ficam fora do denominador: não dizem nada
 *   sobre género e, se se concentrassem num momento, baixavam todos
 *   os índices desse momento por igual.
 * - Horas UTC, como o resto do projeto. Audições sem data ignoradas.
 * - Tags normalizadas (minúsculas, sem acentos) e contadas uma vez
 *   por audição.
 * - Só entram tags com pelo menos `minimo` ocorrências no momento
 *   (por omissão 200): abaixo disso o índice é ruído de amostra.
 * - Ordenadas por índice (desc.); empate por ordem alfabética.
 */
export function generoPorFaixaDoDia(
  scrobbles: Scrobble[],
  minimo = 200,
): GeneroDoMomento[] | null {
  const totalPorTag = new Map<string, number>();
  let totalComTags = 0;
  const porMomento = MOMENTOS_DO_DIA.map(() => ({
    audicoes: 0,
    comTags: 0,
    tags: new Map<string, number>(),
  }));

  for (const s of comDatas(scrobbles)) {
    const hora = horaUTC(new Date(s.date_uts * 1000));
    const i = MOMENTOS_DO_DIA.findIndex((m) => hora >= m.de && hora <= m.ate);
    const atual = porMomento[i];
    atual.audicoes += 1;

    const tags = new Set(separarLista(s.tags).map(normalizarNome));
    tags.delete("");
    if (tags.size === 0) continue;
    atual.comTags += 1;
    totalComTags += 1;
    for (const tag of tags) {
      atual.tags.set(tag, (atual.tags.get(tag) ?? 0) + 1);
      totalPorTag.set(tag, (totalPorTag.get(tag) ?? 0) + 1);
    }
  }

  if (totalComTags === 0) return null;

  return MOMENTOS_DO_DIA.map(({ momento, rotulo }, i) => {
    const dados = porMomento[i];
    const tags: IndiceDeTag[] = [];
    for (const [tag, ocorrencias] of dados.tags) {
      if (ocorrencias < minimo) continue;
      const quota = ocorrencias / dados.comTags;
      const quotaTotal = (totalPorTag.get(tag) ?? 0) / totalComTags;
      tags.push({
        tag,
        ocorrencias,
        quota,
        quotaTotal,
        indice: quota / quotaTotal,
      });
    }
    tags.sort((a, b) => b.indice - a.indice || a.tag.localeCompare(b.tag));
    return { momento, rotulo, audicoes: dados.audicoes, tags };
  });
}

/* ---------- 5 · Valor estimado para os artistas ---------- */

export type Plataforma = "youtube" | "spotify" | "apple" | "tidal";

/**
 * USD por reprodução. ASSUNÇÃO DECLARADA: médias aproximadas de
 * valores divulgados publicamente, não vêm da API e variam por país,
 * contrato e ano. A UI tem de as mostrar ao lado do resultado.
 */
export const TAXAS_POR_REPRODUCAO: {
  plataforma: Plataforma;
  rotulo: string;
  taxa: number;
}[] = [
  { plataforma: "youtube", rotulo: "YouTube", taxa: 0.0007 },
  { plataforma: "spotify", rotulo: "Spotify", taxa: 0.004 },
  { plataforma: "apple", rotulo: "Apple Music", taxa: 0.008 },
  { plataforma: "tidal", rotulo: "Tidal", taxa: 0.013 },
];

export interface ValorPorPlataforma {
  plataforma: Plataforma;
  rotulo: string;
  taxa: number;
  valor: number;
}

export interface Estimativa {
  reproducoes: number;
  porPlataforma: ValorPorPlataforma[];
  minimo: number;
  maximo: number;
}

export interface ValorEstimado {
  total: Estimativa;
  artistaPrincipal: Estimativa & { nome: string };
  /**
   * Os 10 artistas com mais audições, por ordem decrescente (o
   * artistaPrincipal é o 1.º): o cartão deixa escolher para quem ver.
   */
  topArtistas: (Estimativa & { nome: string })[];
}

function estimar(
  reproducoes: number,
  taxas: typeof TAXAS_POR_REPRODUCAO,
): Estimativa {
  const porPlataforma = taxas.map((t) => ({
    ...t,
    valor: reproducoes * t.taxa,
  }));
  const valores = porPlataforma.map((p) => p.valor);
  return {
    reproducoes,
    porPlataforma,
    minimo: Math.min(...valores),
    maximo: Math.max(...valores),
  };
}

/**
 * Quanto terão recebido os artistas pelas tuas reproduções?
 * reproduções × taxa por plataforma; o intervalo vai da plataforma
 * que paga menos à que paga mais, porque não se sabe onde se ouviu.
 *
 * - Conta todas as audições (como totalScrobbles e artistaDeCasa).
 * - Artista principal: o de mais audições, agrupado por nome
 *   normalizado; em empate, o primeiro por ordem alfabética da chave.
 * - topArtistas: os 10 primeiros dessa mesma ordem, para o seletor
 *   do cartão.
 * - As taxas podem ser substituídas (por omissão TAXAS_POR_REPRODUCAO).
 */
export function valorEstimado(
  scrobbles: Scrobble[],
  taxas = TAXAS_POR_REPRODUCAO,
): ValorEstimado | null {
  if (scrobbles.length === 0 || taxas.length === 0) return null;

  const porArtista = new Map<string, { nome: string; reproducoes: number }>();
  for (const s of scrobbles) {
    const k = normalizarNome(s.artist_name);
    const atual = porArtista.get(k);
    if (atual) atual.reproducoes += 1;
    else porArtista.set(k, { nome: s.artist_name, reproducoes: 1 });
  }
  const ordenados = [...porArtista.entries()].sort(
    ([ka, a], [kb, b]) => b.reproducoes - a.reproducoes || ka.localeCompare(kb),
  );
  const principal = ordenados[0][1];

  return {
    total: estimar(scrobbles.length, taxas),
    artistaPrincipal: {
      nome: principal.nome,
      ...estimar(principal.reproducoes, taxas),
    },
    topArtistas: ordenados
      .slice(0, 10)
      .map(([, a]) => ({ nome: a.nome, ...estimar(a.reproducoes, taxas) })),
  };
}
