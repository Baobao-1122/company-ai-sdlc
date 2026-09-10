# company-ai-sdlc

公司级 **AI 辅助软件研发流程（SDLC）** 标准库。定义 Agent 协作入口、阶段 Skill、项目 Rule、质量门禁与接入方式，供所有 Web 项目复用。

## 快速开始

### 1. 新项目接入（推荐）

```bash
# 在目标项目根目录执行
/path/to/company-ai-sdlc/scripts/init-project-sdlc.sh \
  --project-name "我的项目" \
  --project-path /path/to/my-web-app
```

脚本会自动：

- 生成 `AGENTS.md`（从模板填充项目信息）
- 复制 `.cursor/rules/` 核心规则
- 复制 `harness.config.ts` 模板（若不存在）
- 在 `package.json` 追加 `test:harness` / `test:harness:ci` 脚本（若缺失）

### 2. 接入文档（新 + 已有，AI 可执行）

完整说明见 **[docs/project-onboarding.md](docs/project-onboarding.md)**（含决策树、达标清单、验证命令、汇报模板）。

## AI 工作流五层架构

```
需求对齐 → 设计拆分 → 编码实现 → 验证门禁 → 提交发布
    │           │           │           │           │
 AGENTS.md   sdlc-design  sdlc-implement sdlc-verify  git-commit
 + docs/     Skill        + web-* Skills   + harness    Rule
```

| 层级 | 载体 | 作用 |
|------|------|------|
| 1 协作入口 | `AGENTS.md` + `docs/` | Agent 切换会话时的必读边界与启动命令 |
| 2 阶段 Skill | `.cursor/skills/sdlc-*` | 按 SDLC 阶段触发专用流程 |
| 3 项目 Rule | `.cursor/rules/*.mdc` | 编码规范、提交规范、文档同步 |
| 4 质量门禁 | `harness.config.ts` | 合并前 `test:harness:ci` |
| 4b P1 预 Review | `sdlc-verify` + Bugbot | harness 后、CP-05 前（若触发）· **Reflection** |
| 4c Code Review | `sdlc-review` + Cursor Bugbot | **每次 commit 前** · **Reflection** |
| 4d Task State | `sdlc-task-state` + `.sdlc/task-state.yaml` | **换 Chat 可续**；实例在业务项目 |
| 5 自动化（可选） | Cursor Automations | PR 触发、定时巡检 |

详细说明：[docs/workflow-overview.md](docs/workflow-overview.md) · **AI 主动引导**：[docs/agent-active-guidance.md](docs/agent-active-guidance.md) · **暂停点**：[docs/human-checkpoints.md](docs/human-checkpoints.md) · **决策判据**：[docs/decision-rubrics.md](docs/decision-rubrics.md)

## 目录结构

```
company-ai-sdlc/
├── AGENTS.md                 # 本仓库 Agent 入口
├── README.md
├── docs/
│   ├── workflow-overview.md  # 工作流总览
│   ├── project-onboarding.md # 项目接入指南
│   ├── decision-rubrics.md   # CP 决策判据（通用）
│   └── stages/               # 各阶段操作说明
├── templates/                # 可复制到业务项目的模板
│   ├── AGENTS.md.template
│   ├── decision-rubrics-project.template.md
│   ├── harness.config.example.ts
│   └── docs/prd.template.md
├── .cursor/
│   ├── rules/                # 公司通用 Rule（复制到业务项目）
│   └── skills/               # SDLC 阶段 Skill
└── scripts/
    └── init-project-sdlc.sh  # 一键接入脚本
```

## 与现有 Skill 的关系

用户级 Skill（`~/.cursor/skills/web-*`）负责**具体技术规范**（API、DB、组件、测试、提交）。  
本仓库的 `sdlc-*` Skill 负责**流程编排**（何时读 PRD、何时跑 harness、何时暂停等）。

两者配合使用，不重复定义技术细节。

## 参考项目

| 项目 | 接入状态 | 说明 |
|------|----------|------|
| `saa-s-ui` | 部分接入 | 已有完整 `.cursor/rules` + harness |
| `lvneng-carbon-platform` | 部分接入 | 已有 `AGENTS.md` + harness |
| 新项目 | 用 `init-project-sdlc.sh` | 标准接入 |

## 维护

- 流程变更：更新 `docs/` 并在文档顶部追加变更记录
- Rule 变更：改 `.cursor/rules/`，同步更新 `templates/`
- 接入脚本变更：改 `scripts/init-project-sdlc.sh`，在 `docs/project-onboarding.md` 同步说明
