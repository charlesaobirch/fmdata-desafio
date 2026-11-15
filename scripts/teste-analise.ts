import { readFileSync } from "node:fs";
import {
  artistaDeCasa,
  generoPorFaixaDoDia,
  maiorSequenciaRepetida,
  primeiraEUltimaDoDia,
  TAXAS_POR_REPRODUCAO,
  valorEstimado,
} from "../src/lib/analise";
import type { Scrobble } from "../src/types";

const scrobbles = JSON.parse(
  readFileSync("./scrobbles-completo.json", "utf8"),
) as Scrobble[];

let falhas = 0;

function verificar(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) {
    console.log(`  OK  ${nome}`);
  } else {
    falhas += 1;
    console.error(`  FALHOU  ${nome} ${detalhe}`);
  }
}

console.log(`\n[analise] ${scrobbles.length} scrobbles`);

const maratona = maiorSequenciaRepetida(scrobbles);
console.log("  maratona:", maratona);

verificar("maratona existe", maratona !== null);
verificar(
  "a faixa e Easy on Me",
  maratona?.faixa === "Easy on Me",
  `(veio ${maratona?.faixa})`,
);
verificar(
  "foram 27 vezes seguidas",
  maratona?.vezes === 27,
  `(vieram ${maratona?.vezes})`,
);
verificar("array vazio devolve null", maiorSequenciaRepetida([]) === null);

const casa = artistaDeCasa(scrobbles);
console.log("  artista de casa:", casa?.nome, casa?.audicoes);
console.log("  faixas:", casa?.faixasDistintas);
console.log("  manhas:", casa?.manhasQueAbriu);
console.log("  noites:", casa?.noitesQueFechou);
console.log("  album:", casa?.albumPrincipal);
console.log("  pico:", casa?.anoDePico);
console.log("  por ano:", casa?.porAno);

verificar("e a Adele", casa?.nome === "Adele", `(veio ${casa?.nome})`);
verificar(
  "4345 audicoes",
  casa?.audicoes === 4345,
  `(vieram ${casa?.audicoes})`,
);
verificar(
  "58 faixas distintas",
  casa?.faixasDistintas === 58,
  `(vieram ${casa?.faixasDistintas})`,
);
verificar(
  "213 manhas",
  casa?.manhasQueAbriu === 213,
  `(vieram ${casa?.manhasQueAbriu})`,
);
verificar(
  "185 noites",
  casa?.noitesQueFechou === 185,
  `(vieram ${casa?.noitesQueFechou})`,
);
verificar(
  "album principal e o 30",
  casa?.albumPrincipal?.nome === "30",
  `(veio ${casa?.albumPrincipal?.nome})`,
);
verificar(
  "ano de pico e 2021",
  casa?.anoDePico?.ano === 2021,
  `(veio ${casa?.anoDePico?.ano})`,
);
verificar("vazio devolve null", artistaDeCasa([]) === null);

/* ---------- 3 · primeiraEUltimaDoDia ---------- */

const dia = primeiraEUltimaDoDia(scrobbles);
console.log("  dias com musica:", dia?.diasComMusica);
console.log("  quem abre:", dia?.quemAbre.slice(0, 3));
console.log("  quem fecha:", dia?.quemFecha.slice(0, 3));
console.log("  faixa que mais abre:", dia?.faixaQueMaisAbre);
console.log("  faixa que mais fecha:", dia?.faixaQueMaisFecha);
console.log("  mesma faixa:", dia?.diasComMesmaFaixa);

const abreDe = (nome: string) =>
  dia?.quemAbre.find((a) => a.artista === nome)?.dias;
const fechaDe = (nome: string) =>
  dia?.quemFecha.find((a) => a.artista === nome)?.dias;

verificar(
  "2122 dias com musica",
  dia?.diasComMusica === 2122,
  `(vieram ${dia?.diasComMusica})`,
);
verificar(
  "Adele abre 213 dias (e lidera)",
  dia?.quemAbre[0]?.artista === "Adele" && abreDe("Adele") === 213,
  `(veio ${dia?.quemAbre[0]?.artista} ${abreDe("Adele")})`,
);
verificar(
  "Adele fecha 185 dias (e lidera)",
  dia?.quemFecha[0]?.artista === "Adele" && fechaDe("Adele") === 185,
  `(veio ${dia?.quemFecha[0]?.artista} ${fechaDe("Adele")})`,
);
verificar(
  "Tove Lo abre 140 dias (segunda)",
  dia?.quemAbre[1]?.artista === "Tove Lo" && abreDe("Tove Lo") === 140,
  `(veio ${dia?.quemAbre[1]?.artista} ${abreDe("Tove Lo")})`,
);
// "Turning Tables" e "Strangers by Nature" empatam com 14 dias;
// o desempate alfabético pela chave escolhe "Strangers by Nature"
verificar(
  "faixa que mais abre: 14 dias, uma das duas empatadas",
  dia?.faixaQueMaisAbre?.dias === 14 &&
    ["Turning Tables", "Strangers by Nature"].includes(
      dia?.faixaQueMaisAbre?.faixa ?? "",
    ),
  `(veio ${dia?.faixaQueMaisAbre?.faixa} ${dia?.faixaQueMaisAbre?.dias})`,
);
verificar(
  "faixa que mais fecha: True Disaster, Tove Lo, 12 dias",
  dia?.faixaQueMaisFecha?.faixa === "True Disaster" &&
    dia?.faixaQueMaisFecha?.artista === "Tove Lo" &&
    dia?.faixaQueMaisFecha?.dias === 12,
  `(veio ${dia?.faixaQueMaisFecha?.faixa} ${dia?.faixaQueMaisFecha?.dias})`,
);
// 127 (e não 126): em 121 dias há várias audições no mesmo segundo
// numa das pontas. extremosDoDia fica, nas duas pontas, com a primeira
// empatada na ordem do array — o mesmo critério que dá Adele 213/185.
// Ficar com a última empatada só para o fecho daria 126, mas também
// Adele 184 noites: os dois números só são coerentes com um critério.
// Dos 127, 97 são dias com uma só audição; com 2+ audições são 30.
verificar(
  "127 dias abriram e fecharam com a mesma faixa",
  dia?.diasComMesmaFaixa === 127,
  `(vieram ${dia?.diasComMesmaFaixa})`,
);
verificar("vazio devolve null (dia)", primeiraEUltimaDoDia([]) === null);

// casos pequenos feitos à mão
const falso = (
  artista: string,
  faixa: string,
  uts: number | null,
): Scrobble => ({
  track_name: faixa,
  artist_name: artista,
  album_name: "",
  date_iso: null,
  date_uts: uts,
  tags: "",
  loved: 0,
  image_url: null,
  nowplaying: uts === null,
});
const H = 3600;
const D1 = Date.UTC(2024, 0, 1) / 1000;
const D2 = Date.UTC(2024, 0, 2) / 1000;

const mao = primeiraEUltimaDoDia([
  falso("B", "b1", D1 + 9 * H),
  falso("A", "a1", D1 + 8 * H), // abre o dia 1
  falso("C", "c1", D1 + 23 * H), // fecha o dia 1
  falso("Z", "z1", null), // sem data: ignorada
  falso("A", "a1", D2 + 10 * H), // dia 2 com uma só audição
]);
verificar("mao: 2 dias", mao?.diasComMusica === 2);
verificar(
  "mao: A abre os 2 dias",
  mao?.quemAbre[0]?.artista === "A" && mao?.quemAbre[0]?.dias === 2,
);
verificar(
  "mao: sem data nao entra nos rankings",
  !mao?.quemAbre.some((a) => a.artista === "Z") &&
    !mao?.quemFecha.some((a) => a.artista === "Z"),
);
verificar(
  "mao: empate em quem fecha desempata por ordem alfabetica",
  mao?.quemFecha.map((a) => a.artista).join(",") === "A,C",
  `(veio ${mao?.quemFecha.map((a) => a.artista).join(",")})`,
);
verificar(
  "mao: dia com uma so audicao conta como mesma faixa",
  mao?.diasComMesmaFaixa === 1,
  `(vieram ${mao?.diasComMesmaFaixa})`,
);
verificar(
  "so audicoes sem data devolve null",
  primeiraEUltimaDoDia([falso("Z", "z1", null)]) === null,
);

/* ---------- 4 · generoPorFaixaDoDia ---------- */

const generos = generoPorFaixaDoDia(scrobbles);
for (const m of generos ?? []) {
  console.log(
    `  ${m.rotulo} (${m.audicoes}):`,
    m.tags
      .slice(0, 4)
      .map((t) => `${t.tag} ${t.indice.toFixed(2)}`)
      .join(" | "),
  );
}

const indice = (momento: string, tag: string) =>
  generos
    ?.find((m) => m.momento === momento)
    ?.tags.find((t) => t.tag === tag)
    ?.indice.toFixed(2);

const gabaritoGenero: [string, string, string][] = [
  ["manha", "mpb", "1.32"],
  ["manha", "funk", "1.29"],
  ["manha", "dance", "1.16"],
  ["manha", "brazilian", "1.15"],
  // 1.3259 arredonda para 1.33: quota sobre as audições com tags (as
  // sem tags ficam fora do denominador). Com todas as audições daria
  // 1.32 aqui, mas falhava mpb, brazilian, ambient e instrumental.
  ["madrugada", "female vocalist", "1.33"],
  ["madrugada", "british", "1.24"],
  ["madrugada", "funk", "0.74"],
  ["madrugada", "brazil", "0.78"],
  ["noite", "ambient", "1.37"],
  ["noite", "instrumental", "1.24"],
];
for (const [momento, tag, esperado] of gabaritoGenero) {
  verificar(
    `${momento}: ${tag} ${esperado}`,
    indice(momento, tag) === esperado,
    `(veio ${indice(momento, tag)})`,
  );
}
verificar(
  "quatro momentos, a cobrir todas as audicoes com data",
  generos?.length === 4 &&
    generos.reduce((soma, m) => soma + m.audicoes, 0) ===
      scrobbles.filter((s) => s.date_uts !== null).length,
);
verificar(
  "nenhuma tag abaixo de 200 ocorrencias",
  (generos ?? []).every((m) => m.tags.every((t) => t.ocorrencias >= 200)),
);
verificar("vazio devolve null (genero)", generoPorFaixaDoDia([]) === null);

// casos à mão: 2 audições de manhã (rock, pop) e 2 à noite (pop, sem tags)
const comTags = (tags: string, uts: number): Scrobble => ({
  ...falso("A", "a", uts),
  tags,
});
const maoGenero = generoPorFaixaDoDia(
  [
    comTags("rock, Pop", D1 + 7 * H),
    comTags("pop", D1 + 8 * H),
    comTags("POP", D1 + 20 * H),
    comTags("", D1 + 21 * H),
    falso("A", "a", null),
  ],
  1,
);
const maoIndice = (momento: string, tag: string) =>
  maoGenero?.find((m) => m.momento === momento)?.tags.find((t) => t.tag === tag)
    ?.indice;
// pop: 3 de 3 audições com tags no total (quota 1); manhã 2/2; noite 1/1
verificar(
  "mao: tags normalizadas (Pop = POP = pop)",
  maoIndice("manha", "pop") === 1,
);
verificar(
  "mao: audicao sem tags fica fora do denominador",
  maoIndice("noite", "pop") === 1,
);
// rock: 1/3 no total, 1/2 de manhã → índice 1.5
verificar("mao: indice rock de manha 1.5", maoIndice("manha", "rock") === 1.5);
verificar(
  "mao: noite conta 2 audicoes com data",
  maoGenero?.find((m) => m.momento === "noite")?.audicoes === 2,
);
verificar(
  "mao: minimo filtra tags raras",
  generoPorFaixaDoDia([comTags("rock", D1)], 2)?.[0].tags.length === 0,
);
verificar(
  "so audicoes sem tags devolve null",
  generoPorFaixaDoDia([comTags("", D1)]) === null,
);

/* ---------- 5 · valorEstimado ---------- */

const valor = valorEstimado(scrobbles);
console.log("  total:", valor?.total.minimo, "a", valor?.total.maximo);
console.log(
  "  artista:",
  valor?.artistaPrincipal.nome,
  valor?.artistaPrincipal.minimo,
  "a",
  valor?.artistaPrincipal.maximo,
);

const quase = (a: number | undefined, b: number) =>
  a !== undefined && Math.abs(a - b) < 1e-9;
const naPlataforma = (
  e: { porPlataforma: { plataforma: string; valor: number }[] } | undefined,
  p: string,
) => e?.porPlataforma.find((x) => x.plataforma === p)?.valor;

// esperados à mão: 51 522 e 4 345 (já validados acima) × taxa
verificar("total: 51522 reproducoes", valor?.total.reproducoes === 51522);
verificar(
  "total YouTube 36.0654",
  quase(naPlataforma(valor?.total, "youtube"), 36.0654),
);
verificar(
  "total Spotify 206.088",
  quase(naPlataforma(valor?.total, "spotify"), 206.088),
);
verificar(
  "total Apple 412.176",
  quase(naPlataforma(valor?.total, "apple"), 412.176),
);
verificar(
  "total Tidal 669.786",
  quase(naPlataforma(valor?.total, "tidal"), 669.786),
);
verificar(
  "total: intervalo = YouTube a Tidal",
  quase(valor?.total.minimo, 36.0654) && quase(valor?.total.maximo, 669.786),
);
verificar(
  "artista principal e a Adele com 4345",
  valor?.artistaPrincipal.nome === "Adele" &&
    valor?.artistaPrincipal.reproducoes === 4345,
);
verificar(
  "Adele: intervalo 3.0415 a 56.485",
  quase(valor?.artistaPrincipal.minimo, 3.0415) &&
    quase(valor?.artistaPrincipal.maximo, 56.485),
);
verificar(
  "Adele Spotify 17.38",
  quase(naPlataforma(valor?.artistaPrincipal, "spotify"), 17.38),
);
verificar(
  "quatro plataformas com taxa visivel",
  valor?.total.porPlataforma.length === TAXAS_POR_REPRODUCAO.length &&
    valor.total.porPlataforma.every((p) => p.taxa > 0),
);
verificar("vazio devolve null (valor)", valorEstimado([]) === null);

// casos à mão
const maoValor = valorEstimado(
  [falso("b", "x", D1), falso("B", "y", D1 + H), falso("a", "z", D1)],
  [
    { plataforma: "spotify", rotulo: "Spotify", taxa: 1 },
    { plataforma: "tidal", rotulo: "Tidal", taxa: 2 },
  ],
);
verificar(
  "mao: artista agrupado por nome normalizado (b + B = 2)",
  maoValor?.artistaPrincipal.reproducoes === 2 &&
    maoValor.artistaPrincipal.maximo === 4,
);
verificar(
  "mao: taxas personalizadas",
  maoValor?.total.minimo === 3 && maoValor.total.maximo === 6,
);
const empate = valorEstimado([falso("Zeca", "x", D1), falso("Ana", "y", D1)]);
verificar(
  "mao: empate de artistas desempata por ordem alfabetica",
  empate?.artistaPrincipal.nome === "Ana",
  `(veio ${empate?.artistaPrincipal.nome})`,
);
verificar(
  "sem taxas devolve null",
  valorEstimado(scrobbles.slice(0, 1), []) === null,
);

console.log(
  falhas === 0
    ? "\nTODOS OS TESTES PASSARAM\n"
    : `\n${falhas} TESTE(S) FALHARAM\n`,
);
process.exit(falhas === 0 ? 0 : 1);
