# Mermaid 图渲染工具

本工具把业务项目中的 Mermaid 源文件（`.mmd`）导出为 SVG 和高清 PNG。它只安装在 `company-ai-sdlc`，业务项目不需要增加 Node 依赖。

## 运行要求

- Node.js `>=22.13.0`
- 本机 Google Chrome；没有时可下载 Chrome Headless Shell

## 首次安装

在本目录执行一次：

```bash
pnpm install
```

工具会优先使用本机已安装的 Google Chrome。若本机没有可用 Chrome，再执行下面的命令下载 Mermaid CLI 渲染所需的 Chrome Headless Shell；它只安装到本机缓存，不会被提交到仓库。

```bash
pnpm diagram:install-browser
```

## 使用

从任意业务项目目录调用：

```bash
pnpm --dir /path/to/company-ai-sdlc/tools/diagram-renderer diagram:render -- \
  /path/to/project/docs/architecture/system-context.mmd \
  --output-dir /path/to/project/docs/architecture/images
```

默认同时导出同名的 `.svg` 和 `.png`。SVG 适合文档、网页和放大查看；PNG 默认按 3 倍比例导出，适合插入无法显示 SVG 的文档。
输入路径和输出目录可使用绝对路径；相对路径均相对于执行命令时所在的业务项目目录。

可选参数：

```text
--format svg|png|both       默认 both
--png-scale <number>        PNG 导出比例，默认 3
--output-dir <directory>    输出目录，默认与输入文件相同
```

示例：仅导出 4 倍 PNG。

```bash
pnpm --dir /path/to/company-ai-sdlc/tools/diagram-renderer diagram:render -- \
  /path/to/project/docs/architecture/system-context.mmd \
  --format png \
  --png-scale 4
```

`mermaid.config.json` 固定了 Mermaid 的默认主题和基础 flowchart 选项。图文件内的 Mermaid `init` 配置仍可用于表达该图专属的布局或样式。
