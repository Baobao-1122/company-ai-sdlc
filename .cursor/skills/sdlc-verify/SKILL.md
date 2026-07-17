---
name: sdlc-verify
description: AI-SDLC 阶段4验证。跑 harness 后在 CP-05 引导；用户说「提交」时交 sdlc-review（每次 commit 前 Code Review），不直接 commit。
---

# SDLC 阶段 4：验证 + CP-05

## AI 引导职责

- 开头：`📍 阶段 4/5 · 验证门禁` → 完成后 `📍 阶段 4/5 · 验证完成 · 等待你的指示`
- 结束：**CP-05** + 编号选项

## CP-05 输出结构

```markdown
📍 阶段 4/5 · 验证完成 · **等待你的下一步指示**

### 我已完成
- 改动摘要 / harness 表 / 手动验收步骤

### 请你回复（任选其一）
1. **「提交」** — 进入 **sdlc-review**（CP-06 Code Review，每次 commit 必跑）
2. **「继续改：…」**
3. **「下一项：…」**
4. **「暂停」**

⏸ **CP-05 完成暂停**
```

## 用户说「提交」后

→ **必须**读并执行 Skill **`sdlc-review`**，禁止直接进入 `git commit`

## 禁止

- CP-05 后直接 commit
- 跳过 Code Review

## 参考

`docs/code-review.md` · `sdlc-review`
