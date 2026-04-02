<template>
  <div class="device-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">返回看板</button>
      <div class="title">所有设备详情</div>
      <div class="subtitle">全面监控各个设备的运行状态</div>
    </div>

    <div class="filter-bar">
      <input
        v-model.trim="keyword"
        class="filter-input"
        type="text"
        placeholder="搜索设备名称或 deviceCode"
      />
      <select v-model="selectedStatus" class="filter-select">
        <option value="">全部状态</option>
        <option value="normal">normal</option>
        <option value="warning">warning</option>
        <option value="error">error</option>
      </select>
      <button class="clear-btn" @click="clearFilters">清空筛选</button>
      <span class="filter-count">显示 {{ filteredDevices.length }} / {{ allDevicesData.length }}</span>
    </div>

    <div v-if="errorMessage" class="status-message error">{{ errorMessage }}</div>
    <div v-else-if="allDevicesData.length === 0" class="status-message">暂无设备数据</div>
    <div v-else-if="filteredDevices.length === 0" class="status-message">筛选结果为空，请调整条件</div>
    <div v-else class="page-body">
      <div v-for="device in filteredDevices" :key="device.deviceCode" class="device-card-wrapper">
        <DeviceDetailPanel :device-data="device" embedded @close="goBack" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import DeviceDetailPanel from "@/components/DeviceDetailPanel.vue";
import { fetchDevices, type DeviceData } from "@/api/backend";

const router = useRouter();
const allDevicesData = ref<DeviceData[]>([]);
const errorMessage = ref<string>("");
const keyword = ref("");
const selectedStatus = ref<"" | DeviceData["status"]>("");

const filteredDevices = computed(() => {
  const normalizedKeyword = keyword.value.toLowerCase();
  return allDevicesData.value.filter((device) => {
    const keywordMatched =
      normalizedKeyword.length === 0
      || device.name.toLowerCase().includes(normalizedKeyword)
      || device.deviceCode.toLowerCase().includes(normalizedKeyword);
    const statusMatched = selectedStatus.value === "" || device.status === selectedStatus.value;
    return keywordMatched && statusMatched;
  });
});

const goBack = () => {
  router.push({ name: "dashboard" });
};

const clearFilters = () => {
  keyword.value = "";
  selectedStatus.value = "";
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
    radial-gradient(circle at 16% 14%, rgba(70, 155, 250, 0.2) 0%, transparent 38%),
    linear-gradient(155deg, var(--tw-bg-ink) 0%, var(--tw-bg-deep) 52%, var(--tw-bg-haze) 100%);
}

.page-header {
  display: flex;
  align-items: center;
  grid-gap: 14px;
  margin-bottom: 24px;
}

.filter-bar {
  display: flex;
  align-items: center;
  grid-gap: 10px;
  margin-bottom: 16px;
}

.filter-input {
  width: 260px;
  height: 34px;
  padding: 0 10px;
  color: #dff0ff;
  background: rgba(12, 28, 48, 0.8);
  border: 1px solid var(--tw-border-soft);
  border-radius: 8px;
  outline: none;
}

.filter-select {
  height: 34px;
  padding: 0 8px;
  color: #dff0ff;
  background: rgba(12, 28, 48, 0.8);
  border: 1px solid var(--tw-border-soft);
  border-radius: 8px;
}

.clear-btn {
  height: 34px;
  padding: 0 12px;
  color: #e3f0ff;
  cursor: pointer;
  background: linear-gradient(120deg, var(--tw-cta-start) 0%, var(--tw-cta-end) 100%);
  border: 1px solid var(--tw-cta-border);
  border-radius: 18px;
}

.filter-count {
  margin-left: auto;
  font-size: 12px;
  color: #9fc5f7;
}

.back-btn {
  height: 34px;
  padding: 0 12px;
  color: #e3f0ff;
  cursor: pointer;
  background: linear-gradient(120deg, var(--tw-cta-start) 0%, var(--tw-cta-end) 100%);
  border: 1px solid var(--tw-cta-border);
  border-radius: 18px;
  font-weight: bold;
  box-shadow: var(--tw-cta-shadow);
  transition: all var(--tw-motion-duration-fast) var(--tw-motion-ease-standard);
}

.back-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 24px rgba(11, 75, 150, 0.56);
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
  color: #dbe9ff;
  background: var(--tw-status-bg);
  border: 1px solid var(--tw-status-border);
  box-shadow: 0 10px 20px rgba(2, 9, 21, 0.4);
}

.status-message.error {
  color: #ffd2d2;
  background: var(--tw-status-error);
  border-color: rgba(255, 132, 132, 0.44);
}

.device-card-wrapper {
  background: transparent;
  border-radius: 16px;
  overflow: visible;
  display: flex;
}
</style>
