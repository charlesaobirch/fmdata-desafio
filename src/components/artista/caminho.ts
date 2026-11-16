/**
 * O nome do artista viaja no URL. Ida e volta passam sempre por aqui
 * (guia, 8.1): espaços, acentos, "&" ou "/" (K/DA) partiam a rota.
 */

/** Link para a página de um artista: o nome vai sempre codificado. */
export function caminhoDoArtista(nome: string): string {
  return `/artistas/${encodeURIComponent(nome)}`;
}

/**
 * O inverso, à entrada da rota. Um "%" solto num URL escrito à mão
 * faz o decodeURIComponent lançar URIError: nesse caso usa-se o
 * segmento tal como veio, e a página diz "não encontrado" em vez de
 * rebentar.
 */
export function nomeDoSegmento(segmento: string): string {
  try {
    return decodeURIComponent(segmento).trim();
  } catch {
    return segmento.trim();
  }
}
