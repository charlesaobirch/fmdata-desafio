import type { AlbumInfo, ArtistInfo, Scrobble } from "../types";

/** A base única da API. Para mudar de servidor, só mexe aqui. */
const BASE = "https://fmdata-api.onrender.com";

/** Erro identificável como "não existe" — merece uma página própria. */
export class NaoEncontradoError extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "NaoEncontradoError";
  }
}

/**
 * Faz o fetch e classifica o resultado UMA vez:
 * - 404 -> NaoEncontradoError (estado "not-found" na UI)
 * - 400 -> erro normal (parâmetro em falta é bug nosso; a mensagem
 *   da API serve para depuração)
 * - rede / 5xx -> erro genérico com mensagem para o utilizador
 */
async function pedir<T>(caminho: string): Promise<T> {
  let resposta: Response;

  try {
    resposta = await fetch(`${BASE}${caminho}`);
  } catch {
    throw new Error(
      "Não foi possível ligar ao serviço. Verifica a ligação e tenta de novo.",
    );
  }

  if (resposta.ok) {
    return (await resposta.json()) as T;
  }

  // extrair a mensagem da API quando existir: { error: { code, message } }
  let mensagemDaApi = "";
  try {
    const corpo = (await resposta.json()) as {
      error?: { message?: string };
    };
    mensagemDaApi = corpo.error?.message ?? "";
  } catch {
    // corpo não era JSON; seguimos sem mensagem
  }

  if (resposta.status === 404) {
    throw new NaoEncontradoError(mensagemDaApi || "Não encontrado nos dados.");
  }

  if (resposta.status === 400) {
    // parâmetro em falta: é um bug nosso, registar para depuração
    console.error(`Pedido malformado (${caminho}): ${mensagemDaApi}`);
    throw new Error(`Pedido malformado: ${mensagemDaApi}`);
  }

  throw new Error(
    mensagemDaApi ||
      "O serviço respondeu com um erro. Tenta de novo em instantes.",
  );
}

/** Histórico completo de audições (array pesado; a store faz cache). */
export function obterScrobbles(): Promise<Scrobble[]> {
  return pedir<Scrobble[]>("/scrobbles");
}

/** Perfil de um artista (usa encodeURIComponent para acentos e espaços). */
export function obterArtistInfo(nome: string): Promise<ArtistInfo> {
  return pedir<ArtistInfo>(`/artist-info?artist=${encodeURIComponent(nome)}`);
}

/** Perfil de um álbum, sobretudo para o track_count. */
export function obterAlbumInfo(
  artista: string,
  album: string,
): Promise<AlbumInfo> {
  return pedir<AlbumInfo>(
    `/album-info?artist=${encodeURIComponent(artista)}` +
      `&album=${encodeURIComponent(album)}`,
  );
}

/** Mensagem amigável para qualquer erro apanhado. */
export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof Error && erro.message) return erro.message;
  return "Ocorreu um erro inesperado. Tenta de novo.";
}
