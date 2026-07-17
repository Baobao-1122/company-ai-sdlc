# Code Review 规范（每次 Commit 必跑）

> **文档 ID：** `CODE-REVIEW-v1`  
> **执行方式：** Cursor Bugbot / Security Review subagent（只读）  
> **编排 Skill：** `sdlc-review`  
> **最后更新：** 2026-07-17

---

## 1. 硬性规则

**每次 `git commit` 之前，Agent 必须执行 Code Review。** 无例外（除非 diff 为空）。

顺序固定：

```
test:harness:ci 通过（或你接受 ⏭ 原因）
    → 你说「提交」
    → sdlc-review（Bugbot [+ Security]）
    → ⏸ CP-06 步骤 1：Review 结果，等你决定
    → 展示 commit 拆分与 message
    → ⏸ CP-06 步骤 2：等你「确认提交」
    → git commit
```

**禁止：** 跳过 Review 直接 commit；Review 与实现同一轮自审代替 Bugbot。

---

## 2. 审查档位（L0 / L1 / L2）

Agent 根据**本次待提交 diff** 自动选档，并在 Review 前告知你。

| 档位 | 条件 | 执行 |
|------|------|------|
| **L1 标准** | 默认 | Bugbot · `Diff: uncommitted changes` |
| **L2 加强** | diff 命中敏感路径（见 §3） | Bugbot + Security Review |
| **L0** | 仅当 diff 为空 | 跳过 Review |

**L2 追加 Security，不替代 Bugbot。**

---

## 3. 敏感路径（项目 AGENTS.md 可覆盖）

默认建议（Web 项目）：

| 路径模式 | 档位 |
|----------|------|
| `**/api/**`、`app/api/**` | L2 |
| `**/auth/**`、权限/RBAC 相关 | L2 |
| `.env*`、密钥、crypto | L2 |
| 项目自定义（如 `lib/evcs/**`） | L2 |

模板见 `templates/review-policy.example.md`。

---

## 4. Subagent 调用（Cursor 接入，不自研）

| Subagent | Skill 参考 | Diff |
|----------|-----------|------|
| Bugbot | `review-bugbot`（Cursor 内置） | `uncommitted changes`（每次 commit 前） |
| Security | `review-security` | 同左，仅 L2 |

**Custom Instructions（可选）：** 项目 AGENTS.md 中的审查关注点（如 CEC102 红线、RBAC 口径）。

---

## 5. CP-06 两步（每次 commit）

### 步骤 1 · Review 结果

Agent 汇总 Bugbot/Security 为表格，并 **停止**：

| 严重度 | 位置 | 发现 |
|--------|------|------|

**请你回复：** 「确认提交」/「先修 review」/「忽略：…（须说明理由）」/「暂停」

### 步骤 2 · Commit 计划

通过步骤 1 后，展示 `git status`、拆分建议、拟议 message，**再停**：

**请你回复：** 「确认提交」/「调整 message：…」

---

## 6. 与 Harness 的关系

| | Harness | Code Review |
|--|---------|-------------|
| 时机 | CP-05 前（实现后） | **每次 commit 前（CP-06）** |
| 目的 | 行为/回归/ lint | diff 逻辑与安全 |
| 失败 | 先修再 claim 完成 | 你决定修/忽略/暂停 |

---

## 7. 多 commit 拆分

一 commit 一功能时：**每个 commit 前各跑一轮 Review**（仅针对当前 staged/uncommitted 范围）。

---

## 变更记录

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-07-17 | v1.0 | 每次 commit 必跑 Review；L1/L2；CP-06 两步 |
