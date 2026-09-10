# 项目接入文档（AI 可执行版）

> **文档 ID：** `ONBOARDING-v2`  
> **受众：** Cursor Agent、研发人员  
> **用途：** 将业务 Web 项目接入 `company-ai-sdlc` AI 工作流  
> **最后更新：** 2026-08-07

---

## Agent 执行入口（先读本节）

当用户说「接入 AI 工作流」「帮项目接 SDLC」「项目怎么接入」时，Agent **必须先读本文件**，再按决策树执行。

### 决策树

```
用户指定目标项目路径 PROJECT_ROOT
        │
        ▼
扫描 PROJECT_ROOT 是否已有 AGENTS.md / harness.config.ts / .cursor/rules/
        │
        ├─ 三者皆无，或仅有空骨架 ──→ 走 §2 新项目接入
        │
        └─ 至少一项已存在 ──────────→ 走 §3 已有项目增量接入
        │
        ▼
执行 §4 接入后填表（AGENTS.md 必填字段）
        │
        ▼
复制 SDLC 文档 → 项目 `docs/qa/ai-sdlc-*.md`（checkpoints / guidance / code-review / decision-rubrics）
        │
        ▼
复制 `decision-rubrics-project.template.md` → `docs/qa/ai-sdlc-cp-extension.template.md`
        │
        ▼
执行 §5 验证命令
        │
        ▼
用 §6 汇报模板向用户汇报；未完成项标 ❌，禁止声称「接入完成」
```

### Agent 硬性约束

1. **不覆盖**已有文件，除非用户明确说「覆盖」或传入 `--force`
2. **不编写业务功能代码**；接入任务只产生/补全 SDLC 基础设施文件
3. 接入完成后 **必须跑验证命令**（§5），并汇报结果
4. 缺信息时 **先问用户**（项目中文名、边界、启动命令），不编造

---

## §1 接入达标清单（最终状态）

接入完成后，目标项目 `PROJECT_ROOT` 必须满足下表。Agent 用此表做 gap 分析。

| ID | 路径 | 必须 | 作用 | 缺失时动作 |
|----|------|:----:|------|-----------|
| F-01 | `AGENTS.md` | ✅ | Agent 会话入口：边界、必读 doc、启动命令 | 生成或补全 |
| F-02 | `docs/prd.md` | ✅ | 产品目标与 FU-xxx 功能清单 | 从模板创建或链接已有 PRD |
| F-03 | `.cursor/rules/sdlc-workflow.mdc` | ✅ | SDLC 阶段顺序 | 从标准库复制 |
| F-04 | `.cursor/rules/general-principles.mdc` | ✅ | 编码原则 | 从标准库复制 |
| F-05 | `.cursor/rules/git-commit.mdc` | ✅ | 提交规范 | 从标准库复制 |
| F-06 | `.cursor/rules/docs-sync.mdc` | ✅ | 文档同步 | 从标准库复制 |
| F-07 | `.cursor/skills/sdlc-requirements/` | 推荐 | 需求阶段 Skill | 从标准库复制 |
| F-08 | `.cursor/skills/sdlc-design/` | 推荐 | 设计阶段 Skill | 从标准库复制 |
| F-09 | `.cursor/skills/sdlc-implement/` | 推荐 | 实现阶段 Skill | 从标准库复制 |
| F-10 | `.cursor/skills/sdlc-verify/` | 推荐 | 验证阶段 Skill | 从标准库复制 |
| F-11 | `.cursor/skills/sdlc-review/` | ✅ | **每次 commit 前 Code Review** | 从标准库复制 |
| F-11b | `.cursor/skills/sdlc-task-state/` | 推荐 | 任务状态读写（换 Chat 可续） | 从标准库复制 |
| F-11c | `docs/qa/ai-sdlc-task-state.md` | 推荐 | Task State 规范（sync 自标准库） | 从标准库复制 |
| F-11d | `.sdlc/task-state.yaml` | 推荐 | 当前 feat 任务实例（模板可空） | init 脚本或首个任务 Create |
| F-12 | `harness.config.ts` | ✅ | 质量门禁 layers | 创建或保留已有 |
| F-13 | `package.json` → `scripts.test:harness:ci` | ✅ | 合并前必跑命令 | 追加缺失 script |
| F-14 | 项目特有 Rule（可选） | 可选 | 如 `auth-rbac.mdc` | 保留已有，不删 |
| F-15 | `docs/qa/ai-sdlc-decision-rubrics.md` | ✅ | CP Allow/Stop 判据 | 从标准库复制 |
| F-16 | `AGENTS.md` § **CP 判断扩展** | ✅ | 项目特有判据 | 从模板填写 |
| F-17 | `.cursor/rules/nextjs-middleware-response.mdc` | Next.js 推荐 | middleware/proxy 改写 Response 红线（防 text/plain 整页源码） | 从标准库复制；见 `docs/code-review.md` §8 |

**说明：** F-07～F-10 也可依赖用户级 Skill（`~/.cursor/skills/`），但**项目内复制**更稳定（新同事/新机器开箱即用）。

---

## §2 新项目接入（从零）

适用：`AGENTS.md`、`harness.config.ts`、`.cursor/rules/` 均不存在或为空。

### 2.1 前置条件

| 检查项 | 要求 |
|--------|------|
| 项目类型 | Web 项目（Next.js / React + TS 等） |
| 包管理 | 有 `package.json` |
| 标准库路径 | 本地存在 `company-ai-sdlc` 仓库 |
| 变量 | `SDLC_ROOT` = 标准库绝对路径；`PROJECT_ROOT` = 目标项目绝对路径 |

### 2.2 执行命令（Agent 必须运行）

```bash
SDLC_ROOT="/path/to/company-ai-sdlc"
PROJECT_ROOT="/path/to/my-web-app"
PROJECT_NAME="项目中文名"   # 向用户确认

"$SDLC_ROOT/scripts/init-project-sdlc.sh" \
  --project-name "$PROJECT_NAME" \
  --project-path "$PROJECT_ROOT"
```

**脚本行为（Agent 须知晓）：**

| 动作 | 目标 | 已存在时 |
|------|------|----------|
| 复制 Rule | `.cursor/rules/*.mdc` | 跳过同名 |
| 复制 Skill | `.cursor/skills/sdlc-*` | 跳过同名目录 |
| 复制 SDLC 文档 | `docs/qa/ai-sdlc-*.md` | 跳过 |
| 生成 AGENTS.md | 根目录 | 跳过（`--force` 才覆盖） |
| 生成 docs/prd.md | `docs/` | 跳过 |
| 生成 harness.config.ts | 根目录 | 跳过 |
| 追加 scripts | `package.json` | 仅补缺失项 |

### 2.3 脚本后 Agent 必做填表

脚本只生成骨架。Agent **必须**读取项目代码与现有 docs，编辑：

1. `AGENTS.md` — 按 §4 字段规范填满
2. `docs/prd.md` — 至少 1 条 FU-xxx（或链接已有 PRD 并写入 AGENTS 必读表）
3. `harness.config.ts` — 按 §4.2 对齐真实测试/lint 命令

### 2.4 安装 Harness 依赖

若 `package.json` 无 `@linzhang1122/web-harness` / `@xseed/web-harness`：

```bash
cd "$PROJECT_ROOT"
pnpm add -D @linzhang1122/web-harness
# 或：pnpm add -D file:../xseed-web-harness
```

Agent 须检查 `harness.config.ts` 的 `import` 与安装的包名一致。

---

## §3 已有项目增量接入

适用：项目已有部分 SDLC 文件（如 saa-s-ui 有 Rule+harness，碳普惠有 AGENTS+harness）。

### 3.1 现状诊断（Agent 必须执行）

```bash
PROJECT_ROOT="/path/to/existing-project"
ls -la "$PROJECT_ROOT/AGENTS.md" 2>/dev/null
ls -la "$PROJECT_ROOT/harness.config.ts" 2>/dev/null
ls "$PROJECT_ROOT/.cursor/rules/" 2>/dev/null
ls "$PROJECT_ROOT/.cursor/skills/" 2>/dev/null
ls "$PROJECT_ROOT/docs/" 2>/dev/null
grep -E "test:harness" "$PROJECT_ROOT/package.json" 2>/dev/null
```

将结果对照 §1 清单，输出 **缺口表**：

```markdown
| ID | 文件 | 状态 | 动作 |
|----|------|------|------|
| F-01 | AGENTS.md | ✅ 已有 | 检查字段是否完整（§4） |
| F-03 | sdlc-workflow.mdc | ❌ 缺失 | 复制 |
| … | … | … | … |
```

### 3.2 合并策略（硬性）

| 场景 | Agent 动作 |
|------|-----------|
| 标准库 Rule 缺失 | **复制** `$SDLC_ROOT/.cursor/rules/<file>.mdc`，不覆盖已有同名 |
| 项目特有 Rule 已存在（如 `auth-rbac.mdc`） | **保留**，不删不改 |
| AGENTS.md 已存在且内容完整 | **不覆盖**；仅建议补 §4 缺失字段 |
| AGENTS.md 不存在 | 运行 init 脚本或从模板生成 |
| harness.config.ts 已存在且可跑 | **保留**；只补 `package.json` scripts |
| harness.config.ts 不存在 | 复制模板并按项目改 layers |
| 模块级 AGENTS.md（如 `lib/foo/AGENTS.md`） | **保留**；额外补**根目录** `AGENTS.md` 作为总入口 |

### 3.3 单文件补全命令

SDLC Rule、Skill 与配套文档存在跨文件约束，禁止在本节独立复制，统一按 §3.5 原子同步。本节只补不承载流程语义的独立骨架文件。

```bash
SDLC_ROOT="/path/to/company-ai-sdlc"
PROJECT_ROOT="/path/to/existing-project"

# 只补 harness（不存在时）
[[ -f "$PROJECT_ROOT/harness.config.ts" ]] || \
  cp "$SDLC_ROOT/templates/harness.config.example.ts" "$PROJECT_ROOT/harness.config.ts"
```

### 3.4 已有项目参考矩阵

Agent 接入已有仓库时，对照下表决定「保留什么、补什么」：

| 项目 | 已有 | 缺口 | 推荐动作 |
|------|------|------|----------|
| **saa-s-ui** | `.cursor/rules/*`（7+ 条）、`harness.config.ts`、`test:harness:ci` | 根 `AGENTS.md` | 生成根 AGENTS.md；复制 4 条 SDLC 通用 Rule 中缺失的；保留全部项目 Rule |
| **lvneng-carbon-platform** | `AGENTS.md`、`harness.config.ts`、完整 `docs/` | `.cursor/rules/`、`sdlc-*` Skill | 复制 4 条 Rule + 4 个 Skill；不覆盖 AGENTS/harness |
| **lvneng-ops** | `AGENTS.md` | Rule、harness、Skill | 先补 AGENTS 数据库命令并按 §3.5 原子同步 Rule/Skill/docs，再按 §3.3 补 harness；layers 改为 Python 项目命令 |
| **任意新项目** | 无 | 全部 | §2 一键脚本 |

### 3.5 标准库升级同步（已有项目）

当 `company-ai-sdlc` 发布新版本（如新增决策判据），Agent 在**用户明确要求升级**时执行：

| 优先级 | 资源 | 动作 | 覆盖策略 |
|--------|------|------|----------|
| P0（先执行） | `AGENTS.md` | 数据库项目先补 migration prepare/apply、结构检查与针对性 API 冒烟实际命令 | 合并进已有 **Agent 执行规程**；无该章节时才新建，不覆盖项目边界/启动命令 |
| P0（原子同步） | `.cursor/rules/sdlc-workflow.mdc` | 对比 diff，合并数据库变更链与决策包段落 | 不删项目特有 Rule |
| P0（原子同步） | `.cursor/skills/sdlc-design`、`sdlc-implement`、`sdlc-verify`、**`sdlc-review`** | 对比 diff，合并数据库计划、P1/Reflection、验证与 Review 要求 | 不覆盖项目特有补充 |
| P0（原子同步） | `docs/qa/ai-sdlc-decision-rubrics.md`、guidance、checkpoints、**`ai-sdlc-code-review.md`** | 复制或 diff 合并（含 §10 P1、§11 Reflection） | 项目扩展仍在 AGENTS §CP 判断扩展 |
| P1 | 其他 `docs/qa/ai-sdlc-*.md`、Skill | 按需更新 | 跳过若项目有本地定制 |
| P2 | `AGENTS.md` | 补 **§CP 判断扩展** 与 SDLC 文档链接 | **不覆盖**项目边界/启动命令 |

数据库项目升级必须先完成首行的命令登记与 V5 核验，再将三项“P0（原子同步）”一起完成；任一项缺失都应停止升级，不得留下无法执行或定义不完整的强制门禁。

```bash
SDLC_ROOT="/path/to/company-ai-sdlc"
PROJECT_ROOT="/path/to/existing-project"

# 1. 先合并 AGENTS.md 数据库实际命令并完成 V5（数据库项目）
# 2. 原子组目标缺失时先创建，已存在时保留并进入 diff 合并：
mkdir -p "$PROJECT_ROOT/.cursor/rules" "$PROJECT_ROOT/.cursor/skills" "$PROJECT_ROOT/docs/qa"
[[ -f "$PROJECT_ROOT/.cursor/rules/sdlc-workflow.mdc" ]] || \
  cp "$SDLC_ROOT/.cursor/rules/sdlc-workflow.mdc" "$PROJECT_ROOT/.cursor/rules/sdlc-workflow.mdc"
for skill in sdlc-design sdlc-implement sdlc-verify sdlc-review; do
  [[ -d "$PROJECT_ROOT/.cursor/skills/$skill" ]] || \
    cp -R "$SDLC_ROOT/.cursor/skills/$skill" "$PROJECT_ROOT/.cursor/skills/$skill"
done
[[ -f "$PROJECT_ROOT/docs/qa/ai-sdlc-decision-rubrics.md" ]] || \
  cp "$SDLC_ROOT/docs/decision-rubrics.md" "$PROJECT_ROOT/docs/qa/ai-sdlc-decision-rubrics.md"
[[ -f "$PROJECT_ROOT/docs/qa/ai-sdlc-agent-active-guidance.md" ]] || \
  cp "$SDLC_ROOT/docs/agent-active-guidance.md" "$PROJECT_ROOT/docs/qa/ai-sdlc-agent-active-guidance.md"
[[ -f "$PROJECT_ROOT/docs/qa/ai-sdlc-human-checkpoints.md" ]] || \
  cp "$SDLC_ROOT/docs/human-checkpoints.md" "$PROJECT_ROOT/docs/qa/ai-sdlc-human-checkpoints.md"
[[ -f "$PROJECT_ROOT/docs/qa/ai-sdlc-code-review.md" ]] || \
  cp "$SDLC_ROOT/docs/code-review.md" "$PROJECT_ROOT/docs/qa/ai-sdlc-code-review.md"

# 3. 对比并合并以下原子组，禁止只更新其中一项：
diff -u "$PROJECT_ROOT/.cursor/rules/sdlc-workflow.mdc" \
  "$SDLC_ROOT/.cursor/rules/sdlc-workflow.mdc" || true
diff -u "$PROJECT_ROOT/.cursor/skills/sdlc-design/SKILL.md" \
  "$SDLC_ROOT/.cursor/skills/sdlc-design/SKILL.md" || true
diff -u "$PROJECT_ROOT/.cursor/skills/sdlc-implement/SKILL.md" \
  "$SDLC_ROOT/.cursor/skills/sdlc-implement/SKILL.md" || true
diff -u "$PROJECT_ROOT/.cursor/skills/sdlc-verify/SKILL.md" \
  "$SDLC_ROOT/.cursor/skills/sdlc-verify/SKILL.md" || true
diff -u "$PROJECT_ROOT/.cursor/skills/sdlc-review/SKILL.md" \
  "$SDLC_ROOT/.cursor/skills/sdlc-review/SKILL.md" || true
diff -u "$PROJECT_ROOT/docs/qa/ai-sdlc-code-review.md" \
  "$SDLC_ROOT/docs/code-review.md" || true
diff -u "$PROJECT_ROOT/docs/qa/ai-sdlc-decision-rubrics.md" \
  "$SDLC_ROOT/docs/decision-rubrics.md" || true
diff -u "$PROJECT_ROOT/docs/qa/ai-sdlc-agent-active-guidance.md" \
  "$SDLC_ROOT/docs/agent-active-guidance.md" || true
diff -u "$PROJECT_ROOT/docs/qa/ai-sdlc-human-checkpoints.md" \
  "$SDLC_ROOT/docs/human-checkpoints.md" || true

# 4. 合并上述 diff 后统一执行 §5 验证
```

升级后让用户在新会话试跑 CP-01，确认 Agent 输出含 ①～⑤ 决策包。

---

## §4 填表规范（Agent 写文件时用）

### 4.1 AGENTS.md 必填字段

Agent 编辑 `AGENTS.md` 时，以下章节 **不得留「待填」**：

| 章节 | 必填内容 | 获取方式 |
|------|----------|----------|
| 标题下项目名 | 中文项目名 | 问用户或读 README |
| **必读文档（按顺序）** | 表格：路径 + 用途 | 扫描 `docs/` 目录取文件 |
| **项目边界（硬性）** | 部署方式、数据依赖、权限范围、禁止事项 | 读 README / deploy doc / 问用户 |
| **关键代码位置** | 表格：路径 + 说明 | 扫描仓库目录结构 |
| **本地启动** | 可复制的 bash 代码块 | 读 package.json scripts + README |
| **Agent 执行规程**（有数据库项目必填） | 触发条件 → 必跑命令；数据库项目须含 migration prepare/apply、状态/结构检查与 API 冒烟命令 | 读 package scripts、数据库文档与项目特有校验 |
| **Git 提交（硬性）** | 一 commit 一功能 + test:harness:ci | 固定文案即可 |
| **AI-SDLC 协作节奏** | 一项一项 / 确认后写代码 / 完成后暂停 | 固定文案即可 |
| **CP 判断扩展** | CP-01/02/06/10 项目 Allow/Stop | 读 deploy/Playbook/问用户 |

有数据库的项目必须在 `AGENTS.md` 写出项目实际命令，禁止只写“执行迁移”等不可运行的描述。若暂时没有结构检查命令，应将其登记为接入缺口，不能假定 migration 文件存在即表示数据库已更新。

业务数据只读对账命令为**可选**登记（不纳入 V5 硬门）：有脚本则写清只读命令；无脚本允许手工核对。无论是否有脚本，**校验禁止改删业务数据**，只允许输出结论与问题；修数另开任务并单独授权。

**AGENTS.md 最小合格示例结构：**

```markdown
# AI / 研发协作入口

本仓库为 **{项目中文名}**。先读本文件与 docs/，再改代码。

## 必读文档（按顺序）
| 文档 | 用途 |
| docs/prd.md | … |

## 项目边界（硬性）
- …

## 关键代码位置
| 路径 | 说明 |
| … | … |

## 本地启动
\`\`\`bash
pnpm install && pnpm dev
pnpm test:harness:ci
\`\`\`

## Agent 执行规程（按改动类型；有数据库项目必填）
| 触发条件 | 必跑命令 |
| 修改数据库 schema | migration-prepare: `pnpm guard:migration-journal && pnpm guard:migration-integrity`; migration-apply: `pnpm db:migrate`; structure-check: `pnpm db:doctor`; api-smoke: `pnpm smoke:critical-api` |

> 上述命令仅示例；必须替换为项目 `package.json` / 数据库文档中的真实可执行命令。`migration-prepare` 应覆盖工具生成，或手写 migration 后的 journal/manifest 检查。

## Git 提交（硬性）
- 一 commit 一功能；提交前 test:harness:ci
```

### 4.2 harness.config.ts 对齐规则

| 字段 | Agent 填法 |
|------|-----------|
| `name` | 项目 slug（英文，如 `saa-s-ui`） |
| `profiles.ci.layers` | 合并前必跑的 layer ID 列表 |
| `layers.L1` | 项目单测命令（`pnpm vitest run` / `npm run test`） |
| `layers.L4` | lint 命令（`pnpm lint`） |
| 项目特有 layer | 参考同类项目（如 L2 权限双模、L3 协议脚本） |

**import 包名对照：**

| 依赖 | import |
|------|--------|
| `@linzhang1122/web-harness` | `import { defineHarnessConfig } from "@linzhang1122/web-harness"` |
| `@xseed/web-harness` | `import { defineHarnessConfig } from "@xseed/web-harness"` |

### 4.3 docs/prd.md 最低要求

至少包含：

- 产品一句话定位
- 1 条 **FU-xxx** 功能（含：目标、输入、输出、异常、验收）
- 变更记录表

若项目已有 PRD（如 `docs/ai-prd-v1.md`），在 `AGENTS.md` 必读表中 **链接该文件**，可不重复创建 `prd.md`。

---

## §5 验证命令（Agent 必须执行并汇报）

按顺序执行；失败则接入 **未完成**。

```bash
cd "$PROJECT_ROOT"

# V1 文件存在性
test -f AGENTS.md && echo "V1 AGENTS.md OK"
test -f harness.config.ts && echo "V1 harness OK"
test -f .cursor/rules/sdlc-workflow.mdc && echo "V1 rules OK"

# V2 package scripts
node -e "const p=require('./package.json'); if(!p.scripts?.['test:harness:ci']) process.exit(1); console.log('V2 scripts OK')"

# V3 harness 可执行（需已安装依赖）
pnpm test:harness:ci || npm run test:harness:ci

test -f docs/qa/ai-sdlc-decision-rubrics.md && echo "V1 decision-rubrics OK"

# V4 AGENTS 完整性
node -e "const fs=require('fs');const s=fs.readFileSync('AGENTS.md','utf8');if(/待填|\\{\\{[^}]+\\}\\}/.test(s))process.exit(1);console.log('V4 AGENTS placeholders OK')"

# V5 数据库命令登记（条件执行）
node -e "const fs=require('fs');const p=require('./package.json');const names=[...Object.keys(p.dependencies??{}),...Object.keys(p.devDependencies??{}),...Object.keys(p.scripts??{})].join(' ');const usesDb=/(drizzle|prisma|sequelize|typeorm|knex|mongoose|postgres|mysql|sqlite|(^|\\s)pg(\\s|$)|(^|\\s)db:)/i.test(names)||['lib/db','src/db','prisma','drizzle.config.ts','drizzle.config.js'].some((path)=>fs.existsSync(path));if(!usesDb){console.log('V5 database commands N/A');process.exit(0)}const s=fs.readFileSync('AGENTS.md','utf8');const x=s.match(/## Agent 执行规程[^\\n]*[\\s\\S]*?(?=\\n## |$)/)?.[0]??'';const r=x.split('\\n').find((line)=>/修改数据库 schema/i.test(line))??'';if(!/migration-prepare:\\s*\`[^\`]+\`/i.test(r)||!/migration-apply:\\s*\`[^\`]+\`/i.test(r)||!/structure-check:\\s*\`[^\`]+\`/i.test(r)||!/api-smoke:\\s*\`[^\`]+\`/i.test(r))process.exit(1);console.log('V5 database commands registered')"
# V5 只校验命令登记，不在接入时操作数据库；实际执行属于具体 schema 任务的
# CP-05 前置验证。任一命令未登记时，V5 失败，禁止声称接入完成。
```

| 验证 ID | 通过条件 |
|---------|----------|
| V1 | F-01、F-03～F-06、F-11、F-15 文件存在 |
| V2 | `test:harness:ci` 在 package.json 中 |
| V3 | harness ci profile 命令退出码 0（缺依赖时标 ⏭ 并说明） |
| V4 | AGENTS.md 无占位且 Agent 能复述项目边界 |
| V5 | 无数据库时标 N/A；有数据库时登记 migration prepare/apply、结构检查与针对性 API 冒烟四类命令，缺一项即失败；接入阶段不执行迁移 |

---

## §6 接入完成汇报模板（Agent 输出）

接入任务结束时，Agent **必须**使用此模板回复用户：

```markdown
## 项目接入报告：{项目名}

**路径：** `{PROJECT_ROOT}`  
**接入类型：** 新项目 / 已有项目增量

### 清单状态
| ID | 项 | 状态 |
| F-01 | AGENTS.md | ✅ / ❌ |
| F-03～F-06 | 通用 Rule | ✅ / ❌ |
| F-07～F-11 | SDLC Skill | ✅ / ⏭ 用用户级 |
| F-12 | harness.config.ts | ✅ / ❌ |
| F-13 | test:harness:ci | ✅ / ❌ |
| F-15 | ai-sdlc-decision-rubrics.md | ✅ / ❌ |
| F-16 | AGENTS §CP 判断扩展 | ✅ / ❌ |

### 验证结果
| 验证 | 结果 | 说明 |
| V1 文件 | ✅ | |
| V2 scripts | ✅ | |
| V3 harness | ✅ / ⏭ | 未装依赖则写补装命令 |
| V4 AGENTS 完整性 | ✅ | 无占位且能复述项目边界 |
| V5 数据库命令登记 | ✅ / N/A / ❌ | 逐项列出四类命令；缺失时必须为 ❌ |

### 待你确认/补填
1. …
2. …

### 下一步开发用法
- 「对齐需求 FU-001」→ 需求阶段
- 「开始实现」→ 实现阶段
- 「跑 test:harness:ci」→ 验证阶段
```

---

## §7 手动接入（无脚本时）

当无法运行 bash 脚本时，Agent 按序手动完成：

| 步骤 | 命令/动作 |
|------|-----------|
| 1 | `cp $SDLC_ROOT/templates/AGENTS.md.template → AGENTS.md`，按 §4.1 填 |
| 2 | `cp $SDLC_ROOT/.cursor/rules/*.mdc → .cursor/rules/`（跳过已有） |
| 3 | `cp -R $SDLC_ROOT/.cursor/skills/sdlc-* → .cursor/skills/`（跳过已有） |
| 4 | `cp $SDLC_ROOT/templates/harness.config.example.ts → harness.config.ts`，按 §4.2 改 |
| 5 | `cp $SDLC_ROOT/docs/*.md（checkpoints/guidance/code-review/decision-rubrics）→ docs/qa/ai-sdlc-*.md` |
| 6 | `cp $SDLC_ROOT/templates/decision-rubrics-project.template.md → docs/qa/ai-sdlc-cp-extension.template.md` |
| 7 | `cp $SDLC_ROOT/templates/docs/prd.template.md → docs/prd.md`（或链已有 PRD） |
| 8 | 编辑 package.json 追加 `test:harness` / `test:harness:ci` |
| 9 | 执行 §5 验证 |

---

## §8 Git Submodule 接入（可选）

多项目统一升级 Rule 时使用；Agent 仅在用户明确要求时执行。

```bash
cd "$PROJECT_ROOT"
git submodule add <company-ai-sdlc-git-url> .company-ai-sdlc

mkdir -p .cursor/rules
for f in .company-ai-sdlc/.cursor/rules/*.mdc; do
  ln -sf "../../$f" ".cursor/rules/$(basename "$f")"
done
```

**注意：** 项目特有 Rule 仍放本地 `.cursor/rules/`，不与 submodule 冲突。

---

## §9 常见问题（Agent 问答口径）

| 问题 | 回答 |
|------|------|
| 必须复制 Skill 吗？ | 推荐复制到项目 `.cursor/skills/sdlc-*`；也可依赖 `~/.cursor/skills/web-*` 技术 Skill |
| 非 Next.js 能接吗？ | 能。AGENTS + Rule 通用；harness layers 改为实际测试命令 |
| 已有 AGENTS 要覆盖吗？ | **默认不覆盖**；只补缺失字段 |
| 接入时要写业务代码吗？ | **不要**；只建 SDLC 基础设施 |
| Harness 包名不一致？ | 改 `harness.config.ts` 的 import 与 package.json 依赖一致 |

---

## §10 标准库路径索引（Agent 复制源）

`SDLC_ROOT` = 本仓库根目录，即 `company-ai-sdlc/`：

| 资源 | 路径 |
|------|------|
| 接入脚本 | `scripts/init-project-sdlc.sh` |
| AGENTS 模板 | `templates/AGENTS.md.template` |
| PRD 模板 | `templates/docs/prd.template.md` |
| Harness 模板 | `templates/harness.config.example.ts` |
| 通用 Rule | `.cursor/rules/*.mdc` |
| 阶段 Skill | `.cursor/skills/sdlc-*/SKILL.md` |
| CP 判据 | `docs/decision-rubrics.md` |
| 项目判据模板 | `templates/decision-rubrics-project.template.md` |
| 工作流说明 | `docs/workflow-overview.md` |
| 阶段细则 | `docs/stages/01-requirements.md` … `05-release.md` |

---

## 变更记录

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-09-08 | v2.5 | §3.5 升级同步含 sdlc-review、ai-sdlc-code-review §10–§11（P1 + Reflection） |
| 2026-08-19 | v2.4 | 业务数据只读抽样对账门禁说明；对账命令可选登记、禁止校验写库 |
| 2026-08-07 | v2.3 | F-17：Next.js middleware Response 红线 Rule；对齐 code-review §8 |
| 2026-08-03 | v2.2 | 数据库项目接入时必须登记 migration、结构检查与 API 冒烟命令 |
| 2026-07-27 | v2.1 | 决策判据 F-15/F-16、§3.5 升级同步 |
| 2026-07-17 | v2.0 | AI 可执行版：决策树、达标清单、验证命令、汇报模板、已有项目矩阵 |
| 2026-07-17 | v1.0 | 首版：三种接入方式 |
