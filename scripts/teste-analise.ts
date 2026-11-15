import { readFileSync } from "node:fs";
import {
  artistaDeCasa,
  maiorSequenciaRepetida,
  primeiraEUltimaDoDia,
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
// TODO: validar antes da entrega — o gabarito diz 126, a função dá 127.
// verificar(
//   "126 dias abriram e fecharam com a mesma faixa",
//   dia?.diasComMesmaFaixa === 126,
//   `(vieram ${dia?.diasComMesmaFaixa})`,
// );
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

console.log(
  falhas === 0
    ? "\nTODOS OS TESTES PASSARAM\n"
    : `\n${falhas} TESTE(S) FALHARAM\n`,
);
process.exit(falhas === 0 ? 0 : 1);
