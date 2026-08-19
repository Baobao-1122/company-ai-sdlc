# Code Review 路径档位（复制到项目 AGENTS.md）

## Code Review（每次 commit 前必跑）

规范：[company-ai-sdlc/docs/code-review.md](../company-ai-sdlc/docs/code-review.md)

| 路径 / 条件 | 档位 |
|-------------|------|
| 默认业务代码 | L1（Bugbot） |
| `app/api/**` | L2（+ Security） |
| 权限 / RBAC / `lib/adapters/**` | L2 |
| `middleware.ts` / `proxy.ts` / 改写 Response 的 Cookie 包装器 | L2 |
| （按项目补充） | L2 |

**审查关注点（传入 Bugbot Custom Instructions）：**

- （例：须遵守 Early Return；禁止 console.log）
- （例：CEC102 模块禁止业务依赖）
- Next.js：改写 middleware/proxy Response 时禁止 `text()` 后 `new Response(string)` 未拷贝 Content-Type；只改 Cookie 须透传 `response.body`；禁止与 `/api/auth` 双写会话 Cookie（见 `docs/code-review.md` §8）
- 业务数据影响面：须有只读抽样对账的结论与问题清单；禁止以校验/对账名义 INSERT/UPDATE/DELETE 业务数据（见 `docs/code-review.md` §9）
