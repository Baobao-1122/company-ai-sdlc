# 交互设计 Agent · 交接约定

## 读入

| 文件 | 用途 |
|---|---|
| `requirements.md` | 页面范围与验收标准 |
| 交互资产 | 可沿用的模式（见 AGENT.md） |

## 产出

| 文件 | 模板 |
|---|---|
| `.sdlc/specs/<taskId>/interaction.md` | [templates/interaction.md](templates/interaction.md) |

## 完成标准

- 页面清单与 Mermaid 页面流程齐全
- 每页有空、加载、错误、无权限四种状态的处理；不适用时写理由
- 每条验收标准对应到页面或状态
- 检查子 Agent 无遗漏项

## 交给

视觉设计 Agent；路线跳过视觉时交架构 Agent。
