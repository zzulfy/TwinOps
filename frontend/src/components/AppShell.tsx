import { ReactNode } from "react";

export type ModuleKey = "dashboard" | "devices" | "analysis";

const MODULE_ITEMS: Array<{ key: ModuleKey; label: string; subtitle: string; path: string }> = [
  { key: "dashboard", label: "Dashboard", subtitle: "看板总览", path: "/" },
  { key: "devices", label: "Devices", subtitle: "设备管理", path: "/devices" },
  { key: "analysis", label: "Analysis", subtitle: "分析中心", path: "/analysis" },
];

export default function AppShell({
  activeModule,
  onNavigate,
  children,
}: {
  activeModule: ModuleKey;
  onNavigate: (target: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="appshell-root">
      <aside className="appshell-sidebar" aria-label="Primary Modules">
        <div className="appshell-brand">
          <div className="appshell-brand-cn">TwinOps</div>
          <div className="appshell-brand-en">Module Navigation</div>
        </div>
        <nav className="appshell-nav">
          {MODULE_ITEMS.map((item) => (
            <button
              key={item.key}
              title={item.label}
              className={`appshell-nav-item ${activeModule === item.key ? "is-active" : ""}`.trim()}
              onClick={() => onNavigate(item.path)}
            >
              <span className="appshell-nav-label">{item.label}</span>
              <span className="appshell-nav-subtitle">{item.subtitle}</span>
            </button>
          ))}
        </nav>
      </aside>
      <main className="appshell-content">{children}</main>
    </div>
  );
}

