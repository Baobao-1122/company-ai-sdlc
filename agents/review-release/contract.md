# 审查与发布 Agent · 交接约定

## 读入

| 文件 | 用途 |
|---|---|
| 代码 diff | 审查对象 |
| `requirements.md`、`architecture.md`、`tasks.md` | 对照实现与规格（标准档、重型档） |
| `route.md` 的“快速档说明” | 快速档对照实现与规格 |
| `test-plan.md` | 验证证据；命中数据影响时核验对账结论 |
| 项目 `AGENTS.md` 审查关注点 | Bugbot 提示 |

## 产出

| 文件 | 模板 |
|---|---|
| `.sdlc/specs/<taskId>/review.md` | [templates/review.md](templates/review.md) |
| `.sdlc/upstream-candidates.md` | 复用候选（追加，字段见 [docs/asset-library.md](../../docs/asset-library.md) §5.2） |
| PR | 合并前 |

## 完成标准

- 每轮审查有明确结论（可提交、有保留、建议先修、未完成）
- 规格与实现一致性已检查
- 复用候选已判断（有或无）
- 人已在 CP-06 确认

## 交给

编排 Agent（CP-06、CP-08、CP-10）。
