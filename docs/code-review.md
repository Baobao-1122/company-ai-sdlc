# Code Review 规范（每次 Commit 必跑）

> **文档 ID：** `CODE-REVIEW-v1`  
> **执行方式：** Cursor Bugbot / Security Review subagent（只读）  
> **编排 Skill：** `sdlc-review`  
> **最后更新：** 2026-08-19

---

## 1. 硬性规则

**每次 `git commit` 之前，Agent 必须执行 Code Review。** 无例外（除非 diff 为空）。

顺序固定：

```
test:harness:ci 通过（或你接受 ⏭ 原因）
  → P1 预 Review（若命中 §10.2 触发器 — harness 之后、CP-05 之前）
  → ⏸ CP-05 汇报（须含 P1 结论或「未触发」说明）
  → 你说「提交」
  → sdlc-review（Bugbot [+ Security] — CP-06 Reflection）
  → ⏸ CP-06 步骤 1：Review 结果，等你决定
  → 展示 commit 拆分与 message
  → ⏸ CP-06 步骤 2：等你「确认提交」
  → git commit
```

**禁止：** 跳过 Review 直接 commit；Review 与实现同一轮自审代替 Bugbot；**静默跑 Bugbot 而不标注 `🔄 Reflection`**（见 §11）。

---

## 2. 审查档位（L0 / L1 / L2）

Agent 根据**本次待提交 diff** 自动选档，并在 Review 前告知你。

| 档位 | 条件 | 执行 |
|------|------|------|
| **L1 标准** | 默认 | Bugbot · `Diff: uncommitted changes` |
| **L2 加强** | diff 命中敏感路径（见 §3） | Bugbot + Security Review |
| **L0** | 仅当 diff 为空 | 跳过 Review |

**L2 追加 Security，不替代 Bugbot。**

---

## 3. 敏感路径（项目 AGENTS.md 可覆盖）

默认建议（Web 项目）：

| 路径模式 | 档位 |
|----------|------|
| `**/api/**`、`app/api/**` | L2 |
| `**/auth/**`、权限/RBAC 相关 | L2 |
| `middleware.ts`、`proxy.ts`、`**/middleware/**` | L2 |
| 改写 Response/Set-Cookie 的 auth 包装器（如 `**/adjust-*-cookies*.ts`） | L2 |
| `.env*`、密钥、crypto | L2 |
| 项目自定义（如 `lib/evcs/**`） | L2 |

模板见 `templates/review-policy.example.md`。

---

## 4. Subagent 调用（Cursor 接入，不自研）

| Subagent | Skill 参考 | Diff |
|----------|-----------|------|
| Bugbot | `review-bugbot`（Cursor 内置） | `uncommitted changes`（每次 commit 前） |
| Security | `review-security` | 同左，仅 L2 |

**Custom Instructions（可选）：** 项目 AGENTS.md 中的审查关注点（如 CEC102 红线、RBAC 口径）。

**Next.js 项目必加（命中 §3 middleware/proxy/auth Cookie 路径时）：** 禁止为改 Header/Cookie 而 `response.text()` 后再 `new Response(string)` 且未拷贝 `Content-Type`（默认 `text/plain` → 整页源码）；只改 Cookie 须透传 `response.body`；禁止 middleware 与 `/api/auth` 双写同一会话 Cookie。详见 §8 与 Rule `nextjs-middleware-response.mdc`。

---

## 5. CP-06 两步（每次 commit）

### 步骤 1 · Review 结果 + **明确审查结论（必填）**

Agent **必须**输出「审查结论」块，包含：

| 字段 | 说明 |
|------|------|
| **总体结论** | ✅ 可提交 / ⚠️ 可提交但有保留 / ❌ 建议先修 / ⏭ Review 未完成 |
| **问题数量** | 按严重度统计；无问题须写「无」 |
| **具体问题** | 表格：严重度、位置、问题、类型；无问题须说明 |
| **代码质量** | 优/良/需改进 + 一句话 |
| **风险等级** | 低/中/高 + 一句话（安全/数据/权限/上线） |
| **Agent 建议** | 确认提交 / 先修 / 不可提交 |
| **一句话摘要** | 给决策者 10 秒内能读懂 |

判定规则：

- Blocker 或 High → **❌ 建议先修**
- 仅 Low → **⚠️ 可提交但有保留** 或 ✅（Agent 说明理由）
- 无 findings → **✅ 可提交**，仍须写质量与残余风险

**请你回复：** 「确认提交」/「先修 review」/「忽略：…」/「暂停」

完整模板见 `sdlc-review` Skill · [agent-active-guidance.md](agent-active-guidance.md) § CP-06

### 步骤 2 · Commit 计划

通过步骤 1 后，展示 `git status`、拆分建议、拟议 message，**再停**：

**请你回复：** 「确认提交」/「调整 message：…」

---

## 6. 与 Harness 的关系

| | Harness | P1 预 Review | Code Review (CP-06) |
|--|---------|--------------|---------------------|
| 时机 | CP-05 前（实现后） | harness ✅ 后、CP-05 前（若触发） | **每次 commit 前（CP-06）** |
| 目的 | 行为/回归/ lint | 敏感 diff 早期互查（Reflection） | diff 逻辑与安全（Reflection） |
| 失败 | 先修再 claim 完成 | 先修 → 重跑 harness → 可再 P1 | 你决定修/忽略/暂停 |
| 用户可见 | `📍 阶段 4/5 · 验证门禁` | **`🔄 Reflection · P1`** | **`🔄 Reflection · CP-06`** |

---

## 7. 多 commit 拆分

一 commit 一功能时：**每个 commit 前各跑一轮 Review**（仅针对当前 staged/uncommitted 范围）。

---

## 8. Next.js Middleware / Proxy Response 改写红线（防回归）

**事故形态：** middleware/proxy 为校正 Set-Cookie 等读取 `response.text()`，再 `new NextResponse(text)`；未带原 `Content-Type` 时默认 `text/plain`，浏览器把 HTML 显示成整页源码。

### Review 必查（命中 §3 相关路径时）

| # | 检查项 | 判定 |
|---|--------|------|
| 1 | 是否读 body 再重建 Response | 有 → 必须显式保留原 `Content-Type`（及必要编码头），否则 **High** |
| 2 | 是否仅改 Header/Cookie | 应透传 `response.body` 流，禁止无必要缓冲 |
| 3 | 是否丢失 `status` / 非 Cookie 头 | 丢失 → **High** |
| 4 | auth Cookie：middleware 与 `/api/auth` 是否双写 | 双写 → **High**；matcher 应排除已处理路径 |
| 5 | 单测 | 改写路径应断言页面响应仍为 `text/html`（或约定类型） |

### 正确模式（摘要）

```typescript
return new Response(response.body, {
  status: response.status,
  statusText: response.statusText,
  headers, // 已去掉/重写 set-cookie，其余头保留
})
```

配套 Rule（接入项目后生效）：`.cursor/rules/nextjs-middleware-response.mdc`。

---

## 9. 业务数据只读对账（防「校验时改库」）

**事故形态：** 查询语义 / 归属 / 聚合变更后，Harness 与 migration 均通过，但业务笔数/金额与外部真相不一致；或以「对账/校验」名义在库内修数、删数，扩大事故面。

### Review 必查（本次任务命中数据影响面时）

| # | 检查项 | 判定 |
|---|--------|------|
| 1 | CP-05 是否有只读抽样对账的**结论与问题清单**（含数字） | 无 → **High** / 阻塞提交 |
| 2 | 对账/reconcile 相关 diff 是否含写库（INSERT/UPDATE/DELETE）或默认 `--apply` | 有 → **Blocker**；校验脚本必须只读 |
| 3 | 是否把「结构检查通过」当成「业务结果正确」 | 混淆 → 要求补业务对账证据 |
| 4 | 发现问题后是否声称已在校验步骤中修数 | 有 → **Stop**；修数须另任务另授权 |

**原则：** 校验 = 核对；产出 = 结论 + 问题；**禁止**改删业务数据。

---

## 10. P1 预 Review（CP-05 前 · Reflection 早期互查）

> **目的：** 在你说「提交」之前，对敏感/大改 diff 先跑一轮 **Bugbot（+ Security）**，把「实现 Agent 自嗨」提前到 CP-05 暴露；对应 Reflection 的 **生成 → 互查**，修正后再进入 CP-05 / 后续 commit。

### 10.1 时机（固定顺序）

```text
阶段 3 编码完成
  → migration 链（若改 schema）
  → 只读业务对账（若命中数据影响面）
  → test:harness:ci ✅
  → 【P1 预 Review】（仅当命中 §10.2 触发器）
  → 若有 Blocker/High：先修 → 重跑 harness → 可再跑 P1
  → ⏸ CP-05 汇报（须含 P1 结论或「未触发/已跳过」说明）
  → 你说「提交」
  → CP-06 sdlc-review（commit 前最后一轮，仍必跑）
```

**不在 harness 之前跑 P1：** 先保证自动化门禁通过，再花 Review 成本。

### 10.2 触发器（命中任一即跑 P1）

与 **L2 敏感路径** 对齐，并追加业务高风险面：

| 类别 | 路径 / 条件 |
|------|-------------|
| 敏感路径 | 命中 [§3](#3-敏感路径项目-agentsmd-可覆盖)（API、auth、middleware、密钥等） |
| 项目 L2 扩展 | 项目 `AGENTS.md` §Code Review 路径表追加项 |
| 数据库 | 本次改动 schema / migration |
| 业务口径 | CP-02 声明**业务数据影响面**（账单、聚合、归属、金额口径等） |
| 显式声明 | CP-02 验收写「本任务跑 P1 预 Review」 |

**可跳过 P1（须在 CP-05 说明理由）：** 仅 docs、纯样式、与上述无关的极小改动。

### 10.3 执行方式（与 CP-06 相同 subagent）

| 项 | 说明 |
|----|------|
| 谁执行 | 主 Agent 调用 **Bugbot** subagent（只读）；命中 L2 时 **+ Security Review** |
| Diff | `uncommitted changes`（与 CP-06 相同） |
| Custom Instructions | 同项目 AGENTS.md / §4 |
| 编排 Skill | `sdlc-verify` 阶段 4 内触发 |

### 10.4 是否需要手动切换 Cursor 模型？

**不需要。** P1 / CP-06 互查由 **Bugbot / Security subagent** 完成，已是「不同 Agent 互查」。

### 10.5 CP-05 汇报必填（命中 P1 时）

```markdown
### P1 预 Review（CP-05 前）
- 是否触发：是 / 否（否须写原因）
- 档位：L1 / L2
- 结论：✅ 可进入 CP-05 决策 / ⚠️ 有保留 / ❌ 建议先修
- Blocker/High/Medium/Low 数量
- 与 CP-06 关系：commit 前仍须 sdlc-review
```

有 Blocker/High 时，CP-05 **推荐 Stop**，选项优先「继续改」而非「提交」。

### 10.6 与 Reflection 的对应

| Reflection 步骤 | P1 + SDLC |
|-----------------|-----------|
| 生成 | 阶段 3 编码 |
| 反思/批评 | P1 Bugbot（+ Security）+ harness + 只读对账 |
| 修正 | 先修 → 重跑 harness / 再 P1 |
| 再次批评 | CP-06 commit 前 Review |

---

## 11. Reflection 用户可见标识（硬性）

**凡进入 Reflection 轮次，Agent 必须在聊天中明确告知「本轮是 Reflection」**；禁止静默调用 Bugbot/Security 而不说明。

### 11.1 哪些环节算 Reflection

| 标识 | 环节 | 何时告知 |
|------|------|----------|
| **P1** | CP-05 前预 Review | harness ✅ 后、调用 Bugbot **之前** |
| **CP-06** | commit 前 Code Review | 用户说「提交」后、调用 Bugbot **之前** |
| **P1-R2+** | 先修后重审 | 再次调用 Bugbot **之前**（须写轮次） |

**不算 Reflection（但仍须在 CP-05 说明）：** harness、只读对账、migration 链——属**客观验证**，标题用 `📍 阶段 4/5 · 验证门禁`，不用 🔄。

### 11.2 开场话术（调用 subagent 前必发）

**P1：**

```markdown
🔄 **Reflection · 第 1 轮 · P1 预 Review（CP-05 前）**

| 项 | 说明 |
|----|------|
| **本轮性质** | Reflection — 实现已完成，现由 **Bugbot [+ Security]** 互查 diff，**不是**继续写代码 |
| **为何现在做** | 已命中 P1 触发器：… |
| **审查档位** | L1 / L2 |
| **你需要做什么** | **无需回复**；等我给出 Reflection 结论后再进入 CP-05 |

**接下来自动完成：** 启动 Bugbot …
```

**CP-06：**

```markdown
🔄 **Reflection · CP-06 · commit 前 Code Review（第 1 轮）**

| 项 | 说明 |
|----|------|
| **本轮性质** | Reflection — commit 前最后一轮互查（即使 P1 已通过仍须执行） |
| **审查档位** | L1 / L2 |
| **你需要做什么** | **无需回复**；完成后在 **CP-06 步骤 1** 请你决定 |

**接下来自动完成：** 启动 Bugbot …
```

**先修后重审（第 N 轮）：** 标题须写 `🔄 Reflection · 第 N 轮 · P1 预 Review（先修后重审）` 或 `… CP-06 …`。

### 11.3 收束话术（subagent 返回后必发）

Reflection 结论块**标题**须含 `🔄 Reflection · … · 完成`：

```markdown
🔄 **Reflection · P1 预 Review · 完成**

（审查结论表 / 问题清单 / 总体结论 ✅⚠️❌）

**下一步：** ⏸ CP-05 … / 先修后进入第 2 轮 Reflection …
```

CP-06 沿用 `sdlc-review` 的「审查结论」表，但块首须加：

`🔄 **Reflection · CP-06 · 完成**`

### 11.4 未触发 P1 时

仍须在 CP-05 显式一行：

```markdown
ℹ️ **Reflection · P1 未触发** — 原因：…（如：仅 UI 样式）→ 直接进入 CP-05 决策；commit 前仍会有 **CP-06 Reflection**。
```

### 11.5 禁止

- 不标注 🔄 直接跑 Bugbot
- 把 Reflection 结论藏在 harness 汇报里不单独成块
- 用「Code Review 一下」等模糊说法代替「Reflection」字样

---

## 变更记录

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-09-08 | v1.5 | 新增 §11 Reflection 用户可见标识（硬性）；§10 P1 预 Review |
| 2026-08-07 | v1.2 | 新增 §8 Middleware/Proxy Response 改写红线；L2 含 middleware/proxy |
| 2026-07-17 | v1.1 | 强制 CP-06 审查结论：问题/质量/风险/明确 verdict |
| 2026-07-17 | v1.0 | 每次 commit 必跑 Review |
