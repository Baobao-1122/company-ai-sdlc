# 需求 Agent · 交接约定

## 读入

| 文件 | 用途 |
|---|---|
| `route.md` | 档位与路线 |
| 用户需求（对话）、项目 `docs/prd.md` 或产品文档 | 需求来源 |
| `docs/product-templates/` | 可沿用的产品能力 |

## 产出

| 文件 | 模板 |
|---|---|
| `.sdlc/specs/<taskId>/requirements.md` | [templates/requirements.md](templates/requirements.md) |

## 完成标准

- 验收标准全部编号、可验证
- 产品模版一栏写了命中项或“无”
- 涉及数据统计时有口径表；不涉及时写“无数据口径”并说明理由
- 外部依赖与缺口已列出
- 人已在 CP-01 确认

## 交给

A 类项目：交互设计 Agent；B 类项目或路线跳过交互时：架构 Agent。
