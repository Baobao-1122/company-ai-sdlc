---
name: sdlc-review
description: AI-SDLC 提交前 Code Review。每次 git commit 前必跑；编排 Cursor Bugbot（L1）与 Security Review（L2）。用户说「提交」或 Agent 准备 commit 时使用。
---

# SDLC · 每次 Commit 前 Code Review

## 硬性规则

**任何 `git commit` 之前必须执行本 Skill。** 先 Review，后 commit；禁止跳过。

配套 Cursor Skill（调用 subagent 前可读）：`review-bugbot`、`review-security`

## 执行时机

| 触发 | 动作 |
|------|------|
| 用户在 CP-05 说「提交」 | 进入本 Skill |
| Agent 准备执行 `git commit` | 必须先完成本 Skill |
| 拆分多个 commit | **每个 commit 前各跑一轮** |

## 前置

- 已跑或你接受跳过 `test:harness:ci`（见 sdlc-verify）
- 工作区有待提交 diff；若为空 → L0 跳过，直接 CP-06 步骤 2

## 步骤 1 · 选档

读项目 `AGENTS.md` §Code Review 路径表（无则用 `docs/code-review.md` §3）。

```markdown
📍 阶段 5/5 · 提交前 Code Review · 档位 L1/L2

**接下来自动完成（无需你回复）：** 调用 Cursor Review subagent
**完成后：** CP-06 步骤 1 请你决定
```

## 步骤 2 · 调用 Bugbot（L1/L2 必跑）

启动 **一个** `bugbot` subagent（`readonly: true`，`run_in_background: false`）：

```text
Full Repository Path: <项目绝对路径>
Diff: uncommitted changes
Custom Instructions: <项目 AGENTS.md 中的审查关注点，若有>
```

按 `review-bugbot` Skill 处理失败重试与结果汇总。

## 步骤 3 · 调用 Security（仅 L2）

若 diff 命中敏感路径，再启动 **一个** `security-review` subagent：

```text
Full Repository Path: <项目绝对路径>
Diff: uncommitted changes
Custom Instructions: <同上>
```

## 步骤 4 · CP-06 步骤 1 汇报

```markdown
📍 阶段 5/5 · Code Review 完成 · **等待你对 Review 的决定**

### Code Review
| 来源 | 档位 | 结果 |
| Bugbot | L1 | N findings / 无问题 |
| Security | L2 / 未跑 | … |

| 严重度 | 位置 | 发现 |
| … | … | … |

### 请你回复（必选其一）
1. **「确认提交」** — 进入 CP-06 步骤 2（展示 commit 计划）
2. **「先修 review」** — 我修 findings，修完重跑 harness + Review
3. **「忽略：…」** — 你承担风险并说明理由（须写入 commit/PR 说明）
4. **「暂停」**

⏸ **CP-06 · 步骤 1/2 · Code Review 暂停**
```

## 步骤 5 · CP-06 步骤 2（用户步骤 1 选「确认提交」后）

按 `web-git-commit-standard` 展示 status、拆分、message：

```markdown
### 请你回复
1. **「确认提交」** — 执行 git commit
2. **「调整 message：…」**

⏸ **CP-06 · 步骤 2/2 · Commit 确认暂停**
```

## 禁止

- 跳过 Bugbot 直接 commit
- Review 发现问题后自动修（除非用户说「先修 review」）
- 用主 Agent 自读 diff 代替 Bugbot
- subagent 失败时不告知仍 commit（须 ⏭ 并请你选择）

## 参考

`docs/code-review.md` · `docs/human-checkpoints.md` · CP-06
