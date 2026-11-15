import { readFileSync } from "node:fs";
import { artistaDeCasa, maiorSequenciaRepetida } from "../src/lib/analise";
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

console.log(
  falhas === 0
    ? "\nTODOS OS TESTES PASSARAM\n"
    : `\n${falhas} TESTE(S) FALHARAM\n`,
);
process.exit(falhas === 0 ? 0 : 1);
