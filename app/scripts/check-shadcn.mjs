/**
 * Guarda de design system: bloqueia padrões raw proibidos em src/pages e src/screens,
 * e limita o tamanho de arquivo em todo src/ (ver CLAUDE.md > Tamanho de Arquivo).
 * Roda via `pnpm lint` (ver package.json).
 *
 * Patterns proibidos:
 *  - <input  → usar shadcn Input
 *  - <select → usar shadcn Select
 *  - position: "fixed".*inset → sinal de Modal custom (usar shadcn Dialog)
 *  - function (Modal|Spinner|Avatar|Field) → componentes que devem vir de shared/ui
 *
 * Tamanho de arquivo:
 *  - qualquer .jsx/.js em src/ (exceto src/components/ui, vendor shadcn) deve ter < 150 linhas
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const SCAN_DIRS = ["src/pages", "src/screens", "src/layouts"];
const SIZE_LIMIT = 150;
const SIZE_EXCLUDE_DIRS = ["src/components/ui"];
// Baseline: arquivos pré-existentes acima do limite, aceitos temporariamente.
// Não adicionar novas entradas aqui — ao tocar um desses arquivos, decompor
// em vez de crescer, e remover a entrada. Ver CLAUDE.md > Tamanho de Arquivo.
const SIZE_BASELINE = [
  "src/layouts/DashboardLayout.jsx",
  "src/pages/AlunosPage.jsx",
  "src/pages/ContasPage.jsx",
  "src/pages/DashboardPage.jsx",
  "src/pages/ExerciciosPage.jsx",
  "src/pages/TreinosPage.jsx",
  "src/screens/HelloScreen.jsx",
  "src/screens/LoginScreen.jsx",
];

const FORBIDDEN = [
  {
    pattern: /<input\s/g,
    message: 'Raw <input> — use shadcn: import { Input } from "@/components/ui/input"',
  },
  {
    pattern: /<select\s/g,
    message: 'Raw <select> — use shadcn: import { Select, ... } from "@/components/ui/select"',
  },
  {
    pattern: /function\s+(Modal|Spinner|Avatar|Field)\s*\(/g,
    message: "Componente duplicado — importar de \"@/components/shared\" ou \"@/components/ui\"",
  },
  {
    pattern: /position:\s*["']fixed["'].*inset/g,
    message: 'Modal custom detectado — use shadcn: import { Dialog, DialogContent } from "@/components/ui/dialog"',
  },
];

function walkFiles(dir) {
  const abs = join(process.cwd(), dir);
  try {
    return readdirSync(abs).flatMap((f) => {
      const full = join(abs, f);
      const ext = extname(f);
      if (statSync(full).isDirectory()) return walkFiles(join(dir, f));
      if (ext === ".jsx" || ext === ".tsx") return [{ path: join(dir, f), full }];
      return [];
    });
  } catch {
    return [];
  }
}

let violations = 0;

for (const dir of SCAN_DIRS) {
  for (const { path, full } of walkFiles(dir)) {
    const src = readFileSync(full, "utf8");
    for (const { pattern, message } of FORBIDDEN) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(src)) !== null) {
        const line = src.slice(0, match.index).split("\n").length;
        console.error(`\x1b[31mERR\x1b[0m  ${path}:${line}  ${message}`);
        violations++;
      }
    }
  }
}

for (const { path, full } of walkFiles("src")) {
  if (SIZE_EXCLUDE_DIRS.some((d) => path.startsWith(d))) continue;
  if (SIZE_BASELINE.includes(path)) continue;
  const lineCount = readFileSync(full, "utf8").split("\n").length;
  if (lineCount > SIZE_LIMIT) {
    console.error(`\x1b[31mERR\x1b[0m  ${path}  ${lineCount} linhas (limite ${SIZE_LIMIT}) — decompor em componentes/hooks menores`);
    violations++;
  }
}

if (violations > 0) {
  console.error(`\n\x1b[31m${violations} violação(ões) de design system encontrada(s).\x1b[0m`);
  console.error("Veja CLAUDE.md > Design System e > Tamanho de Arquivo para os padrões corretos.\n");
  process.exit(1);
} else {
  console.log("\x1b[32m✓ Design system OK — nenhum padrão proibido encontrado.\x1b[0m");
}
