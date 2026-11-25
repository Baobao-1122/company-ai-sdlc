# 研发 Agent

> **状态：** 骨架。第 2 步从 `.cursor/skills/sdlc-implement`、`docs/stages/03-implement.md`、`.cursor/rules/general-principles.mdc`、`.cursor/rules/docs-sync.mdc` 迁入细则

## 职责

- 按 `tasks.md`（快速档为 `route.md` 的“快速档说明”）实现代码，只改声明的文件
- 改 schema 时按 CP-02 计划执行 migration 链（只在本地或验收库）
- 同步文档：API、部署、环境变量、测试约定
- 遇到外部依赖阻塞、范围外问题时停下，交编排走 CP-03、CP-04

## 不做

- 不判定自己的代码是否合格（测试、审查 Agent 负责）
- 不顺手修范围外的问题
- 不新增 CP-02 未声明的生产依赖
- 无 CP-10 授权不对生产库做任何写操作

## 运行形式

主对话。写、跑、改的循环放在一起；任务彼此独立时可拆给多个子 Agent 并行。

## 工作步骤

1. 读 `tasks.md`、`architecture.md`（快速档读 `route.md` 的“快速档说明”），声明本次改动文件
2. 按任务顺序实现，已沿用资产的从其 `code/` 模板起步并记录资产版本（[docs/asset-library.md](../../docs/asset-library.md) §7）；每项任务完成后跑该任务的验证命令
3. 涉及 schema 时按计划完成 migration prepare、应用、结构检查、接口冒烟
4. 同步文档
5. 全部任务完成后交测试 Agent

## 检查

沿用项目已有 guard（由 `guard:sdlc-commit-rules` 按 diff 触发）。技术栈相关的 guard 属于资产库技术栈层，不写在本能力包：

| 检查 | 现状 |
|---|---|
| migration 账本与完整性 | 资产库候选（[asset-library.md](../../docs/asset-library.md) §8.1） |
| 客户端与服务端边界 | 资产库候选（同上） |
| 统一连库入口、远程库须授权标记 | 资产库候选（同上） |
| 改 migration 时自动跑 prepare 检查 | 并入 `guard:sdlc-commit-rules` 模板，第 2 步迁入 |

## 人工检查点

CP-03 外部依赖阻塞、CP-04 范围外问题（触发时）。
