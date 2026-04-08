import { useEffect, useRef, useState } from "react";
import { fetchFaultRateTrend, type FaultRateTrendResponse } from "../api/backend";
import LayoutPanel from "./LayoutPanel";

export default function WidgetPanel04({ dashboardSummaryVersion }: { dashboardSummaryVersion: number }) {
  const chartElRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<import("../utils/echartsRuntime").EChartsType | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [trend, setTrend] = useState<FaultRateTrendResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchFaultRateTrend({ predictMinutes: 5 });
        setTrend(data);
        setApiError(null);
      } catch (error) {
        setTrend(null);
        setApiError(`图表数据加载失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    void load();
  }, [dashboardSummaryVersion]);

  useEffect(() => {
    if (!trend || !chartElRef.current) {
      return;
    }
    let active = true;
    const render = async () => {
      const runtime = await import("../utils/echartsRuntime");
      if (!active || !chartElRef.current) {
        return;
      }
      const chart = chartRef.current ?? runtime.init(chartElRef.current);
      chartRef.current = chart;
      const labels = [...trend.history.map((item) => item.time), ...trend.forecast.map((item) => item.time)].map(
        (label) => label.slice(-5)
      );
      const historyValues = [
        ...trend.history.map((item) => item.value),
        ...new Array(trend.forecast.length).fill(null),
      ];
      const lastHistory = trend.history[trend.history.length - 1];
      const forecastValues = [
        ...new Array(Math.max(0, trend.history.length - 1)).fill(null),
        lastHistory ? lastHistory.value : null,
        ...trend.forecast.map((item) => item.value),
      ];
      chart.setOption(
        {
          backgroundColor: "transparent",
          tooltip: {
            trigger: "axis",
            valueFormatter: (value: unknown) =>
              typeof value === "number" ? `${value.toFixed(1)}%` : "-",
          },
          legend: {
            right: 0,
            top: 4,
            textStyle: { color: "#000", fontSize: 11 },
            data: ["历史故障率", "未来5分钟预测故障率(AI)"],
          },
          grid: { left: 36, right: 14, top: 32, bottom: 42 },
          xAxis: {
            type: "category",
            boundaryGap: false,
            data: labels,
            axisLabel: { color: "#000", fontSize: 10, formatter: (value: string) => value.slice(-5) },
          },
          yAxis: {
            type: "value",
            name: "故障率",
            min: 0,
            max: 100,
            axisLabel: { color: "#000", formatter: "{value}%" },
            splitLine: { lineStyle: { color: "rgba(128,164,211,0.25)" } },
          },
          dataZoom: [
            { type: "inside", start: 60, end: 100 },
            { type: "slider", height: 14, bottom: 8, start: 60, end: 100 },
          ],
          series: [
            {
              name: "历史故障率",
              type: "line",
              smooth: true,
              showSymbol: false,
              lineStyle: { width: 2, color: "#3ea3ff" },
              areaStyle: { color: "rgba(62,163,255,0.18)" },
              data: historyValues,
            },
            {
              name: "未来5分钟预测故障率(AI)",
              type: "line",
              smooth: true,
              showSymbol: false,
              lineStyle: { width: 2, type: "dashed", color: "#f7b955" },
              data: forecastValues,
            },
          ],
        },
        true
      );
      chart.resize();
    };
    void render();
    const resize = () => {
      chartRef.current?.resize();
    };
    window.addEventListener("resize", resize);
    return () => {
      active = false;
      window.removeEventListener("resize", resize);
    };
  }, [trend]);

  useEffect(
    () => () => {
      chartRef.current?.dispose();
      chartRef.current = null;
    },
    []
  );

  const latest = trend?.history[trend.history.length - 1];

  return (
    <LayoutPanel title="设备故障率">
      {apiError ? <div className="chart-fallback">{apiError}</div> : null}
      {!apiError && !trend ? <div className="chart-fallback">图表运行中</div> : null}
      {!apiError && trend ? (
        <div className="fault-rate-chart-wrap">
          <div className="fault-rate-meta">
            最新故障率 {latest ? `${latest.value.toFixed(1)}%` : "-"}
          </div>
          <div ref={chartElRef} className="fault-rate-chart"></div>
        </div>
      ) : null}
    </LayoutPanel>
  );
}

