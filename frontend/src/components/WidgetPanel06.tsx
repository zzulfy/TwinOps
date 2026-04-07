import { useEffect, useRef, useState } from "react";
import { fetchAlarmList } from "../api/backend";
import type { AlarmStatus, AlarmListItem } from "../api/backend";
import useAutoRefresh from "../hooks/useAutoRefresh";
import LayoutPanel from "./LayoutPanel";

export default function WidgetPanel06() {
  const [displayList, setDisplayList] = useState<AlarmListItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentStatus, setCurrentStatus] = useState<AlarmStatus>("new");
  const [loading, setLoading] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const statusTabs: Array<{ label: string; value: AlarmStatus }> = [
    { label: "新告警", value: "new" },
    { label: "已解决", value: "resolved" },
  ];

  const loadAlarms = async () => {
    if (loading) {
      return;
    }
    try {
      setLoading(true);
      const previousScrollTop = viewportRef.current?.scrollTop ?? 0;
      const data = await fetchAlarmList(currentStatus);
      setDisplayList(data);
      window.requestAnimationFrame(() => {
        const viewport = viewportRef.current;
        if (!viewport) {
          return;
        }
        const maxScrollableTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
        viewport.scrollTop = Math.min(previousScrollTop, maxScrollableTop);
      });
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(`预警数据加载失败: ${error instanceof Error ? error.message : String(error)}`);
      setDisplayList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAlarms();
  }, [currentStatus]);

  useAutoRefresh({
    intervalMs: 20000,
    immediate: false,
    runWhenHidden: true,
    onTick: loadAlarms,
  });

  return (
    <LayoutPanel title="预警情况">
      <div className="wrap">
        <div className="status-tabs">
          {statusTabs.map((item) => (
            <button
              key={item.value}
              className={`tab-btn ${currentStatus === item.value ? "active" : ""}`.trim()}
              onClick={() => {
                if (!loading && currentStatus !== item.value) {
                  setCurrentStatus(item.value);
                }
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        {errorMessage ? <div className="panel-message">{errorMessage}</div> : null}
        {!errorMessage && displayList.length === 0 ? <div className="panel-message">暂无预警数据</div> : null}
        {!errorMessage && displayList.length > 0 ? (
          <div ref={viewportRef} className="item-viewport">
            <div className="item-list">
              {displayList.map((item) => (
                <div key={item.id} className={`item type-${item.type}`}>
                  <div className={`item-circle dot-${item.type}`}></div>
                  <div className="item-name">{item.name}</div>
                  <div className="item-type">{item.event}</div>
                  <div className={`item-status is-${item.status}`}>
                    {item.status === "new" ? "新告警" : "已解决"}
                  </div>
                  <div className="item-time">{item.time}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </LayoutPanel>
  );
}

