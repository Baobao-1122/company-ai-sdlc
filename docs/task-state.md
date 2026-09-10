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
| `cp.*` | enum | `pending` \| `passed` \| `skipped` |
| `verify.*` | mixed | harness、对账、P1 audit 等客观门禁 |
| `reflection.*` | mixed | P1 / CP-06 结论摘要（非完整 Bugbot 日志） |
| `blockers` | string[] | 非空 → Agent 默认推荐 Stop |
| `extensions` | object | **项目特有**扩展（见各项目 `AGENTS.md`） |

大块终端日志 **不**写入 State；写路径或一行摘要到 `notes` / 对应字段。

---

## 4. 何时使用（Agent 硬性）

### 4.1 读取（Read）

| 时机 | 动作 |
|------|------|
| **新 Chat / 用户说「续任务」「继续 SDLC」** | **第一件事**：Read `.sdlc/task-state.yaml`；汇报 `stage` + 下一步 |
| **任何开发类任务开场** | 检查文件是否存在；存在则 Read 并续做，不存在则准备创建 |
| **派 Bugbot / Security** | 将 `scope`、`verify.dataImpact` 等写入 Custom Instructions（可选） |

### 4.2 创建（Create）

| 时机 | 动作 |
|------|------|
| CP-01 输出对齐表后 | 从模板创建 `.sdlc/task-state.yaml`，填入 `taskId`、`scope`、`acceptance`、`stage: requirements` |
| 用户明确「小改动」且跳过 CP-01 | 可创建简化实例，`cp.cp01: skipped`，`notes` 写明理由 |

创建后 **建议 commit** 到当前 feat 分支（与代码同生命周期）。

### 4.3 更新（Update）

| 时机 | 更新内容 |
|------|----------|
| 用户 CP-01「确认」 | `cp.cp01: passed`，`stage: design` |
| 用户 CP-02「开始实现」 | `cp.cp02: passed`，`stage: implement` |
| 进入阶段 4 | `stage: verify` |
| 只读对账完成 | `verify.reconcileDone` |
| harness 跑完 | `verify.harnessPass`、`verify.harnessCommand` |
| `guard:sdlc-p1-trigger-audit` 后 | `verify.p1Audit` |
| P1 Reflection 完成 | `reflection.p1.*`、`verify.p1Review` |
| 用户 CP-05「提交」 | `stage: submit`（cp05 仍 pending 直到 CP-05 对话结束可标 passed） |
| CP-05 对话结束（用户已指示） | `cp.cp05: passed` |
| CP-06 Reflection 完成 | `reflection.cp06.*` |
| commit 成功 | `cp.cp06: passed`，`stage: done`（或删除/归档 state 文件） |
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

**建议下一步：** …（按 stage + cp + verify 推断）

请确认继续，或说「修改范围：…」。
```

推断规则（Agent）：

| state 条件 | 建议下一步 |
|------------|-----------|
| `stage: requirements` 且 `cp.cp01: pending` | 继续 CP-01 或等人确认 |
| `cp.cp01: passed` 且 `cp.cp02: pending` | 阶段 2 设计 / CP-02 |
| `cp.cp02: passed` 且 `stage: implement` | 阶段 3 编码 |
| `stage: verify` 且 `harnessPass: null` | 跑 harness / 对账 |
| `harnessPass: true` 且 `cp.cp05: pending` | CP-05 汇报 |
| 用户已说「提交」且 `cp.cp06: pending` | CP-06 Reflection + commit |

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

---

## 7. 与 Supervisor / LangGraph 的关系

- 本文档仅 **State alone**；不引入 Supervisor 节点。
- 将来若加 Supervisor，应 **读取** 本 State，而不是另建一套进度文件。

---

## 变更记录

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-09-10 | v1.0 | 初版：schema v1、生命周期、换 Chat SOP |
