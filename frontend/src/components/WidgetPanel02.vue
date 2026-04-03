<template>
  <LayoutPanel title="服务器负载变化">
    <div v-if="loadError" class="chart-fallback">{{ loadError }}</div>
    <div v-else class="container" ref="container"></div>
  </LayoutPanel>
</template>
<script setup lang="ts">
import { nextTick, onMounted } from "vue";
import { sampleSize, range } from "lodash";
import useEcharts from "@/hooks/useEcharts";
import { CHART_MOTION } from "@/utils/chartMotion";
import LayoutPanel from "./LayoutPanel.vue";

const { container, setOption, loadError } = useEcharts();

const generateOptions = (sources: number[][]) => ({
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
    left: "1%",
    right: "6%",
    bottom: "0%",
    top: "20%",
    containLabel: true,
  },
  xAxis: {
    type: "category" as const,
    boundaryGap: false,
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: "#9f9d97",
      margin: 20,
    },
    data: ["11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
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
      name: "1#",
      type: "line" as const,
      symbol: "none",
      smooth: true,
      emphasis: {
        focus: "series" as const,
      },
      lineStyle: {
        width: 2,
        color: "rgba(213, 211, 205, 1)",
        shadowColor: "rgba(213, 211, 205, 0.25)",
        shadowBlur: 8,
      },
      itemStyle: {
        color: "rgba(213, 211, 205, 0.6)",
      },
      // areaStyle: {},
      data: sources[0],
    },
    {
      name: "2#",
      type: "line" as const,
      symbol: "none",
      smooth: true,
      emphasis: {
        focus: "series" as const,
      },
      lineStyle: {
        width: 2,
        color: "rgba(134, 161, 127, 1)",
        shadowColor: "rgba(134, 161, 127, 0.25)",
        shadowBlur: 8,
      },
      itemStyle: {
        color: "rgba(134, 161, 127, 0.6)",
      },
      // areaStyle: {},
      data: sources[1],
    },
    {
      name: "3#",
      type: "line" as const,
      symbol: "none",
      smooth: true,
      emphasis: {
        focus: "series" as const,
      },
      lineStyle: {
        width: 2,
        color: "rgba(200, 163, 106, 1)",
        shadowColor: "rgba(200, 163, 106, 0.28)",
        shadowBlur: 8,
      },
      itemStyle: {
        color: "rgba(200, 163, 106, 0.6)",
      },
      // areaStyle: {},
      data: sources[2],
    },
  ],
});

onMounted(() => {
  nextTick(async () => {
    const sources = [
      sampleSize(range(1000, 200), 7),
      sampleSize(range(1000, 200), 7),
      sampleSize(range(1000, 200), 7),
    ];
    const options = generateOptions(sources);
    await setOption(options);
  });
});
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
  animation: chart-fade-in var(--tw-motion-duration-enter)
    var(--tw-motion-ease-enter) var(--tw-motion-stagger-1) both;
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
    var(--tw-motion-ease-enter) var(--tw-motion-stagger-1) both;
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
