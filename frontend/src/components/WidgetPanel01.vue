<template>
  <LayoutPanel title="设备故障变化率">
    <div v-if="loadError || apiError" class="chart-fallback">
      {{ loadError || apiError }}
    </div>
    <div v-else class="container" ref="container"></div>
  </LayoutPanel>
</template>
<script setup lang="ts">
import { inject, nextTick, onMounted, ref, watch } from "vue";
import useEcharts from "@/hooks/useEcharts";
import { CHART_MOTION } from "@/utils/chartMotion";
import { fetchDashboardSummary } from "@/api/backend";
import LayoutPanel from "./LayoutPanel.vue";

const { container, setOption, loadError } = useEcharts();
const apiError = ref<string | null>(null);
const dashboardSummaryVersion = inject("dashboardSummaryVersion", ref(0));

const generateOptions = (labels: string[], values: number[]) => ({
  animation: true,
  animationDuration: CHART_MOTION.appearDuration,
  animationEasing: CHART_MOTION.easing,
  animationDurationUpdate: CHART_MOTION.updateDuration,
  animationEasingUpdate: CHART_MOTION.easingUpdate,
  legend: {
    show: false,
  },
  tooltip: {
    trigger: "axis" as const,
    backgroundColor: "rgba(16, 16, 16, 0.96)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    textStyle: {
      color: "#f2f1ed",
    },
    formatter(params: any) {
      const data = params[0];
      return `<div style="padding: 5px 0;">
          <div style="color: #cbc9c3; font-size: 14px;">${data.name}</div>
          <div style="color: #c8a36a; font-size: 16px; margin-top: 5px;">故障变化率: ${data.value}%</div>
        </div>`;
    },
  },
  grid: {
    left: "4%",
    right: "4%",
    bottom: "0%",
    top: "20%",
    containLabel: true,
  },
  xAxis: {
    type: "category" as const,
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: "#9f9d97",
      margin: 10,
      fontSize: 12,
      interval: 9, // 每隔 10 个数据点显示一个标签，避免重叠
    },
    data: labels,
  },
  yAxis: {
    type: "value" as const,
    name: "故障变化率(%)",
    nameTextStyle: {
      color: "#9f9d97",
      fontSize: 12,
    },
    axisLabel: {
      color: "#9f9d97",
    },
    splitLine: {
      lineStyle: {
        color: "rgba(255, 255, 255, 0.12)",
        type: "dashed" as const,
      },
    },
    min: 0,
    max: 100,
  },
  series: [
    {
      name: "故障变化率",
      type: "line" as const,
      smooth: true,
      symbol: "none",
      emphasis: {
        focus: "series" as const,
      },
      lineStyle: {
        color: "rgba(200, 163, 106, 1)",
        width: 2,
        shadowColor: "rgba(200, 163, 106, 0.35)",
        shadowBlur: 8,
      },
      areaStyle: {
        color: {
          type: "linear" as const,
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "rgba(200, 163, 106, 0.3)" },
            { offset: 1, color: "rgba(200, 163, 106, 0.02)" },
          ],
          global: false,
        },
      },
      data: values,
    },
  ],
});

const loadChart = async () => {
  try {
    const summary = await fetchDashboardSummary();
    const options = generateOptions(
      summary.faultRate.labels,
      summary.faultRate.values
    );
    await setOption(options);
    apiError.value = null;
  } catch (error) {
    apiError.value = `图表数据加载失败: ${
      error instanceof Error ? error.message : String(error)
    }`;
  }
};

onMounted(() => {
  nextTick(async () => {
    await loadChart();
  });
});

watch(dashboardSummaryVersion, async () => {
  await loadChart();
});
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
  animation: chart-fade-in var(--tw-motion-duration-enter)
    var(--tw-motion-ease-enter) both;
}

.chart-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 10px;
  color: var(--tw-color-text-secondary);
  font-size: 13px;
  text-align: center;
  background: linear-gradient(
    135deg,
    rgba(30, 30, 30, 0.5) 0%,
    rgba(12, 12, 12, 0.72) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  animation: chart-fade-in var(--tw-motion-duration-enter)
    var(--tw-motion-ease-enter) both;
}

@keyframes chart-fade-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
