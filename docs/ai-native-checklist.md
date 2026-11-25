# AI-Native SDLC 重构 · 总进度清单

> **用途：** 跟进整体进度；每完成一项勾选并写上 commit 或 PR
> **设计依据：** [agent-architecture.md](agent-architecture.md)（§11.1 落地步骤）· [asset-library.md](asset-library.md) · [ai-native-optimization.md](ai-native-optimization.md)
> **分支：** 集成分支 `feat/ai-native-sdlc`；每步一个 `feat/ai-native-<步骤>` 分支，PR 合入集成分支
> **过渡期：** 合入 `main` 前，现行 Rule、Skill、`docs/` 流程照常有效

## 当前位置

第 1 步（骨架）进行中：集成分支已有 `c72e81c`；分支 `feat/ai-native-skeleton` 在其上新增 7 个 commit，前 3 个已推送，后 4 个待推送；PR 待开。

---

## 已定决策

- [x] 每个环节一个独立 Agent，编排 Agent 按需求判定路线；能力包独立，运行形式按环节选主对话或子 Agent
- [x] 用旧仓库，在分支上重构后合并到 `main`
- [x] 快速档：每次 commit 前机器审查照跑，人工确认合为一步
- [x] 交互、视觉产出 Markdown、Mermaid、状态表、样式变量与组件约定；截图验收由测试 Agent 做；不做原型、不接 Figma
- [x] 试点项目：项目丁
- [x] 项目分 A 类（有界面）、B 类（无界面）；B 类不启用交互、视觉、E2E 与截图
- [x] 标准库只放通用内容：来源写项目代号，盘点原文与代号对照表放在标准库外
- [x] 资产库：准入四条判据、三层目录、候选到稳定四种状态，入库由人审
- [x] 新增复盘 Agent（第 9 个），只读子 Agent，负责抽象与判断
- [x] 阶段复盘按事件触发（版本上线、模块完成、重型档完成、累计 8～10 个任务、线上事故），6 周无触发时按时间兜底
- [x] 资产入库由标准库负责人拍板，来源项目负责人补充业务判断

---

## 第 1 步 · 骨架

- [x] 设计稿：优化方案、多 Agent 架构（`c72e81c`）
- [x] 资产库设计稿（`b20f6a6`）
- [x] 设计稿去标识与修订（`324d36f`）
- [x] 8 个 Agent 能力包骨架、交接文件模板、测试子 Agent 入口示例（`6f5c289`）
- [x] 新增复盘 Agent：设计稿 §3、§7、§8.2 与资产库 §5 修订，新增 `agents/retrospective/`（`99b8fbf`、`bde7163`）
- [x] 资产库补：分工（标准库负责人拍板）、阶段复盘触发规则、资产度量（`bde7163`）
- [x] 其余子 Agent 入口示例：视觉、交互检查、架构审查、复盘；审查用内置 Bugbot，不另设入口（`08fee64`）
- [x] 推送 `feat/ai-native-skeleton`（2026-11-25）
- [ ] PR 合入 `feat/ai-native-sdlc`（走 `sdlc-pr-review`）

**完成标准：** 目录与模板齐全；红线 Rule 保持一直生效。

## 第 2 步 · 迁移旧能力

把旧 Skill 与文档的细则迁入能力包（设计稿 §10）。

- [ ] 需求：`sdlc-requirements`、`docs/stages/01`、产品模版
- [ ] 架构：`sdlc-design`、`sdlc-architecture`、`tech-stack-selection.md`；数据分层七项（项目乙）
- [ ] 研发：`sdlc-implement`、`general-principles`、`docs-sync`
- [ ] 测试：`sdlc-verify`、harness 模板；P1 与 E2E 触发检查、E2E 黄金路径（项目甲）；文档期验证清单（项目乙、丙）
- [ ] 审查与发布：`sdlc-review`、`sdlc-pr-review`、`code-review.md`、`pr-review.md`；commit 规则检查回灌（项目甲）；发布分支卫生（项目甲）；数据项目合并前清单（项目乙）
- [ ] 编排：`sdlc-workflow`、`sdlc-task-state`、`human-checkpoints.md`、`decision-rubrics.md`
- [ ] 本机全局 Skill 入仓库（设计稿 §10.4）

**完成标准：** 旧流程能在新结构下跑通一个标准档任务。

## 第 3 步 · 编排 Agent

- [ ] 判档硬规则脚本（以项目甲的 P1、E2E 触发检查为底子）
- [ ] 开工检查：未收尾任务、项目类型、红线与引用命令
- [ ] `route.md` 生成；按档位启用检查点（同步改 `human-checkpoints.md`、`decision-rubrics.md`）
- [ ] 快速、标准、重型各跑通一例

## 第 4 步 · 测试 Agent 独立

- [ ] 从验收标准出用例，与研发分开运行
- [ ] A 类改界面时截图验收
- [ ] 只读对账计划与结论模板投入使用

**完成标准：** 每条验收标准有对应用例。

## 第 5 步 · 交互、视觉与首批资产

- [ ] 交互、视觉先合为产品设计 Agent 运行
- [ ] 建 `assets/`：`README.md` 索引、`ASSET.md` 模板；`login.md` 迁入
- [ ] 首批 3 个资产：登录与权限、地图轨迹回放、外部数据对账
- [ ] 在试点项目上跑通“沿用 + 差异”

**完成标准：** 新页面需求有交互稿与视觉约定；命中资产时只写差异。

## 第 6 步 · 提升闭环与评测

- [ ] 候选清单 `.sdlc/upstream-candidates.md` 字段落地
- [ ] 复盘 Agent 首次阶段复盘（试点项目）
- [ ] 各 Agent 评测集可回放；改能力包前先回放
- [ ] 度量：Agent 维度（打回次数、首次通过率）、资产维度（使用项目数、时长与返工变化）

## 第 7 步 · 同步与迁移

- [ ] 锁定文件 `.sdlc/standard.lock.json`（含已安装资产与版本）
- [ ] 一条命令安装与升级；漂移检查 guard
- [ ] 迁移脚本（设计稿 §12.3）
- [ ] 试点项目丁完成迁移

## 合并到 main

- [ ] 第 1～3 步完成；试点项目快速、标准、重型各至少一个任务跑通；迁移脚本可用
- [ ] `main` 打 tag `sdlc-legacy-final`
- [ ] 集成分支对 `main` 提 PR，走 `sdlc-pr-review`

## 其他项目迁移

- [ ] 项目甲
- [ ] 项目乙
- [ ] 项目丙

## 旁支任务

- [ ] `main` 上原有 9 个文件去标识（README 接入状态表、`project-onboarding.md`、`code-review.md`、`decision-rubrics.md`、`task-state.md`、`commit-rules-audit.md`、`stages/01`、`init-project-sdlc.sh`、`review-policy.example.md`）
- [ ] git 提交者邮箱：当前为系统自动生成，是否改由你决定

---

## 变更记录

| 日期 | 版本 | 说明 |
|---|---|---|
| 2026-11-25 | v1 | 首版：已定决策、7 步落地清单、合并与迁移、旁支任务 |
