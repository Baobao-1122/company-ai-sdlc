import { defineHarnessConfig } from "@linzhang1122/web-harness"

/**
 * 接入说明：
 * 1. 按项目实际测试命令修改 layers
 * 2. L4 lint 建议 error：`@typescript-eslint/no-explicit-any`、`no-empty`（空 catch）、`complexity`
 * 3. 可选：`max-lines-per-function` 80～100（配合 general-principles 圈复杂度 10，非 50 行硬线）
 * 4. pnpm add -D @linzhang1122/web-harness（或 file:../xseed-web-harness）
 * 5. package.json 添加 test:harness / test:harness:ci
 */
export default defineHarnessConfig({
  name: "{{PROJECT_SLUG}}",
  profiles: {
    local: { layers: ["L1"] },
    ci: { layers: ["L1", "L4"] },
  },
  layers: {
    L1: {
      name: "单元与模块测试",
      steps: [{ type: "shell", command: "pnpm vitest run" }],
    },
    L4: {
      name: "静态检查",
      steps: [{ type: "shell", command: "pnpm lint" }],
    },
  },
})
