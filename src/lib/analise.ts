import type { Scrobble } from "../types";
import { normalizarNome } from "./filters";

/* ---------- auxiliares partilhados ---------- */

type ComData = Scrobble & { date_uts: number };

/**
 * Para cada dia UTC ("AAAA-MM-DD"), a primeira e a última audição.
 * Ignora audições sem data. Em empate de timestamp fica a que aparece
 * primeiro no array (comparação estrita).
 */
function extremosDoDia(
  scrobbles: Scrobble[],
): Map<string, { primeira: ComData; ultima: ComData }> {
  const dias = new Map<string, { primeira: ComData; ultima: ComData }>();
  for (const s of scrobbles) {
    if (s.date_uts === null) continue;
    const c = s as ComData;
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
  const ordenados = scrobbles
    .filter((s): s is Scrobble & { date_uts: number } => s.date_uts !== null)
    .sort((a, b) => a.date_uts - b.date_uts);

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
  for (const lista of porArtista.values()) {
    if (lista.length > dele.length) dele = lista;
  }
  if (dele.length === 0) return null;

  const comData = dele.filter(
    (s): s is Scrobble & { date_uts: number } => s.date_uts !== null,
  );

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
