# 阶段 1：需求对齐

**对应 Skill：** `sdlc-requirements`

## 目标

在写任何代码之前，对齐一条可验收的需求。

## Agent 执行步骤

1. 读 `AGENTS.md` 与 `docs/prd.md`
2. 确认当前要对齐的条目（FU-ID 或 PRD 章节）
3. 用表格输出：目标 / 输入 / 输出 / 异常 / 验收标准
4. 列出设计草稿清单：CP-01 前讨论中改过的文档，没有写「无」（见 [human-checkpoints.md](../human-checkpoints.md) §2.1）
5. **等待用户确认**，不自动进入实现

## 先讨论、后对齐

用户想先讨论方案时，Agent 可以边讨论边改文档，作为设计草稿。草稿只改文档，不改代码、migration 和数据库，不提交。讨论中的「可以」只表示认可方案，仍须走 CP-01。

## 输出模板

```markdown
## 需求对齐：FU-xxx

| 项 | 内容 |
|----|------|
| 目标 | … |
| 输入 | … |
| 输出 | … |
| 异常/降级 | … |
| 验收标准 | … |

### 设计草稿清单

| 文件 | 改了什么 |
|------|----------|
| … | … |

（没有草稿时写「无」）

请确认后我再开始设计。
```

## 禁止

- 未确认就写代码
- 一次对齐多条后直接开干
- 静默假设数据/接口可用（有外部依赖必须主动指出）
- CP-01 前改代码、migration 或数据库；改了文档却不列进草稿清单

## 相关文档

- [templates/docs/prd.template.md](../../templates/docs/prd.template.md)
- 参考：[lvneng-carbon-platform/docs/ai-prd-v1.md](https://github.com/) 的 FU-xxx 结构
