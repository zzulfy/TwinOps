## Context

当前 Dashboard 右侧仿真场景已具备稳定的 deferred loading、模型/fallback 双通路、以及手动相机控制，但默认视觉参数偏夜景：背景较暗、主辅光照偏弱、材质整体偏冷。页面整体已迁移到 GitHub Light 风格，场景夜景效果在视觉层出现割裂。

## Goals / Non-Goals

**Goals:**
- 将仿真场景视觉统一为白天风格，提升与 Light UI 的一致性。
- 保持现有相机交互、模型加载路径、fallback 行为与刷新链路不变。
- 在不增加新依赖的前提下，仅通过场景参数完成改造。

**Non-Goals:**
- 不改动 OrbitControls 交互规则。
- 不引入新的 3D 资源文件或替换模型。
- 不调整后端接口、数据契约或自动刷新策略。

## Decisions

1. **以参数调优替代模型重制**
   - 在 `useDashboardScene` 内调整 `scene.background`、环境光/平行光强度、地面与设备材质色彩。
   - 原因：风险低、改动面小、无需新增资源构建流程。

2. **保留现有加载与降级路径**
   - GLB 加载仍使用 `/models/base.glb`、`/models/devices.glb` 与 `DRACOLoader`，失败时继续使用程序化 fallback。
   - 原因：当前稳定性已验证，视觉改造不应影响可用性。

3. **保持交互语义不变**
   - 中央区域左键旋转、边缘区域左键平移、滚轮缩放逻辑不变。
   - 原因：此前已针对桌面与边缘拖拽行为做过修复，避免引入交互回归。

## Risks / Trade-offs

- **[风险] 白色背景下模型对比度不足** → 通过设备材质亮度与边缘阴影强度校准，确保轮廓清晰。
- **[风险] 光照增强后高光过曝** → 限制主光强度并保留柔和环境光，避免金属面片闪烁。
- **[风险] fallback 与模型视觉不一致** → 同步调整 fallback 材质配色，保持同一日间语义。

## Migration Plan

1. 调整 `useDashboardScene` 中场景背景、光源与材质参数。
2. 对模型成功加载与 fallback 两条路径统一日间配色。
3. 更新 `frontend/README.md` 与根 `README.md` 的仿真视觉描述。
4. 执行前端 `type-check/build` 与既有 smoke 回归，确认无交互回归。

## Open Questions

- 暂无阻塞问题；默认采用“晴天中性日光”作为首版视觉基线。
