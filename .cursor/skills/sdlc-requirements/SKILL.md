---
name: sdlc-requirements
description: AI-SDLC 阶段1需求对齐。输出对齐表后在 CP-01 暂停，须含完整决策包（判据+自检+推荐）。用户说「对齐需求」「FU-xxx」或开发任务开场时使用。
---

# SDLC 阶段 1：需求对齐

## AI 引导职责

- 回复开头：`📍 阶段 1/5 · 需求对齐`
- 结束：**CP-01 决策包**（五块；判据见 `docs/decision-rubrics.md` §2～§3 CP-01，业务项目见 `docs/qa/ai-sdlc-decision-rubrics.md`）

## 执行步骤

1. 读 `AGENTS.md`（含 §CP 判断扩展）与 PRD
2. 只对齐**一条**需求
3. 输出对齐表 + CP-01 决策包，**停止**

## CP-01 输出结构

```markdown
📍 阶段 1/5 · 需求对齐 · **等待你的确认**

### 需求对齐表
…

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
- 未过 CP-01 写代码

## 参考

判据文档：业务项目 `docs/qa/ai-sdlc-decision-rubrics.md`；标准库 `docs/decision-rubrics.md`

`docs/decision-rubrics.md` · `docs/agent-active-guidance.md` · `docs/human-checkpoints.md`
