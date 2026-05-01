import { useRef, useState } from "react";
import {
  fetchAnalysisReport,
  fetchAnalysisReports,
  triggerAnalysisReport,
} from "../api/backend";
import type { AnalysisReport } from "../api/backend";
import useAutoRefresh from "../hooks/useAutoRefresh";

function parseInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function renderMarkdown(text: string | null) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={i} className="report-h3">
          {parseInline(line.slice(4))}
        </h4>
      );
      i++;
    } else if (line.startsWith("## ")) {
      elements.push(
        <h3 key={i} className="report-h2">
          {parseInline(line.slice(3))}
        </h3>
      );
      i++;
    } else if (line.startsWith("|-") || line.startsWith("| ")) {
      const rows: string[][] = [];
      let headerPassed = false;
      while (i < lines.length && lines[i].startsWith("|")) {
        const cells = lines[i].split("|").slice(1, -1).map(c => c.trim());
        if (cells.length > 0 && !cells.every(c => /^-+$/.test(c))) {
          rows.push(cells);
        } else {
          headerPassed = true;
        }
        i++;
      }
      if (rows.length > 0) {
        const header = rows[0];
        const body = rows.slice(1);
        elements.push(
          <table key={i} className="report-table">
            <thead>
              <tr>{header.map((cell, ci) => <th key={ci}>{parseInline(cell)}</th>)}</tr>
            </thead>
            <tbody>
              {body.map((row, ri) => (
                <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{parseInline(cell)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        );
      }
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={i} className="report-list">
          {items.map((item, idx) => (
            <li key={idx}>{parseInline(item)}</li>
          ))}
        </ul>
      );
    } else if (line.match(/^\d+\.\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={i} className="report-list">
          {items.map((item, idx) => (
            <li key={idx}>{parseInline(item)}</li>
          ))}
        </ol>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="report-spacer" />);
      i++;
    } else {
      elements.push(
        <p key={i} className="report-para">
          {parseInline(line)}
        </p>
      );
      i++;
    }
  }
  return elements;
}

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

              {selectedReport.status === "processing" ? (
                <div className="processing-notice">分析进行中，请稍候...</div>
              ) : null}

              {selectedReport.report ? (
                <div className="report-card">
                  <div className="report-card-label">综合报告</div>
                  <div className="report-card-body">{renderMarkdown(selectedReport.report)}</div>
                </div>
              ) : null}

              <div className="detail-meta-grid">
                <div className="meta-item">
                  <span className="meta-label">设备</span>
                  <span className="meta-value">{selectedReport.deviceCode}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">状态</span>
                  <span className={`meta-value status-tag status-${selectedReport.status}`}>{selectedReport.status}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">分析引擎</span>
                  <span className="meta-value">{selectedReport.engine ?? "-"}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">RCA 状态</span>
                  <span className="meta-value">{selectedReport.rcaStatus ?? "-"}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">风险等级</span>
                  <span className={`meta-value risk-tag risk-${selectedReport.riskLevel ?? "unknown"}`}>
                    {selectedReport.riskLevel ?? "-"}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">置信度</span>
                  <span className="meta-value">{selectedReport.confidence ?? "-"}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">模型版本</span>
                  <span className="meta-value">{selectedReport.modelVersion ?? "-"}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">证据时间窗</span>
                  <span className="meta-value">
                    {selectedReport.evidenceWindowStart && selectedReport.evidenceWindowEnd
                      ? `${selectedReport.evidenceWindowStart} ~ ${selectedReport.evidenceWindowEnd}`
                      : "-"}
                  </span>
                </div>
              </div>

              <div className="analysis-rca-grid">
                <div className="analysis-rca-section">
                  <strong>Top Root Causes</strong>
                  {selectedReport.status === "processing" ? (
                    <p>等待分析完成...</p>
                  ) : detailRootCauses.length === 0 ? (
                    <p>当前报告没有结构化 RCA 结果，可能走了 fallback 路径。</p>
                  ) : (
                    <ul>
                      {detailRootCauses.map((item) => (
                        <li key={`${item.deviceCode}-${item.rank}`}>
                          <span className="rca-rank">#{item.rank ?? "-"}</span>
                          <span className="rca-name">{item.deviceCode}</span>
                          <span className="rca-score">{item.score ?? 0}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="analysis-rca-section">
                  <strong>Causal Edges</strong>
                  {selectedReport.status === "processing" ? (
                    <p>等待分析完成...</p>
                  ) : detailCausalEdges.length === 0 ? (
                    <p>无因果边结果。</p>
                  ) : (
                    <ul>
                      {detailCausalEdges.map((item, index) => (
                        <li key={`${item.fromDeviceCode}-${item.toDeviceCode}-${index}`}>
                          <span className="edge-from">{item.fromDeviceCode}</span>
                          <span className="edge-arrow">→</span>
                          <span className="edge-to">{item.toDeviceCode}</span>
                          <span className="edge-weight">{item.weight ?? 0}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="detail-extra">
                <p><strong>预测结果:</strong> {selectedReport.prediction ?? "-"}</p>
                <p><strong>建议动作:</strong> {selectedReport.recommendedAction ?? "-"}</p>
                {selectedReport.errorMessage ? (
                  <p><strong>错误信息:</strong> {selectedReport.errorMessage}</p>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
