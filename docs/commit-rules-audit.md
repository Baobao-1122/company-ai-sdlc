# 提交前 Rules 检测（CP-06）

> **文档 ID：** `COMMIT-RULES-AUDIT-v1`  
> **目的：** 不新增规范正文，在 **每次 commit 前** 激活项目已有的 `.cursor/rules` 与 `scripts/check-*.mjs` guard。  
> **编排：** Skill `sdlc-review` 步骤 0 · `docs/code-review.md` §1

## 变更记录

| 日期 | 版本 | 说明 |
|---|---|---|
| 2026-09-15 | v1.0 | 从运营平台试点回灌；标准库定义流程，脚本由业务项目实现 |

---

## 1. 命令约定

业务项目在 `package.json` 注册（名称固定，便于 Skill 引用）：

```bash
pnpm guard:sdlc-commit-rules
# 或 npm run guard:sdlc-commit-rules
```

| 终端结果 | 含义 |
|----------|------|
| `RESULT: PASS` | 可进入 Bugbot；`applicable_rules` 须写入 Bugbot Custom Instructions |
| `RESULT: FAIL` | 先修 `diff_scoped_violations` 或 guard 失败，**禁止 commit** |

**参考实现：** [`templates/check-sdlc-commit-rules.example.mjs`](../templates/check-sdlc-commit-rules.example.mjs)（律能运营平台 `saa-s-ui` 已落地）。

---

## 2. 检测内容（不重写规范）

1. **解析** `.cursor/rules/*.mdc`（`alwaysApply` + `globs`）→ 按本次 diff 输出 `applicable_rules`
2. **Diff 静态扫描**（与已有 Rule 对齐，项目可增删项）  
   - 列表表：禁止 `table-fixed` / `colgroup`  
   - Client/Server：`"use client"` 禁止运行时 DB 连接 import  
   - 通用：新增行禁止 `console.log`
3. **已有 guard**（按 diff 触发，映射到项目 `scripts/check-*.mjs`）  
   - 示例：mock 隔离、client-server-boundary、page-size-literal、migration journal

完整 lint / 单测 / Harness L4 仍在 **CP-05 的 `test:harness:ci`**；本命令是 **CP-06 专用补门**，避免只跑 Bugbot 却未激活 Rules。

---

## 3. 与 Harness / Bugbot 的分工

| 环节 | 职责 |
|------|------|
| `test:harness:ci`（CP-05） | 客观门禁：测试、lint、全量 guard |
| `guard:sdlc-commit-rules`（CP-06） | 按 diff 激活 Rule 清单 + diff 静态项 + 必要 guard 子集 |
| Bugbot（CP-06） | 语义 Review；Instructions **必须包含 applicable_rules** |

---

## 4. 业务项目接入清单

- [ ] 从 `templates/check-sdlc-commit-rules.example.mjs` 复制并改为 `scripts/check-sdlc-commit-rules.mjs`
- [ ] 在 `package.json` 增加 `guard:sdlc-commit-rules`
- [ ] 项目 `docs/qa/` 增加一页索引（链到 `.cursor/rules` 与专项 docs），文件名建议 `sdlc-commit-rules.md`
- [ ] 同步 `sdlc-review` Skill 步骤 0、`code-review.md` §1、`sdlc-workflow.mdc` CP-06 预告
- [ ] `AGENTS.md` 执行表增加 CP-06 一行

---

## 5. 参考

- `docs/code-review.md` §1、§11  
- `.cursor/skills/sdlc-review/SKILL.md` 步骤 0  
- 试点项目：律能运营平台 PR #81（2026-09-15）
