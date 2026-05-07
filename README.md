# 番茄钟 Pomodoro Timer

一个基于 Electron + React + TypeScript 的桌面番茄钟应用，帮助你使用番茄工作法提升专注力。

## 功能

- **番茄计时** — 标准 25 分钟专注 + 5 分钟短休息 + 15 分钟长休息，支持暂停/继续/重置
- **模式切换** — 专注、短休息、长休息三种模式一键切换，进度环发光反馈
- **待办清单** — 添加待办事项，勾选完成，关联番茄计数
- **统计追踪** — 总番茄数、今日专注时长、7天趋势柱状图、历史记录
- **主题系统** — 内置深色（暖调）、浅色、森林三套主题，支持跟随系统
- **自定义标题栏** — 融入整体设计的窗口控制栏，最小化/最大化/关闭按钮
- **交互反馈** — 按钮点击缩放、开始按钮脉冲呼吸光效
- **桌面通知** — 专注/休息结束时系统原生通知
- **自定义设置** — 自由调整专注时长、休息时长、长休息间隔

## 截图

<!-- TODO: 添加截图 -->

## 下载

从 [Releases](https://github.com/LJT1218XX/pomodoro-timer/releases) 页面下载最新安装包。

## 开发

```bash
# 克隆项目
git clone https://github.com/LJT1218XX/pomodoro-timer.git
cd pomodoro-timer

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 打包 Windows 安装包
pnpm package
```

### 环境要求

- Node.js >= 18
- pnpm >= 10

## 技术栈

| 技术 | 用途 |
|------|------|
| [electron-vite](https://electron-vite.org/) | 构建工具 |
| [React](https://react.dev/) | UI 框架 |
| [TypeScript](https://www.typescriptlang.org/) | 类型安全 |
| [electron-store](https://github.com/sindresorhus/electron-store) | 持久化存储 |
| [recharts](https://recharts.org/) | 统计图表 |

## 项目结构

```
src/
├── main/index.ts            # Electron 主进程
├── preload/index.ts         # 安全 API 桥接
└── renderer/
    ├── App.tsx / App.css    # 主布局 + 主题系统
    ├── main.tsx             # React 入口
    ├── types/index.ts       # 类型定义
    ├── store/AppContext.tsx  # 全局状态管理
    └── components/
        ├── Timer.tsx        # 计时器组件
        ├── ProgressRing.tsx # SVG 进度环（含发光滤镜）
        ├── TodoPanel.tsx    # 待办面板
        ├── Stats.tsx        # 统计页面
        ├── SettingsModal.tsx # 设置弹窗
        └── TitleBar.tsx     # 自定义标题栏
```

## License

MIT
