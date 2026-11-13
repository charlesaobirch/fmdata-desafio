/**
 * Testes contra o DATASET COMPLETO (51 522 scrobbles) — não só a amostra.
 *
 * O destaque é o "teste de ouro": o nosso scrobblesPorHora aplicado ao
 * dataset tem de coincidir EXATAMENTE com o /stats/listening-clock
 * oficial da API. Se coincidir, dates + filters + stats estão corretos
 * de uma só vez.
 *
 * Correr: npx tsx scripts/teste-dataset-completo.ts
 */
import { readFileSync } from "node:fs";
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
} from "../src/lib/filters";
import {
  generoMaisOuvido,
  horaDePico,
  scrobblesPorHora,
  topAlbuns,
  topArtistas,
  topMusicas,
  totalArtistasDistintos,
  totalScrobbles,
} from "../src/lib/stats";
import type { ArtistInfo, Scrobble } from "../src/types";

const API = "https://fmdata-api.onrender.com";
let falhas = 0;

function verificar(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) {
    console.log(`  ✔ ${nome}`);
  } else {
    falhas += 1;
    console.error(`  ✘ ${nome} ${detalhe}`);
  }
}

/* ---------- 0. Carregar o dataset completo ---------- */

const inicio = Date.now();
const dados: unknown = JSON.parse(
  readFileSync("scrobbles-completo.json", "utf8"),
);
const scrobbles = dados as Scrobble[];

console.log(
  `\n[dataset] ${scrobbles.length} scrobbles carregados em ${Date.now() - inicio} ms`,
);
verificar(
  "dataset carrega e é um array grande (51 522)",
  Array.isArray(scrobbles) && scrobbles.length === 51522,
);

/* ---------- 1. Integridade dos dados ---------- */

console.log("\n[integridade]");
verificar(
  "todos os registos têm track_name e artist_name (strings)",
  scrobbles.every(
    (s) =>
      typeof s.track_name === "string" &&
      typeof s.artist_name === "string" &&
      s.track_name !== "" &&
      s.artist_name !== "",
  ),
);
verificar(
  "loved é sempre 0 ou 1",
  scrobbles.every((s) => s.loved === 0 || s.loved === 1),
);
const semAlbum = scrobbles.filter((s) => s.album_name.trim() === "");
console.log(`    (dataset tem ${semAlbum.length} scrobbles sem álbum)`);

/* ---------- 2. Teste de ouro: relógio 24h vs. endpoint oficial ---------- */

console.log("\n[teste de ouro: scrobblesPorHora vs /stats/listening-clock]");

const respostaClock = await fetch(`${API}/stats/listening-clock`);
verificar("endpoint /stats/listening-clock responde 200", respostaClock.ok);
// a resposta é um array direto de { hour, scrobbles }
const clockOficial = (await respostaClock.json()) as {
  hour: number;
  scrobbles: number;
}[];

const nossoRelogio = scrobblesPorHora(scrobbles);
const oficial = new Array<number>(24).fill(0);
for (const h of clockOficial) oficial[h.hour] = h.scrobbles;

let divergencias = 0;
for (let h = 0; h < 24; h += 1) {
  if (nossoRelogio[h] !== oficial[h]) divergencias += 1;
}
verificar(
  "as 24 horas coincidem EXATAMENTE com as oficiais",
  divergencias === 0,
  `(${divergencias} divergências; nosso=${nossoRelogio.join(",")} oficial=${oficial.join(",")})`,
);
verificar(
  "horaDePico coincide com a hora de pico oficial",
  horaDePico(nossoRelogio) === horaDePico(oficial),
);

/* ---------- 3. Consistência dos totais ---------- */

console.log("\n[totais e filtros]");
verificar(
  "totalScrobbles = comprimento do array",
  totalScrobbles(scrobbles) === scrobbles.length,
);
const normalizados = new Set(
  scrobbles.map((s) => normalizarNome(s.artist_name)),
);
verificar(
  "totalArtistasDistintos = artistas após normalizar (2081)",
  totalArtistasDistintos(scrobbles) === normalizados.size &&
    normalizados.size > 2000,
  `(obtido ${totalArtistasDistintos(scrobbles)}, esperado ${normalizados.size})`,
);

const limpos = removerSemData(scrobbles);
verificar(
  "removerSemData remove apenas os sem data válida",
  limpos.length <= scrobbles.length &&
    limpos.every((s) => parseDataScrobble(s) !== null),
);
const somaDasHoras = nossoRelogio.reduce((a, b) => a + b, 0);
verificar(
  "soma das 24 horas = scrobbles com data válida (fecha bem)",
  somaDasHoras === limpos.length,
  `(${somaDasHoras} vs ${limpos.length})`,
);

const referencia = dataDeReferencia(scrobbles);
verificar("dataDeReferencia existe no dataset completo", referencia !== null);
const inicioJanela =
  referencia === null ? 0 : referencia.getTime() - 86_400_000;
const ultimas24 = filtrarPorPeriodo(scrobbles, "24h");
verificar(
  "período 24h não vazio e dentro do total",
  ultimas24.length > 0 && ultimas24.length < scrobbles.length,
);
verificar(
  "todas as audições do 24h estão dentro da janela",
  ultimas24.every((s) => {
    const data = parseDataScrobble(s);
    return data !== null && data.getTime() >= inicioJanela;
  }),
);

/* ---------- 4. Rankings em escala ---------- */

console.log("\n[rankings]");
const inicioRanking = Date.now();
const artistas = topArtistas(scrobbles, 20);
const musicas = topMusicas(scrobbles, 10);
const albuns = topAlbuns(scrobbles, 8);
console.log(`    (3 rankings sobre 51k em ${Date.now() - inicioRanking} ms)`);

verificar(
  "topArtistas devolve 20, ordenado por contagem decrescente",
  artistas.length === 20 &&
    artistas.every((a, i) => i === 0 || artistas[i - 1].contagem >= a.contagem),
);
verificar(
  "o 1.º do topArtistas é o artista com mais scrobbles no dataset",
  (() => {
    const esperado = new Map<string, number>();
    for (const s of scrobbles) {
      const k = normalizarNome(s.artist_name);
      esperado.set(k, (esperado.get(k) ?? 0) + 1);
    }
    const [melhor, contagem] = [...esperado.entries()].sort(
      (a, b) => b[1] - a[1],
    )[0];
    return artistas[0].chave === melhor && artistas[0].contagem === contagem;
  })(),
);
verificar(
  "topMusicas: toda a entrada tem artista no subtítulo",
  musicas.every((m) => (m.subtitulo ?? "") !== ""),
);
verificar(
  "topAlbuns: nenhum nome vazio (os 5 sem álbum não aparecem)",
  albuns.every((a) => a.nome.trim() !== ""),
);
const genero = generoMaisOuvido(scrobbles);
verificar(
  "generoMaisOuvido existe e tem contagem > 0",
  genero !== null && genero.contagem > 0,
);
console.log(
  `    (género dominante no dataset: ${genero?.genero}, ${genero?.contagem} audições)`,
);

/* ---------- 5. Pipeline completo de um artista real ---------- */

console.log("\n[pipeline do artista mais ouvido]");
const nomeTop = artistas[0].nome;
const doArtista = filtrarPorArtista(scrobbles, nomeTop);
console.log(`    (artista: "${nomeTop}" — ${doArtista.length} audições)`);

const resumo = resumoDoArtista(doArtista, scrobbles);
verificar(
  "resumo: total bate certo e % entre 0 e 100",
  resumo.totalAudicoes === doArtista.length &&
    resumo.percentagemDoTotal > 0 &&
    resumo.percentagemDoTotal <= 100,
);
verificar(
  "favoritas = faixas distintas com loved=1 (≤ audições loved)",
  resumo.faixasFavoritas <= doArtista.filter((s) => s.loved === 1).length,
);
verificar(
  "topMusicasDoArtista ordenado e ≤ 10",
  topMusicasDoArtista(doArtista, 10).length <= 10,
);
verificar(
  "albunsDoArtista: faixas distintas ≤ audições por álbum",
  albunsDoArtista(doArtista).every(
    (a) => a.faixasDistintasOuvidas <= a.totalAudicoes,
  ),
);
verificar(
  "scrobblesPorMes: meses contíguos sem saltos",
  (() => {
    const pontos = scrobblesPorMes(doArtista);
    for (let i = 1; i < pontos.length; i += 1) {
      const [anoA, mesA] = pontos[i - 1].mes.split("-").map(Number);
      const [anoB, mesB] = pontos[i].mes.split("-").map(Number);
      const diff = anoB * 12 + mesB - (anoA * 12 + mesA);
      if (diff !== 1) return false;
    }
    return pontos.length > 0;
  })(),
);
verificar(
  "ultimasAudicoes: as 10 mais recentes, por ordem desc",
  (() => {
    const ultimas = ultimasAudicoes(doArtista, 10);
    for (let i = 1; i < ultimas.length; i += 1) {
      const a = parseDataScrobble(ultimas[i - 1])?.getTime() ?? 0;
      const b = parseDataScrobble(ultimas[i])?.getTime() ?? 0;
      if (a < b) return false;
    }
    return ultimas.length === 10;
  })(),
);

/* ---------- 6. Artistas semelhantes cruzados com o dataset ---------- */

console.log("\n[perfis e semelhantes]");
const perfilResposta = await fetch(
  `${API}/artist-info?artist=${encodeURIComponent(nomeTop)}`,
);
if (perfilResposta.ok) {
  const perfil = (await perfilResposta.json()) as ArtistInfo;
  const semelhantes = artistasSemelhantes(perfil, scrobbles);
  const ouvidos = semelhantes.filter((s) => s.ouvido).length;
  console.log(
    `    ("${nomeTop}": ${semelhantes.length} semelhantes, ${ouvidos} já ouvidos)`,
  );
  verificar(
    "todo semelhante marcado 'ouvido' existe mesmo no dataset",
    semelhantes
      .filter((s) => s.ouvido)
      .every((s) => filtrarPorArtista(scrobbles, s.nome).length > 0),
  );
  verificar(
    "todo semelhante não ouvido NÃO existe no dataset",
    semelhantes
      .filter((s) => !s.ouvido)
      .every((s) => filtrarPorArtista(scrobbles, s.nome).length === 0),
  );
} else {
  console.log(`    (sem perfil para "${nomeTop}" — teste ignorado)`);
}

/* ---------- Fecho ---------- */

console.log(
  falhas === 0
    ? "\n✅ TODOS OS TESTES DO DATASET COMPLETO PASSARAM\n"
    : `\n❌ ${falhas} TESTE(S) FALHARAM\n`,
);
process.exit(falhas === 0 ? 0 : 1);
