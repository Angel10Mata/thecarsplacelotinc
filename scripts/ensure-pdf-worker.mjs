import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

try {
  const reactPdfDir = path.dirname(require.resolve("react-pdf/package.json"));
  const workerSrc = require.resolve("pdfjs-dist/build/pdf.worker.min.mjs", {
    paths: [reactPdfDir],
  });
  const dest = path.join(root, "public", "pdf.worker.min.mjs");
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(workerSrc, dest);
} catch (error) {
  console.error("ensure-pdf-worker:", error);
  process.exit(1);
}
