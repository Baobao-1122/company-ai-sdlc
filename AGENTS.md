# AI / 研发协作入口 — company-ai-sdlc

本仓库为 **公司 AI-SDLC 标准库**，不是业务应用。Agent 在此仓库工作时，目标是维护流程规范、模板与接入脚本，**不编写业务代码**。

## 必读文档

| 文档 | 用途 |
|------|------|
| [README.md](README.md) | 仓库概览与快速开始 |
| [docs/workflow-overview.md](docs/workflow-overview.md) | 五层 AI 工作流架构 |
| [docs/code-review.md](docs/code-review.md) | **每次 commit 前 Code Review（Bugbot）** |
| [docs/agent-active-guidance.md](docs/agent-active-guidance.md) | AI 主动引导 |
| [docs/human-checkpoints.md](docs/human-checkpoints.md) | **人工确认暂停点 CP-01～CP-10** |
| [docs/project-onboarding.md](docs/project-onboarding.md) | **业务项目接入（AI 可执行版，新/已有）** |
| [docs/stages/](docs/stages/) | 各 SDLC 阶段操作说明 |

## 仓库边界

- **职责**：SDLC 流程定义、Rule/Skill 模板、项目接入脚本
- **不做**：业务功能、具体 API/页面实现
- **变更原则**：改模板时必须同步更新 `docs/project-onboarding.md`

## 关键路径

| 路径 | 说明 |
|------|------|
| `templates/AGENTS.md.template` | 业务项目 Agent 入口模板 |
| `templates/harness.config.example.ts` | Harness 门禁模板 |
| `.cursor/rules/` | 公司通用 Rule（复制到业务项目） |
| `.cursor/skills/sdlc-*` | SDLC 阶段 Skill |
| `scripts/init-project-sdlc.sh` | 项目一键接入 |

## Agent 在本仓库的执行规程

1. 改 Rule/Skill/模板前，先读对应 `docs/stages/` 文档，确认与流程一致
2. 改 `templates/` 后，检查 `init-project-sdlc.sh` 是否需要同步
3. 不在此仓库添加业务项目依赖或 `.env`
4. 用户问「项目怎么接入」→ 读 [docs/project-onboarding.md](docs/project-onboarding.md) 并按 §1 决策树 + §6 模板执行

## Git 提交

- 一 commit 一事：`docs` / `rules` / `skills` / `scripts` 分开提交
- Message 格式：`docs: 更新项目接入说明` / `feat(rules): 新增文档同步规则`
