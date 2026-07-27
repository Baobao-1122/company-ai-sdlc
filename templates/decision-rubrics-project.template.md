# CP 判断扩展（复制到项目 AGENTS.md）

> 在通用判据 [decision-rubrics.md](https://github.com/Baobao-1122/company-ai-sdlc/blob/main/docs/decision-rubrics.md) 基础上，追加本项目特有判断要点。

## CP 判断扩展

| CP | 项目追加要点 | Allow | Stop |
|----|--------------|-------|------|
| CP-01 | （例：外部数据依赖须标明接口与字段） | 缺口已说明 | 静默 mock |
| CP-02 | （例：改 api/auth 须列 harness:auth） | 验收命令含 auth profile | 缺 profile |
| CP-06 | （例：L2 路径 app/api、lib/adapters） | Review 含 Security | 敏感路径未 L2 |
| CP-10 | （例：禁止 Mac 写 ECS/RDS） | 负责人授权 | 无授权 |

**审查关注点（Bugbot Custom Instructions）：**

- （项目特有 2～3 条）
