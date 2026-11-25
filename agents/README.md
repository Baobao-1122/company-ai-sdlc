# Agent 能力包

> **状态：** 骨架（落地第 1 步）。未启用；过渡期以现行 `.cursor/rules/`、`.cursor/skills/sdlc-*` 为准
> **设计：** [docs/agent-architecture.md](../docs/agent-architecture.md) · **资产库：** [docs/asset-library.md](../docs/asset-library.md)

每个 Agent 一个能力包。能力包回答“这个环节**怎么做**”，是该 Agent 随项目变强的唯一载体；Cursor 的 `.cursor/agents/*.md` 与 `.cursor/skills/*/SKILL.md` 只做薄入口，指向这里。

## Agent 一览

| 目录 | Agent | 运行形式 | 产出交接文件 | 第 2 步迁入来源 |
|---|---|---|---|---|
| [orchestrator](orchestrator/) | 编排 | 主对话 | `route.md` | `sdlc-workflow.mdc`、`sdlc-task-state`、`human-checkpoints.md`、`decision-rubrics.md`、`agent-active-guidance.md` |
| [requirements](requirements/) | 需求 | 主对话 | `requirements.md` | `sdlc-requirements`、`docs/product-templates/` |
| [interaction](interaction/) | 交互设计 | 主对话出方案，子 Agent 检查 | `interaction.md` | 新建 |
| [visual](visual/) | 视觉设计 | 子 Agent | `visual.md` | 新建；`~/.cursor/skills/frontend-design` |
| [architecture](architecture/) | 架构 | 主对话出方案，子 Agent 审查 | `architecture.md`、`tasks.md` | `sdlc-design`、`sdlc-architecture`、`tech-stack-selection.md` |
| [development](development/) | 研发 | 主对话，可并行子 Agent | 代码、migration、文档同步 | `sdlc-implement`、`general-principles.mdc`、`docs-sync.mdc` |
| [test](test/) | 测试 | 子 Agent，与研发分开 | `test-plan.md` | `sdlc-verify`、harness 模板 |
| [review-release](review-release/) | 审查与发布 | 子 Agent 审查，主对话汇总 | `review.md`、PR | `sdlc-review`、`sdlc-pr-review`、`code-review.md`、`pr-review.md` |

交互与视觉的能力包分开维护；起步时可由同一个“产品设计”运行实例加载两个能力包。

## 能力包统一结构

```
agents/<agent>/
├── AGENT.md      # 职责、不做什么、工作步骤、检查、人工检查点
├── contract.md   # 读入、产出、完成标准、交给谁
├── lessons.md    # 经验记录：每条有来源、日期、状态
├── evals.md      # 评测任务：改本能力包前回放
└── templates/    # 本 Agent 负责的交接文件模板（研发 Agent 无）
```

机器检查脚本建成后放 `checks/`；在此之前，检查项列在各 `AGENT.md` 的“检查”表。

## 项目类型

| 类型 | 说明 | 不启用 |
|---|---|---|
| A | 有界面的 Web 平台 | — |
| B | 数据或引擎服务，无界面 | 交互、视觉 Agent；E2E 与截图验收 |

见设计稿 §5.5。

## 维护规则

1. **改能力包前先回放 `evals.md`**，确认没有变差。
2. **经验先进 `lessons.md`，状态为“待审核”**；人审核后再落到检查、模板或 `AGENT.md`，并把状态改为“已采纳”及落点；不再适用的改为“已废弃”并写明理由。
3. **能做成检查的不只写文字**（设计稿原则 6）。
4. **红线不在能力包里**：数据红线、安全基线、CI 安全、提交规范保持一直生效的 Rule，能力包只引用。
5. **能力包只放环节做法**：某类系统功能、技术栈或行业的做法进资产库（[docs/asset-library.md](../docs/asset-library.md) §2）；项目专属内容不进标准库。
6. **来源只写代号**：经验与评测的来源写项目代号与任务序号，不写真实项目名、任务名、地名（同上 §6）。
