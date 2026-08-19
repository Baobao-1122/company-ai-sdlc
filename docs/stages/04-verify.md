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

### 数据库结构变更（条件必跑）

本次修改表、字段、索引、约束或数据库枚举时，必须在页面验收前按顺序完成：

1. 完成 migration prepare：工具生成，或手写后检查 journal/manifest，并确认已纳入版本管理
2. 将 migration 应用至本次验收使用的本地、测试或隔离集成库
3. 执行项目提供的迁移状态或数据库结构一致性检查
4. 针对性冒烟验证至少一个依赖新结构的 API 或数据访问路径；通用 Harness smoke 只有明确覆盖本次新增/变更结构时才能替代
5. 最后执行 `test:harness:ci`，并在 CP-05 提供人工页面验收步骤

环境暂不可用时，必须在 CP-05 标为 **Stop** 或明确的未完成项；migration 文件已准备不等于迁移已完成。

## 汇报模板

```markdown
## 验证结果

| 命令 | 结果 | 说明 |
|------|------|------|
| test:harness:ci | ✅ 通过 | … |
| migration 应用与结构检查（涉及 DB 时） | ✅ 通过 | 目标环境：… |
| 依赖新结构的 API 冒烟（涉及 DB 时） | ✅ 通过 | … |
| verify:xxx | ⏭ 跳过 | dev 未启动 |

### 如何手动验收
1. …
2. …
```

## 禁止

- 未跑命令就声称「已修好」
- 失败时不说明原因与下一步
- 涉及数据库结构时，只准备 migration 文件就进入 API 或页面验收

## Harness Profile 参考

| Profile | 用途 |
|---------|------|
| `local` | 本地快速反馈 |
| `ci` | 合并前必跑 |
| `full` / `release` | 发版前全量 |

定义位置：项目根 `harness.config.ts`
