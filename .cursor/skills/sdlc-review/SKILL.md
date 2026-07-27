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

## 步骤 4 · CP-06 步骤 1 汇报（必须含「审查结论」）

**硬性：每次 Review 后必须给出明确结论**，禁止只贴原始 findings 或含糊「看一下」。

主 Agent 在 Bugbot/Security 返回后，**必须**按下列结构汇总（可合并 subagent 结果，并补充代码质量与风险判断）：

```markdown
📍 阶段 5/5 · Code Review 完成 · **等待你对 Review 的决定**

---

## 审查结论（必填）

| 项 | 内容 |
|----|------|
| **总体结论** | ✅ 可提交 / ⚠️ 可提交但有保留 / ❌ 建议先修 / ⏭ Review 未完成 |
| **问题数量** | Blocker: N · High: N · Medium: N · Low: N · 无问题 |
| **代码质量** | 优 / 良 / 需改进 — （一句话：可读性、复杂度、规范符合度） |
| **风险等级** | 低 / 中 / 高 — （一句话：上线/安全/数据/权限风险） |
| **Agent 建议** | 确认提交 / 先修再提交 / 必须修 Blocker 后再提交 |

### 一句话摘要
（例：「无 Blocker；2 个 Low 风格问题；质量良；风险低，可提交。」）

---

### 具体问题（有问题时必填；无问题写「无」）

| # | 严重度 | 位置 | 问题 | 类型 |
|---|--------|------|------|------|
| 1 | High | `path:line` | … | bug / 安全 / 规范 / 性能 |

来源列（可选脚注）：Bugbot #1 · Security #2

### 无问题时的说明（结论为 ✅ 可提交 时必填）
- Bugbot：已审 uncommitted diff，未发现逻辑/回归类问题
- Security：（L2 已跑/未跑）…
- 代码质量：…
- 残余风险：（如「仅覆盖本次 diff，不含运行时行为」）

---

### 请你回复（必选其一）
1. **「确认提交」** — 进入 CP-06 步骤 2（须总体结论为 ✅ 或 ⚠️；❌ 时 Agent 应默认推荐选 2）
2. **「先修 review」** — 修 findings 后重跑 harness + Review
3. **「忽略：…」** — 仅 ⚠️ 可用；须写理由，写入 commit/PR
4. **「暂停」**

⏸ **CP-06 · 步骤 1/2 · Code Review 暂停**
```

### 结论判定规则（Agent 必须遵守）

| 条件 | 总体结论 | Agent 建议 |
|------|----------|-----------|
| 无 findings | ✅ 可提交 | 确认提交 |
| 仅 Low / 风格类 | ⚠️ 可提交但有保留 | 确认提交或先修 |
| 有 Medium | ⚠️ 可提交但有保留 | 先修再提交（你可 override） |
| 有 High 或 Blocker | ❌ 建议先修 | 先修 review |
| subagent 失败 | ⏭ Review 未完成 | 重试 / 暂停，**禁止默认 commit** |

**禁止：** 缺少「审查结论」表；结论与 findings 表格矛盾；用「自行判断」代替明确结论。

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

`docs/code-review.md` · 判据见业务项目 `docs/qa/ai-sdlc-decision-rubrics.md` 或标准库 `docs/decision-rubrics.md` §3 CP-06 · `docs/human-checkpoints.md`
