import { readFileSync } from "node:fs";
import { maiorSequenciaRepetida } from "../src/lib/analise";
import type { Scrobble } from "../src/types";

const scrobbles = JSON.parse(
  readFileSync("./scrobbles-completo.json", "utf8"),
) as Scrobble[];

let falhas = 0;

function verificar(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) {
    console.log(`  ✔ ${nome}`);
  } else {
    falhas += 1;
    console.error(`  ✘ ${nome} ${detalhe}`);
  }
}

console.log(`\n[analise] ${scrobbles.length} scrobbles`);

const maratona = maiorSequenciaRepetida(scrobbles);
console.log("  maratona:", maratona);

verificar("maratona existe", maratona !== null);
verificar(
  "a faixa é Easy on Me",
  maratona?.faixa === "Easy on Me",
  `(veio "${maratona?.faixa}")`,
);
verificar(
  "foram 27 vezes seguidas",
  maratona?.vezes === 27,
  `(vieram ${maratona?.vezes})`,
);
verificar("array vazio devolve null", maiorSequenciaRepetida([]) === null);

console.log(
  falhas === 0
    ? "\n✅ TODOS OS TESTES PASSARAM\n"
    : `\n❌ ${falhas} TESTE(S) FALHARAM\n`,
);
process.exit(falhas === 0 ? 0 : 1);
