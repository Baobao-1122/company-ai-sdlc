---
name: sdlc-task-state
description: AI-SDLC 任务状态读写。新 Chat 恢复、过 CP/门禁后更新 .sdlc/task-state.yaml。各阶段 Skill 与开发任务开场时 Read 本 Skill。
---

# SDLC · Task State 读写

## 文件位置

| 项目 | 路径 |
|------|------|
| 业务项目实例 | `.sdlc/task-state.yaml` |
| 空模板 | 标准库 `templates/task-state.template.yaml`；业务项目 sync 后同路径约定 |
| 规范全文 | 标准库 `docs/task-state.md`；业务项目 `docs/qa/ai-sdlc-task-state.md`（sync 后） |

## 硬性规则

1. **开发类任务** — 开场检查 `.sdlc/task-state.yaml`：存在则 **Read 并汇报**，不存在则在 CP-01 后 **Create**
2. **新 Chat / 「续任务」** — **第一件事 Read** state + `git branch --show-current`，对照 `branch` 字段
3. **过 CP / 过客观门禁** — **必须 Update** state（见下表）
4. **不存** 大段终端日志；存结论、命令名、一行摘要
5. **不替代 CP** — State 记录进度；授权仍靠人工 CP 回复

## 更新触发表

| 事件 | 字段 |
|------|------|
| 创建任务 | 全文件初始化 |
| CP-01「确认」 | `cp.cp01: passed`，`stage: design` |
| CP-01 跳过（小改动） | `cp.cp01: skipped`，`notes` 理由 |
| CP-02「开始实现」 | `cp.cp02: passed`，`stage: implement` |
| 进入验证 | `stage: verify` |
| 对账完成 | `verify.reconcileDone` |
| harness 完成 | `verify.harnessPass`，`verify.harnessCommand` |
| P1 audit | `verify.p1Audit` |
| P1 Reflection 完成 | `reflection.p1`，`verify.p1Review` |
| CP-05 用户已指示 | `cp.cp05: passed` |
| 用户「提交」 | `stage: submit` |
| CP-06 Reflection 完成 | `reflection.cp06` |
| commit 成功 | `cp.cp06: passed`，`stage: done` |
| 「暂停」 | `stage: paused` |
| 「继续改」 | `stage: implement`，更新 `blockers` |

每次写入：`updatedAt`（ISO 8601）、`updatedBy: agent`。

## 恢复话术（新 Chat 必读 state 后）

```markdown
📍 **任务恢复** · `.sdlc/task-state.yaml`

| 项 | 值 |
|----|-----|
| 任务 | {taskId} |
| 分支 | {branch} |
| 阶段 | {stage} |
| 阻塞 | {blockers 或 无} |

**建议下一步：** …
```

## 与阶段 Skill 的关系

| Skill | 调用 Task State |
|-------|-----------------|
| `sdlc-requirements` | CP-01 前 Create；确认后 Update |
| `sdlc-design` | 进入时 Read；CP-02 通过后 Update |
| `sdlc-implement` | 进入时 Read；进 verify 前 Update stage |
| `sdlc-verify` | 进入时 Read；harness/P1/CP-05 后 Update |
| `sdlc-review` | 进入时 Read；CP-06/commit 后 Update |

## 禁止

- 有 state 文件却从不 Read（换 Chat 场景）
- 过 CP 不更新 state
- 用 state 代替 harness 或 CP 授权
- 在标准库仓库创建业务项目的 state 实例

## 参考

`docs/task-state.md` · `templates/task-state.template.yaml`
