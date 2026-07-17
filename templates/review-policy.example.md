# Code Review 路径档位（复制到项目 AGENTS.md）

## Code Review（每次 commit 前必跑）

规范：[company-ai-sdlc/docs/code-review.md](../company-ai-sdlc/docs/code-review.md)

| 路径 / 条件 | 档位 |
|-------------|------|
| 默认业务代码 | L1（Bugbot） |
| `app/api/**` | L2（+ Security） |
| 权限 / RBAC / `lib/adapters/**` | L2 |
| （按项目补充） | L2 |

**审查关注点（传入 Bugbot Custom Instructions）：**

- （例：须遵守 Early Return；禁止 console.log）
- （例：CEC102 模块禁止业务依赖）
