import type { RouteMatch } from "../types/route";
import { navigateTo } from "./index";
import DashboardPage from "../pages/DashboardPage";
import DeviceDetailPage from "../pages/DeviceDetailPage";
import AnalysisCenterPage from "../pages/AnalysisCenterPage";
import LoginPage from "../pages/LoginPage";
import AppShell, { ModuleKey } from "../components/AppShell";

const resolveModule = (route: RouteMatch): ModuleKey => {
  if (route.path === "/analysis") {
    return "analysis";
  }
  if (route.path === "/devices" || route.path === "/devices/:deviceCode") {
    return "devices";
  }
  return "dashboard";
};

export default function RouteView({ route }: { route: RouteMatch }) {
  if (route.path === "/login") {
    return (
      <LoginPage
        route={route}
        onLoginSuccess={(target) => {
          navigateTo(target);
        }}
      />
    );
  }
  return (
    <AppShell activeModule={resolveModule(route)} onNavigate={navigateTo}>
      {route.path === "/analysis" ? <AnalysisCenterPage /> : null}
      {route.path === "/devices" || route.path === "/devices/:deviceCode" ? (
        <DeviceDetailPage route={route} onNavigate={navigateTo} />
      ) : null}
      {route.path !== "/analysis" &&
      route.path !== "/devices" &&
      route.path !== "/devices/:deviceCode" ? (
        <DashboardPage onNavigate={navigateTo} />
      ) : null}
    </AppShell>
  );
}

