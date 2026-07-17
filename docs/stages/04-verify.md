# 阶段 4：验证门禁

**对应 Skill：** `sdlc-verify`

## 目标

在汇报「完成」前，用命令证明变更可验收。

## Agent 必须执行

```bash
# 默认合并前门禁（按项目 package.json 为准）
pnpm test:harness:ci
# 或
npm run test:harness:ci
```

若项目有额外校验（如 `verify:dashboard`、`db:reconcile`），按 `AGENTS.md` 的 Agent 执行规程追加。

## 汇报模板

```markdown
## 验证结果

| 命令 | 结果 | 说明 |
|------|------|------|
| test:harness:ci | ✅ 通过 | … |
| verify:xxx | ⏭ 跳过 | dev 未启动 |

### 如何手动验收
1. …
2. …
```

## 禁止

- 未跑命令就声称「已修好」
- 失败时不说明原因与下一步

## Harness Profile 参考

| Profile | 用途 |
|---------|------|
| `local` | 本地快速反馈 |
| `ci` | 合并前必跑 |
| `full` / `release` | 发版前全量 |

定义位置：项目根 `harness.config.ts`
