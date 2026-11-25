# 子 Agent 入口示例

安装到业务项目的 `.cursor/agents/`；标准库自身不启用。入口只做指向，内容以 `agents/<agent>/` 能力包为准（设计稿 §4.2）。

| 文件 | 子 Agent | 调用方 | 只读 |
|---|---|---|---|
| [test.md](test.md) | 测试 | 编排 | 否（写 `test-plan.md`） |
| [visual.md](visual.md) | 视觉设计 | 编排 | 否（写 `visual.md`） |
| [interaction-check.md](interaction-check.md) | 交互稿检查 | 交互设计 | 是 |
| [architecture-review.md](architecture-review.md) | 架构审查 | 架构 | 是 |
| [retrospective.md](retrospective.md) | 复盘 | 编排 | 是 |

提交前审查与安全审查使用 Cursor 内置的 Bugbot、Security Review 子 Agent，不另设入口；审查要求见 `agents/review-release/`。
