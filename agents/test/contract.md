# 测试 Agent · 交接约定

## 读入

| 文件 | 用途 |
|---|---|
| `requirements.md` | 验收标准、口径（标准档、重型档） |
| `interaction.md`、`visual.md` | 页面状态、视觉验收点（A 类项目，路线经过时） |
| `architecture.md` | 只读对账计划、migration 计划（标准档、重型档） |
| `tasks.md` | 各任务验证命令（标准档、重型档） |
| `route.md` 的“快速档说明” | 快速档的验收标准与验证命令，替代 `requirements.md`、`tasks.md` |
| 代码 diff | 被测对象 |

## 产出

| 文件 | 模板 |
|---|---|
| `.sdlc/specs/<taskId>/test-plan.md` | [templates/test-plan.md](templates/test-plan.md) |

## 完成标准

- 每条验收标准至少一条用例，并有结果
- 验证顺序正确；失败步骤之后的步骤未执行并标明
- 命中业务数据影响时有对账结论与问题清单，且声明“未改删数据”
- A 类项目改到界面时有截图验收结果

## 交给

编排 Agent（CP-05）；通过后交审查与发布 Agent。
