# 阶段 2：设计拆分

**对应 Skill：** `sdlc-design`

## 目标

将已确认的需求拆为可独立实现、可独立验收的任务。

## Agent 执行步骤

1. 列出待改文件（精确路径）
2. 列出依赖（DB 迁移、新 API、新组件）
3. 列出验收命令（如 `test:harness:ci`、手动步骤）
4. 估算是否需要拆多个 commit

涉及数据库结构变更时，还必须列出：

- migration prepare 方式（工具生成，或手写并检查 journal/manifest）
- 应用迁移的目标验收环境（本地、测试或隔离集成库）
- 迁移状态/结构一致性检查命令
- 至少一个依赖新结构的 API 或数据访问冒烟步骤
- 失败回滚或恢复方式

## 输出模板

```markdown
## 设计拆分：FU-xxx

### 改动范围
- `src/app/api/.../route.ts` — 新增 GET 接口
- `src/db/schema.ts` — 新增 xxx 表

### 依赖
- 无外部接口依赖 / 依赖零浩 xxx 字段（需确认）
- DB：migration → 验收库应用 → 结构检查 → API 冒烟（如不涉及则写「无」）

### 验收
- [ ] `pnpm test:harness:ci`
- [ ] DB 变更：migration 已应用且依赖 API 冒烟通过
- [ ] 手动：登录后可见 xxx 列表

### 建议 commit 拆分
1. `feat(xxx): 新增 schema 与 migration`
2. `feat(xxx): 实现 API 与页面`
```

## 禁止

- 改动范围过大（一次改 10+ 文件无说明）
- 不声明外部数据依赖
- 修改 schema 却未声明 migration、应用环境与验证步骤
