## Context

当前前端 UI 仍以 cockpit 深色风格为主（重渐变、发光边框、强对比色块），与目标 GitHub Light 体验差距较大。  
本次变更覆盖 Dashboard、Devices、Analysis、Login 全站页面，要求统一改为 GitHub Light 视觉体系，同时保留 Dashboard 的 3D 仿真能力。

## Goals / Non-Goals

**Goals:**
- 建立全站统一的 GitHub Light 主题 token（颜色、边框、阴影、按钮状态、文本层级）。
- 将两栏壳层与页面布局改造成更接近 GitHub 的信息结构与间距节奏。
- Dashboard 保留 3D 仿真功能，仅外层容器和周边控件改为 Light 卡片样式。
- 在不改变后端契约的前提下提升可读性、可扫描性与视觉一致性。

**Non-Goals:**
- 不变更后端 API、数据库与业务数据结构。
- 不移除 Three.js 仿真功能，也不改动模型资源本身。
- 不引入新的 UI 框架依赖（保持现有 React + SCSS + token 体系）。

## Decisions

1. **先改 token，再改壳层，最后改页面组件。**  
   先收敛 `design-tokens.css` 的基础语义色，再统一 `app.scss` 中壳层样式，最后收口页面级组件，避免“边改边漂移”。

2. **采用 GitHub Light 的低饱和中性色体系。**  
   背景分层、边框强度、文本灰阶、按钮态采用轻量层次，替换 cockpit 风格的重渐变和 glow。

3. **3D 区域保持功能不变，仅容器样式 GitHub 化。**  
   仅调整边框、背景、卡片包裹和控制条视觉，不动相机逻辑与模型加载链路。

4. **分阶段交付并保持可回滚。**  
   每个阶段都限定改动面（token -> shell -> pages），通过已有构建/测试命令验证，降低一次性大改风险。

## Risks / Trade-offs

- **[Risk]** 全站视觉改动较大，可能引入样式回归。  
  **Mitigation:** 以 token 驱动改造并按壳层/页面分步提交，减少耦合面。

- **[Risk]** Dashboard 从 cockpit 到 light 后，信息“科技感”下降。  
  **Mitigation:** 保留 3D 仿真与关键状态色，仅收敛到更克制的 GitHub Light 表达。

- **[Risk]** 两栏布局在窄屏下可能出现密度问题。  
  **Mitigation:** 复用现有响应式断点并调整留白与字号，保持导航可用性。
