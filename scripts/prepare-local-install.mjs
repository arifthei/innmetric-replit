// Prepares a local (non-Replit) checkout for `pnpm install`.
//
// pnpm-workspace.yaml excludes the native esbuild, rollup, lightningcss and
// Tailwind binaries for every platform except linux-x64, because Replit only
// runs on linux-x64. On another platform those binaries are needed, so this
// script removes the exclusion lines for the current platform only.
//
// The change is for your machine. Do not commit pnpm-workspace.yaml or
// pnpm-lock.yaml after running it. Usage:
//   node scripts/prepare-local-install.mjs
//   node scripts/prepare-local-install.mjs --platform win32 --arch x64   (testing)
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const platform = option("platform", process.platform);
const arch = option("arch", process.arch);
const target = `${platform}-${arch}`;
const file = fileURLToPath(new URL("../pnpm-workspace.yaml", import.meta.url));

if (target === "linux-x64") {
  console.log("linux-x64 is already supported. Nothing to change.");
  process.exit(0);
}

const original = readFileSync(file, "utf8");
const newline = original.includes("\r\n") ? "\r\n" : "\n";
const lines = original.split(/\r?\n/);
// Matches override keys such as "esbuild>@esbuild/win32-x64" or "...-win32-x64-msvc".
const pattern = new RegExp(`^\\s*"[^"]*[/-]${target}(-[a-z]+)?":\\s*"-"\\s*$`);
const kept = lines.filter((line) => !pattern.test(line));
const removed = lines.length - kept.length;

if (removed === 0) {
  console.log(`No exclusions found for ${target}. pnpm-workspace.yaml is unchanged.`);
} else {
  writeFileSync(file, kept.join(newline));
  console.log(`Removed ${removed} exclusion line(s) for ${target} from pnpm-workspace.yaml.`);
}
console.log("Next: pnpm install --no-frozen-lockfile");
console.log("Do not commit pnpm-workspace.yaml or pnpm-lock.yaml after this step.");
