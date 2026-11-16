import amostra from "../scrobbles-amostra.json";
import {
  albunsDoArtista,
  artistasSemelhantes,
  resumoDoArtista,
  scrobblesPorMes,
  topMusicasDoArtista,
  ultimasAudicoes,
} from "../src/lib/artist";
import { dataDeReferencia, parseDataScrobble } from "../src/lib/dates";
import {
  filtrarPorArtista,
  filtrarPorPeriodo,
  normalizarNome,
  removerSemData,
  separarLista,
} from "../src/lib/filters";
import {
  generoMaisOuvido,
  horaDePico,
  scrobblesPorHora,
  topAlbuns,
  topArtistas,
  topGeneros,
  topMusicas,
  totalArtistasDistintos,
  totalScrobbles,
} from "../src/lib/stats";
import type { ArtistInfo, Scrobble } from "../src/types";

const scrobbles = amostra as Scrobble[];
let falhas = 0;

function verificar(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) {
    console.log(`  ✔ ${nome}`);
  } else {
    falhas += 1;
    console.error(`  ✘ ${nome} ${detalhe}`);
  }
}

console.log("\n[dates]");
verificar(
  "nowplaying sem data devolve null",
  parseDataScrobble(scrobbles[0]) === null,
);
const referencia = dataDeReferencia(scrobbles);
verificar("dataDeReferencia existe na amostra", referencia !== null);
verificar("array vazio devolve null", dataDeReferencia([]) === null);

console.log("\n[filters]");
verificar(
  "separarLista trata espaços e vazios",
  JSON.stringify(separarLista("rock, indie , ,pop")) ===
    JSON.stringify(["rock", "indie", "pop"]),
);
verificar(
  "normalizarNome remove acentos e caixa",
  normalizarNome("  Beyoncé ") === "beyonce",
);
const semData = removerSemData(scrobbles);
verificar(
  "removerSemData elimina nowplaying",
  semData.length < scrobbles.length && semData.every((s) => !s.nowplaying),
);
const em24h = filtrarPorPeriodo(semData, "24h");
verificar(
  "24h é subconjunto do tudo",
  em24h.length <= semData.length,
  `(24h: ${em24h.length}, tudo: ${semData.length})`,
);
verificar(
  "periodo 'tudo' devolve tudo",
  filtrarPorPeriodo(semData, "tudo") === semData,
);

console.log("\n[stats]");
verificar(
  "totalScrobbles bate certo",
  totalScrobbles(semData) === semData.length,
);
verificar("totalArtistasDistintos > 0", totalArtistasDistintos(semData) > 0);
const porHora = scrobblesPorHora(semData);
verificar("scrobblesPorHora tem 24 posições", porHora.length === 24);
verificar(
  "soma das 24 horas = total com data",
  porHora.reduce((a, b) => a + b, 0) === semData.length,
  `(soma: ${porHora.reduce((a, b) => a + b, 0)})`,
);
verificar("horaDePico entre 0 e 23", (horaDePico(porHora) ?? -1) >= 0);
verificar("topArtistas <= 20", topArtistas(semData).length <= 20);
const musicas = topMusicas(semData, 10);
verificar(
  "topMusicas tem subtitulo (artista)",
  musicas.every((m) => typeof m.subtitulo === "string"),
);
const musicasDuasVezes = [
  ...semData,
  {
    ...semData[1],
    nowplaying: false,
    date_uts: 1,
    date_iso: "1970-01-01T00:00:01.000Z",
  },
];
verificar(
  "chave artista+faixa agrupa corretamente",
  topMusicas(musicasDuasVezes, 100)[0].contagem >=
    topMusicas(semData, 100)[0].contagem,
);
verificar("topAlbuns <= 8", topAlbuns(semData).length <= 8);
const genero = generoMaisOuvido(semData);
verificar("generoMaisOuvido existe", genero !== null, JSON.stringify(genero));
const top5 = topGeneros(semData);
console.log(
  "    top5 géneros:",
  top5.map((g) => `${g.genero} ${g.percentagem.toFixed(1)}%`).join(", "),
);
verificar("topGeneros devolve 5", top5.length === 5);
verificar(
  "topGeneros[0] é o generoMaisOuvido",
  top5[0]?.genero === genero?.genero && top5[0]?.contagem === genero?.contagem,
);
verificar(
  "topGeneros ordenado do mais para o menos ouvido",
  top5.every((g, i) => i === 0 || top5[i - 1].contagem >= g.contagem),
);
verificar(
  "topGeneros: percentagem = contagem / audições",
  top5.every(
    (g) => Math.abs(g.percentagem - (g.contagem / semData.length) * 100) < 1e-9,
  ),
);

console.log("\n[artist]");
const nomeArtista = topArtistas(semData, 1)[0].nome;
const doArtista = filtrarPorArtista(semData, nomeArtista);
verificar("filtrarPorArtista encontra audições", doArtista.length > 0);
verificar(
  "artistaExiste true/false",
  artistaExisteBool(semData, nomeArtista) &&
    !artistaExisteBool(semData, "ZZZ-Inexistente"),
);
const resumo = resumoDoArtista(doArtista, semData);
console.log(`    resumo(${nomeArtista}):`, resumo);
verificar(
  "percentagem entre 0 e 100",
  resumo.percentagemDoTotal >= 0 && resumo.percentagemDoTotal <= 100,
);
verificar(
  "topMusicasDoArtista <= 10",
  topMusicasDoArtista(doArtista).length <= 10,
);
const meses = scrobblesPorMes(doArtista);
verificar("scrobblesPorMes cronológico e contíguo", mesesContiguos(meses));
const ultimas = ultimasAudicoes(doArtista, 5);
verificar("ultimasAudicoes <= 5", ultimas.length <= 5);
const infoFalsa: ArtistInfo = {
  name: nomeArtista,
  image_url: "",
  tags: "",
  listeners_global: 0,
  bio_summary: "",
  bio_content: "",
  similar_artists: `${nomeArtista}, ZZZ-Nao-Existe`,
  url_lastfm: "",
  url_wikipedia: null,
  url_musicbrainz: null,
};
const semelhantes = artistasSemelhantes(infoFalsa, semData);
verificar(
  "artistaSemelhante: ouvido=true e inexistente=false",
  semelhantes.some((a) => a.ouvido) && semelhantes.some((a) => !a.ouvido),
);
const albuns = albunsDoArtista(doArtista);
verificar(
  "albunsDoArtista com faixas distintas",
  albuns.every((a) => a.faixasDistintasOuvidas <= a.totalAudicoes),
);

console.log(
  falhas === 0
    ? "\n✅ TODOS OS TESTES PASSARAM\n"
    : `\n❌ ${falhas} TESTE(S) FALHARAM\n`,
);
process.exit(falhas === 0 ? 0 : 1);

/* --- auxiliares de teste --- */
function artistaExisteBool(sc: Scrobble[], nome: string): boolean {
  const alvo = normalizarNome(nome);
  return sc.some((s) => normalizarNome(s.artist_name) === alvo);
}

function mesesContiguos(pontos: { mes: string; contagem: number }[]): boolean {
  for (let i = 1; i < pontos.length; i += 1) {
    const anterior = pontos[i - 1].mes;
    const atual = pontos[i].mes;
    const [anoA, mesA] = anterior.split("-").map(Number);
    const [anoB, mesB] = atual.split("-").map(Number);
    const sequencial =
      (anoA === anoB && mesB === mesA + 1) ||
      (anoB === anoA + 1 && mesA === 12 && mesB === 1);
    if (!sequencial) return false; // sem saltos de meses
  }
  return true;
}
