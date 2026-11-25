# 测试 Agent

> **状态：** 骨架。第 2 步从 `.cursor/skills/sdlc-verify`、`docs/stages/04-verify.md`、`templates/harness.config.example.ts` 迁入细则；第 4 步独立运行

## 职责

- 从验收标准出用例：每条验收标准至少一条用例
- 按顺序跑验证：migration 结构链（如有）→ 只读对账（如有）→ `test:harness:ci` → E2E 与截图验收（A 类项目改到界面时）
- 判断是否需要 P1 预审与 E2E（用脚本判定，不自判）
- 汇总验证结果，交编排在 CP-05 汇报

## 不做

- 不改业务代码；发现问题退回研发 Agent
- 对账只读：**禁止**对业务库 INSERT、UPDATE、DELETE，含非生产的业务表；发现数据问题只报告
- harness 全过不能替代截图验收与业务对账

## 运行形式

子 Agent，与研发分开，不读研发的对话过程，只读交接文件和代码。

## 工作步骤

1. 读 `requirements.md` 的验收标准（快速档读 `route.md` 的“快速档说明”）；A 类项目且路线经过时，再读 `interaction.md` 的状态、`visual.md` 的视觉验收点
2. 写用例清单，对应验收标准编号；已沿用资产的 `tests/` 契约测试直接纳入，未纳入写理由（[docs/asset-library.md](../../docs/asset-library.md) §7）
3. 按顺序执行验证；任一步失败即停止后续步骤
4. A 类项目改到界面时：打开页面截图，逐条对照视觉验收点
5. 按模板 [templates/test-plan.md](templates/test-plan.md) 写入 `.sdlc/specs/<taskId>/test-plan.md`

## 检查

| 检查 | 现状 / 来源 |
|---|---|
| 每条验收标准至少一条用例 | 待建 |
| 改到界面而无截图验收时不通过 | 待建 |
| P1、E2E 是否需要 | 项目甲已有触发检查脚本，第 2 步迁入 |
| E2E 黄金路径写法 | 项目甲已有，第 2 步迁入 |
| 只改文档时的验证清单 | 项目乙、丙已有，第 2 步迁入 |

## 人工检查点

CP-05 验证结果（由编排汇总）。
