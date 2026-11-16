import {
  albunsDoArtista,
  artistaExiste,
  resumoDoArtista,
  scrobblesPorMes,
} from "../src/lib/artist";
import { dataDeReferencia, horaUTC, parseDataScrobble } from "../src/lib/dates";
import {
  filtrarPorPeriodo,
  normalizarNome,
  removerSemData,
} from "../src/lib/filters";
import {
  generoMaisOuvido,
  horaDePico,
  scrobblesPorHora,
  topAlbuns,
  topGeneros,
} from "../src/lib/stats";
import type { Scrobble } from "../src/types";

let falhas = 0;

function verificar(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) {
    console.log(`  ✔ ${nome}`);
  } else {
    falhas += 1;
    console.error(`  ✘ ${nome} ${detalhe}`);
  }
}

/** Fábrica de scrobbles para os casos limite, à mão. */
function sc(atributos: Partial<Scrobble> = {}): Scrobble {
  return {
    track_name: "Faixa",
    artist_name: "Artista",
    album_name: "",
    date_iso: null,
    date_uts: null,
    tags: "",
    loved: 0,
    image_url: null,
    nowplaying: false,
    ...atributos,
  };
}

console.log("\n[casos limite: dates]");
verificar(
  "date_iso inválida → null",
  parseDataScrobble(sc({ date_iso: "isto-não-é-uma-data" })) === null,
);
const epocaZero = sc({ date_uts: 0 });
const dataEpocaZero = parseDataScrobble(epocaZero);
verificar(
  "date_uts=0 → 1 jan 1970, hora UTC 0",
  dataEpocaZero !== null && horaUTC(dataEpocaZero) === 0,
);
verificar(
  "só nowplaying → dataDeReferencia null",
  dataDeReferencia([
    sc({ nowplaying: true }),
    sc({ date_uts: null, date_iso: null }),
  ]) === null,
);

console.log("\n[casos limite: filters]");
verificar(
  "período 24h com dados antigos e referência antiga → não vazio",
  filtrarPorPeriodo(
    [
      sc({ date_uts: 1767238200 }), // 1 jan 2026 ~03:30 UTC
      sc({ date_uts: 1767230000 }),
      sc({ nowplaying: true }),
    ],
    "24h",
  ).length === 2,
);
verificar(
  "tudo com nowplaying/sem data → removerSemData esvazia",
  removerSemData([sc({ nowplaying: true }), sc()]).length === 0,
);
verificar(
  "normalizarNome com hífen e espaços duplos",
  normalizarNome("  A-ha  ") === "a-ha",
);

console.log("\n[casos limite: stats]");
verificar(
  "horaDePico com tudo a zero → null",
  horaDePico([0, 0, 0, 0]) === null,
);
verificar(
  "scrobblesPorHora concentra as 2 audições na mesma hora UTC",
  (() => {
    const porHora = scrobblesPorHora([
      sc({ date_uts: 1767238200 }), // 03:30 UTC
      sc({ date_uts: 1767240000 }), // 04:00 UTC
      sc({ date_uts: 1767239999 }), // 03:59:59 UTC
    ]);
    return porHora[3] === 2 && porHora[4] === 1;
  })(),
);
verificar(
  "generoMaisOuvido com array vazio → null",
  generoMaisOuvido([]) === null,
);
verificar(
  "generoMaisOuvido sem tags → null",
  generoMaisOuvido([sc({ tags: "" }), sc({ tags: " " })]) === null,
);
verificar(
  "Rock e rock contam juntas",
  (() => {
    const g = generoMaisOuvido([
      sc({ tags: "Rock" }),
      sc({ tags: "rock" }),
      sc({ tags: "rock, indie" }),
      sc({ tags: "indie" }),
    ]);
    // contagens desiguais: rock=3, indie=2 (com 2-2 o empate ia para
    // "indie" por ordem alfabética, o que seria correto mas confuso)
    return g?.genero === "rock" && g.contagem === 3;
  })(),
);
verificar("topGeneros com array vazio → []", topGeneros([]).length === 0);
verificar(
  "topGeneros sem tags → []",
  topGeneros([sc({ tags: "" }), sc({ tags: " " })]).length === 0,
);
verificar(
  "topGeneros: Rock e rock juntas, percentagem sobre as audições",
  (() => {
    const t = topGeneros([
      sc({ tags: "Rock" }),
      sc({ tags: "rock, indie" }),
      sc({ tags: "indie" }),
      sc({ tags: "" }),
    ]);
    // rock 2 de 4 (50%), indie 2 de 4 (50%): empate por ordem alfabética
    return (
      t.length === 2 &&
      t[0].genero === "indie" &&
      t[1].genero === "rock" &&
      t[1].percentagem === 50
    );
  })(),
);
verificar(
  "topGeneros corta em n",
  topGeneros([sc({ tags: "a, b, c, d, e, f" })], 5).length === 5,
);
verificar(
  "topAlbuns ignora audições sem álbum",
  topAlbuns([sc({ album_name: "" }), sc({ album_name: " " })]).length === 0,
);

console.log("\n[casos limite: artist]");
const doArtista = [
  sc({ track_name: "A", loved: 1, album_name: "X", date_uts: 1700000000 }),
  sc({ track_name: "A", loved: 1, album_name: "X", date_uts: 1700100000 }),
  sc({ track_name: "B", loved: 1, album_name: "", date_uts: 1700200000 }),
];
const resumo = resumoDoArtista(doArtista, doArtista);
verificar(
  "favoritas são faixas DISTINCTAS (2, não 3)",
  resumo.faixasFavoritas === 2,
);
verificar(
  "resumoDoArtista com todos vazio → percentagem 0 (sem crash)",
  resumoDoArtista(doArtista, []).percentagemDoTotal === 0,
);
verificar(
  "artistaExiste com array vazio → false",
  artistaExiste([], "Qualquer Coisa") === false,
);
const albuns = albunsDoArtista(doArtista);
verificar(
  "albunsDoArtista: 1 álbum, 1 faixa distinta, 2 audições",
  albuns.length === 1 &&
    albuns[0].faixasDistintasOuvidas === 1 &&
    albuns[0].totalAudicoes === 2,
);
verificar(
  "scrobblesPorMes com array vazio → []",
  scrobblesPorMes([]).length === 0,
);
verificar(
  "scrobblesPorMes preenche o mês intermédio com 0",
  (() => {
    // set e nov de 2026, com outubro no meio sem dados
    const pontos = scrobblesPorMes([
      sc({ date_uts: 1788220800 }), // 1 set 2026 00:00 UTC
      sc({ date_uts: 1793491200 }), // 1 nov 2026 00:00 UTC
    ]);
    return (
      pontos.length === 3 &&
      pontos[1].contagem === 0 &&
      pontos[0].contagem === 1 &&
      pontos[2].contagem === 1
    );
  })(),
);

console.log(
  falhas === 0
    ? "\n✅ TODOS OS CASOS LIMITE PASSARAM\n"
    : `\n❌ ${falhas} CASO(S) LIMITE FALHARAM\n`,
);
process.exit(falhas === 0 ? 0 : 1);
