package com.twinops.backend.analysis.service;

import com.twinops.backend.analysis.dto.AnalysisCausalEdgeDto;
import com.twinops.backend.analysis.dto.AnalysisRootCauseDto;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

public interface LlmProviderAdapter {

    LlmPredictionResult predict(String deviceCode, String metricSummary) throws Exception;

    default String generateReport(
        String deviceCode,
        String metricSummary,
        List<AnalysisRootCauseDto> rootCauses,
        List<AnalysisCausalEdgeDto> causalEdges,
        String prediction,
        String riskLevel,
        String recommendedAction
    ) {
        StringBuilder sb = new StringBuilder();

        sb.append("## 指标摘要\n\n");
        sb.append("本次分析覆盖设备 **").append(deviceCode).append("**，关键指标如下：\n\n");
        sb.append(metricSummary != null ? metricSummary : "无指标数据").append("\n\n");

        sb.append("## Top Root Cause 总结\n\n");
        if (rootCauses == null || rootCauses.isEmpty()) {
            sb.append("当前分析未发现显著根因设备，系统运行整体稳定。\n\n");
        } else {
            sb.append("经因果推断，以下设备被识别为主要根因：\n\n");
            sb.append("| 排名 | 设备 | 评分 |\n");
            sb.append("|------|------|------|\n");
            for (AnalysisRootCauseDto rc : rootCauses) {
                sb.append("| #").append(rc.rank() == null ? "-" : rc.rank())
                    .append(" | **").append(rc.deviceCode()).append("**")
                    .append(" | ").append(String.format("%.2f", rc.score() == null ? 0.0 : rc.score()))
                    .append(" |\n");
            }
            sb.append("\n");
        }

        sb.append("## Causal Edges 总结\n\n");
        if (causalEdges == null || causalEdges.isEmpty()) {
            sb.append("未检测到显著的设备间因果传播关系。\n\n");
        } else {
            sb.append("以下因果边揭示了设备间故障传播路径：\n\n");
            sb.append("| 源设备 | 目标设备 | 权重 |\n");
            sb.append("|--------|----------|------|\n");
            for (AnalysisCausalEdgeDto edge : causalEdges) {
                sb.append("| **").append(edge.fromDeviceCode()).append("**")
                    .append(" | ").append(edge.toDeviceCode())
                    .append(" | ").append(String.format("%.2f", edge.weight() == null ? 0.0 : edge.weight()))
                    .append(" |\n");
            }
            sb.append("\n");
        }

        sb.append("## 预测结果\n\n");
        sb.append("- **风险等级**: ").append(riskLevel != null ? riskLevel : "未知").append("\n");
        sb.append("- **预测结论**: ").append(prediction != null ? prediction : "无").append("\n");
        sb.append("- **建议动作**: ").append(recommendedAction != null ? recommendedAction : "无").append("\n\n");

        sb.append("## 未来预防和解决措施\n\n");
        if ("high".equalsIgnoreCase(riskLevel)) {
            sb.append("当前风险较高，建议立即采取以下措施：\n\n");
            sb.append("1. 优先排查根因设备，检查硬件状态与负载情况\n");
            sb.append("2. 对因果链下游设备进行预防性巡检，防止故障级联扩散\n");
            sb.append("3. 准备故障切换预案，确保关键业务连续性\n");
            sb.append("4. 加强监控频率，设置更严格的告警阈值\n");
        } else if ("medium".equalsIgnoreCase(riskLevel)) {
            sb.append("当前风险中等，建议采取以下预防措施：\n\n");
            sb.append("1. 持续关注根因设备的指标变化趋势\n");
            sb.append("2. 在高峰时段提高采样与巡检频率\n");
            sb.append("3. 定期回顾因果图变化，及时发现新增的传播路径\n");
        } else {
            sb.append("当前风险较低，建议保持常规运维策略：\n\n");
            sb.append("1. 按计划执行日常巡检与维护\n");
            sb.append("2. 关注指标长期趋势，预防潜在风险积累\n");
        }

        return sb.toString();
    }

    default LlmPredictionResult fallback(String metricSummary) {
        String normalized = metricSummary == null ? "" : metricSummary.toLowerCase();
        String riskLevel = normalized.contains("overload") || normalized.contains("critical") ? "high" : "medium";
        BigDecimal confidence = "high".equals(riskLevel) ? BigDecimal.valueOf(86.5) : BigDecimal.valueOf(72.0);
        String prediction = "high".equals(riskLevel)
            ? "设备负载在未来 2 小时内可能触发告警阈值，请提前扩容或限流。"
            : "设备运行趋势平稳，但建议持续观察温度与 CPU 负载波动。";
        String action = "high".equals(riskLevel)
            ? "建议立即检查散热与流量策略，并准备故障切换。"
            : "建议保持常规巡检并在高峰时段提高采样频率。";
        return new LlmPredictionResult(prediction, confidence, riskLevel, action);
    }
}
