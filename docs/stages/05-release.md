# 阶段 5：提交发布

**对应 Skill：** `sdlc-review` + `web-git-commit-standard`  
**对应 Rule：** `git-commit.mdc`

## 目标

**每次 commit 前 Code Review**，再按「一 commit 一功能」提交。

## Agent 执行步骤（顺序固定）

1. 用户从 CP-05 说「提交」→ 执行 **`sdlc-review`**（Bugbot [+ Security]）
2. **CP-06 步骤 1**：汇报 Review，等人「确认提交 / 先修 / 忽略」
3. **CP-06 步骤 2**：展示 status、拆分、message，等人「确认提交」
4. 执行 `git commit`（用户未要求时不 push）
5. 若需多个 commit → **每个 commit 前重复 1～4**

## 分支约定

| 分支 | 用途 |
|------|------|
| `feat/*` `fix/*` | 日常开发 |
| `dev` | 集成主分支，禁止 Agent 直接 push |
| `main` | 生产，仅 PR 合并 |

## 禁止

- 跳过 Code Review 直接 commit
- 无意义 commit message
- 未授权 push / 在 dev/main 上 commit

## 参考

[docs/code-review.md](../code-review.md)
