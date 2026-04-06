import { useEffect, useState } from "react";
import { fetchDashboardSummary } from "../api/backend";
import LayoutPanel from "./LayoutPanel";

export default function WidgetPanel01({ dashboardSummaryVersion }: { dashboardSummaryVersion: number }) {
  const [source, setSource] = useState<Array<{ icon: string; label: string; value: string; unit: string }>>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const summary = await fetchDashboardSummary();
        setSource(summary.deviceScale);
        setErrorMessage("");
      } catch (error) {
        setErrorMessage(`设备规模加载失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    void loadSummary();
  }, [dashboardSummaryVersion]);

  return (
    <LayoutPanel title="设备规模">
      <div className="weather-scroll-area">
        {errorMessage ? <div className="panel-message">{errorMessage}</div> : null}
        {!errorMessage && source.length === 0 ? <div className="panel-message">暂无设备规模数据</div> : null}
        <div className="weather-monitor">
          {source.map((item, index) => (
            <div key={`${item.label}-${index}`} className="widget-weather-item">
              <div className={`weather-icon ${item.icon}`}></div>
              <div className="weather-label">{item.label}</div>
              <div className="weather-value">
                <span className="value">{item.value}</span>
                <span className="unit">{item.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LayoutPanel>
  );
}

