---
name: sdlc-requirements
description: AI-SDLC 阶段1需求对齐。输出对齐表后在 CP-01 暂停，须含完整决策包（判据+自检+推荐）。用户说「对齐需求」「FU-xxx」或开发任务开场时使用。
---

# SDLC 阶段 1：需求对齐

## AI 引导职责

- 回复开头：`📍 阶段 1/5 · 需求对齐`
- 结束：**CP-01 决策包**（五块；判据见 `docs/decision-rubrics.md` §2～§3 CP-01，业务项目见 `docs/qa/ai-sdlc-decision-rubrics.md`）

## Task State

- 开场 **Read** Skill **`sdlc-task-state`**；若 `.sdlc/task-state.yaml` 已存在且非本任务 → 先汇报旧任务断点，用户确认切换后按 `sdlc-task-state` 规则 6 归档（旧任务未结束时先写 `stage: paused` 和切走原因），不覆盖
- 输出对齐表后 **Create** `.sdlc/task-state.yaml`（从 `templates/task-state.template.yaml`），填入 `taskId`、`branch`、`scope`、`acceptance`、`previousTask`（刚归档的文件和交接；没有上一个任务时写 `null`）、`context`（本任务要读的背景文档，每份一句 `why`）；`drafts` 保持 `[]`
- 用户 CP-01「确认」后 **Update**：`cp.cp01: passed`，`stage: design`，`drafts` 按确认的清单写入

## 先讨论、后对齐

用户想先讨论方案时，可以边讨论边改文档，作为**设计草稿**：只改文档，不改代码、migration 和数据库，不提交。讨论中的「可以」只表示认可方案，不等于过了 CP-01。详见 `docs/human-checkpoints.md` §2.1。

## 执行步骤

1. Read **`sdlc-task-state`**；读 `AGENTS.md`（含 §CP 判断扩展）与 PRD
2. 只对齐**一条**需求
3. 列出设计草稿清单：本任务 CP-01 前改过的文档，逐个写文件和改动；没有写「无」
4. 输出对齐表 + 草稿清单 + CP-01 决策包，**停止**

## CP-01 输出结构

```markdown
📍 阶段 1/5 · 需求对齐 · **等待你的确认**

### 需求对齐表
…

### 设计草稿清单
| 文件 | 改了什么 |
（没有草稿时写「无」）

### ① 本卡点目的
…

### ② 判断要点
（decision-rubrics §3 CP-01 + AGENTS §CP 判断扩展）

### ③ Agent 自检
| # | 结果 | 说明 |

### ④ Agent 推荐
**Allow** / **Stop** — …

### ⑤ 请你回复
1. **「确认」**  2. **「修改：…」**  3. **「暂停」**

⏸ **CP-01 需求对齐暂停**
```

## 禁止

- CP-01 只有选项、无 ②③④
- 未过 CP-01 写代码、改 migration 或动数据库
- CP-01 前改过的文档没列进草稿清单

## 参考

判据文档：业务项目 `docs/qa/ai-sdlc-decision-rubrics.md`；标准库 `docs/decision-rubrics.md`

`docs/decision-rubrics.md` · `docs/agent-active-guidance.md` · `docs/human-checkpoints.md`
