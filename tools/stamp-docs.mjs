#!/usr/bin/env node
/**
 * 给本站自有文档写入更新时间（docs-site/** 与 README.md，精确到分钟）。
 *
 * 约定与主仓一致：每份文档在标题下方带一行 `> 最后更新：YYYY-MM-DD HH:MM`。
 * 主仓同步过来的文档由主仓维护其时间戳，这里只处理本站自有页面与 README。
 *
 *   node tools/stamp-docs.mjs            # 改过的取当前时间，未改的取该文件最后一次提交时间
 *   node tools/stamp-docs.mjs --all      # 全部取当前时间
 *   node tools/stamp-docs.mjs --from-git # 全部取最后一次提交时间（回填用）
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(import.meta.dirname, "..");
const TZ = "Asia/Shanghai";
const PREFIX = "> 最后更新：";

const mode = process.argv.includes("--all")
  ? "all"
  : process.argv.includes("--from-git")
    ? "git"
    : "auto";

function stampOf(ms) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(ms));
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".md") && !e.name.startsWith("._")) out.push(p);
  }
  return out;
}

function git(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
}

function lastCommitMs(rel) {
  try {
    const iso = git(["log", "-1", "--format=%cI", "--", rel]);
    const ms = iso ? Date.parse(iso) : NaN;
    return Number.isFinite(ms) ? ms : null;
  } catch {
    return null;
  }
}

function isDirty(rel) {
  try {
    return git(["status", "--porcelain", "--", rel]) !== "";
  } catch {
    return true;
  }
}

function applyStamp(file, value) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  const at = lines.findIndex((l) => l.startsWith(PREFIX));
  if (at >= 0) {
    if (lines[at] === PREFIX + value) return false;
    lines[at] = PREFIX + value;
  } else {
    const h1 = lines.findIndex((l) => l.startsWith("# "));
    if (h1 >= 0) lines.splice(h1 + 1, 0, "", PREFIX + value);
    else lines.unshift(PREFIX + value, "");
  }
  fs.writeFileSync(file, lines.join("\n"));
  return true;
}

const targets = [...walk(path.join(ROOT, "docs-site")), path.join(ROOT, "README.md")].filter((f) =>
  fs.existsSync(f),
);

let changed = 0;
for (const file of targets.sort()) {
  const rel = path.relative(ROOT, file);
  const value =
    mode === "all"
      ? stampOf(Date.now())
      : mode === "git"
        ? stampOf(lastCommitMs(rel) ?? Date.now())
        : stampOf(isDirty(rel) ? Date.now() : (lastCommitMs(rel) ?? Date.now()));
  if (applyStamp(file, value)) {
    console.log("写入", rel, value);
    changed += 1;
  }
}
console.log(changed === 0 ? "全部文档时间戳已是最新" : `更新 ${changed} 份文档的时间戳`);
