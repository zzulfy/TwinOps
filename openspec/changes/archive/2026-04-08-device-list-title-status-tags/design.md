## Context

设备列表当前将 `deviceCode` 与 `status` 放在次行文本（`deviceCode · status`），主标题仅显示设备名称。该布局在批量浏览场景下不利于快速识别设备主键，也让状态信息缺少可扫描的视觉锚点。

这次变更仅涉及前端展示层，目标是在不改变现有交互行为（筛选、关注、跳转、告警操作）的前提下，重排列表项的信息层级。

## Goals / Non-Goals

**Goals:**
- 将设备列表主标题统一为 `deviceCode + 设备名称`（示例：`DEV001 服务器机柜`）。
- 将设备状态改为次行独立标签显示，仅显示 `normal | warning | error`。
- 保持原有页面数据流与交互逻辑不变，仅调整渲染结构与样式。

**Non-Goals:**
- 不新增后端字段或 API。
- 不调整设备筛选、关注、详情页路由和告警处理流程。
- 不改动设备详情面板内容结构。

## Decisions

### 1) 标题信息前置设备编码
- **Decision**: 列表卡片标题改为 `device.deviceCode + " " + device.name`。
- **Rationale**: 运维侧优先按设备编码定位目标，标题级展示可降低扫描成本。
- **Alternative considered**: 保持标题为名称，在次行突出编码。该方案仍要求二次视线移动，放弃。

### 2) 状态信息改为标签
- **Decision**: 次行仅显示状态标签，不再拼接 `deviceCode · status` 文本。
- **Rationale**: 标签化可强化状态分类识别，并与现有告警状态视觉模式保持一致。
- **Alternative considered**: 保留次行文本并追加标签。信息冗余且密度更高，放弃。

### 3) 复用现有样式体系
- **Decision**: 在 `app.scss` 中新增/复用局部 class（如 `device-status-tag`）完成样式，不引入新依赖。
- **Rationale**: 该改动为局部 UI 收敛，维持当前 GitHub Light 主题变量与样式组织更稳妥。

## Risks / Trade-offs

- **[Risk] 列表项高度变化影响密度** → **Mitigation**: 使用紧凑标签样式（小字号、圆角、轻边框）控制增高幅度。
- **[Risk] 状态标签颜色对比不足** → **Mitigation**: 复用设计 token 并在 `normal/warning/error` 下分别校验可读性。
- **[Trade-off] 信息维度减少（去掉次行 deviceCode 文本）** → **Mitigation**: 已在标题首位保留 deviceCode，不丢失核心识别信息。
