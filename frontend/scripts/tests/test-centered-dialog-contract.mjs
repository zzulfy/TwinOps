import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");

async function readFile(relPath) {
  return fs.readFile(path.join(projectRoot, relPath), "utf-8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function run() {
  const sceneHook = await readFile("src/hooks/useDashboardScene.ts");
  const dashboardPage = await readFile("src/pages/DashboardPage.tsx");
  const dialogComponent = await readFile("src/components/SimulationDeviceDialog.tsx");
  const uiConfig = await readFile("src/config/simulationDeviceUiConfig.ts");
  const appStyles = await readFile("src/styles/app.scss");

  assert(!sceneHook.includes("selectedAnchor"), "useDashboardScene 不应再暴露 selectedAnchor。");
  assert(!dashboardPage.includes("sceneState.selectedAnchor"), "DashboardPage 不应依赖 sceneState.selectedAnchor。");
  assert(
    /selectedDevice\s*\?\s*\(?\s*<SimulationDeviceDialog/.test(dashboardPage),
    "DashboardPage 应使用 selectedDevice 控制对话框开关。"
  );
  assert(!dashboardPage.includes("scene-device-label-layer"), "DashboardPage 不应渲染设备悬浮标签层。");
  assert(!dashboardPage.includes("scene-overlay-message"), "DashboardPage 不应渲染顶部提示对话框。");
  assert(!dashboardPage.includes("scene-overlay-hint"), "DashboardPage 不应渲染左下角一致性提示。");
  assert(dashboardPage.includes("fetchSimulationDeviceData"), "DashboardPage 应使用 simulation-data 接口加载仿真数据。");
  assert(dashboardPage.includes("SIMULATION_INTERACTIVE_DEVICE_CONFIG"), "DashboardPage 应引用前端固定仿真设备配置。");
  assert(dashboardPage.includes("configOnlyCodes"), "DashboardPage 应校验配置集合与后端集合一致性。");
  assert(dashboardPage.includes("dataOnlyCodes"), "DashboardPage 应校验配置集合与后端集合一致性。");
  assert(!sceneHook.includes("labels:"), "useDashboardScene 不应再输出 labels。");
  assert(!sceneHook.includes("setLabels("), "useDashboardScene 不应再维护标签状态。");
  assert(!sceneHook.includes("mappingWarning"), "useDashboardScene 不应再维护映射提示状态。");
  assert(sceneHook.includes("twDeviceCode"), "useDashboardScene 应通过 twDeviceCode 绑定点击设备编码。");
  assert(sceneHook.includes("normalizeDeviceStatus"), "useDashboardScene 应规范化 warning/warn/error 状态。");
  assert(sceneHook.includes("STATUS_COLOR"), "useDashboardScene 应声明状态透明色配置。");
  assert(sceneHook.includes("opacity: 0.58"), "useDashboardScene 应保留透明状态色渲染。");
  assert(!dialogComponent.includes("x:"), "SimulationDeviceDialog 不应再接收 x 坐标。");
  assert(!dialogComponent.includes("y:"), "SimulationDeviceDialog 不应再接收 y 坐标。");
  assert(dialogComponent.includes('role="dialog"'), "SimulationDeviceDialog 应声明 role=dialog。");
  assert(!dialogComponent.includes("dialog-tail"), "SimulationDeviceDialog 不应包含锚点尾巴元素。");
  assert(dialogComponent.includes("displayName"), "SimulationDeviceDialog 应从前端 UI 配置读取显示名称。");
  assert(dialogComponent.includes("displayLabel"), "SimulationDeviceDialog 应从前端 UI 配置读取显示标签。");
  assert(dashboardPage.includes("scene-title-board"), "DashboardPage 应渲染仿真区域标题牌。");
  assert(dashboardPage.includes("simulation-dialog-backdrop"), "DashboardPage 应在弹窗开启时渲染中央对话框遮罩。");
  assert(uiConfig.includes("SIMULATION_INTERACTIVE_DEVICE_CONFIG"), "应存在前端仿真设备固定配置。");
  assert(uiConfig.includes("buildInteractiveDeviceConfigs(51)"), "前端仿真设备配置应覆盖 51 台设备。");
  assert(appStyles.includes(".scene-title-board"), "样式中应包含 scene-title-board。");
  assert(appStyles.includes("color: #111111;"), "非黑色背景场景标题应使用黑色字体。");

  console.log("PASS: centered simulation device dialog contract checks");
}

run().catch((error) => {
  console.error("FAIL: centered simulation device dialog contract checks");
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
