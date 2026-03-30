<template>
  <div class="device-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">返回看板</button>
      <div class="title">所有设备详情</div>
      <div class="subtitle">全面监控各个设备的运行状态</div>
    </div>

    <div v-if="errorMessage" class="status-message error">{{ errorMessage }}</div>
    <div v-else-if="allDevicesData.length === 0" class="status-message">暂无设备数据</div>
    <div v-else class="page-body">
      <div v-for="device in allDevicesData" :key="device.name" class="device-card-wrapper">
        <DeviceDetailPanel :device-data="device" embedded @close="goBack" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import DeviceDetailPanel from "@/components/DeviceDetailPanel.vue";
import { fetchDevices, type DeviceData } from "@/api/backend";

const router = useRouter();
const allDevicesData = ref<DeviceData[]>([]);
const errorMessage = ref<string>("");

const goBack = () => {
  router.push({ name: "dashboard" });
};

onMounted(async () => {
  try {
    allDevicesData.value = await fetchDevices();
    errorMessage.value = "";
  } catch (error) {
    errorMessage.value = `设备数据加载失败: ${error instanceof Error ? error.message : String(error)}`;
  }
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

.status-message {
  padding: 16px;
  border-radius: 10px;
  color: var(--tw-color-text-primary);
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid var(--tw-border-soft);
}

.status-message.error {
  color: #9f4040;
}

.device-card-wrapper {
  background: transparent;
  border-radius: 16px;
  overflow: visible;
  display: flex;
}
</style>
