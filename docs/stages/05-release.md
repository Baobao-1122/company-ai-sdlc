# 阶段 5：提交发布

**对应 Rule：** `git-commit.mdc` + Skill `web-git-commit-standard`

## 目标

按「一 commit 一功能」提交，合并前通过 CI 门禁。

## Agent 执行步骤

1. `git status` + `git diff` 盘点变更类型
2. 混合 feat/fix/docs 时 **拆分多个 commit**
3. 每个 commit 前跑 `test:harness:ci`（用户未要求时不 push）
4. Message 格式：`<类型>(<范围>): <简短描述>`

## 分支约定

| 分支 | 用途 |
|------|------|
| `feat/*` `fix/*` | 日常开发 |
| `dev` | 集成主分支，禁止 Agent 直接 push |
| `main` | 生产，仅 PR 合并 |

## 发布

- 发布脚本与 ECS 操作见各项目 `docs/deploy.md`
- Agent **不在未授权时 SSH 发布**

## 禁止

- `git commit -m "fix bug"` / `"update"` 等无意义 message
- 用户未要求时 `git push`
- 在 `dev`/`main` 上直接 commit（除非负责人明确授权）
