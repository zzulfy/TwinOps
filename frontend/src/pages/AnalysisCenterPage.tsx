import { useRef, useState } from "react";
import {
  fetchAnalysisReport,
  fetchAnalysisReports,
  triggerAnalysisReport,
} from "../api/backend";
import type { AnalysisReport } from "../api/backend";
import useAutoRefresh from "../hooks/useAutoRefresh";

export default function AnalysisCenterPage() {
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedReport, setSelectedReport] = useState<AnalysisReport | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [triggerMessage, setTriggerMessage] = useState("");
  const [listLoading, setListLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const detailRequestSeqRef = useRef(0);
  const detailRootCauses = selectedReport?.rootCauses ?? [];
  const detailCausalEdges = selectedReport?.causalEdges ?? [];

  const formatTriggerStatus = (status: "processing" | "partial" | "failed" | "skipped"): string => {
    if (status === "processing") return "聚合分析任务已受理，正在生成报告。";
    if (status === "partial") return "聚合分析任务已受理，部分数据处理失败，请关注结果状态。";
    if (status === "skipped") return "当前没有异常设备，未生成新的分析任务。";
    return "聚合分析任务触发失败，请稍后重试。";
  };

  const selectReport = async (id: number) => {
    const requestSeq = ++detailRequestSeqRef.current;
    setSelectedId(id);
    setDetailLoading(true);
    try {
      const report = await fetchAnalysisReport(id);
      if (requestSeq === detailRequestSeqRef.current) {
        setSelectedReport(report);
      }
    } catch (error) {
      if (requestSeq === detailRequestSeqRef.current) {
        setErrorMessage(error instanceof Error ? error.message : String(error));
      }
    } finally {
      if (requestSeq === detailRequestSeqRef.current) {
        setDetailLoading(false);
      }
    }
  };

  const loadReports = async (preferredReportId?: number | null) => {
    if (listLoading) {
      return;
    }
    try {
      setListLoading(true);
      const list = await fetchAnalysisReports(30);
      setReports(list);
      if (list.length === 0) {
        setSelectedId(null);
        setSelectedReport(null);
        return;
      }
      let nextReportId = preferredReportId ?? selectedId;
      if (nextReportId === null || nextReportId === undefined) {
        nextReportId = list[0].id;
      }
      if (!list.some((item) => item.id === nextReportId)) {
        nextReportId = list[0].id;
      }
      await selectReport(nextReportId);
    } finally {
      setListLoading(false);
    }
  };

  useAutoRefresh({
    intervalMs: 1000,
    runWhenHidden: true,
    onTick: async () => {
      setTriggerMessage("");
      await loadReports();
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    },
  });

  return (
    <div className="analysis-page">
      <div className="header">
        <div className="title">AI Analysis Center</div>
      </div>

      <div className="trigger-panel">
        <div className="panel-title">手动触发分析</div>
        <form
          className="trigger-form"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              setSubmitting(true);
              setErrorMessage("");
              setTriggerMessage("");
              const result = await triggerAnalysisReport();
              setTriggerMessage(`${formatTriggerStatus(result.status)}（任务ID：${result.triggerId}）`);
              if (result.reportId !== null) {
                await selectReport(result.reportId);
              }
              await loadReports(result.reportId);
            } catch (error) {
              setErrorMessage(error instanceof Error ? error.message : String(error));
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <button type="submit" disabled={submitting}>
            {submitting ? "提交中..." : "触发分析"}
          </button>
        </form>
        {triggerMessage ? <div className="status success">{triggerMessage}</div> : null}
      </div>

      {errorMessage ? <div className="status error">{errorMessage}</div> : null}
      <div className="layout analysis-layout">
        <div className="list">
          <div className="list-title">分析结果</div>
          {reports.map((report) => (
            <div
              key={report.id}
              className={`item ${report.id === selectedId ? "active" : ""}`.trim()}
              onClick={() => {
                void selectReport(report.id);
              }}
            >
              <div className="item-head">
                <div className="report-id">#{report.id}</div>
                <div className="report-time">{report.createdAt}</div>
              </div>
              <div className="meta">
                <span>{report.status}</span>
                <span>{report.riskLevel || "-"}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="detail">
          {!selectedReport ? <div className="placeholder">请选择左侧分析报告查看详情</div> : null}
          {selectedReport ? (
            <>
              <h3 className="detail-title">#{selectedReport.id}</h3>
              <p className="detail-time">生成时间 {selectedReport.createdAt}</p>
              <p>
                <strong>设备:</strong> {selectedReport.deviceCode}
              </p>
              <p>
                <strong>状态:</strong> {selectedReport.status}
              </p>
              <p>
                <strong>分析引擎:</strong> {selectedReport.engine ?? "-"}
              </p>
              <p>
                <strong>RCA 状态:</strong> {selectedReport.rcaStatus ?? "-"}
              </p>
              <p>
                <strong>模型版本:</strong> {selectedReport.modelVersion ?? "-"}
              </p>
              <p>
                <strong>证据时间窗:</strong>{" "}
                {selectedReport.evidenceWindowStart && selectedReport.evidenceWindowEnd
                  ? `${selectedReport.evidenceWindowStart} ~ ${selectedReport.evidenceWindowEnd}`
                  : "-"}
              </p>
              <p>
                <strong>置信度:</strong> {selectedReport.confidence ?? "-"}
              </p>
              <p>
                <strong>风险等级:</strong> {selectedReport.riskLevel ?? "-"}
              </p>
              <p>
                <strong>预测结果:</strong> {selectedReport.prediction ?? "-"}
              </p>
              <p>
                <strong>建议动作:</strong> {selectedReport.recommendedAction ?? "-"}
              </p>
              <p>
                <strong>错误信息:</strong> {selectedReport.errorMessage ?? "-"}
              </p>
              <p>
                <strong>指标摘要:</strong> {selectedReport.metricSummary}
              </p>
              <div className="analysis-rca-section">
                <strong>Top Root Causes:</strong>
                {selectedReport.status === "processing" ? (
                  <p>分析进行中，请稍候...</p>
                ) : detailRootCauses.length === 0 ? (
                  <p>当前报告没有结构化 RCA 结果，可能走了 fallback 路径。</p>
                ) : (
                  <ul>
                    {detailRootCauses.map((item) => (
                      <li key={`${item.deviceCode}-${item.rank}`}>
                        #{item.rank ?? "-"} {item.deviceCode} ({item.score ?? 0})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="analysis-rca-section">
                <strong>Causal Edges:</strong>
                {selectedReport.status === "processing" ? (
                  <p>分析进行中，请稍候...</p>
                ) : detailCausalEdges.length === 0 ? (
                  <p>无因果边结果。</p>
                ) : (
                  <ul>
                    {detailCausalEdges.map((item, index) => (
                      <li key={`${item.fromDeviceCode}-${item.toDeviceCode}-${index}`}>
                        {item.fromDeviceCode} → {item.toDeviceCode} ({item.weight ?? 0})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

