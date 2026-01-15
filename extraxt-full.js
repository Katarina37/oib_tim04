// dump-project.js
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, "project-dump.txt");

// Fajlovi/dir-ovi koje preskačemo (dodaj/ukloni po potrebi)
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".idea",
  "dist",
  "dist-electron",
  ".turbo",
  ".next",
  ".cache"
]);
const SKIP_FILES = [/\.log$/i, /\.lock$/i];

function shouldSkipDir(name) {
  return SKIP_DIRS.has(name);
}
function shouldSkipFile(name) {
  return SKIP_FILES.some((re) => re.test(name));
}

function dumpDir(dir, relPath = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const rel = path.join(relPath, entry.name);
    if (entry.isDirectory()) {
      if (shouldSkipDir(entry.name)) continue;
      writeLine(`\n# DIR: ${rel}`);
      dumpDir(fullPath, rel);
    } else if (entry.isFile()) {
      if (shouldSkipFile(entry.name)) continue;
      writeLine(`\n# FILE: ${rel}\n`);
      try {
        const content = fs.readFileSync(fullPath, "utf8");
        writeLine(content);
      } catch (err) {
        writeLine(`(cannot read file: ${err.message})`);
      }
    }
  }
}

let outStream;
function writeLine(text) {
  outStream.write(text.endsWith("\n") ? text : text + "\n");
}

function main() {
  outStream = fs.createWriteStream(OUTPUT, { encoding: "utf8" });
  writeLine(`# Project dump generated at ${new Date().toISOString()}`);
  writeLine(`# Root: ${ROOT}`);
  dumpDir(ROOT);
  outStream.end(() => {
    console.log(`Dump finished -> ${OUTPUT}`);
  });
}

main();
