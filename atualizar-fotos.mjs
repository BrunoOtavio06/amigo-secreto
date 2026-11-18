#!/usr/bin/env node
// Coloca (ou atualiza) as fotos nas páginas SEM refazer o sorteio.
//
// Uso:  node atualizar-fotos.mjs
//
// Lê quem tirou quem direto das páginas que já estão em docs/ e gera cada página
// de novo com a foto da pessoa sorteada. No fim confere, página por página, que
// o resultado do sorteio continua exatamente o mesmo.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { arquivosDeFoto, carregarFoto, lerNomes, raiz, slug } from "./comum.mjs";
import { paginaPessoa } from "./templates.mjs";

const saida = join(raiz, "docs");

function falhar(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

const lerDado = (html) => html.match(/var dado = "([^"]+)"/)?.[1];
const decodificar = (b64) => Buffer.from(b64, "base64").toString("utf8");

const nomes = lerNomes(join(raiz, "nomes.txt"));
const porNome = new Set(nomes);

// 1. Ler o sorteio atual das páginas
const tirou = new Map();
const dados = new Map();
for (const nome of nomes) {
  const arq = join(saida, slug(nome), "index.html");
  if (!existsSync(arq)) falhar(`Não achei a página de ${nome} (${arq}). O sorteio já foi feito?`);
  const dado = lerDado(readFileSync(arq, "utf8"));
  if (!dado) falhar(`Não consegui ler o sorteio na página de ${nome}.`);
  const amigo = decodificar(dado);
  if (!porNome.has(amigo)) falhar(`${nome} tirou "${amigo}", que não está em nomes.txt. Nada foi alterado.`);
  tirou.set(nome, amigo);
  dados.set(nome, dado);
}
if (new Set(tirou.values()).size !== nomes.length) falhar("O sorteio nas páginas está inconsistente. Nada foi alterado.");

// 2. Gerar as páginas de novo com as fotos
const semFoto = [];
for (const nome of nomes) {
  const amigo = tirou.get(nome);
  const foto = carregarFoto(slug(amigo));
  if (!foto.src) semFoto.push(amigo);
  writeFileSync(join(saida, slug(nome), "index.html"), paginaPessoa(nome, amigo, foto));
}

// 3. Conferir que o sorteio não mudou
for (const nome of nomes) {
  const dado = lerDado(readFileSync(join(saida, slug(nome), "index.html"), "utf8"));
  if (dado !== dados.get(nome)) falhar(`A página de ${nome} mudou de resultado! Desfaça com: git checkout docs/`);
}

// 4. Resumo
const comFoto = nomes.length - semFoto.length;
console.log(`\n✔ Páginas atualizadas. O sorteio continua o mesmo (${nomes.length} pessoas).`);
console.log(`  Fotos: ${comFoto} de ${nomes.length}.`);
if (semFoto.length) {
  console.log(`  Ainda sem foto (aparece a inicial no lugar): ${semFoto.sort().join(", ")}`);
  console.log(`  Coloque em fotos/ com o nome do link: ${semFoto.map((n) => slug(n) + ".jpg").join(", ")}`);
}
const slugs = new Set(nomes.map(slug));
const sobrando = arquivosDeFoto().filter((f) => !slugs.has(slug(f.slice(0, f.lastIndexOf(".")))));
if (sobrando.length) console.log(`  ⚠ Fotos com nome que não bate com ninguém: ${sobrando.join(", ")}`);
console.log("");
