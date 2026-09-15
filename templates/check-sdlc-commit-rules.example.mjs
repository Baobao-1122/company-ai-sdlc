#!/usr/bin/env node
/**
 * CP-06 提交前：激活已有 .cursor/rules + 仓库 guard（不新增规范文本）。
 *
 * 接入：
 * 1. 复制本文件 → scripts/check-sdlc-commit-rules.mjs
 * 2. 复制 templates/sdlc-worktree-files.example.mjs → scripts/lib/sdlc-worktree-files.mjs
 * 3. 按项目调整 RULE_GUARD_COMMANDS、diff 扫描项（链到已有 Rule/docs）
 * 4. package.json: "guard:sdlc-commit-rules": "node scripts/check-sdlc-commit-rules.mjs"
 *
 * 流程说明：docs/commit-rules-audit.md
 */
import fs from "node:fs/promises"
import path from "node:path"
import { execSync } from "node:child_process"
import { listWorktreeChangedFiles } from "./lib/sdlc-worktree-files.mjs"

const ROOT = process.cwd()
const RULES_DIR = path.join(ROOT, ".cursor/rules")

const TEST_FILE_PATTERN = /\.(test|spec)\.(ts|tsx|js|jsx|mjs)$/

/** @typedef {{ id: string; description: string; globs: string[]; alwaysApply: boolean }} CursorRule */

/**
 * 业务项目按已有 scripts/check-*.mjs 填写；勿复制律能项目 guard 名除非已注册。
 * @type {{ ruleIds: string[]; when: (files: string[]) => boolean; command: string; label?: string }[]}
 */
const RULE_GUARD_COMMANDS = [
  // 示例：
  // {
  //   ruleIds: ["mock-data-isolation"],
  //   when: () => true,
  //   command: "pnpm guard:mock-isolation",
  // },
]

function runShell(command) {
  execSync(command, { stdio: "inherit", cwd: ROOT })
}

function parseRuleFrontmatter(raw) {
  /** @type {CursorRule} */
  const rule = {
    id: "",
    description: "",
    globs: [],
    alwaysApply: false,
  }
  const descMatch = raw.match(/^description:\s*(.+)$/m)
  if (descMatch) rule.description = descMatch[1].trim()
  const alwaysMatch = raw.match(/^alwaysApply:\s*(true|false)/m)
  if (alwaysMatch) rule.alwaysApply = alwaysMatch[1] === "true"
  const globsMatch = raw.match(/^globs:\s*(.+)$/m)
  if (globsMatch) {
    rule.globs = globsMatch[1]
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean)
  }
  return rule
}

async function loadCursorRules() {
  const entries = await fs.readdir(RULES_DIR)
  /** @type {CursorRule[]} */
  const rules = []
  for (const name of entries) {
    if (!name.endsWith(".mdc")) continue
    const id = name.replace(/\.mdc$/, "")
    const content = await fs.readFile(path.join(RULES_DIR, name), "utf8")
    const fm = content.match(/^---\n([\s\S]*?)\n---/)
    const meta = parseRuleFrontmatter(fm ? fm[1] : "")
    meta.id = id
    rules.push(meta)
  }
  return rules.sort((a, b) => a.id.localeCompare(b.id))
}

function globToRegExp(glob) {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "{{GLOBSTAR}}")
    .replace(/\*/g, "[^/]*")
    .replace(/{{GLOBSTAR}}/g, ".*")
  return new RegExp(`^${escaped}$`)
}

function fileMatchesRule(file, rule) {
  if (rule.alwaysApply) return true
  if (rule.globs.length === 0) return false
  return rule.globs.some((glob) => globToRegExp(glob).test(file))
}

function listApplicableRules(files, rules) {
  const applicable = rules.filter(
    (rule) => rule.alwaysApply || files.some((f) => fileMatchesRule(f, rule)),
  )
  const always = rules.filter((r) => r.alwaysApply)
  return { applicable, always }
}

function collectAddedSourceLines(file) {
  /** @type {number[]} */
  const lineNumbers = []
  let diffText = ""
  try {
    diffText += execSync(`git diff HEAD -- ${JSON.stringify(file)}`, {
      encoding: "utf8",
      maxBuffer: 4 * 1024 * 1024,
    })
    diffText += execSync(`git diff --cached -- ${JSON.stringify(file)}`, {
      encoding: "utf8",
      maxBuffer: 4 * 1024 * 1024,
    })
  } catch {
    return null
  }
  if (!diffText.trim()) return null

  let newLine = 0
  for (const line of diffText.split("\n")) {
    if (line.startsWith("@@")) {
      const match = line.match(/\+(\d+)/)
      newLine = match ? Number(match[1]) : 0
      continue
    }
    if (line.startsWith("+++") || line.startsWith("---")) continue
    if (line.startsWith("+")) {
      lineNumbers.push(newLine)
      newLine += 1
      continue
    }
    if (line.startsWith("-")) continue
    if (line.startsWith(" ")) newLine += 1
  }
  return lineNumbers
}

/** @returns {Promise<{ file: string; line: string; ruleId: string; message: string }[]>} */
async function runDiffScopedChecks(files) {
  /** @type {{ file: string; line: string; ruleId: string; message: string }[]} */
  const violations = []

  for (const file of files) {
    if (TEST_FILE_PATTERN.test(file)) continue
    if (!/\.(tsx?|jsx?)$/.test(file)) continue

    let content
    try {
      content = await fs.readFile(path.join(ROOT, file), "utf8")
    } catch {
      continue
    }

    if (content.includes('"use client"')) {
      if (
        /(?:^|\n)\s*import\s+(?!type\s)[^;]*from\s+["']@\/lib\/db["']/.test(content)
        || /(?:^|\n)\s*import\s+(?!type\s)[^;]*from\s+["']postgres["']/.test(content)
      ) {
        violations.push({
          file,
          line: "-",
          ruleId: "nextjs-client-server-boundary",
          message: 'use client 禁止运行时 import @/lib/db / postgres',
        })
      }
    }

    const addedLineNumbers = collectAddedSourceLines(file)
    const linesToScan =
      addedLineNumbers === null
        ? content.split("\n").map((_, index) => index + 1)
        : addedLineNumbers
    const lines = content.split("\n")
    for (const lineNo of linesToScan) {
      const line = lines[lineNo - 1]
      if (!line) continue
      if (/console\.log\s*\(/.test(line) && !line.trim().startsWith("//")) {
        violations.push({
          file,
          line: String(lineNo),
          ruleId: "general-principles",
          message: "禁止 console.log（提交前须清理）",
        })
      }
    }
  }

  return violations
}

function dedupeGuardRuns(files) {
  const seen = new Set()
  /** @type {{ command: string; ruleIds: string[]; label?: string }[]} */
  const planned = []
  for (const entry of RULE_GUARD_COMMANDS) {
    if (!entry.when(files)) continue
    const key = entry.command
    if (seen.has(key)) continue
    seen.add(key)
    planned.push(entry)
  }
  return planned
}

async function main() {
  const files = listWorktreeChangedFiles()
  const rules = await loadCursorRules()
  const { applicable, always } = listApplicableRules(files, rules)

  console.log("SDLC Commit Rules Audit (CP-06)")
  console.log("================================")
  console.log(`changed_files: ${files.length}`)
  console.log("")
  console.log("always_on_rules (.cursor/rules, alwaysApply):")
  if (always.length === 0) {
    console.log("  (none parsed)")
  } else {
    for (const rule of always) {
      console.log(`  - ${rule.id}: ${rule.description.slice(0, 72)}`)
    }
  }
  console.log("")
  console.log("applicable_rules (always + matched globs on this diff):")
  for (const rule of applicable) {
    console.log(`  - ${rule.id}`)
  }
  console.log("")
  console.log("agent_action: CP-06 Bugbot Custom Instructions 须引用上述 applicable_rules 对应文档/Rule。")
  console.log("")

  const violations = await runDiffScopedChecks(files)
  if (violations.length > 0) {
    console.log("diff_scoped_violations:")
    for (const v of violations) {
      console.log(`  [${v.ruleId}] ${v.file}:${v.line} — ${v.message}`)
    }
    console.log("")
    console.log("RESULT: FAIL — 先修 violation 再 commit / Bugbot")
    process.exit(1)
  }
  console.log("diff_scoped_violations: (none)")
  console.log("")

  const guardRuns = dedupeGuardRuns(files)
  console.log("guards_to_run:")
  for (const run of guardRuns) {
    console.log(`  - ${run.command}${run.label ? ` (${run.label})` : ""}`)
  }
  console.log("")

  for (const run of guardRuns) {
    console.log(`> ${run.command}`)
    runShell(run.command)
  }

  console.log("")
  console.log("RESULT: PASS — 可进入 Bugbot / CP-06 步骤 1")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
