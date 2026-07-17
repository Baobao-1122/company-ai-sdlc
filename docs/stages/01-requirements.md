# 阶段 1：需求对齐

**对应 Skill：** `sdlc-requirements`

## 目标

在写任何代码之前，对齐一条可验收的需求。

## Agent 执行步骤

1. 读 `AGENTS.md` 与 `docs/prd.md`
2. 确认当前要对齐的条目（FU-ID 或 PRD 章节）
3. 用表格输出：目标 / 输入 / 输出 / 异常 / 验收标准
4. **等待用户确认**，不自动进入实现

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

请确认后我再开始实现。
```

## 禁止

- 未确认就写代码
- 一次对齐多条后直接开干
- 静默假设数据/接口可用（有外部依赖必须主动指出）

## 相关文档

- [templates/docs/prd.template.md](../../templates/docs/prd.template.md)
- 参考：[lvneng-carbon-platform/docs/ai-prd-v1.md](https://github.com/) 的 FU-xxx 结构
