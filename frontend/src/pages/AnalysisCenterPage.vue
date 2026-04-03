<template>
  <div class="analysis-page">
    <div class="header">
      <button class="back-btn" @click="goDashboard">返回看板</button>
      <div class="title">AI Analysis Center</div>
    </div>

    <div class="create-box">
      <input v-model.trim="deviceCode" type="text" placeholder="deviceCode" />
      <textarea v-model.trim="metricSummary" rows="3" placeholder="Metric summary for prediction" />
      <button :disabled="submitting" @click="submitReport">{{ submitting ? "提交中..." : "提交分析" }}</button>
    </div>

    <div v-if="errorMessage" class="status error">{{ errorMessage }}</div>
    <div class="layout">
      <div class="list">
        <div class="list-title">Reports</div>
        <div v-for="report in reports" :key="report.id" class="item" :class="{ active: report.id === selectedId }" @click="selectReport(report.id)">
          <div>#{{ report.id }} · {{ report.deviceCode }}</div>
          <div class="meta">
            <span>{{ report.status }}</span>
            <span>{{ report.riskLevel || "-" }}</span>
            <span>{{ report.createdAt }}</span>
          </div>
        </div>
      </div>

      <div class="detail">
        <div v-if="!selectedReport" class="placeholder">请选择左侧分析报告查看详情</div>
        <template v-else>
          <h3>Report #{{ selectedReport.id }}</h3>
          <p><strong>Device:</strong> {{ selectedReport.deviceCode }}</p>
          <p><strong>Status:</strong> {{ selectedReport.status }}</p>
          <p><strong>Confidence:</strong> {{ selectedReport.confidence ?? "-" }}</p>
          <p><strong>Risk:</strong> {{ selectedReport.riskLevel ?? "-" }}</p>
          <p><strong>Prediction:</strong> {{ selectedReport.prediction ?? "-" }}</p>
          <p><strong>Recommended Action:</strong> {{ selectedReport.recommendedAction ?? "-" }}</p>
          <p><strong>Error:</strong> {{ selectedReport.errorMessage ?? "-" }}</p>
          <p><strong>Metric Summary:</strong> {{ selectedReport.metricSummary }}</p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  createAnalysisReport,
  fetchAnalysisReport,
  fetchAnalysisReports,
  type AnalysisReport,
} from "@/api/backend";

const router = useRouter();
const reports = ref<AnalysisReport[]>([]);
const selectedId = ref<number | null>(null);
const selectedReport = ref<AnalysisReport | null>(null);
const deviceCode = ref("");
const metricSummary = ref("");
const submitting = ref(false);
const errorMessage = ref("");

const loadReports = async () => {
  reports.value = await fetchAnalysisReports(30);
  if (reports.value.length > 0 && selectedId.value === null) {
    await selectReport(reports.value[0].id);
  }
};

const selectReport = async (id: number) => {
  selectedId.value = id;
  selectedReport.value = await fetchAnalysisReport(id);
};

const submitReport = async () => {
  if (!deviceCode.value || !metricSummary.value) {
    errorMessage.value = "deviceCode 和 metric summary 必填";
    return;
  }
  submitting.value = true;
  errorMessage.value = "";
  try {
    const created = await createAnalysisReport(deviceCode.value, metricSummary.value);
    await loadReports();
    await selectReport(created.id);
    metricSummary.value = "";
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : String(error);
  } finally {
    submitting.value = false;
  }
};

const goDashboard = () => router.push({ name: "dashboard" });

onMounted(async () => {
  try {
    await loadReports();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : String(error);
  }
});
</script>

<style scoped lang="scss">
.analysis-page {
  min-height: 100%;
  padding: 16px;
  background: linear-gradient(145deg, var(--tw-bg-ink) 0%, var(--tw-bg-deep) 54%, var(--tw-bg-haze) 100%);
  color: var(--tw-color-text-primary);
}
.header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.title {
  font-size: 24px;
  font-family: Douyu;
}
.back-btn,
.create-box button {
  height: 34px;
  padding: 0 12px;
  color: #e3f0ff;
  cursor: pointer;
  background: linear-gradient(120deg, var(--tw-cta-start) 0%, var(--tw-cta-end) 100%);
  border: 1px solid var(--tw-cta-border);
  border-radius: 18px;
}
.create-box {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 220px 1fr auto;
  gap: 10px;
}
.create-box input,
.create-box textarea {
  border: 1px solid var(--tw-border-soft);
  border-radius: 8px;
  color: #dff0ff;
  background: rgba(12, 28, 48, 0.8);
  padding: 8px 10px;
}
.layout {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 12px;
}
.list,
.detail {
  border: 1px solid var(--tw-border-soft);
  border-radius: 12px;
  background: rgba(12, 28, 48, 0.82);
  padding: 10px;
}
.list-title {
  font-size: 14px;
  margin-bottom: 6px;
}
.item {
  border: 1px solid rgba(126, 161, 192, 0.2);
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 8px;
  cursor: pointer;
}
.item.active {
  border-color: #7cb9ff;
  box-shadow: inset 0 0 0 1px rgba(124, 185, 255, 0.36);
}
.meta {
  margin-top: 4px;
  font-size: 12px;
  color: #9fc5f7;
  display: flex;
  gap: 8px;
}
.placeholder {
  color: #9fc5f7;
}
.status.error {
  margin-top: 12px;
  color: #ffd2d2;
}
</style>
