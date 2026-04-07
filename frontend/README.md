# TwinOps Frontend

TwinOps 前端工作区，负责数字孪生运维 Cockpit 的页面渲染、交互流程与后端 API 集成。

## 技术栈

- React + TypeScript
- Vite
- Three.js
- ECharts
- GSAP / Tween.js

## 目录说明

- `src/`：React 应用主源码
  - `main.tsx` / `App.tsx`：运行入口与路由壳层
  - `pages/`：页面级模块（Dashboard / Devices / Analysis / Login）
  - `components/`：可复用 UI 组件（layout / panel / detail）
  - `hooks/`：可复用 Hooks（如自动刷新）
  - `router/`：Hash Router 解析与跳转封装
  - `types/`：本地共享类型定义
  - `api/`：后端接口封装与 `ApiResponse` 解析
  - `assets/`：设计 Token 与共享资源
- `public/`：运行时静态资源（models、textures、fonts、draco、favicon）
- `scripts/`：验证与排障脚本（`smoke/`、`checks/`、`tests/`、`debug/`）
- `reports/`：验证日志、快照与诊断结果
- `tmp/`：本地临时文件
- `docs/`：生产构建输出目录

## 环境要求

- Node.js 20+
- npm 9+

## 安装依赖

```bash
npm install
```

## 本地开发

```bash
npm run dev
```

指定地址启动：

```bash
npm run dev -- --host 127.0.0.1 --port 8090 --strictPort
```

## 构建与预览

```bash
npm run type-check
npm run type-check:react
npm run build
npm run preview
```

## 质量命令

```bash
npm run lint
npm run format
npm run lint:style
npm run smoke:shell
npm run smoke:analysis-auto-refresh
npm run smoke:alarm-real-data
npm run smoke:alarm-manual-scroll
npm run smoke:device-alarm-two-status
```

## 关键约定

### 1) Deferred Loading

- ECharts 在 `useEcharts` 中动态加载，避免阻塞首屏。
- Three.js 非关键 addons 按需加载。
- Deferred 模块失败时优先局部降级，不阻断整个 Shell。

### 2) 数据一致性与刷新

- `fetchDashboardSummary` 采用共享 in-flight 策略，避免并发重复请求。
- `fetchFaultRateTrend` 提供分钟级（minute）故障率历史曲线，并返回未来 5 分钟 AI 预测点位。
- 故障率口径与后端一致：`error` 设备数 / 全部设备数 × 100。
- Dashboard 右侧设备仿真画面由 `useDashboardScene` 驱动，采用 Three.js deferred loading，从 `/models/base.glb` 与 `/models/devices.glb` 加载模型；仅在模型全部加载失败时回退到程序化设备阵列渲染。
- 设备仿真默认禁用巡检类叠加元素（含箭头/路径线），并保留鼠标视角切换（PC 端：中央区域左键拖动旋转，边缘区域左键拖动平移，滚轮缩放）。
- 场景不再自动旋转或漂移，视角变化仅由用户手动交互触发。
- Dashboard 支持自动刷新 + 手动刷新，并展示最近一次成功刷新时间。
- 自动刷新具备页面可见性控制，避免隐藏页面无效轮询。
- 故障率曲线统一按 0.1% 精度展示，横坐标按 1 分钟粒度展示且仅显示 `HH:mm`，支持 dataZoom 滑动查看历史分钟数据。

### 3) 鉴权与路由

- 登录页：`/login`
- 受保护路由：`/`、`/devices`、`/devices/:deviceCode`、`/analysis`
- 未登录访问受保护路由会跳转到 `/login?redirect=<target>`

### 4) Two-pane 导航布局（ChatGPT 风格）

- 主模块页面统一使用 `AppShell`：
  - 左侧：模块标签导航（窄列）
  - 右侧：当前模块详细内容（宽列）
- 左侧导航集中管理模块切换，不在右侧内容区重复放置主模块入口按钮。
- 左列宽度使用 `clamp()` 约束，右侧占据剩余主要空间。
- 窄屏下启用侧栏收窄策略，保持模块切换可用。

### 5) 告警与设备交互

- 告警状态：`new | resolved`
- 告警状态变更通过 `PATCH /api/alarms/{id}/status`
- 设备页支持筛选、关注（watchlist）、单设备详情跳转

### 6) 资源路径

运行时资源统一使用根路径：

- `/models/...`
- `/textures/...`
- `/fonts/...`
- `/js/draco/...`
- `/favicon.png`

### 7) 设计 Token

- 统一使用 `src/assets/design-tokens.css`
- 新视觉常量先补 Token，再落组件

### 8) GitHub Light 主题与布局

- 全站页面（Dashboard / Devices / Analysis / Login）统一迁移为 GitHub Light 视觉语言：浅色中性背景、细边框、轻阴影、克制状态色。
- 两栏壳层保持左侧导航 + 右侧内容结构，交互态（hover/active/focus）对齐 GitHub 风格可读性。
- Dashboard 保留 Three.js 设备仿真能力，仅将仿真区外层容器与周边控件改为 Light 卡片样式。

