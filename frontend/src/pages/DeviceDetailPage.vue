<template>
  <div class="device-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">返回看板</button>
      <div class="title">设备列表与详情</div>
      <div class="subtitle">搜索、关注并快速进入单设备详情</div>
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
    <div v-else class="device-layout">
      <div class="list-panel">
        <div class="list-title">设备列表</div>
        <div v-if="filteredDevices.length === 0" class="status-message">筛选结果为空，请调整条件</div>
        <div
          v-for="device in filteredDevices"
          :key="device.deviceCode"
          class="list-item"
          :class="{ active: currentDevice?.deviceCode === device.deviceCode }"
        >
          <div class="list-item-main" @click="openDevice(device.deviceCode)">
            <div class="name">{{ device.name }}</div>
            <div class="meta">{{ device.deviceCode }} · {{ device.status }}</div>
          </div>
          <button class="pin-btn" @click="toggleWatch(device.deviceCode)">
            {{ watchSet.has(device.deviceCode) ? "取消关注" : "关注" }}
          </button>
        </div>
      </div>

      <div class="watch-panel">
        <div class="list-title">关注列表</div>
        <div v-if="watchList.length === 0" class="empty-watch">暂无关注设备</div>
        <div
          v-for="item in watchList"
          :key="item.deviceCode"
          class="watch-item"
          @click="openDevice(item.deviceCode)"
        >
          {{ item.deviceCode }}
        </div>
      </div>

      <div class="detail-panel">
        <div v-if="notFound" class="status-message error">
          未找到设备 {{ route.params.deviceCode }}，请从左侧列表重新选择。
        </div>
        <div v-else-if="currentDevice">
          <DeviceDetailPanel :device-data="currentDevice" embedded @close="goBackToList" />
        </div>
        <div v-else class="status-message">请从列表或关注列表选择设备查看详情。</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import DeviceDetailPanel from "@/components/DeviceDetailPanel.vue";
import {
  fetchDevices,
  fetchWatchlist,
  pinWatchlistDevice,
  type DeviceData,
  type WatchlistItem,
  unpinWatchlistDevice,
} from "@/api/backend";

const router = useRouter();
const route = useRoute();
const allDevicesData = ref<DeviceData[]>([]);
const errorMessage = ref<string>("");
const keyword = ref("");
const selectedStatus = ref<"" | DeviceData["status"]>("");
const watchList = ref<WatchlistItem[]>([]);
const currentDeviceCode = ref<string>("");

const watchSet = computed(() => new Set(watchList.value.map((item) => item.deviceCode)));
const currentDevice = computed(() =>
  allDevicesData.value.find((device) => device.deviceCode === currentDeviceCode.value),
);
const notFound = computed(
  () => Boolean(currentDeviceCode.value) && !currentDevice.value && allDevicesData.value.length > 0,
);

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

const goBackToList = () => {
  router.push({ name: "devices" });
};

const clearFilters = () => {
  keyword.value = "";
  selectedStatus.value = "";
};

const openDevice = (deviceCode: string) => {
  router.push({ name: "device-focus", params: { deviceCode } });
};

const loadWatchlist = async () => {
  watchList.value = await fetchWatchlist();
};

const toggleWatch = async (deviceCode: string) => {
  if (watchSet.value.has(deviceCode)) {
    watchList.value = await unpinWatchlistDevice(deviceCode);
    return;
  }
  watchList.value = await pinWatchlistDevice(deviceCode);
};

const syncRouteState = () => {
  const routeCode = typeof route.params.deviceCode === "string" ? route.params.deviceCode : "";
  currentDeviceCode.value = routeCode;
  if (typeof route.query.keyword === "string") {
    keyword.value = route.query.keyword;
  }
};

watch(
  () => route.params.deviceCode,
  () => syncRouteState(),
  { immediate: true },
);

onMounted(async () => {
  try {
    allDevicesData.value = await fetchDevices();
    await loadWatchlist();
    errorMessage.value = "";
    if (!currentDeviceCode.value && filteredDevices.value.length > 0) {
      currentDeviceCode.value = filteredDevices.value[0].deviceCode;
    }
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

.device-layout {
  display: grid;
  grid-template-columns: minmax(320px, 28%) minmax(200px, 18%) 1fr;
  align-items: start;
  gap: 14px;
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

.list-panel,
.watch-panel,
.detail-panel {
  border: 1px solid var(--tw-border-soft);
  border-radius: 12px;
  background: rgba(12, 28, 48, 0.82);
  padding: 12px;
  min-height: 72vh;
}

.list-title {
  font-weight: 700;
  margin-bottom: 10px;
  color: #dceaff;
}

.list-item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  border: 1px solid rgba(126, 161, 192, 0.2);
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 8px;
}

.list-item.active {
  border-color: rgba(124, 185, 255, 0.9);
  box-shadow: inset 0 0 0 1px rgba(124, 185, 255, 0.34);
}

.list-item-main {
  cursor: pointer;
}

.name {
  color: #eaf3ff;
  font-weight: 700;
}

.meta {
  margin-top: 4px;
  font-size: 12px;
  color: #9fc5f7;
}

.pin-btn {
  height: 28px;
  padding: 0 10px;
  cursor: pointer;
  color: #e3f0ff;
  border-radius: 14px;
  border: 1px solid var(--tw-cta-border);
  background: linear-gradient(120deg, var(--tw-cta-start) 0%, var(--tw-cta-end) 100%);
}

.watch-item {
  border: 1px solid rgba(126, 161, 192, 0.2);
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  color: #dbe9ff;
}

.empty-watch {
  color: #9fc5f7;
  font-size: 13px;
}
</style>
