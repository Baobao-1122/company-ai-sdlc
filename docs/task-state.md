# AI-SDLC 任务状态（Task State）

> **文档 ID：** `TASK-STATE-v1`  
> **策略：** 标准库定义 schema 与读写规则；**实例**保存在各业务项目  
> **配套：** [agent-active-guidance.md](agent-active-guidance.md) · [human-checkpoints.md](human-checkpoints.md) · Skill `sdlc-task-state`

---

## 1. 目标

| 问题 | Task State 如何解决 |
|------|---------------------|
| 单 Chat 长跑、上下文被摘要 | 任务进度写入 `.sdlc/task-state.yaml`，换 Chat 可恢复 |
| 阶段/CP/门禁是否完成靠翻聊天 | 结构化字段，Agent 必读必更新 |
| 多项目 schema 分叉 | 标准库统一 `schemaVersion: 1`；差异放 `extensions` |

**不包含：** Supervisor 动态路由、LangGraph 运行时。仅为 **State alone** 增强。

---

## 2. 存放位置

| 层级 | 路径 | 说明 |
|------|------|------|
| **标准库** | `docs/task-state.md`（本文） | Schema 与生命周期 |
| **标准库** | `templates/task-state.template.yaml` | 空模板 |
| **标准库** | `.cursor/skills/sdlc-task-state/` | Agent 读写协议 |
| **业务项目** | `.sdlc/task-state.yaml` | **当前 feat 的任务实例**（建议跟分支 commit） |
| **业务项目** | `.sdlc/history/{taskId}-{YYYYMMDD}.yaml` | 已结束或已切走的任务实例（见 §4.2 归档） |
| **业务项目** | `.sdlc/history/index.md` | 归档任务索引，每个任务一行（见 §4.5） |

灵犀、运营平台等各写各的实例；**不**把实例放进 `company-ai-sdlc` 仓库。

---

## 3. Schema（schemaVersion: 1）

见 [templates/task-state.template.yaml](../templates/task-state.template.yaml)。核心字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `taskId` | string | 任务 slug |
| `branch` | string | 当前 Git 分支 |
| `stage` | enum | `requirements` \| `design` \| `implement` \| `verify` \| `submit` \| `done` \| `paused` |
| `scope` / `acceptance` | string / string[] | 需求与验收 |
| `drafts` | object[] | CP-01 确认的设计草稿：`path`、`summary`。没有草稿为 `[]`（见 [human-checkpoints.md](human-checkpoints.md) §2.1） |
| `previousTask` | object \| null | 上一个任务：`path`（归档文件）、`handoff`（交给本任务的尾巴，如未提交的代码；没有写「无」）。第一个任务为 `null` |
| `context` | object[] | 本任务要读的背景文档：`path`、`why`（一句话：读它要知道什么）。只列和本任务有关的，按需读（见 §4.1） |
| `cp.*` | enum | `pending` \| `passed` \| `skipped` |
| `verify.*` | mixed | harness、对账、P1 audit 等客观门禁 |
| `reflection.*` | mixed | P1 / CP-06 结论摘要（非完整 Bugbot 日志） |
| `blockers` | string[] | 非空 → Agent 默认推荐 Stop |
| `extensions` | object | **项目特有**扩展（见各项目 `AGENTS.md`） |

大块终端日志 **不**写入 State；写路径或一行摘要到 `notes` / 对应字段。`notes` 只写断点和下一步，不超过 5 行；设计决定写进设计文档，再在 `context` 里指向它。

---

## 4. 何时使用（Agent 硬性）

### 4.1 读取（Read）

| 时机 | 动作 |
|------|------|
| **新 Chat / 用户说「续任务」「继续 SDLC」** | **第一件事**：Read `.sdlc/task-state.yaml` 和 `.sdlc/history/index.md`（若有）；汇报 `stage` + 下一步 |
| **任何开发类任务开场** | 检查文件是否存在；存在则 Read 并续做，不存在则准备创建 |
| **派 Bugbot / Security** | 将 `scope`、`verify.dataImpact` 等写入 Custom Instructions（可选） |

**分层读取（全面但按需）：**

| 层 | 读什么 | 何时读 |
|----|--------|--------|
| 1 当前任务 | `.sdlc/task-state.yaml` | 每次新 Chat 必读 |
| 2 任务索引 | `.sdlc/history/index.md` | 每次新 Chat 必读；只看行，不展开归档文件 |
| 3 按需深读 | `previousTask.path` 归档全文；`context` 里的文档；`AGENTS.md` 列的项目背景文档 | `previousTask` 不为 `null`，且 `handoff` 不是「无」或 `stage: requirements` 时，读归档全文。要动 `context` 里某份文档涉及的部分时读那一份。用户问到更早的任务时，按索引找到对应归档再读 |

不要一开场就把 history 全读一遍。项目长期背景（边界、产品、架构）以 `AGENTS.md` 和项目文档为准，不搬进 state。

### 4.2 创建（Create）

| 时机 | 动作 |
|------|------|
| CP-01 输出对齐表后 | 从模板创建 `.sdlc/task-state.yaml`，填入 `taskId`、`scope`、`acceptance`、`stage: requirements`、`previousTask`、`context`；`drafts` 保持 `[]`，CP-01 确认后再写 |
| 用户明确「小改动」且跳过 CP-01 | 可创建简化实例，`cp.cp01: skipped`，`notes` 写明理由 |

创建后 **建议 commit** 到当前 feat 分支（与代码同生命周期）。

**归档（不覆盖、不删除）：** 创建前若 `.sdlc/task-state.yaml` 已存在且 `taskId` 不同，先把它**移动**到 `.sdlc/history/{taskId}-{YYYYMMDD}.yaml`（日期取移动当天；同名已存在时加 `-2`、`-3`），再从模板创建。触发时机：

| 时机 | 说明 |
|------|------|
| 用户在 CP-09 指定下一项 | 旧任务已过 CP-05，归档后新任务从 CP-01 开始 |
| 旧任务未结束，用户要求先做另一项 | 先在旧 state 写 `stage: paused` 和 `notes`（停在哪、为什么切走），再归档 |

归档时同步在 `.sdlc/history/index.md` 追加一行（§4.5），新 state 的 `previousTask` 指向刚归档的文件。

恢复旧任务时，把 history 里的文件移回 `.sdlc/task-state.yaml`（当前 state 按上表先归档），并在索引那一行的「结果」列末尾加「（已恢复）」。history 文件与 state 一样建议跟分支 commit。

### 4.3 更新（Update）

| 时机 | 更新内容 |
|------|----------|
| 用户 CP-01「确认」 | `cp.cp01: passed`，`stage: design`，`drafts` 按确认的清单写入 |
| 架构审查「通过」 | `extensions.architectureReview.status: pending_confirm` |
| 用户「确认通过」 | `extensions.architectureReview.status: reviewed`，然后才可输出 CP-02 |
| 架构审查「要改」 | `extensions.architectureReview.status: changes_requested` |
| 用户「按审查改方案」 | `extensions.architectureReview.status: revising` |
| 用户「维持方案」 | `extensions.architectureReview.status: waived`，然后输出 CP-02 |
| 主 Agent 判定未触发，或子 Agent「这次不该审」 | `extensions.architectureReview.status: not_required`，写未触发理由后输出 CP-02 |
| 用户 CP-02「开始实现」 | `cp.cp02: passed`，`stage: implement` |
| 进入阶段 4 | `stage: verify` |
| 只读对账完成 | `verify.reconcileDone` |
| harness 跑完 | `verify.harnessPass`、`verify.harnessCommand` |
| `guard:sdlc-p1-trigger-audit` 后 | `verify.p1Audit` |
| P1 Reflection 完成 | `reflection.p1.*`、`verify.p1Review` |
| 用户 CP-05「提交」 | `stage: submit`（cp05 仍 pending 直到 CP-05 对话结束可标 passed） |
| CP-05 对话结束（用户已指示） | `cp.cp05: passed` |
| CP-06 Reflection 完成 | `reflection.cp06.*` |
| commit 成功 | `cp.cp06: passed`，`stage: done`；文件保留到下一个任务创建前再归档（§4.2） |
| 用户 CP-09 指定下一项 | 按 §4.2 归档，再创建新 state |
| 用户「暂停」 | `stage: paused` |
| 用户「继续改」 | `stage: implement`，追加 `blockers` 或清空已修项 |

**每次更新**须写 `updatedAt`（ISO 8601）、`updatedBy: agent`。

### 4.4 人工何时介入

| 操作 | 谁做 |
|------|------|
| 创建/更新 State 文件 | **Agent 自动**（无需人编辑 yaml） |
| CP-01～CP-06 确认 | **人**（与现网一致，State 不替代 CP） |
| 换 Chat 续做 | **人** 可选说「续任务」；Agent 也应 **自动 Read** 已有 state |
| 手动改 state | **人可选**（纠正 Agent 或强制暂停）；非日常路径 |
| commit state 文件 | **Agent 建议**；人 CP-06 确认提交时一并 commit |

**结论：** Task State 是 **Agent 维护的任务档案**；**人工介入点仍是 CP**，没有新增 mandatory 人工步骤。

### 4.5 归档索引 `.sdlc/history/index.md`

第一次归档时创建，之后每次归档追加一行，**不改旧行**（恢复时只在「结果」列末尾加「（已恢复）」）。新的在下面：

```markdown
# 任务归档索引

| 归档日 | 任务 | 结果 | 提交 | 交接 | 文件 |
|--------|------|------|------|------|------|
| 2026-10-21 | {taskId}：一句话范围 | 完成 / 暂停 / 放弃，停在哪个 CP | 提交号或「未提交」 | 留给后面的尾巴，没有写「无」 | `{taskId}-{YYYYMMDD}.yaml` |
```

每行控制在一屏能读完。细节留在归档文件和设计文档里。

---

## 5. 换 Chat 恢复 SOP

用户新开 Chat 时说：

```text
续任务
```

或 Agent 检测到 `.sdlc/task-state.yaml` 存在时 **主动**：

```markdown
📍 **任务恢复** · 自 `.sdlc/task-state.yaml`

| 项 | 值 |
|----|-----|
| 任务 | {taskId} |
| 分支 | {branch} |
| 阶段 | {stage} |
| 阻塞 | {blockers 或 无} |
| 上一任务 | {previousTask.path 与 handoff，或 无} |

**建议下一步：** …（按 stage + cp + verify 推断）

请确认继续，或说「修改范围：…」。
```

推断规则（Agent）：

| state 条件 | 建议下一步 |
|------------|-----------|
| `stage: requirements` 且 `cp.cp01: pending` | 继续 CP-01 或等人确认 |
| `architectureReview.status: pending_confirm` 且 `cp.cp02: pending` | 停在架构审查，等用户「确认通过」。不得输出 CP-02 |
| `architectureReview.status: changes_requested` 且 `cp.cp02: pending` | 停在架构审查，等用户「按审查改方案」或「维持方案」。不得输出 CP-02 |
| `architectureReview.status: revising` 且 `cp.cp02: pending` | 用户已选「按审查改方案」。继续改方案并再审，不得再次询问该选择，不得输出 CP-02 |
| `architectureReview.status: waived` 且 `cp.cp02: pending` | 用户已「维持方案」。输出 CP-02 |
| `architectureReview.status: reviewed` 且 `cp.cp02: pending` | 用户已「确认通过」。输出 CP-02 |
| `architectureReview` 尚未写入，且 `cp.cp01` 为 `passed` 或 `skipped`、`cp.cp02: pending` | 先按 `sdlc-architecture` 做触发判断并写下 status。不得输出 CP-02 |
| `architectureReview.status: not_required` 且 `cp.cp02: pending` | 已写下未触发理由。输出 CP-02 |
| `cp.cp02: passed` 且 `stage: implement` | 阶段 3 编码 |
| `stage: verify` 且 `harnessPass: null` | 跑 harness / 对账 |
| `harnessPass: true` 且 `cp.cp05: pending` | CP-05 汇报 |
| 用户已说「提交」且 `cp.cp06: pending` | CP-06 Reflection + commit |
| 用户提的新任务与 state 的 `taskId` 不同 | 先汇报旧任务断点；用户确认切换后按 §4.2 归档，不覆盖 |

---

## 6. 项目 extensions 约定

各业务项目在 `AGENTS.md` 声明 `extensions` 键，例如：

```yaml
extensions:
  saa-s-ui:
    reviewTier: L2
    harnessProfile: ci
```

**禁止**为项目特有字段修改标准库核心 schema 字段名。

标准库预留的架构审查扩展（未触发可省略整段）：

```yaml
extensions:
  architectureReview:
    required: false
    reason: ""
    status: not_required # not_required | pending_confirm | changes_requested | revising | reviewed | waived
```

定义见 Skill `sdlc-architecture`。`pending_confirm` 表示子 Agent 结论已是「通过」，正在等用户回复「确认通过」。`changes_requested` 表示结论是「要改」，正在等用户「按审查改方案」或「维持方案」。`revising` 表示用户已选「按审查改方案」，正在改方案并准备再审。这三个状态都不得输出 CP-02。`waived` 只用于用户选择「维持方案」。`reviewed` 只在用户已回复「确认通过」之后写入。

---

## 7. 与 Supervisor / LangGraph 的关系

- 本文档仅 **State alone**；不引入 Supervisor 节点。
- 将来若加 Supervisor，应 **读取** 本 State，而不是另建一套进度文件。

---

## 变更记录

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-10-21 | v1.3 | 分层读取：新增 `previousTask`、`context` 字段和 `.sdlc/history/index.md` 索引；`notes` 只写断点 |
| 2026-10-21 | v1.2 | 新增 `drafts` 字段；换任务时旧 state 移到 `.sdlc/history/`，不覆盖、不删除 |
| 2026-10-09 | v1.1 | `extensions.architectureReview`：`pending_confirm`、`changes_requested`、`revising` 都不得输出 CP-02 |
| 2026-09-10 | v1.0 | 初版：schema v1、生命周期、换 Chat SOP |
