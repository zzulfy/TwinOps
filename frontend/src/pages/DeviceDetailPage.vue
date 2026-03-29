<template>
  <div class="device-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">返回看板</button>
      <div class="title">所有设备详情</div>
      <div class="subtitle">全面监控各个设备的运行状态</div>
    </div>

    <div class="page-body">
      <div v-for="device in allDevicesData" :key="device.name" class="device-card-wrapper">
        <DeviceDetailPanel :device-data="device" embedded @close="goBack" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import DeviceDetailPanel from "@/components/DeviceDetailPanel.vue";

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

const router = useRouter();

const goBack = () => {
  router.push({ name: "dashboard" });
};

const createFallbackData = (name: string): DeviceData => {
  const isServer = name.includes("服务器");
  const isNetwork = name.includes("网络") || name.includes("交换机");
  const isPower = name.includes("电源");

  const type = isServer ? "服务器机柜" : isNetwork ? "网络设备" : isPower ? "电源柜" : "其他设备";

  return {
    name,
    type,
    status: isPower ? "warning" : "normal",
    serialNumber: `1000${Math.floor(Math.random() * 9000)}`,
    location: "数据中心 A 区",
    temperature: Math.floor(Math.random() * 30) + 20,
    humidity: Math.floor(Math.random() * 40) + 40,
    voltage: Math.floor(Math.random() * 20) + 220,
    current: Math.floor(Math.random() * 10) + 5,
    power: Math.floor(Math.random() * 2000) + 1000,
    cpuLoad: Math.floor(Math.random() * 60) + 20,
    memoryUsage: Math.floor(Math.random() * 50) + 30,
    diskUsage: Math.floor(Math.random() * 40) + 40,
    networkTraffic: Math.floor(Math.random() * 1000) + 500,
    alarms: [
      { id: 1, name: "状态巡检提醒", type: "info", time: "08:30" },
      { id: 2, name: "阈值波动提醒", type: "warning", time: "10:12" },
    ],
  };
};

const allDevicesData = computed<DeviceData[]>(() => {
  const deviceNames = [
    "服务器机柜 A",
    "网络交换机 B",
    "主备电源柜 C",
    "冷却水塔 D",
    "核心路由器 E",
    "综合存储阵列 F",
    "边缘计算节点 G",
    "负载均衡器 H",
    "备份电源组 I",
    "温湿度采集器 J",
    "监控摄像单元 K",
    "安全网关 L",
  ];
  return deviceNames.map(createFallbackData);
});
</script>

<style lang="scss" scoped>
.device-page {
  min-height: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  background:
    radial-gradient(circle at 16% 14%, rgba(84, 147, 208, 0.12) 0%, transparent 38%),
    linear-gradient(155deg, #f7fbff 0%, #edf3f9 52%, #e4edf5 100%);
}

.page-header {
  display: flex;
  align-items: center;
  grid-gap: 14px;
  margin-bottom: 24px;
}

.back-btn {
  height: 34px;
  padding: 0 12px;
  color: var(--tw-color-text-primary);
  cursor: pointer;
  background: #fff;
  border: 1px solid rgba(93, 132, 168, 0.36);
  border-radius: 18px;
  font-weight: bold;
}

.back-btn:hover {
  background: #f0f5fa;
}

.title {
  font-family: Douyu;
  font-size: 24px;
  color: var(--tw-color-text-primary);
}

.subtitle {
  font-size: 14px;
  color: var(--tw-color-text-secondary);
}

.page-body {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  align-items: start;
  gap: 24px;
  padding-bottom: 48px;
  max-width: 100%;
}

.device-card-wrapper {
  background: transparent;
  border-radius: 16px;
  overflow: visible;
  display: flex;
}
</style>
