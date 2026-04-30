import { useEffect, useRef, useState } from "react";
import { fetchFaultRateTrend, type FaultRateTrendResponse } from "../api/backend";
import LayoutPanel from "./LayoutPanel";

export default function WidgetPanel04({ dashboardSummaryVersion }: { dashboardSummaryVersion: number }) {
  const chartElRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<import("../utils/echartsRuntime").EChartsType | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [trend, setTrend] = useState<FaultRateTrendResponse | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const forecastEverLoaded = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        // Phase 1: history-only, no LLM call — renders immediately
        const historyResp = await fetchFaultRateTrend({ predictMinutes: 0 });
        if (cancelled) return;
        setApiError(null);

        if (forecastEverLoaded.current) {
          // Already have forecast from a previous load — keep current chart,
          // let Phase 2 update everything at once without intermediate render
        } else {
          // First load: show history immediately while waiting for forecast
          setTrend(historyResp);
          setForecastLoading(true);
        }

        // Phase 2: fetch forecast with AI analysis asynchronously
        try {
          const fullResp = await fetchFaultRateTrend({ predictMinutes: 30 });
          if (cancelled) return;
          setTrend(fullResp);
          forecastEverLoaded.current = true;
        } catch (forecastErr) {
          console.warn("[WidgetPanel04] forecast fetch failed", forecastErr);
        } finally {
          if (!cancelled) setForecastLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          setTrend(null);
          setApiError(`图表数据加载失败: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [dashboardSummaryVersion]);

  useEffect(() => {
    if (!trend || !chartElRef.current) {
      return;
    }
    let active = true;
    const container = chartElRef.current;

    const render = async () => {
      try {
        const runtime = await import("../utils/echartsRuntime");
        if (!active || !container) {
          return;
        }

        const el = container;
        if (el.clientHeight === 0 || el.clientWidth === 0) {
          console.warn("[WidgetPanel04] chart container has zero dimensions", {
            width: el.clientWidth,
            height: el.clientHeight,
          });
        }

        const chart = chartRef.current ?? runtime.init(el);
        chartRef.current = chart;

        const hasForecast = trend.forecast.length > 0;

        const labels = hasForecast
          ? [...trend.history.map((item) => item.time), ...trend.forecast.map((item) => item.time)].map((label) =>
              label.slice(-5)
            )
          : trend.history.map((item) => item.time).map((label) => label.slice(-5));

        const historyValues = hasForecast
          ? [...trend.history.map((item) => item.value), ...new Array(trend.forecast.length).fill(null)]
          : trend.history.map((item) => item.value);

        const lastHistory = trend.history[trend.history.length - 1];
        const forecastValues = hasForecast
          ? [
              ...new Array(Math.max(0, trend.history.length - 1)).fill(null),
              lastHistory ? lastHistory.value : null,
              ...trend.forecast.map((item) => item.value),
            ]
          : [];

        const legendData = hasForecast
          ? ["历史故障率", `未来${trend.forecast.length}分钟预测故障率(AI)`]
          : ["历史故障率"];

        const lastHistoryTime = trend.history[trend.history.length - 1]?.time;

        const series: Array<Record<string, unknown>> = [
          {
            name: "历史故障率",
            type: "line",
            smooth: true,
            showSymbol: false,
            lineStyle: { width: 2, color: "#3ea3ff" },
            areaStyle: { color: "rgba(62,163,255,0.18)" },
            data: historyValues,
            markLine: {
              silent: true,
              symbol: "none",
              label: {
                formatter: "当前",
                position: "start",
                fontSize: 10,
                color: "#ff6b6b",
              },
              lineStyle: { color: "#ff6b6b", type: "dashed", width: 1 },
              data: lastHistoryTime ? [{ xAxis: lastHistoryTime.slice(-5) }] : [],
            },
          },
        ];

        if (hasForecast) {
          series.push({
            name: `未来${trend.forecast.length}分钟预测故障率(AI)`,
            type: "line",
            smooth: true,
            showSymbol: false,
            lineStyle: { width: 2, type: "dashed", color: "#f7b955" },
            data: forecastValues,
          });
        }

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
              data: legendData,
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
              { type: "inside", start: 70, end: 100 },
              { type: "slider", height: 14, bottom: 8, start: 70, end: 100 },
            ],
            series,
          },
          true
        );
        chart.resize();
      } catch (renderError) {
        console.error("[WidgetPanel04] chart render failed", renderError);
        if (active) {
          setApiError(`图表渲染失败: ${renderError instanceof Error ? renderError.message : String(renderError)}`);
        }
      }
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
            {forecastLoading ? <span style={{ marginLeft: 8, color: "#f7b955" }}>AI预测中...</span> : null}
          </div>
          <div ref={chartElRef} className="fault-rate-chart" style={{ minHeight: 180 }}></div>
        </div>
      ) : null}
    </LayoutPanel>
  );
}
