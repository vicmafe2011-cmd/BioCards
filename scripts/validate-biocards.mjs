import { access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { figures } from "../src/data/figures.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ids = new Set();
const numbers = new Set();

if (figures.length !== 16) {
  throw new Error(`Se esperaban 16 figuras y hay ${figures.length}.`);
}

for (const figure of figures) {
  if (ids.has(figure.id)) throw new Error(`Identificador duplicado: ${figure.id}`);
  if (numbers.has(figure.number)) throw new Error(`Número duplicado: ${figure.number}`);
  ids.add(figure.id);
  numbers.add(figure.number);

  for (const stat of ["obs", "des", "imp"]) {
    if (!Number.isInteger(figure[stat]) || figure[stat] < 0 || figure[stat] > 100) {
      throw new Error(`${figure.name}: ${stat} no es un valor válido.`);
    }
  }

  if (!["obs", "des", "imp"].includes(figure.abilityStat)) {
    throw new Error(`${figure.name}: atributo de habilidad inválido.`);
  }

  const imagePath = join(root, "public", figure.image.replace(/^\//, ""));
  await access(imagePath);
}

console.log("BioCards: 16 figuras, valores, habilidades e imágenes verificados.");
