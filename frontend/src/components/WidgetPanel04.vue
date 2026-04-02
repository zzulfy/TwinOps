<template>
  <LayoutPanel title="设备规模">
    <div class="weather-scroll-area">
      <div v-if="errorMessage" class="panel-message">{{ errorMessage }}</div>
      <div v-else-if="source.length === 0" class="panel-message">暂无设备规模数据</div>
      <div class="weather-monitor">
        <div
          v-for="(item, index) in source"
          :key="index"
          class="widget-weather-item"
        >
          <div class="weather-icon" :class="item.icon"></div>
          <div class="weather-label">{{ item.label }}</div>
          <div class="weather-value">
            <span class="value">{{ item.value }}</span>
            <span class="unit">{{ item.unit }}</span>
          </div>
        </div>
      </div>
    </div>
  </LayoutPanel>
</template>
<script setup lang="ts">
import { inject, onMounted, ref, watch } from "vue";
import LayoutPanel from "./LayoutPanel.vue";
import { fetchDashboardSummary } from "@/api/backend";

const source = ref<Array<{ icon: string; label: string; value: string; unit: string }>>([]);
const errorMessage = ref("");
const dashboardSummaryVersion = inject("dashboardSummaryVersion", ref(0));

const loadSummary = async () => {
  try {
    const summary = await fetchDashboardSummary();
    source.value = summary.deviceScale;
    errorMessage.value = "";
  } catch (error) {
    errorMessage.value = `设备规模加载失败: ${error instanceof Error ? error.message : String(error)}`;
  }
};

onMounted(async () => {
  await loadSummary();
});

watch(dashboardSummaryVersion, async () => {
  await loadSummary();
});
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
}

:deep(.panel-body) {
  display: flex;
  min-height: 0;
  overflow: hidden;
}

.weather-scroll-area {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: 10px;
  padding-right: 4px;
  padding-bottom: 6px;
}

.panel-message {
  padding: 10px;
  font-size: 13px;
  color: var(--tw-color-text-secondary);
  border: 1px solid var(--tw-border-soft);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.72);
  margin-bottom: 8px;
}

.weather-monitor {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  grid-auto-rows: minmax(84px, auto);
  grid-gap: 12px;
  padding-bottom: 8px;

  $icon-size: 34px;
  .widget-weather-item {
    box-sizing: border-box;
    display: grid;
    grid-template-rows: repeat(2, 1fr);
    grid-template-columns: $icon-size auto;
    grid-column-gap: 10px;
    align-items: center;
    width: 100%;
    min-height: 84px;
    padding: 0 8px;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.96) 0%, rgba(244, 249, 255, 0.93) 100%);
    border: 1px solid var(--tw-border-panel);
    border-radius: 8px;
    transition: all 0.3s ease;
    box-shadow: var(--tw-shadow-panel);

    &:hover {
      box-shadow: var(--tw-shadow-panel-hover);
      transform: translateY(-1px);
      border-color: var(--tw-border-strong);
    }

    .weather-icon {
      display: flex;
      grid-row: 1 /3;
      align-items: center;
      justify-content: center;
      width: $icon-size;
      height: $icon-size;
      border: 1px solid rgba(92, 128, 160, 0.32);
      border-radius: 50%;
      color: var(--tw-color-text-primary);
      background: radial-gradient(circle, rgba(94, 146, 194, 0.16) 0%, rgba(255, 255, 255, 0.86) 72%);
    }

    .weather-label {
      margin-top: 10px;
      font-size: 13px;
      color: var(--tw-color-text-secondary);
      font-weight: 600;
    }

    .weather-value {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin-bottom: 6px;
      color: var(--tw-color-text-primary);

      .value {
        font-size: 20px;
        line-height: 1;
        font-weight: 700;
      }

      .unit {
        font-size: 12px;
        color: var(--tw-color-text-muted);
      }
    }
  }
}

@media (max-width: 420px) {
  .weather-monitor {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>
