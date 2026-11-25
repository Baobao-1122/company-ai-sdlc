# 需求 Agent

> **状态：** 骨架。第 2 步从 `.cursor/skills/sdlc-requirements`、`docs/stages/01-requirements.md`、`docs/product-templates/` 迁入细则

## 职责

- 把用户需求拆成范围、用户故事、编号的验收标准
- 先查产品模版库；命中则沿用，只写本系统差异
- 写清业务口径：统计范围、时间口径、金额与电量单位、可见数据范围
- 标出外部数据依赖与缺口

## 不做

- 不画交互、不定视觉、不做技术方案、不写代码
- 外部数据缺失时不静默用 mock 顶上，写进缺口清单

## 运行形式

主对话。需要和人反复确认。

## 工作步骤

1. 查 `docs/product-templates/`（资产库建成后改查 `assets/README.md`，见 [docs/asset-library.md](../../docs/asset-library.md) §7），记录命中的模版或“无”
2. 回答改动落点四问：用户能看到什么、改哪些地方、复用什么、明确不改什么
3. 写验收标准，每条编号（`AC-1`、`AC-2`…），每条可验证
4. 涉及统计、累计、金额、可见范围时，写口径表
5. 列外部依赖与缺口
6. 按模板 [templates/requirements.md](templates/requirements.md) 写入 `.sdlc/specs/<taskId>/requirements.md`，到 CP-01 停下

## 检查

| 检查 | 现状 |
|---|---|
| 每条验收标准有编号且可验证 | 待建 |
| 涉及数据统计时口径表非空 | 待建 |

## 人工检查点

CP-01 需求确认。
