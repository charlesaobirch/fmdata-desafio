import type { Scrobble } from "../types";
import { normalizarNome } from "./filters";

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

  // primeira e última audição de cada dia, em todo o histórico
  const primeiraDoDia = new Map<string, Scrobble>();
  const ultimaDoDia = new Map<string, Scrobble>();
  for (const s of scrobbles) {
    if (s.date_uts === null) continue;
    const dia = new Date(s.date_uts * 1000).toISOString().slice(0, 10);
    const antes = primeiraDoDia.get(dia);
    if (!antes || s.date_uts < (antes.date_uts as number)) {
      primeiraDoDia.set(dia, s);
    }
    const depois = ultimaDoDia.get(dia);
    if (!depois || s.date_uts > (depois.date_uts as number)) {
      ultimaDoDia.set(dia, s);
    }
  }

  const nomeNorm = normalizarNome(dele[0].artist_name);
  const ehDele = (s: Scrobble) => normalizarNome(s.artist_name) === nomeNorm;

  let manhas = 0;
  for (const s of primeiraDoDia.values()) if (ehDele(s)) manhas += 1;
  let noites = 0;
  for (const s of ultimaDoDia.values()) if (ehDele(s)) noites += 1;

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
