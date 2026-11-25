# 复盘 Agent · 交接约定

## 读入

| 文件 | 用途 |
|---|---|
| `.sdlc/history/index.md`、`.sdlc/history/*.yaml` | 本阶段归档的任务 |
| `.sdlc/specs/<taskId>/` | 各任务的需求、设计、测试、审查记录 |
| `.sdlc/upstream-candidates.md` | 平时记下的复用素材 |
| `.sdlc/retros/` | 上次复盘的范围与“待观察”条目 |
| 标准库 `assets/README.md`、`agents/*/lessons.md` | 比对是否已有 |
| 线上事故记录（事故复盘时） | 事故经过与修复 |

## 产出

| 文件 | 模板 |
|---|---|
| `.sdlc/retros/<YYYYMMDD>-<阶段名>.md` | [templates/retro.md](templates/retro.md)（由主对话写入） |

度量项：

| 维度 | 指标 |
|---|---|
| Agent | 各 Agent 产出被打回次数、下游回退次数、检查首次通过率 |
| 资产 | 本阶段沿用了哪些资产及版本；沿用任务与未沿用同类任务的时长、返工次数对比 |

## 完成标准

- 范围内每个任务都已读过；未读的写明原因
- 每条候选有判据结论、归属与推荐
- 上次“待观察”条目已重新判断
- 通用部分无真实项目信息

## 交给

主对话（编排 Agent）写入报告，交标准库负责人做复盘确认。确认“入库”的条目，在标准库另开任务提 PR：改到哪个 Agent 的能力包，先回放该 Agent 的 `evals.md` 确认没有变差（设计稿 §8.2），再按正常 SDLC 审查与提交。
