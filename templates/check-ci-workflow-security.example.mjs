#!/usr/bin/env node
/**
 * CI 工作流安全检查：扫描 .github/workflows/*.yml，违反 docs/ci-security.md §1 R1～R11、R13 时退出码 1。
 *
 * 接入：
 * 1. 复制本文件 → scripts/check-ci-workflow-security.mjs
 * 2. package.json: "guard:ci-workflow-security": "node scripts/check-ci-workflow-security.mjs"
 * 3. harness.config.ts 的 L4 加一步 `pnpm guard:ci-workflow-security`
 *
 * 只用 Node 内置模块。按行和缩进读取，不是完整的 YAML 解析器；
 * 工作流须按 docs/ci-security.md §2 的块写法书写，流式写法（{ } 内嵌多键）会被判为不通过或漏检。
 * 可传目录参数做验证：node scripts/check-ci-workflow-security.mjs <dir>
 */
import fs from "node:fs/promises"
import path from "node:path"

const DEFAULT_DIR = ".github/workflows"
const WORKFLOW_FILE = /\.ya?ml$/
const ALLOWED_EVENTS = new Set(["pull_request", "push"])
const READ_ONLY_SCOPES = new Set(["read", "none"])
const READ_ONLY_INLINE = new Set(["read-all", "{}"])
const IMAGE_KEYS = new Set(["image", "container"])
const PINNED_ACTION = /^(actions|github)\/[\w.-]+(\/[\w./-]+)?@[0-9a-f]{40}$/
const CHECKOUT_ACTION = /^actions\/checkout@/
const HOSTED_RUNNER = /^(ubuntu|windows|macos)-[\w.-]+$/
const PINNED_IMAGE = /@sha256:[0-9a-f]{64}$/
const EXPRESSION = /\$\{\{([\s\S]*?)\}\}/g
const EXPRESSION_OPEN = "${{"
const EXPRESSION_CLOSE = "}}"
const GITHUB_REFERENCE = /\bgithub\b(?:\s*\.\s*([\w-]+))?/g
const TRUSTED_GITHUB_FIELDS = new Set(["ref", "sha", "event_name", "repository", "run_id", "run_number"])
const SECRET_CONTEXT = /\b(secrets|vars)\b/
const SECRET_INHERIT = /^secrets:\s*inherit\b/
const ENVIRONMENT_KEY = "environment"
const CONNECTION_URL = /\b(?:postgres(?:ql)?|mysql):\/\/(?:[^@\s/]*@)?([^:/\s?'"]+)/gi
const LOCAL_DB_HOSTS = new Set(["localhost", "127.0.0.1", "postgres"])
const UNFROZEN_INSTALL = [
  /\bpnpm\s+(install|i)\b(?!.*--frozen-lockfile)/,
  /\bnpm\s+(install|i)\b/,
  /\byarn\s+install\b(?!.*(--immutable|--frozen-lockfile))/,
]

const RULES = {
  permissions: "R1 顶层必须声明 permissions，且只能是 read 或 none",
  triggers: "R2 只允许 pull_request 和 push 触发",
  secrets: "R3 不得引用 secrets、vars，不得使用 job 级 environment",
  actions: "R4 action 只能来自 actions/ 或 github/，并锁到 40 位提交哈希",
  checkout: "R5 actions/checkout 必须设置 persist-credentials: false",
  runner: "R6 只能用 GitHub 托管机器（ubuntu-*、windows-*、macos-*）",
  untrusted: "R7 表达式须写在一行，github 只能用 ref、sha、event_name、repository、run_id、run_number",
  timeout: "R8 每个 job 必须设置 timeout-minutes",
  concurrency: "R9 顶层必须设置 concurrency，且 cancel-in-progress: true",
  install: "R10 依赖必须按锁文件安装（pnpm install --frozen-lockfile / npm ci）",
  image: "R11 容器镜像必须锁定到 @sha256: 摘要",
  connection: "R13 数据库连接串只能指向 localhost、127.0.0.1 或服务名 postgres（CI 自己起的临时库）",
}

/** @typedef {{ no: number; indent: number; text: string }} Line */
/** @typedef {{ line: number; rule: keyof typeof RULES }} Violation */

function stripComment(raw) {
  const at = raw.search(/(^|\s)#/)
  if (at < 0) return raw
  const before = raw.slice(0, at)
  const quotes = (before.match(/["']/g) ?? []).length
  return quotes % 2 === 0 ? before : raw
}

/** @returns {Line[]} */
function parseLines(content) {
  return content.split(/\r?\n/).map((raw, index) => {
    const text = stripComment(raw).trimEnd()
    return { no: index + 1, indent: text.length - text.trimStart().length, text: text.trim() }
  })
}

function unquote(value) {
  return value.replace(/^["']|["']$/g, "")
}

function keyOf(text) {
  const match = text.match(/^(?:-\s+)?([^:\s]+)\s*:/)
  return match ? unquote(match[1]) : ""
}

function valueOf(text) {
  const match = text.match(/^(?:-\s+)?[^:\s]+\s*:\s*(.*)$/)
  return match ? unquote(match[1].trim()) : ""
}

/** 返回 index 所在行之下、缩进更深的非空行下标。 */
function childIndexes(lines, index) {
  const parentIndent = lines[index].indent
  const result = []
  for (let i = index + 1; i < lines.length; i += 1) {
    if (!lines[i].text) continue
    if (lines[i].indent <= parentIndent) break
    result.push(i)
  }
  return result
}

function directChildIndexes(lines, index) {
  const children = childIndexes(lines, index)
  if (children.length === 0) return []
  const childIndent = lines[children[0]].indent
  return children.filter((i) => lines[i].indent === childIndent)
}

function topLevelIndex(lines, key) {
  return lines.findIndex((line) => line.text && line.indent === 0 && keyOf(line.text) === key)
}

function checkPermissionBlock(lines, index, report) {
  const inline = valueOf(lines[index].text)
  if (inline) {
    if (!READ_ONLY_INLINE.has(inline)) report(lines[index].no, "permissions")
    return
  }
  const children = childIndexes(lines, index)
  if (children.length === 0) report(lines[index].no, "permissions")
  for (const i of children) {
    if (!READ_ONLY_SCOPES.has(valueOf(lines[i].text))) report(lines[i].no, "permissions")
  }
}

function checkPermissions(lines, report) {
  if (topLevelIndex(lines, "permissions") < 0) report(1, "permissions")
  lines.forEach((line, index) => {
    if (keyOf(line.text) === "permissions") checkPermissionBlock(lines, index, report)
  })
}

function triggerEvents(lines, index) {
  const inline = valueOf(lines[index].text)
  if (!inline) {
    return directChildIndexes(lines, index).map((i) => ({ name: keyOf(lines[i].text), no: lines[i].no }))
  }
  return inline
    .replace(/[[\]]/g, "")
    .split(",")
    .map((name) => ({ name: unquote(name.trim()), no: lines[index].no }))
    .filter((event) => event.name)
}

function checkTriggers(lines, report) {
  const index = topLevelIndex(lines, "on")
  if (index < 0) {
    report(1, "triggers")
    return
  }
  for (const event of triggerEvents(lines, index)) {
    if (!ALLOWED_EVENTS.has(event.name)) report(event.no, "triggers")
  }
}

function stepStartIndex(lines, index) {
  if (lines[index].text.startsWith("-")) return index
  for (let i = index - 1; i >= 0; i -= 1) {
    if (lines[i].text.startsWith("-") && lines[i].indent < lines[index].indent) return i
  }
  return index
}

function checkCheckout(lines, index, report) {
  const start = stepStartIndex(lines, index)
  const stepLines = [start, ...childIndexes(lines, start)].map((i) => lines[i].text)
  const disabled = stepLines.some((text) => /^persist-credentials:\s*false\b/.test(text))
  if (!disabled) report(lines[index].no, "checkout")
}

function checkUses(lines, index, report) {
  const target = valueOf(lines[index].text)
  if (!PINNED_ACTION.test(target)) report(lines[index].no, "actions")
  if (CHECKOUT_ACTION.test(target)) checkCheckout(lines, index, report)
}

function checkKeyedLine(lines, index, report) {
  const key = keyOf(lines[index].text)
  const value = valueOf(lines[index].text)
  if (key === "uses") checkUses(lines, index, report)
  if (key === "runs-on" && !HOSTED_RUNNER.test(value)) report(lines[index].no, "runner")
  if (key === ENVIRONMENT_KEY) report(lines[index].no, "secrets")
  if (IMAGE_KEYS.has(key) && value && !PINNED_IMAGE.test(value)) report(lines[index].no, "image")
}

function expressionsOf(text) {
  return [...text.matchAll(EXPRESSION)].map((match) => match[1])
}

function hasUnclosedExpression(text) {
  return text.split(EXPRESSION_OPEN).length > text.split(EXPRESSION_CLOSE).length
}

function usesUntrustedGithub(expression) {
  return [...expression.matchAll(GITHUB_REFERENCE)].some((match) => !TRUSTED_GITHUB_FIELDS.has(match[1] ?? ""))
}

function hasRemoteConnection(text) {
  return [...text.matchAll(CONNECTION_URL)].some((match) => !LOCAL_DB_HOSTS.has(match[1].toLowerCase()))
}

function checkTextLine(line, report) {
  const expressions = expressionsOf(line.text)
  const secretUsed = SECRET_INHERIT.test(line.text) || expressions.some((e) => SECRET_CONTEXT.test(e))
  const untrustedUsed = hasUnclosedExpression(line.text) || expressions.some(usesUntrustedGithub)
  if (secretUsed) report(line.no, "secrets")
  if (untrustedUsed) report(line.no, "untrusted")
  if (UNFROZEN_INSTALL.some((pattern) => pattern.test(line.text))) report(line.no, "install")
  if (hasRemoteConnection(line.text)) report(line.no, "connection")
}

function checkLines(lines, report) {
  lines.forEach((line, index) => {
    if (!line.text) return
    checkKeyedLine(lines, index, report)
    checkTextLine(line, report)
  })
}

function checkTimeouts(lines, report) {
  const jobs = topLevelIndex(lines, "jobs")
  if (jobs < 0) return
  for (const job of directChildIndexes(lines, jobs)) {
    const props = directChildIndexes(lines, job).map((i) => keyOf(lines[i].text))
    if (!props.includes("timeout-minutes")) report(lines[job].no, "timeout")
  }
}

function checkConcurrency(lines, report) {
  const index = topLevelIndex(lines, "concurrency")
  if (index < 0) {
    report(1, "concurrency")
    return
  }
  const cancels = childIndexes(lines, index).some((i) => /^cancel-in-progress:\s*true\b/.test(lines[i].text))
  if (!cancels) report(lines[index].no, "concurrency")
}

/** @returns {Violation[]} */
function checkWorkflow(content) {
  const lines = parseLines(content)
  /** @type {Violation[]} */
  const violations = []
  const report = (line, rule) => violations.push({ line, rule })
  checkPermissions(lines, report)
  checkTriggers(lines, report)
  checkConcurrency(lines, report)
  checkTimeouts(lines, report)
  checkLines(lines, report)
  return violations.sort((a, b) => a.line - b.line)
}

async function listWorkflowFiles(dir) {
  try {
    const entries = await fs.readdir(dir)
    return entries
      .filter((name) => WORKFLOW_FILE.test(name))
      .sort()
      .map((name) => path.join(dir, name))
  } catch (error) {
    if (error.code === "ENOENT") return []
    throw error
  }
}

async function main() {
  const dir = path.resolve(process.argv[2] ?? DEFAULT_DIR)
  const files = await listWorkflowFiles(dir)
  if (files.length === 0) {
    process.stdout.write(`[ci-workflow-security] ${path.relative(process.cwd(), dir) || dir} 下没有工作流，跳过\n`)
    return
  }
  let total = 0
  for (const file of files) {
    const relative = path.relative(process.cwd(), file)
    for (const violation of checkWorkflow(await fs.readFile(file, "utf8"))) {
      process.stderr.write(`[ci-workflow-security] ${relative}:${violation.line} ${RULES[violation.rule]}\n`)
      total += 1
    }
  }
  if (total > 0) {
    process.stderr.write(`[ci-workflow-security] ${total} 处违规，规范见 docs/qa/ai-sdlc-ci-security.md\n`)
    process.exitCode = 1
    return
  }
  process.stdout.write(`[ci-workflow-security] ${files.length} 个工作流通过\n`)
}

await main()
