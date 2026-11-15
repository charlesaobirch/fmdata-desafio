/**
 * Descarrega o dataset COMPLETO de scrobbles (≈ 51 522 registos, 26 MB)
 * para scrobbles-completo.json, usado pelos testes de integração.
 *
 * O ficheiro não vai para o git (.gitignore) — quem precisar dele corre:
 *   npm run dataset
 */
import { writeFileSync } from "node:fs";

const API = "https://fmdata-api.onrender.com";
const destino = "scrobbles-completo.json";

console.log(`A descarregar ${API}/scrobbles …`);
const resposta = await fetch(`${API}/scrobbles`);

if (!resposta.ok) {
  console.error(`Falhou: HTTP ${resposta.status}`);
  process.exit(1);
}

const texto = await resposta.text();
writeFileSync(destino, texto);

const dados: unknown = JSON.parse(texto);
const total = Array.isArray(dados) ? dados.length : 0;
const mb = (texto.length / 1024 / 1024).toFixed(1);
console.log(`✅ ${destino} gravado — ${total} scrobbles (${mb} MB)`);
