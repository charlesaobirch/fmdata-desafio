import fs from "node:fs";
import { maiorSequenciaRepetida } from "./src/lib/analise";
const d = JSON.parse(fs.readFileSync("/tmp/s.json", "utf8"));
console.log(maiorSequenciaRepetida(d));
