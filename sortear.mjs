#!/usr/bin/env node
// Sorteio do Amigo Secreto da Família Carvalho.
//
// Uso:
//   node sortear.mjs              -> lê nomes.txt e gera o site em docs/
//   node sortear.mjs --refazer    -> apaga o sorteio atual e sorteia de novo
//
// O sorteio forma UM ÚNICO CÍRCULO com todo mundo: embaralha a lista e cada
// pessoa tira a próxima; a última tira a primeira. Assim nunca existe um
// grupinho fechado (ex.: A↔B) nem alguém tirando a si mesmo.

import { randomInt } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { paginaPessoa, paginaInicial, pagina404 } from "./templates.mjs";

const raiz = dirname(fileURLToPath(import.meta.url));
const arquivoNomes = join(raiz, "nomes.txt");
const saida = join(raiz, "docs");
const refazer = process.argv.includes("--refazer");

function falhar(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

export function slug(nome) {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// --- 1. Ler os nomes -------------------------------------------------------
if (!existsSync(arquivoNomes)) falhar("Não achei o arquivo nomes.txt (um nome por linha).");

const nomes = readFileSync(arquivoNomes, "utf8")
  .split(/\r?\n/)
  .map((l) => l.replace(/#.*/, "").trim())
  .filter(Boolean);

if (nomes.length < 3) falhar(`Preciso de pelo menos 3 nomes (achei ${nomes.length}).`);

const vistos = new Map();
for (const nome of nomes) {
  const s = slug(nome);
  if (!s) falhar(`O nome "${nome}" não gera um link válido.`);
  if (vistos.has(s)) {
    falhar(`"${nome}" e "${vistos.get(s)}" gerariam o mesmo link (/${s}). Diferencie-os (ex.: "Ana Maria" e "Ana Clara").`);
  }
  vistos.set(s, nome);
}

// --- 2. Proteção contra sortear de novo sem querer -------------------------
if (existsSync(join(saida, "index.html")) && !refazer) {
  falhar("Já existe um sorteio em docs/. Se quiser MESMO sortear de novo (os links antigos mudam de resultado), rode: node sortear.mjs --refazer");
}

// --- 3. Sortear: embaralhar (Fisher–Yates com aleatoriedade criptográfica) -
const circulo = [...nomes];
for (let i = circulo.length - 1; i > 0; i--) {
  const j = randomInt(i + 1);
  [circulo[i], circulo[j]] = [circulo[j], circulo[i]];
}
const tirou = new Map(circulo.map((nome, i) => [nome, circulo[(i + 1) % circulo.length]]));

// --- 4. Conferir que é um único círculo com todo mundo ---------------------
{
  let atual = nomes[0];
  const visitados = new Set();
  while (!visitados.has(atual)) {
    visitados.add(atual);
    const prox = tirou.get(atual);
    if (prox === atual) falhar("Erro interno: alguém tirou a si mesmo.");
    atual = prox;
  }
  if (atual !== nomes[0] || visitados.size !== nomes.length) {
    falhar("Erro interno: o sorteio não formou um círculo único.");
  }
  const recebedores = new Set(tirou.values());
  if (recebedores.size !== nomes.length) falhar("Erro interno: alguém foi tirado duas vezes.");
}

// --- 5. Gerar o site --------------------------------------------------------
rmSync(saida, { recursive: true, force: true });
mkdirSync(saida, { recursive: true });

for (const nome of nomes) {
  const pasta = join(saida, slug(nome));
  mkdirSync(pasta, { recursive: true });
  writeFileSync(join(pasta, "index.html"), paginaPessoa(nome, tirou.get(nome)));
}
writeFileSync(join(saida, "index.html"), paginaInicial());
writeFileSync(join(saida, "404.html"), pagina404(nomes.map(slug)));
writeFileSync(join(saida, ".nojekyll"), "");

// --- 6. Mostrar os links (sem revelar ninguém) ------------------------------
console.log(`\n✔ Sorteio feito: ${nomes.length} pessoas num único círculo.\n`);
console.log("Links para enviar (troque SEU-SITE pelo endereço do deploy):\n");
for (const nome of nomes) console.log(`  ${nome.padEnd(20)} https://SEU-SITE/${slug(nome)}`);
console.log("");
