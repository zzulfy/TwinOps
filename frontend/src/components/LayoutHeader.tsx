import { useEffect, useState } from "react";

const formatClock = () => {
  const date = new Date();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return {
    currentTime: `${hours}:${minutes}:${seconds}`,
    currentDate: `${year}-${month}-${day}`,
    currentDay: weekdays[date.getDay()],
  };
};

export default function LayoutHeader({
  showSummaryActions,
  summaryUpdatedAt,
  refreshing,
  onRefreshSummary,
  onLogout,
}: {
  showSummaryActions?: boolean;
  summaryUpdatedAt?: string;
  refreshing?: boolean;
  onRefreshSummary?: () => void;
  onLogout?: () => void;
}) {
  const [clock, setClock] = useState(formatClock());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClock(formatClock());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="layout-header">
      <div className="header-midden">
        <div className="cn">数据中心数字孪生智能运维平台</div>
        <div className="en">Data Center Digital Twin Intelligent Operation Platform</div>
      </div>
      <div className="header-left">
        <i className="fa-regular fa-envelope"></i>
        <div
          className="message"
          content="【系统通知】感谢大家对我们项目的关注与支持!希望能为我们的项目点一个Star,您的支持对我们来说至关重要。"
        />
      </div>
      <div className="header-right">
        {showSummaryActions ? (
          <>
            <button className="summary-refresh" disabled={refreshing} onClick={onRefreshSummary}>
              {refreshing ? "刷新中..." : "刷新看板"}
            </button>
            <button className="summary-refresh" onClick={onLogout}>
              退出登录
            </button>
          </>
        ) : null}
        {showSummaryActions && summaryUpdatedAt ? (
          <span className="summary-updated">更新于 {summaryUpdatedAt}</span>
        ) : null}
        <span>{clock.currentTime}</span>
        <span>{clock.currentDate}</span>
        <span>{clock.currentDay}</span>
      </div>
    </div>
  );
}

