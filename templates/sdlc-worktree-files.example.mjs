/**
 * 复制到业务项目：scripts/lib/sdlc-worktree-files.mjs
 * 供 check-sdlc-commit-rules.mjs 列出相对 HEAD 的变更（含未跟踪）。
 */
import { execSync } from "node:child_process"

/** @returns {string[]} */
export function listWorktreeChangedFiles() {
  const tracked = execSync("git diff --name-only HEAD", { encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
  const staged = execSync("git diff --cached --name-only", { encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
  const untracked = execSync("git ls-files --others --exclude-standard", {
    encoding: "utf8",
  })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  return [...new Set([...tracked, ...staged, ...untracked])]
}
