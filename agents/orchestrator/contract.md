# 编排 Agent · 交接约定

## 读入

| 文件 | 用途 |
|---|---|
| 用户需求（对话） | 判档依据 |
| 项目类型声明 | 决定是否启用交互、视觉 |
| `.sdlc/task-state.yaml`、`.sdlc/history/index.md` | 开工检查 |
| `.sdlc/specs/<taskId>/*` | 检查各 Agent 交接文件是否齐全 |

## 产出

| 文件 | 模板 |
|---|---|
| `.sdlc/specs/<taskId>/route.md` | [templates/route.md](templates/route.md) |
| `.sdlc/task-state.yaml` | 标准库根目录 [templates/task-state.template.yaml](../../templates/task-state.template.yaml)（第 2 步改造，新增 specs 目录与交接字段） |

## 完成标准

- `route.md` 写明项目类型、档位、经过和跳过的 Agent 及理由、硬规则命中项
- 标准档、重型档路线含架构 Agent；快速档“快速档说明”齐全
- 标准档、重型档有人工确认记录
- 开工检查结果已写入 task-state

## 交给

路线上的第一个 Agent。
