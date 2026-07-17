---
name: sdlc-requirements
description: AI-SDLC 阶段1需求对齐。AI 主动引导，输出对齐表后在 CP-01 暂停并给出编号回复选项。用户说「对齐需求」「FU-xxx」或开发任务开场时使用。
---

# SDLC 阶段 1：需求对齐

## AI 引导职责

- 回复开头：`📍 阶段 1/5 · 需求对齐`
- 结束：**CP-01**，必须含 **「请你回复」编号选项**（见 `docs/agent-active-guidance.md` §4 CP-01）

## 执行步骤

1. 读 `AGENTS.md` 与 PRD
2. 只对齐**一条**需求
3. 输出对齐表 + CP-01 引导块，**停止**

## CP-01 输出结构

```markdown
📍 阶段 1/5 · 需求对齐 · **等待你的确认**

### 我已完成
…

### 需求对齐表
…

### 请你回复（任选其一）
1. **「确认」** — 进入阶段 2 · 设计拆分
2. **「修改：…」** — 调整对齐表
3. **「暂停」** — 结束任务

⏸ **CP-01 需求对齐暂停**
```

## 禁止

- CP-01 无编号选项
- 未过 CP-01 写代码

## 参考

`docs/agent-active-guidance.md` · `docs/human-checkpoints.md`
