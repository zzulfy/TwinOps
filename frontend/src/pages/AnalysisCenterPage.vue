<template>
  <div class="analysis-page">
    <div class="header">
      <button class="back-btn" @click="goDashboard">返回看板</button>
      <div class="title">AI Analysis Center</div>
    </div>

    <div class="trigger-panel">
      <div class="panel-title">手动触发分析</div>
      <form class="trigger-form" @submit.prevent="submitTrigger">
        <button type="submit" :disabled="submitting">
          {{ submitting ? "提交中..." : "触发分析" }}
        </button>
      </form>
      <div v-if="triggerMessage" class="status success">{{ triggerMessage }}</div>
    </div>

    <div v-if="errorMessage" class="status error">{{ errorMessage }}</div>
    <div class="layout">
      <div class="list">
        <div class="list-title">分析结果</div>
        <div
          v-for="report in reports"
          :key="report.id"
          class="item"
          :class="{ active: report.id === selectedId }"
          @click="selectReport(report.id)"
        >
          <div>#{{ report.id }} · {{ report.deviceCode }}</div>
          <div class="meta">
            <span>{{ report.status }}</span>
            <span>{{ report.riskLevel || "-" }}</span>
            <span>{{ report.createdAt }}</span>
          </div>
        </div>
      </div>

      <div class="detail">
        <div v-if="!selectedReport" class="placeholder">
          请选择左侧分析报告查看详情
        </div>
        <template v-else>
           <h3>分析报告 #{{ selectedReport.id }}</h3>
           <p><strong>设备:</strong> {{ selectedReport.deviceCode }}</p>
           <p><strong>状态:</strong> {{ selectedReport.status }}</p>
           <p>
             <strong>置信度:</strong> {{ selectedReport.confidence ?? "-" }}
           </p>
           <p><strong>风险等级:</strong> {{ selectedReport.riskLevel ?? "-" }}</p>
           <p>
             <strong>预测结果:</strong> {{ selectedReport.prediction ?? "-" }}
           </p>
           <p>
             <strong>建议动作:</strong>
             {{ selectedReport.recommendedAction ?? "-" }}
           </p>
           <p>
             <strong>错误信息:</strong> {{ selectedReport.errorMessage ?? "-" }}
           </p>
           <p>
             <strong>指标摘要:</strong> {{ selectedReport.metricSummary }}
           </p>
         </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  triggerAnalysisReport,
  fetchAnalysisReport,
  fetchAnalysisReports,
  type AnalysisReport,
} from "@/api/backend";

const router = useRouter();
const reports = ref<AnalysisReport[]>([]);
const selectedId = ref<number | null>(null);
const selectedReport = ref<AnalysisReport | null>(null);
const errorMessage = ref("");
const submitting = ref(false);
const triggerMessage = ref("");

const formatTriggerStatus = (
  status: "processing" | "partial" | "failed"
): string => {
  if (status === "processing") {
    return "聚合分析任务已受理，正在生成报告。";
  }
  if (status === "partial") {
    return "聚合分析任务已受理，部分数据处理失败，请关注结果状态。";
  }
  return "聚合分析任务触发失败，请稍后重试。";
};

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

const submitTrigger = async () => {
  submitting.value = true;
  errorMessage.value = "";
  triggerMessage.value = "";
  try {
    const result = await triggerAnalysisReport();
    triggerMessage.value = `${formatTriggerStatus(result.status)}（任务ID：${result.triggerId}）`;
    await loadReports();
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
  background: linear-gradient(
    145deg,
    var(--tw-bg-ink) 0%,
    var(--tw-bg-deep) 54%,
    var(--tw-bg-haze) 100%
  );
  color: var(--tw-color-text-primary);
}
.header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.title {
  font-size: 24px;
  font-family: var(--tw-font-title);
}
.back-btn {
  height: 34px;
  padding: 0 12px;
  color: var(--tw-color-text-on-dark);
  cursor: pointer;
  background: linear-gradient(
    120deg,
    var(--tw-cta-start) 0%,
    var(--tw-cta-end) 100%
  );
  border: 1px solid var(--tw-cta-border);
  border-radius: 18px;
}

.trigger-panel {
  margin-top: 14px;
  padding: 10px 12px;
  border: 1px solid var(--tw-border-soft);
  border-radius: 8px;
  color: var(--tw-color-text-on-dark);
  background: rgba(20, 56, 98, 0.72);
  font-family: var(--tw-font-body);
}
.panel-title {
  font-weight: 600;
  margin-bottom: 8px;
}
.trigger-form {
  display: flex;
  justify-content: flex-start;
}
.trigger-form button {
  height: 34px;
  padding: 0 14px;
  border-radius: 18px;
  border: 1px solid var(--tw-cta-border);
  background: linear-gradient(
    120deg,
    var(--tw-cta-start) 0%,
    var(--tw-cta-end) 100%
  );
  color: var(--tw-color-text-on-dark);
  cursor: pointer;
}
.trigger-form button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
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
  color: var(--tw-color-text-on-dark-secondary);
  display: flex;
  gap: 8px;
}
.placeholder {
  color: var(--tw-color-text-on-dark-secondary);
}
.status.error {
  margin-top: 12px;
  color: #ffd2d2;
}
.status.success {
  margin-top: 8px;
  color: #9ff5c8;
}
</style>
