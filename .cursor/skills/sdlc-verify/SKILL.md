---
name: sdlc-verify
description: AI-SDLC 阶段4验证。跑 harness 后在 CP-05 输出决策包；用户说「提交」时交 sdlc-review，不直接 commit。
---

# SDLC 阶段 4：验证 + CP-05

## AI 引导职责

- 开头：`📍 阶段 4/5 · 验证门禁` → 完成后 `📍 阶段 4/5 · 验证完成 · 等待你的指示`
- 结束：**CP-05 决策包**（业务项目 `docs/qa/ai-sdlc-decision-rubrics.md` §3 CP-05；标准库 `docs/decision-rubrics.md` §3 CP-05）

## 验证顺序（固定）

```text
migration 链（若改 schema）
  → 只读业务对账（若命中数据影响面）
  → test:harness:ci
  → P1 预 Review（若命中触发器 — 见下）
  → CP-05 汇报
```

**禁止在 harness 之前跑 P1。** 先客观门禁，再 Bugbot 互查。

## P1 预 Review（CP-05 前）

**目的：** Reflection 早期互查；**不替代** CP-06 commit 前 Review。

**触发器（命中任一）：** 见 `docs/code-review.md` §10.2（L2 路径、schema、业务数据影响面、项目 AGENTS §Code Review 扩展、CP-02 显式声明）。

**未触发：** CP-05 须写「ℹ️ Reflection · P1 未触发 — 原因：…」（见 `code-review.md` §11.4）。

**执行：**

0. **调用 subagent 前** — 必须发送 §11.2 **P1 开场话术**（含 `🔄 Reflection` 标题）
1. 读 `docs/code-review.md` §3 选 L1/L2 档位
2. 启动 **Bugbot** subagent（`Diff: uncommitted changes`，Custom Instructions 同 `sdlc-review`）
3. L2 时再启动 **Security Review**
4. **禁止**主 Agent 自读 diff 代替 Bugbot
5. **不需要**请用户手动切换 Cursor 聊天模型（subagent 已是不同 Agent）
6. **subagent 返回后** — 必须发送 §11.3 **Reflection 完成**块，再进入 CP-05

**有 Blocker/High：** 先修 → 重跑 harness → 再跑 P1（第 2 轮须标注 `🔄 Reflection · 第 2 轮`）→ 再 CP-05；推荐 **Stop**，勿默认「提交」。

**汇报模板（命中 P1 时 CP-05 必填）：**

```markdown
🔄 **Reflection · P1 预 Review · 完成**（摘要亦写入 CP-05）

### P1 预 Review
- 触发：是 / 否
- 档位：L1 / L2
- 结论：✅ / ⚠️ / ❌
- 问题数：Blocker N · High N · …
- commit 前仍须 CP-06 sdlc-review
```

## CP-05 输出结构

须含 harness 结果 + P1（或跳过说明）+ ①～⑤ 五块。

涉及数据库 schema 时，harness **前**必须完成并汇报：migration prepare 并纳入版本管理 → 应用至目标验收库 → 迁移状态/结构一致性检查 → 依赖新结构的针对性 API 或数据访问冒烟。通用 Harness smoke 只有明确覆盖本次新结构时才能替代针对性冒烟。任一步未完成，**不得跑 harness**，CP-05 推荐 **Stop**；仅准备 migration 文件不算完成。

命中业务数据影响面时，必须在 harness **前**完成**只读**抽样对账并汇报：结论（通过/有差异）、问题清单、数字证据；核对过程禁止改删业务数据。未执行、缺证据或核对中写库 → **不得跑 harness**，推荐 **Stop**。结论「有差异」但已有问题清单时仍可跑 harness，由 CP-05 决定是否提交。

两者都命中时顺序：**结构链 → 只读对账 → harness → P1（若触发）→ CP-05**。

```markdown
📍 阶段 4/5 · 验证完成 · **等待你的下一步指示**

（改动摘要）

### 数据库迁移验证（涉及 schema 时必填）
…

### 业务数据只读对账（命中数据影响面时必填）
…

### P1 预 Review
…

### Harness 与手动验收
- `test:harness:ci`：✅ / ❌ / ⛔ 前置失败未执行

### ①～⑤ …（判据见 decision-rubrics §3 CP-05）

⏸ **CP-05 完成暂停**
```

## 用户说「提交」后

→ **必须**读并执行 Skill **`sdlc-review`**，禁止直接进入 `git commit`（CP-06 为 commit 前最后一轮，即使 P1 已通过）

## 禁止

- CP-05 后直接 commit
- harness 前跑 P1
- P1 跳过 Bugbot、主 Agent 自审代替
- P1 有 Blocker/High 仍默认推荐「提交」
- **Reflection 轮次未用 🔄 标题告知用户**（见 `code-review.md` §11）
- CP-05 只有选项、无判据/自检/推荐
- 数据库结构变更未应用到验收环境就声称完成
- 以校验/对账名义修改或删除业务数据
- 命中数据影响面却无结论与问题清单
- 只读对账或结构链未完成仍执行 harness

## 参考

`docs/code-review.md` §10–§11 · `docs/decision-rubrics.md` · `sdlc-review`
