---
name: sdlc-verify
description: AI-SDLC 阶段4验证。跑 harness 后在 CP-05 输出决策包；用户说「提交」时交 sdlc-review，不直接 commit。
---

# SDLC 阶段 4：验证 + CP-05

## AI 引导职责

- 开头：`📍 阶段 4/5 · 验证门禁` → 完成后 `📍 阶段 4/5 · 验证完成 · 等待你的指示`
- 结束：**CP-05 决策包**（业务项目 `docs/qa/ai-sdlc-decision-rubrics.md` §3 CP-05）

## CP-05 输出结构

须含 harness 结果 + ①～⑤ 五块。

涉及数据库 schema 时，harness 前必须完成并汇报：migration 纳入版本管理 → 应用至目标验收库 → 迁移状态/结构一致性检查 → 依赖新结构的针对性 API 或数据访问冒烟。通用 Harness smoke 只有明确覆盖本次新结构时才能替代针对性冒烟。任一步未完成，CP-05 推荐 **Stop**；仅生成 migration 文件不算完成。

```markdown
📍 阶段 4/5 · 验证完成 · **等待你的下一步指示**

（改动摘要 / harness 表 / 手动验收）

### 数据库迁移验证（涉及 schema 时必填）
- migration 纳入版本管理：✅ / ❌
- 目标验收环境与应用结果：…
- 迁移状态/结构一致性检查：✅ / ❌
- 依赖新结构的 API 或数据访问冒烟：✅ / ❌

### ①～⑤ …（判据见 decision-rubrics §3 CP-05）

⏸ **CP-05 完成暂停**
```

## 用户说「提交」后

→ **必须**读并执行 Skill **`sdlc-review`**，禁止直接进入 `git commit`

## 禁止

- CP-05 后直接 commit
- CP-05 只有选项、无判据/自检/推荐
- 数据库结构变更未应用到验收环境就声称完成

## 参考

`docs/decision-rubrics.md` · `docs/code-review.md` · `sdlc-review`
