import type {
  ArtistaSemelhante,
  ArtistInfo,
  ItemRanking,
  PontoMensal,
  Scrobble,
} from "../types";
import { chaveDoMes, formatarData, parseDataScrobble } from "./dates";
import { normalizarNome, separarLista } from "./filters";
import { contarPor, exemplosDe, paraRanking } from "./stats";

/* ---------- Existência e resumo ---------- */

/** O artista aparece nos dados? (comparação por nome normalizado) */
export function artistaExiste(scrobbles: Scrobble[], nome: string): boolean {
  const alvo = normalizarNome(nome);
  return scrobbles.some((s) => normalizarNome(s.artist_name) === alvo);
}

export interface ResumoDoArtista {
  totalAudicoes: number;
  percentagemDoTotal: number;
  faixasFavoritas: number;
  primeiraReproducao: string | null;
  ultimaReproducao: string | null;
}

/**
 * Números do cartão de estatísticas da página do artista.
 * As favoritas são FAIXAS distintas, não audições.
 */
export function resumoDoArtista(
  doArtista: Scrobble[],
  todos: Scrobble[],
): ResumoDoArtista {
  const datas = doArtista
    .map(parseDataScrobble)
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime());

  const chavesDeFaixasFavoritas = new Set(
    doArtista
      .filter((s) => s.loved === 1)
      .map(
        (s) =>
          `${normalizarNome(s.artist_name)}::${normalizarNome(s.track_name)}`,
      ),
  );

  return {
    totalAudicoes: doArtista.length,
    percentagemDoTotal:
      todos.length === 0 ? 0 : (doArtista.length / todos.length) * 100,
    faixasFavoritas: chavesDeFaixasFavoritas.size,
    primeiraReproducao: datas.length > 0 ? formatarData(datas[0]) : null,
    ultimaReproducao:
      datas.length > 0 ? formatarData(datas[datas.length - 1]) : null,
  };
}

/* ---------- Rankings do artista ---------- */

export function topMusicasDoArtista(
  doArtista: Scrobble[],
  n = 10,
): ItemRanking[] {
  const chaveDaFaixa = (s: Scrobble) => normalizarNome(s.track_name);
  const contagens = contarPor(doArtista, chaveDaFaixa);
  const exemplos = exemplosDe(doArtista, chaveDaFaixa);

  return paraRanking(contagens, n).map((item) => {
    const exemplo = exemplos.get(item.chave);
    return {
      ...item,
      nome: exemplo?.track_name ?? item.nome,
      imagem: exemplo?.image_url ?? null,
    };
  });
}

export interface AlbumDoArtista {
  chave: string;
  nome: string;
  imagem: string | null;
  faixasDistintasOuvidas: number;
  totalAudicoes: number;
}

/**
 * Álbuns do artista com o número de faixas distintas ouvidas.
 * O total de faixas do álbum ("Y" de "X de Y") vem de AlbumInfo,
 * via useAlbumInfo — esta função não o calcula.
 */
export function albunsDoArtista(doArtista: Scrobble[]): AlbumDoArtista[] {
  const porAlbum = new Map<string, AlbumDoArtista>();

  for (const s of doArtista) {
    const nomeAlbum = s.album_name.trim();
    if (nomeAlbum === "") continue; // audições sem álbum ficam de fora

    const k = normalizarNome(nomeAlbum);
    const atual = porAlbum.get(k) ?? {
      chave: k,
      nome: nomeAlbum,
      imagem: s.image_url,
      faixasDistintasOuvidas: 0,
      totalAudicoes: 0,
    };

    atual.totalAudicoes += 1;
    if (!atual.imagem && s.image_url) atual.imagem = s.image_url;
    porAlbum.set(k, atual);
  }

  // contar faixas distintas por álbum num segundo passe
  const faixasPorAlbum = new Map<string, Set<string>>();
  for (const s of doArtista) {
    const k = normalizarNome(s.album_name.trim());
    if (k === "") continue;
    const set = faixasPorAlbum.get(k) ?? new Set<string>();
    set.add(normalizarNome(s.track_name));
    faixasPorAlbum.set(k, set);
  }
  for (const [k, set] of faixasPorAlbum) {
    const album = porAlbum.get(k);
    if (album) album.faixasDistintasOuvidas = set.size;
  }

  // do álbum mais ouvido para o menos ouvido, desempate alfabético
  return [...porAlbum.values()].sort(
    (a, b) => b.totalAudicoes - a.totalAudicoes || a.nome.localeCompare(b.nome),
  );
}

/**
 * O "X" de "Ouviste X de Y faixas": as faixas da tracklist do álbum
 * (`tracklist_names`, separada por ";") que já ouviste com esse nome de
 * álbum. Só conta o que está na tracklist, por isso faixas bónus,
 * versões e edições deluxe guardadas com o mesmo nome de álbum ficam de
 * fora e o X nunca passa do Y (`total`, o track_count da API).
 *
 * Devolve null quando não há tracklist ou total: sem eles não se sabe o
 * X honesto, e a interface mostra só "X faixas ouvidas".
 */
export function faixasOuvidasDoAlbum(
  doArtista: Scrobble[],
  album: string,
  tracklist: string,
  total: number,
): number | null {
  const faixasDoAlbum = separarLista(tracklist, ";").map(normalizarNome);
  if (faixasDoAlbum.length === 0 || total <= 0) return null;

  const alvo = normalizarNome(album);
  const ouvidas = new Set(
    doArtista
      .filter((s) => normalizarNome(s.album_name) === alvo)
      .map((s) => normalizarNome(s.track_name)),
  );

  const naTracklist = new Set(faixasDoAlbum.filter((f) => ouvidas.has(f)));
  return Math.min(naTracklist.size, total);
}

/* ---------- Evolução temporal ---------- */

/**
 * Scrobbles por mês, cronológico, com os meses vazios a 0
 * entre o primeiro e o último mês com audições.
 */
export function scrobblesPorMes(doArtista: Scrobble[]): PontoMensal[] {
  const contagens = contarPor(doArtista, (s) => {
    const data = parseDataScrobble(s);
    return data ? chaveDoMes(data) : "";
  });

  const mesesComDados = [...contagens.keys()].sort();
  if (mesesComDados.length === 0) return [];

  const pontos: PontoMensal[] = [];
  const [primeiroAno, primeiroMes] = mesesComDados[0].split("-").map(Number);
  const [ultimoAno, ultimoMes] = mesesComDados[mesesComDados.length - 1]
    .split("-")
    .map(Number);

  // percorrer todos os meses do intervalo, mesmo os sem audições
  let ano = primeiroAno;
  let mes = primeiroMes;
  while (ano < ultimoAno || (ano === ultimoAno && mes <= ultimoMes)) {
    const chave = `${ano}-${String(mes).padStart(2, "0")}`;
    pontos.push({
      mes: chave,
      contagem: contagens.get(chave) ?? 0,
    });
    mes += 1;
    if (mes > 12) {
      mes = 1;
      ano += 1;
    }
  }

  return pontos;
}

/* ---------- Últimas audições ---------- */

/** As n audições mais recentes (ignora as sem data). */
export function ultimasAudicoes(doArtista: Scrobble[], n = 10): Scrobble[] {
  return doArtista
    .map((s) => ({ s, data: parseDataScrobble(s) }))
    .filter(
      (entrada): entrada is { s: Scrobble; data: Date } =>
        entrada.data !== null,
    )
    .sort((a, b) => b.data.getTime() - a.data.getTime())
    .slice(0, n)
    .map((entrada) => entrada.s);
}

/* ---------- Artistas semelhantes ---------- */

/**
 * Cruza a lista "similar_artists" da API com os nossos scrobbles.
 * Só os ouvidos ficam clicáveis na interface.
 */
export function artistasSemelhantes(
  info: ArtistInfo,
  todos: Scrobble[],
): ArtistaSemelhante[] {
  const ouvidos = new Set(todos.map((s) => normalizarNome(s.artist_name)));

  // A API repete nomes ("Luísa Sonza" veio 2x para o Jão) e a lista
  // alimenta chaves de render: sem repetições, à fonte.
  const vistos = new Set<string>();
  const semelhantes: ArtistaSemelhante[] = [];
  for (const nome of separarLista(info.similar_artists)) {
    const chave = normalizarNome(nome);
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    semelhantes.push({ nome, ouvido: ouvidos.has(chave) });
  }
  return semelhantes;
}
