## 1. Frontend Interaction Refactor

- [x] 1.1 重构 `useDashboardScene`，去除设备详情框对 `selectedAnchor` 的依赖，仅保留设备点击选择状态。
- [x] 1.2 更新 `DashboardPage`：点击设备后在仿真画面中心渲染设备信息对话框，不再跟随设备锚点。
- [x] 1.3 更新 `SimulationDeviceDialog` 组件结构与样式，移除锚点尾巴视觉，支持中央弹层展示。
- [x] 1.4 保留并验证关闭路径：点击空白关闭、关闭按钮关闭、`Esc` 关闭。

## 2. UX and Consistency Safeguards

- [x] 2.1 确保页面不再显示设备悬浮标签，且设备点击命中逻辑不回归（仍可正确选中对应设备）。
- [x] 2.2 确保仿真设备与数据库 1:1 一致性校验不回归（映射异常仅记录日志，不在画面叠加提示）。
- [x] 2.3 验证中央弹层在常见分辨率下不越界，移动端/窄屏下可读。

## 3. Testing and Validation

- [x] 3.1 单元测试：覆盖对话框开关状态、关闭行为与关键渲染分支。
- [ ] 3.2 集成测试：通过 localhost 接口链路验证点击设备后可获取并展示设备详情数据。
- [ ] 3.3 回归测试：Dashboard 场景加载、设备点击弹框、Devices/Analysis 页面主流程无回归。
- [x] 3.4 输出测试命令与结果摘要，满足项目“每次改动均需单元/集成/回归测试”的约束。

## 4. Documentation

- [x] 4.1 更新 `README.md`：说明仿真设备点击后改为“中央对话框”展示设备信息。
- [x] 4.2 更新 `frontend/README.md`：补充新的交互行为与关闭方式。
