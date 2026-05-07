# Pomodoro Timer - CLAUDE.md

## 项目

基于 electron-vite 5 + React + TypeScript 的桌面番茄钟应用。

## 目录结构

```
src/
  main/index.ts        # Electron 主进程（electron-store IPC + 通知）
  preload/index.ts     # contextBridge 安全 API
  renderer/
    App.tsx / App.css  # 深色主题主布局
    main.tsx           # React 入口
    index.html         # HTML 模板
    types/index.ts     # TypeScript 类型定义
    store/AppContext.tsx # 全局状态（useReducer + 自动持久化）
    components/         # UI 组件
```

## 命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 开发模式 |
| `pnpm build` | 构建（编译 main + preload + renderer 三个环境） |
| `pnpm package` | electron-builder 打包 Windows NSIS 安装包 |

## 架构要点

- **electron-vite 5**: 严格使用 `src/main/` `src/preload/` `src/renderer/` 结构，`electron/` 目录不会被识别
- **状态管理**: React Context + useReducer，自动同步到 electron-store JSON 文件
- **IPC**: 主进程注册 `store:get/set` 和 `notification:show` handler，preload 通过 contextBridge 暴露
- **数据持久化**: electron-store schema 含 sessions（番茄记录）、todos（待办）、settings（设置）
- **渲染进程**: 通过 `window.electronAPI` 调用主进程功能（global type declaration 在 AppContext.tsx 中）

## 踩坑记录

- TypeScript 7.0 弃用 `baseUrl` 配置项，需加 `ignoreDeprecations: "6.0"`
- `crypto.randomUUID()` 在 Electron 中可用（非浏览器环境）
- recharts Tooltip 深色主题通过 `contentStyle` 设置背景色
- CRLF/LF 警告是 Windows 正常现象，不影响功能
- **electron-vite 必须显式 externalize electron**: 在 `main` 和 `preload` 的 `build.rollupOptions.external` 中均需添加 `'electron'`，否则 electron 的二进制路径解析代码会被打包导致路径错误
- **Vite 8 输出 `.mjs`**: `out/` 目录输出为 `.mjs` 文件，main 进程中 preload 路径必须写为 `index.mjs` 而非 `index.js`
- **国内网络**: Electron 二进制下载需设置 `ELECTRON_MIRROR` 环境变量为 `https://npmmirror.com/mirrors/electron/`，建议写入 `.npmrc` 的 `electron_mirror` 字段
- **主题系统**: 使用 CSS 变量 + `data-theme` 属性实现，JS 监听 `prefers-color-scheme` 实现跟随系统。主题变量在 `App.css` 的 `[data-theme='dark']` 等选择器中定义
