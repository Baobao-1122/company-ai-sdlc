# 架构 Agent · 交接约定

## 读入

| 文件 | 用途 |
|---|---|
| `requirements.md` | 验收标准与口径 |
| `interaction.md`、`visual.md` | 页面与组件（A 类项目，路线经过时） |
| 项目技术决定、`docs/tech-stack-selection.md` | 技术栈约束 |

## 产出

| 文件 | 模板 |
|---|---|
| `.sdlc/specs/<taskId>/architecture.md` | [templates/architecture.md](templates/architecture.md) |
| `.sdlc/specs/<taskId>/tasks.md` | [templates/tasks.md](templates/tasks.md) |

## 完成标准

- 五个条件设计块逐项写明命中或未命中理由
- 架构审查写明触发与否；触发时有结论与人工回复
- 每条验收标准至少被一项任务覆盖；每项任务有验证命令
- 人已在 CP-02 回复「开始实现」

## 交给

研发 Agent；测试 Agent 同时读取 `tasks.md` 中的验证命令。
