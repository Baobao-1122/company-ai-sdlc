#!/usr/bin/env bash
# 将 company-ai-sdlc AI 工作流接入目标 Web 项目
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SDLC_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

PROJECT_NAME=""
PROJECT_PATH=""
PROJECT_SLUG=""
FORCE=false

usage() {
  cat <<'EOF'
用法:
  init-project-sdlc.sh --project-name "项目中文名" --project-path /path/to/project

选项:
  --project-name   必填，写入 AGENTS.md
  --project-path   目标项目根目录，默认当前目录
  --project-slug   Harness name，默认由项目名生成
  --force          覆盖已存在的 AGENTS.md（慎用）
  -h, --help       显示帮助

示例:
  ./scripts/init-project-sdlc.sh --project-name "律能运营平台" --project-path ../saa-s-ui
EOF
}

slugify() {
  local raw fallback
  raw="$(echo "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-|-$//g')"
  if [[ -n "$raw" ]]; then
    echo "$raw"
    return
  fi
  fallback="$(basename "$2" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-|-$//g')"
  if [[ -n "$fallback" ]]; then
    echo "$fallback"
  else
    echo "web-project"
  fi
}

log() { echo "[init-sdlc] $*"; }
warn() { echo "[init-sdlc] WARN: $*" >&2; }

copy_rules() {
  local dest="$1"
  mkdir -p "$dest/.cursor/rules"
  for f in "$SDLC_ROOT/.cursor/rules/"*.mdc; do
    local base
    base="$(basename "$f")"
    if [[ -f "$dest/.cursor/rules/$base" ]]; then
      warn "跳过已存在: .cursor/rules/$base"
    else
      cp "$f" "$dest/.cursor/rules/$base"
      log "已复制: .cursor/rules/$base"
    fi
  done
}

copy_skills() {
  local dest="$1"
  mkdir -p "$dest/.cursor/skills"
  for d in "$SDLC_ROOT/.cursor/skills/"*/; do
    local name
    name="$(basename "$d")"
    if [[ -d "$dest/.cursor/skills/$name" ]]; then
      warn "跳过已存在: .cursor/skills/$name"
    else
      cp -R "$d" "$dest/.cursor/skills/$name"
      log "已复制: .cursor/skills/$name"
    fi
  done
}

copy_sdlc_docs() {
  local dest="$1"
  mkdir -p "$dest/docs/qa"
  for f in human-checkpoints.md agent-active-guidance.md code-review.md decision-rubrics.md; do
    local base="ai-sdlc-${f}"
    if [[ -f "$dest/docs/qa/$base" ]]; then
      warn "跳过已存在: docs/qa/$base"
    else
      cp "$SDLC_ROOT/docs/$f" "$dest/docs/qa/$base"
      log "已复制: docs/qa/$base"
    fi
  done
  local tpl="$SDLC_ROOT/templates/decision-rubrics-project.template.md"
  if [[ -f "$tpl" ]]; then
    if [[ -f "$dest/docs/qa/ai-sdlc-cp-extension.template.md" ]]; then
      warn "跳过已存在: docs/qa/ai-sdlc-cp-extension.template.md"
    else
      cp "$tpl" "$dest/docs/qa/ai-sdlc-cp-extension.template.md"
      log "已复制: docs/qa/ai-sdlc-cp-extension.template.md"
    fi
  fi
}

generate_agents_md() {
  local dest="$1"
  if [[ -f "$dest/AGENTS.md" && "$FORCE" != true ]]; then
    warn "跳过已存在: AGENTS.md（使用 --force 覆盖）"
    return
  fi
  cat > "$dest/AGENTS.md" <<EOF
# AI / 研发协作入口

本仓库为 **${PROJECT_NAME}**。大模型切换协作时，**先读本文件与 \`docs/\`**，再改代码。

## 必读文档（按顺序）

| 文档 | 用途 |
|------|------|
| [docs/prd.md](docs/prd.md) | 产品目标、功能范围、验收标准 |
| [docs/dev-standard.md](docs/dev-standard.md) | 目录、代码规范（待建） |
| [docs/testing.md](docs/testing.md) | 测试与 Harness 门禁（待建） |
| [docs/deploy.md](docs/deploy.md) | 部署说明（待建） |

## 项目边界（硬性）

- （待填：部署边界、数据依赖、权限范围等）

## 关键代码位置

| 路径 | 说明 |
|------|------|
| \`src/\` | 应用源码（待细化） |

## 本地启动

\`\`\`bash
pnpm install
cp .env.local.example .env.local   # 若有
pnpm dev
pnpm test:harness:ci               # 合并前
\`\`\`

## Agent 执行规程（按改动类型）

| 触发条件 | 必跑命令 |
|----------|----------|
| 修改数据库 schema（无数据库时删除本行或标 N/A） | migration-prepare: \`（待填真实命令）\`; migration-apply: \`（待填真实命令）\`; structure-check: \`（待填真实命令）\`; api-smoke: \`（待填真实命令）\` |

> 数据库项目缺少上述实际命令时，不得通过 CP-02/CP-05。

## AI-SDLC 协作（AI 引导，你在 CP 介入）

**你不需要猜何时说话** — Agent 会在 `⏸` 处输出 **决策包**（判什么、Allow/Stop、自检、推荐）并给出编号选项。

| 文档 | 用途 |
|------|------|
| [docs/qa/ai-sdlc-agent-active-guidance.md](docs/qa/ai-sdlc-agent-active-guidance.md) | AI 如何引导、决策包模板 |
| [docs/qa/ai-sdlc-human-checkpoints.md](docs/qa/ai-sdlc-human-checkpoints.md) | CP-01～CP-10 何时停 |
| [docs/qa/ai-sdlc-decision-rubrics.md](docs/qa/ai-sdlc-decision-rubrics.md) | **CP 判断要点（Allow/Stop）** |
| [docs/qa/ai-sdlc-code-review.md](docs/qa/ai-sdlc-code-review.md) | 每次 commit 前 Review |

流程：**需求 → 设计 → 实现 → 验证 → （你要求时）提交**；提交前必跑 \`test:harness:ci\` + \`sdlc-review\`。

## CP 判断扩展（项目特有，必填）

在通用判据基础上追加本项目要点（模板见 [docs/qa/ai-sdlc-cp-extension.template.md](docs/qa/ai-sdlc-cp-extension.template.md)）：

| CP | 项目追加要点 | Allow | Stop |
|----|--------------|-------|------|
| CP-01 | （待填：外部数据/接口依赖） | 缺口已说明 | 静默 mock |
| CP-02 | （待填：敏感路径与 harness profile） | 验收命令完整 | 缺 profile |
| CP-06 | （待填：L2 路径） | Review 含 Security | 敏感路径未 L2 |
| CP-10 | （待填：生产/部署红线） | 负责人授权 | 无授权 |

## Git 提交（硬性）

- **一 commit 一功能**
- 提交前必跑 \`test:harness:ci\` + \`sdlc-review\`（CP-06 Code Review）
- 用户未要求时不 \`git push\`

## 文档维护

需求或部署约定变更时，**同步更新对应 \`docs/*.md\`**，并在文档顶部「变更记录」追加一行。
EOF
  log "已生成: AGENTS.md"
}

generate_prd() {
  local dest="$1"
  mkdir -p "$dest/docs"
  if [[ -f "$dest/docs/prd.md" ]]; then
    warn "跳过已存在: docs/prd.md"
    return
  fi
  local date today
  today="$(date +%Y-%m-%d)"
  sed \
    -e "s|{{PROJECT_NAME}}|${PROJECT_NAME}|g" \
    -e "s|{{DATE}}|${today}|g" \
    "$SDLC_ROOT/templates/docs/prd.template.md" > "$dest/docs/prd.md"
  log "已生成: docs/prd.md"
}

generate_harness() {
  local dest="$1"
  if [[ -f "$dest/harness.config.ts" ]]; then
    warn "跳过已存在: harness.config.ts"
    return
  fi
  sed "s|{{PROJECT_SLUG}}|${PROJECT_SLUG}|g" \
    "$SDLC_ROOT/templates/harness.config.example.ts" > "$dest/harness.config.ts"
  log "已生成: harness.config.ts"
}

patch_package_json() {
  local dest="$1"
  local pkg="$dest/package.json"
  if [[ ! -f "$pkg" ]]; then
    warn "未找到 package.json，请手动添加 test:harness 脚本"
    return
  fi
  if command -v node >/dev/null 2>&1; then
    node <<NODE
const fs = require('fs');
const path = require('path');
const pkgPath = path.join('$dest', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
let changed = false;
if (!pkg.scripts['test:harness']) {
  pkg.scripts['test:harness'] = 'harness run';
  changed = true;
}
if (!pkg.scripts['test:harness:ci']) {
  pkg.scripts['test:harness:ci'] = 'harness run --profile ci';
  changed = true;
}
if (changed) {
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log('[init-sdlc] 已更新 package.json scripts');
} else {
  console.log('[init-sdlc] package.json 已有 harness scripts，跳过');
}
NODE
  else
    warn "未安装 node，请手动在 package.json 添加 test:harness / test:harness:ci"
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project-name) PROJECT_NAME="$2"; shift 2 ;;
    --project-path) PROJECT_PATH="$2"; shift 2 ;;
    --project-slug) PROJECT_SLUG="$2"; shift 2 ;;
    --force) FORCE=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "未知参数: $1" >&2; usage; exit 1 ;;
  esac
done

if [[ -z "$PROJECT_NAME" ]]; then
  echo "错误: --project-name 必填" >&2
  usage
  exit 1
fi

PROJECT_PATH="${PROJECT_PATH:-.}"
PROJECT_PATH="$(cd "$PROJECT_PATH" && pwd)"
PROJECT_SLUG="${PROJECT_SLUG:-$(slugify "$PROJECT_NAME" "$PROJECT_PATH")}"

log "SDLC 根目录: $SDLC_ROOT"
log "目标项目: $PROJECT_PATH"
log "项目名: $PROJECT_NAME"
log "Harness slug: $PROJECT_SLUG"

copy_rules "$PROJECT_PATH"
copy_skills "$PROJECT_PATH"
copy_sdlc_docs "$PROJECT_PATH"
generate_agents_md "$PROJECT_PATH"
generate_prd "$PROJECT_PATH"
generate_harness "$PROJECT_PATH"
patch_package_json "$PROJECT_PATH"

cat <<EOF

接入完成。请手动完成：

  1. 编辑 AGENTS.md — 填必读文档、边界、启动命令、关键路径、**§CP 判断扩展**
  2. 数据库项目：填写 migration-prepare / migration-apply / structure-check / api-smoke 真实命令并执行接入 V5 登记检查
  3. 编辑 docs/prd.md — 写产品目标与 FU-xxx 功能清单
  4. 编辑 harness.config.ts — 按实际测试/lint 命令调整 layers
  5. 安装 Harness: pnpm add -D @linzhang1122/web-harness
  6. 验证: pnpm test:harness:ci

详细说明: $SDLC_ROOT/docs/project-onboarding.md

EOF
