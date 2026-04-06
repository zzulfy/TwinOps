import { useEffect, useState } from "react";
import { fetchDashboardSummary } from "../api/backend";
import LayoutPanel from "./LayoutPanel";

export default function WidgetPanel04({ dashboardSummaryVersion }: { dashboardSummaryVersion: number }) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [hint, setHint] = useState("图表运行中");

  useEffect(() => {
    const load = async () => {
      try {
        const summary = await fetchDashboardSummary();
        const latest = summary.faultRate.values[summary.faultRate.values.length - 1];
        setHint(`最新故障变化率 ${latest ?? "-"}%`);
        setApiError(null);
      } catch (error) {
        setApiError(`图表数据加载失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    void load();
  }, [dashboardSummaryVersion]);

  return (
    <LayoutPanel title="设备故障变化率">
      {apiError ? <div className="chart-fallback">{apiError}</div> : <div className="chart-fallback">{hint}</div>}
    </LayoutPanel>
  );
}

