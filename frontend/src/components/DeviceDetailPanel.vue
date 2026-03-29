<template>
  <div class="device-detail-panel" :class="{ embedded: props.embedded }" @click.stop>
    <div class="header">
      <div class="title">{{ device.name }}</div>
      <div class="close-btn" @click.stop="onClose">×</div>
    </div>
    <div class="content">
      <div class="info-section">
        <div class="info-title">设备基本信息</div>
        <div class="info-item">
          <div class="info-label">设备类型</div>
          <div class="info-value">{{ device.type }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">设备状态</div>
          <div class="info-value" :class="getStatusClass(device.status)">
            {{ getStatusText(device.status) }}
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">设备编号</div>
          <div class="info-value">{{ device.serialNumber }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">安装位置</div>
          <div class="info-value">{{ device.location }}</div>
        </div>
      </div>
      <div class="info-section">
        <div class="info-title">实时参数</div>
        <div class="info-item">
          <div class="info-label">温度</div>
          <div class="info-value">{{ device.temperature }}°C</div>
        </div>
        <div class="info-item">
          <div class="info-label">湿度</div>
          <div class="info-value">{{ device.humidity }}%</div>
        </div>
        <div class="info-item">
          <div class="info-label">电压</div>
          <div class="info-value">{{ device.voltage }}V</div>
        </div>
        <div class="info-item">
          <div class="info-label">电流</div>
          <div class="info-value">{{ device.current }}A</div>
        </div>
        <div class="info-item">
          <div class="info-label">功率</div>
          <div class="info-value">{{ device.power }}W</div>
        </div>
      </div>
      <div class="info-section">
        <div class="info-title">运行状态</div>
        <div class="info-item">
          <div class="info-label">CPU 负载</div>
          <div class="info-value">{{ device.cpuLoad }}%</div>
        </div>
        <div class="info-item">
          <div class="info-label">内存使用</div>
          <div class="info-value">{{ device.memoryUsage }}%</div>
        </div>
        <div class="info-item">
          <div class="info-label">磁盘使用</div>
          <div class="info-value">{{ device.diskUsage }}%</div>
        </div>
        <div class="info-item">
          <div class="info-label">网络流量</div>
          <div class="info-value">{{ device.networkTraffic }} Mbps</div>
        </div>
      </div>
      <div class="info-section">
        <div class="info-title">告警信息</div>
        <div class="alarm-list">
          <div
            class="alarm-item"
            v-for="alarm in device.alarms"
            :key="alarm.id"
          >
            <div
              class="alarm-icon"
              :style="{ background: getAlarmTypeColor(alarm.type) }"
            >
              {{ getAlarmTypeIcon(alarm.type) }}
            </div>
            <div class="alarm-info">
              <div class="alarm-name">{{ alarm.name }}</div>
              <div class="alarm-time">{{ alarm.time }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface DeviceAlarm {
  id: number;
  name: string;
  type: "warning" | "error" | "info";
  time: string;
}

interface DeviceData {
  name: string;
  type: string;
  status: "normal" | "warning" | "error";
  serialNumber: string;
  location: string;
  temperature: number;
  humidity: number;
  voltage: number;
  current: number;
  power: number;
  cpuLoad: number;
  memoryUsage: number;
  diskUsage: number;
  networkTraffic: number;
  alarms: DeviceAlarm[];
}

const props = defineProps<{
  deviceData: DeviceData;
  embedded?: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const device = computed(() => props.deviceData);

const getStatusClass = (status: string) => {
  const classes = {
    normal: "status-normal",
    warning: "status-warning",
    error: "status-error",
  };
  return classes[status as keyof typeof classes] || "status-normal";
};

const getStatusText = (status: string) => {
  const texts = {
    normal: "正常",
    warning: "警告",
    error: "故障",
  };
  return texts[status as keyof typeof texts] || "正常";
};

const getAlarmTypeColor = (type: string) => {
  const colors = {
    warning: "var(--tw-state-warning)",
    error: "var(--tw-state-danger)",
    info: "var(--tw-state-normal)",
  };
  return colors[type as keyof typeof colors] || "var(--tw-state-normal)";
};

const getAlarmTypeIcon = (type: string) => {
  const icons = {
    warning: "⚠",
    error: "❌",
    info: "ℹ",
  };
  return icons[type as keyof typeof icons] || "ℹ";
};

const onClose = () => {
  emit("close");
};
</script>

<style lang="scss" scoped>
.device-detail-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 700px;
  max-height: 80vh;
  color: var(--tw-color-text-secondary);
  background: linear-gradient(158deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 250, 255, 0.95) 100%);
  border: 1px solid var(--tw-border-panel);
  border-radius: 14px;
  z-index: 99999;
  box-shadow: var(--tw-shadow-elevated);
  user-select: text;

  &.embedded {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    max-width: none;
    max-height: none;
    transform: none;
    z-index: 1;
  }

  * {
    user-select: text;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 18px;
    border-bottom: 1px solid var(--tw-border-soft);

    .title {
      font-size: 18px;
      font-weight: 700;
      color: var(--tw-color-text-primary);
      letter-spacing: 0.2px;
    }

    .close-btn {
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--tw-color-text-muted);
      font-size: 24px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background-color: rgba(70, 110, 146, 0.12);
        border-radius: 50%;
        color: var(--tw-color-text-primary);
      }
    }
  }

  .content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 14px;
    padding: 16px;
    max-height: calc(80vh - 60px);
    overflow-y: auto;

    .info-section {
      margin-bottom: 0;
      padding: 12px;
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(243, 248, 255, 0.92) 100%);
      border: 1px solid var(--tw-border-soft);
      border-radius: 10px;

      .info-title {
        font-size: 15px;
        font-weight: 700;
        color: var(--tw-color-text-primary);
        margin-bottom: 10px;
        padding-bottom: 6px;
        border-bottom: 1px solid var(--tw-border-soft);
      }

      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 8px 10px;
        margin-bottom: 7px;
        background: rgba(255, 255, 255, 0.74);
        border-radius: 8px;
        border: 1px solid rgba(126, 161, 192, 0.2);

        .info-label {
          font-size: 13px;
          color: var(--tw-color-text-secondary);
          font-weight: 600;
          min-width: 100px;
        }

        .info-value {
          font-size: 13px;
          color: var(--tw-color-text-primary);
          font-weight: 600;
          text-align: right;
          flex: 1;

          &.status-normal {
            color: var(--tw-state-success);
          }

          &.status-warning {
            color: var(--tw-state-warning);
          }

          &.status-error {
            color: var(--tw-state-danger);
          }
        }
      }

      .alarm-list {
        .alarm-item {
          display: flex;
          align-items: center;
          padding: 8px 10px;
          margin-bottom: 7px;
          background: rgba(255, 255, 255, 0.74);
          border-radius: 8px;
          border: 1px solid rgba(126, 161, 192, 0.2);

          .alarm-icon {
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            font-size: 14px;
            margin-right: 15px;
            color: #fff;
          }

          .alarm-info {
            flex: 1;

            .alarm-name {
              font-size: 13px;
              font-weight: 600;
              color: var(--tw-color-text-primary);
              margin-bottom: 3px;
            }

            .alarm-time {
              font-size: 12px;
              color: var(--tw-color-text-muted);
            }
          }
        }
      }
    }
  }
}

// 滚动条样式
.content::-webkit-scrollbar {
  width: 7px;
}

.content::-webkit-scrollbar-track {
  background: rgba(127, 160, 191, 0.14);
  border-radius: 3px;
}

.content::-webkit-scrollbar-thumb {
  background: rgba(101, 138, 173, 0.46);
  border-radius: 3px;
}

.content::-webkit-scrollbar-thumb:hover {
  background: rgba(86, 126, 164, 0.62);
}
</style>
