package com.twinops.backend.analysis.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@TableName("analysis_reports")
public class AnalysisReportEntity {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String deviceCode;
    private String metricSummary;
    private String prediction;
    private BigDecimal confidence;
    private String riskLevel;
    private String recommendedAction;
    private String status;
    private String errorMessage;
    private String engine;
    private String rcaStatus;
    private String rootCausesJson;
    private String causalGraphJson;
    private String modelVersion;
    private String idempotencyKey;
    private LocalDateTime evidenceWindowStart;
    private LocalDateTime evidenceWindowEnd;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDeviceCode() { return deviceCode; }
    public void setDeviceCode(String deviceCode) { this.deviceCode = deviceCode; }
    public String getMetricSummary() { return metricSummary; }
    public void setMetricSummary(String metricSummary) { this.metricSummary = metricSummary; }
    public String getPrediction() { return prediction; }
    public void setPrediction(String prediction) { this.prediction = prediction; }
    public BigDecimal getConfidence() { return confidence; }
    public void setConfidence(BigDecimal confidence) { this.confidence = confidence; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public String getEngine() { return engine; }
    public void setEngine(String engine) { this.engine = engine; }
    public String getRcaStatus() { return rcaStatus; }
    public void setRcaStatus(String rcaStatus) { this.rcaStatus = rcaStatus; }
    public String getRootCausesJson() { return rootCausesJson; }
    public void setRootCausesJson(String rootCausesJson) { this.rootCausesJson = rootCausesJson; }
    public String getCausalGraphJson() { return causalGraphJson; }
    public void setCausalGraphJson(String causalGraphJson) { this.causalGraphJson = causalGraphJson; }
    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
    public LocalDateTime getEvidenceWindowStart() { return evidenceWindowStart; }
    public void setEvidenceWindowStart(LocalDateTime evidenceWindowStart) { this.evidenceWindowStart = evidenceWindowStart; }
    public LocalDateTime getEvidenceWindowEnd() { return evidenceWindowEnd; }
    public void setEvidenceWindowEnd(LocalDateTime evidenceWindowEnd) { this.evidenceWindowEnd = evidenceWindowEnd; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
