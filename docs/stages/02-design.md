# 阶段 2：设计拆分

**对应 Skill：** `sdlc-design`

## 目标

将已确认的需求拆为可独立实现、可独立验收的任务。

## Agent 执行步骤

1. 列出待改文件（精确路径）
2. 列出依赖（DB 迁移、新 API、新组件）
3. 列出验收命令（如 `test:harness:ci`、手动步骤）
4. 估算是否需要拆多个 commit

## 输出模板

```markdown
## 设计拆分：FU-xxx

### 改动范围
- `src/app/api/.../route.ts` — 新增 GET 接口
- `src/db/schema.ts` — 新增 xxx 表

### 依赖
- 无外部接口依赖 / 依赖零浩 xxx 字段（需确认）

### 验收
- [ ] `pnpm test:harness:ci`
- [ ] 手动：登录后可见 xxx 列表

### 建议 commit 拆分
1. `feat(xxx): 新增 schema 与 migration`
2. `feat(xxx): 实现 API 与页面`
```

## 禁止

- 改动范围过大（一次改 10+ 文件无说明）
- 不声明外部数据依赖
