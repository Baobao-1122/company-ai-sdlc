import { defineHarnessConfig } from "@linzhang1122/web-harness"

/**
 * 接入说明：
 * 1. 按项目实际测试命令修改 layers
 * 2. pnpm add -D @linzhang1122/web-harness（或 file:../xseed-web-harness）
 * 3. package.json 添加 test:harness / test:harness:ci
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
