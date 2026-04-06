import { useState } from "react";
import { fetchDashboardSummary, logoutAdmin } from "../api/backend";
import useAutoRefresh from "../hooks/useAutoRefresh";
import LayoutFooter from "../components/LayoutFooter";
import LayoutHeader from "../components/LayoutHeader";
import LayoutLoading from "../components/LayoutLoading";
import WidgetPanel01 from "../components/WidgetPanel01";
import WidgetPanel04 from "../components/WidgetPanel04";
import WidgetPanel06 from "../components/WidgetPanel06";

export default function DashboardPage({ onNavigate }: { onNavigate: (target: string) => void }) {
  const [loading] = useState({ total: 3, loaded: 3, isLoading: false });
  const [showMask] = useState(false);
  const [summaryUpdatedAt, setSummaryUpdatedAt] = useState("");
  const [refreshingSummary, setRefreshingSummary] = useState(false);
  const [dashboardSummaryVersion, setDashboardSummaryVersion] = useState(0);

  const refreshSummary = async () => {
    if (refreshingSummary) {
      return;
    }
    try {
      setRefreshingSummary(true);
      await fetchDashboardSummary({ force: true });
      const date = new Date();
      const display = `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
      setSummaryUpdatedAt(display);
      setDashboardSummaryVersion((value) => value + 1);
    } finally {
      setRefreshingSummary(false);
    }
  };

  useAutoRefresh({
    intervalMs: 20000,
    runWhenHidden: true,
    onTick: refreshSummary,
  });

  return (
    <div className="layout">
      <LayoutHeader
        showSummaryActions
        summaryUpdatedAt={summaryUpdatedAt}
        refreshing={refreshingSummary}
        onRefreshSummary={() => {
          void refreshSummary();
        }}
        onLogout={async () => {
          await logoutAdmin();
          onNavigate("/login");
        }}
      />
      <LayoutFooter />
      <LayoutLoading loading={loading} />
      <div className="layout-main">
        <div className="main-left">
          <WidgetPanel04 dashboardSummaryVersion={dashboardSummaryVersion} />
          <WidgetPanel01 dashboardSummaryVersion={dashboardSummaryVersion} />
          <WidgetPanel06 />
        </div>
        <div className="main-right">
          <canvas className="scene-canvas" />
        </div>
        {showMask ? <div className="mask"></div> : null}
      </div>
    </div>
  );
}

