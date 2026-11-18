// Funções usadas tanto pelo sorteio quanto pelo script das fotos.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const raiz = dirname(fileURLToPath(import.meta.url));
export const pastaFotos = join(raiz, "fotos");

export function slug(nome) {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function lerNomes(arquivo) {
  return readFileSync(arquivo, "utf8")
    .split(/\r?\n/)
    .map((l) => l.replace(/#.*/, "").trim())
    .filter(Boolean);
}

// --- Fotos -------------------------------------------------------------------
// Cada foto fica em fotos/<link-da-pessoa>.<jpg|jpeg|png|webp|heic>
// (ex.: fotos/bruno.jpg, fotos/flavia.png). Ajustes opcionais por pessoa ficam
// em fotos/ajustes.json — veja o README.

const extensoes = ["jpg", "jpeg", "png", "webp", "heic", "heif"];
const LADO = 480; // pixels da foto quadrada final

export function arquivosDeFoto() {
  if (!existsSync(pastaFotos)) return [];
  return readdirSync(pastaFotos).filter((f) => extensoes.includes(f.split(".").pop().toLowerCase()));
}

function acharFoto(s) {
  for (const f of arquivosDeFoto()) {
    const base = f.slice(0, f.lastIndexOf("."));
    if (slug(base) === s) return join(pastaFotos, f);
  }
  return null;
}

let ajustesCache;
function ajustes() {
  if (ajustesCache) return ajustesCache;
  const arq = join(pastaFotos, "ajustes.json");
  ajustesCache = existsSync(arq) ? JSON.parse(readFileSync(arq, "utf8")) : {};
  return ajustesCache;
}

// Devolve { src, gorro } para a página de quem tirou essa pessoa.
// src é a foto já recortada em quadrado e embutida (data URI), ou null.
export function carregarFoto(s) {
  const aj = ajustes()[s] || {};
  const arquivo = acharFoto(s);
  if (!arquivo) return { src: null, gorro: aj.gorro ?? null };

  const [w, h] = execFileSync("convert", [arquivo + "[0]", "-auto-orient", "-format", "%w %h", "info:"])
    .toString().trim().split(" ").map(Number);

  // Recorte quadrado. "foco" = ponto que fica no centro (em % da foto original);
  // por padrão, centro na horizontal e um pouco acima do meio em fotos em pé
  // (onde costuma estar o rosto). "zoom" > 1 aperta o recorte.
  const [fx, fy] = aj.foco || [50, h > w ? 38 : 50];
  const lado = Math.round(Math.min(w, h) / Math.max(1, aj.zoom || 1));
  const limitar = (v, max) => Math.max(0, Math.min(max, Math.round(v)));
  const x0 = limitar((fx / 100) * w - lado / 2, w - lado);
  const y0 = limitar((fy / 100) * h - lado / 2, h - lado);

  const jpg = execFileSync("convert", [
    arquivo + "[0]", "-auto-orient",
    "-crop", `${lado}x${lado}+${x0}+${y0}`, "+repage",
    "-resize", `${LADO}x${LADO}`,
    "-strip", "-quality", "80", "-sampling-factor", "4:2:0", "-interlace", "Plane",
    "jpg:-",
  ], { maxBuffer: 64 * 1024 * 1024 });

  return { src: `data:image/jpeg;base64,${jpg.toString("base64")}`, gorro: aj.gorro ?? null };
}
