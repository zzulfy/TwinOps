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
npm run smoke:scene-centered-dialog
npm run test:unit:scene-centered-dialog
```

## 关键约定

### 1) Deferred Loading

- ECharts 运行时在图表组件内通过 `src/utils/echartsRuntime.ts` 动态加载，避免阻塞首屏。
- Three.js 非关键 addons 按需加载。
- `vite.config.ts` 对 React、ECharts、zrender 和 Three.js 做手工分块，并把已知延迟 3D 包的 chunk warning 阈值调整为 700 kB。
- Deferred 模块失败时优先局部降级，不阻断整个 Shell。

### 2) 数据一致性与刷新

- `fetchDashboardSummary` 采用共享 in-flight 策略，避免并发重复请求。
- `fetchFaultRateTrend` 提供分钟级（minute）故障率历史曲线，并返回未来 5 分钟 AI 预测点位。
- 故障率口径与后端一致：`error` 设备数 / 全部设备数 × 100。
- Dashboard 右侧设备仿真画面由 `useDashboardScene` 驱动，当前使用 Three.js 程序化构建现代室内配电与控制室展示廊，默认镜头直接位于舱内，并把相机与目标点持续约束在室内范围；场景采用裁剪后的 32 台设备演示集、中轴窄通道 + 左右设备平台 + 前/中/后/尾端分层柜列、偏轴低机位镜头、按 `visualFamily` 区分轮廓和面板语言的柜体家族、现代化吊顶灯槽、分缝墙面、暗色磨砂标题牌、阻尼平滑移动、更大范围的自由旋转和局部状态灯效，不依赖运行时 GLB 模型加载。
- `frontend/public/models/devices.glb` 当前主要用于 seed 生成与仿真对象映射基线，不是 Dashboard 右侧仿真区的直接渲染入口。
- Dashboard 右侧仿真 UI 由 `src/config/simulationDeviceCatalog.json` 作为共享户内设备目录，`src/config/simulationDeviceUiConfig.ts` 只负责把目录映射成前端 UI 配置；当前固定维护 32 台可交互设备（`DEV001` ~ `DEV032`）。
- Dashboard 标题板会直接显示“演示数 / 数据数”，当前前端演示设备与数据库 seed 设备保持 32:32 的 1:1 对齐。
- 共享目录只收录户内设备，右侧仿真区展示的名称、类型和短标识都从这份目录读取。
- 后端 `GET /api/devices/simulation-data` 只返回设备业务数据，Dashboard 在前端完成“固定 UI 配置 + 实时数据”的合并渲染。
- Analysis 页面在保留原有文本报告基础上，现已支持显示后端返回的 RCA 结构化字段：`engine`、`rcaStatus`、`rootCauses`、`causalEdges`、`modelVersion`、`evidenceWindowStart/End`；当后端走 `llm_only` fallback 时，详情区会显式显示无 RCA 结果而不是崩溃。
- Dashboard 初始化会先调用 `GET /api/devices/simulation-consistency` 并自动修复；若仍存在不一致，仅记录日志，不在仿真画面叠加提示框。
- 场景交互节点通过前端固定 `objectId -> deviceCode` 配置绑定；后端一致性服务则独立维护模型/对象映射与数据库设备集合对齐。
- 用户点击设备节点后，会在仿真画面中央显示设备信息对话框（状态/位置/遥测/告警）。
- 可点击设备通过局部状态灯、边缘光条和面板信号表达后端状态，不再对整柜做大面积染色。
- 对话框关闭方式：点击空白区域、点击对话框关闭按钮、按 `Esc`。
- 命中策略：使用 `pointerdown + pointerup`（小位移阈值）触发射线命中，确保拖动视角与设备点击不互相误判。
- 事件冲突修复：仿真容器不再用父级 `onClick` 直接清空选中，避免“点中设备后同次事件被立即关闭”。
- 设备仿真默认禁用巡检类叠加元素（含箭头/路径线），并保留鼠标视角切换（PC 端：左键拖动时，边缘区域平移、中部区域旋转，滚轮缩放）；相机不会退出室内去观察外壳。
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
- 设备列表卡片标题展示为 `deviceCode + 设备名称`（如 `DEV001 服务器机柜`），并在下方仅展示状态标签（`normal | warning | error`）

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

