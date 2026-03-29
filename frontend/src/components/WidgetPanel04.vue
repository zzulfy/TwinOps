<template>
  <LayoutPanel title="设备规模">
    <div class="weather-scroll-area">
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
import LayoutPanel from "./LayoutPanel.vue";

const source = [
  {
    icon: "fa-solid fa-server",
    label: "服务器机柜",
    value: "23",
    unit: "个",
  },
  {
    icon: "fa-solid fa-network-wired",
    label: "网络设备",
    value: "23",
    unit: "个",
  },
  {
    icon: "fa-solid fa-bolt",
    label: "电源柜",
    value: "23",
    unit: "个",
  },
  {
    icon: "fa-solid fa-temperature-three-quarters",
    label: "温湿度传感器",
    value: "11",
    unit: "个",
  },
  {
    icon: "fa-solid fa-snowflake",
    label: "空调系统",
    value: "63",
    unit: "个",
  },
  {
    icon: "fa-solid fa-shield-alt",
    label: "防火墙",
    value: "23",
    unit: "个",
  },
  {
    icon: "fa-solid fa-ethernet",
    label: "交换机",
    value: "12",
    unit: "个",
  },
  {
    icon: "fa-solid fa-database",
    label: "存储设备",
    value: "12",
    unit: "个",
  },
  {
    icon: "fa-solid fa-video",
    label: "监控设备",
    value: "13",
    unit: "个",
  },
];
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
