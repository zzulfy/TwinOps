<template>
  <LayoutPanel title="资源利用率监测">
    <div v-if="loadError" class="chart-fallback">{{ loadError }}</div>
    <div v-else class="container" ref="container"></div>
  </LayoutPanel>
</template>
<script setup lang="ts">
import { nextTick, onMounted } from "vue";
import useEcharts from "@/hooks/useEcharts";
import LayoutPanel from "./LayoutPanel.vue";
import { CHART_MOTION } from "@/utils/chartMotion";

const { container, setOption, loadError } = useEcharts();

const generateOptions = () => ({
  animation: true,
  animationDuration: CHART_MOTION.appearDuration,
  animationEasing: CHART_MOTION.easing,
  animationDurationUpdate: CHART_MOTION.updateDuration,
  animationEasingUpdate: CHART_MOTION.easingUpdate,
  legend: {
    show: true,
    right: 0,
    textStyle: {
      color: "#9f9d97",
    },
  },
  tooltip: {
    trigger: "axis" as const,
    backgroundColor: "rgba(16, 16, 16, 0.96)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    textStyle: {
      color: "#f2f1ed",
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
    },
    data: [...Array(30).keys()],
  },
  yAxis: {
    type: "value" as const,
    axisLabel: {
      color: "#9f9d97",
    },
    splitLine: {
      lineStyle: {
        color: "rgba(255, 255, 255, 0.12)",
        type: "dashed" as const,
      },
    },
  },
  series: [
    {
      smooth: true,
      showSymbol: false,
      emphasis: {
        focus: "series" as const,
      },
      data: Array.from({ length: 30 }).map(() => Math.random() * 90 + 10),
      type: "bar" as const,
      itemStyle: {
        color: {
          type: "linear" as const,
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "rgba(213, 211, 205, 0.95)" },
            { offset: 1, color: "rgba(213, 211, 205, 0.24)" },
          ],
          global: false,
        },
        borderRadius: [3, 3, 0, 0],
      },
    },
  ],
});

onMounted(() => {
  nextTick(async () => {
    const options = generateOptions();
    await setOption(options);
  });
});
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
  animation: chart-fade-in var(--tw-motion-duration-enter-slow) var(--tw-motion-ease-enter) var(--tw-motion-stagger-2) both;
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
  background: linear-gradient(135deg, rgba(30, 30, 30, 0.5) 0%, rgba(12, 12, 12, 0.72) 100%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  animation: chart-fade-in var(--tw-motion-duration-enter-slow) var(--tw-motion-ease-enter) var(--tw-motion-stagger-2) both;
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
