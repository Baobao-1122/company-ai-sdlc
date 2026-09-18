# 阶段 3：编码实现

**对应 Skill：** `sdlc-implement`

## 目标

在用户确认设计后，按最小范围实现功能。

## Agent 执行步骤

1. **声明**：「本次只会修改以下文件：…」
2. 按文件类型触发对应 `web-*` Skill：
   - API → `web-api-route-standard`
   - 前端请求 → `web-api-fetch-standard`
   - 组件 → `web-component-design-standard`
   - 数据库 → `web-db-design-standard`
3. 遵守 `.cursor/rules/general-principles.mdc`（含禁止 `any`、空 catch、未经 CP 不得 `pnpm add`）
4. 改 docs 若行为/接口变更（见 `docs-sync.mdc`）
5. 完成后进入 [04-verify](04-verify.md)，不自动 commit

## 禁止

- 顺手改用户未提及的文件
- 引入 `console.log` 到提交代码
- 单文件超过 300 行仍继续堆逻辑（应拆分）；函数规模以**圈复杂度 ≤10** 为准（非 50 行硬线）
- **未经 CP-02 已列依赖 +「开始实现」，或 CP-03「确认安装」，执行 `pnpm add` / 新增生产依赖**

## 与用户协作

- 发现无关 bug → 先报告，等确认再修
- 发现外部数据缺口 → 立即主动指出（见 AGENTS.md 数据依赖规程）
