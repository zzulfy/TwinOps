<template>
  <div class="layout-footer">
    <div class="item" :style="warmingStyle" @click="showAlarmList = true">
      设备告警
    </div>
    <AlarmDeviceList
      v-if="showAlarmList"
      :devices="alarmDevices"
      :loading="alarmLoading"
      :error-message="alarmErrorMessage"
      @close="showAlarmList = false"
      @click.stop
    />
  </div>
</template>
<script setup lang="ts">
import { reactive, computed, inject, ref, onMounted, watch } from "vue";
import { fetchAlarmList, type AlarmListItem } from "@/api/backend";
import AlarmDeviceList from "./AlarmDeviceList.vue";

interface EventsType {
  startWarming: () => void;
  stopWarming: () => void;
}

const state = reactive({
  isWarming: true, // 默认开启告警
});

const events = inject<EventsType | undefined>("events");
const showAlarmList = ref(false);
const alarmDevices = ref<AlarmListItem[]>([]);
const alarmLoading = ref(false);
const alarmErrorMessage = ref("");

// 初始化时自动开启告警
onMounted(() => {
  if (events) {
    events.startWarming();
  }
});

const loadAlarmDevices = async () => {
  try {
    alarmLoading.value = true;
    alarmDevices.value = await fetchAlarmList("new", 20);
    alarmErrorMessage.value = "";
  } catch (error) {
    alarmErrorMessage.value = `告警数据加载失败: ${
      error instanceof Error ? error.message : String(error)
    }`;
    alarmDevices.value = [];
  } finally {
    alarmLoading.value = false;
  }
};

watch(showAlarmList, async (visible) => {
  if (!visible) {
    return;
  }
  await loadAlarmDevices();
});

const warmingStyle = computed(() => {
  const style: Record<string, string> = {};
  style.cursor = "pointer";
  style.color = state.isWarming
    ? "var(--tw-state-normal)"
    : "var(--tw-color-text-on-light)";
  return style;
});
</script>
<style lang="scss" scoped>
.layout-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100px;
  background: linear-gradient(
    180deg,
    var(--tw-bg-footer-start) 0%,
    var(--tw-bg-footer-end) 100%
  );
  border-top: 1px solid var(--tw-border-soft);
  .item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 220px;
    height: 52px;
    letter-spacing: 1px;
    font-family: var(--tw-font-title);
    color: var(--tw-color-text-on-light);
    cursor: pointer;
    background: linear-gradient(
      120deg,
      rgba(255, 255, 255, 0.82) 0%,
      rgba(239, 247, 255, 0.9) 56%,
      rgba(228, 240, 252, 0.95) 100%
    );
    border: 1px solid var(--tw-border-strong);
    border-radius: var(--tw-radius-sm);
    transition: all var(--tw-motion-duration-base)
      var(--tw-motion-ease-standard);

    &::before {
      position: absolute;
      left: 14px;
      width: 8px;
      height: 8px;
      content: "";
      background: var(--tw-state-danger);
      border-radius: 50%;
      box-shadow: 0 0 10px
        color-mix(in srgb, var(--tw-state-danger) 88%, transparent);
    }

    &:hover {
      background: linear-gradient(
        120deg,
        rgba(255, 255, 255, 0.92) 0%,
        rgba(245, 251, 255, 0.98) 56%,
        rgba(235, 246, 255, 1) 100%
      );
      box-shadow: 0 8px 16px rgba(66, 108, 147, 0.24);
      transform: translateY(-2px);
      border-color: rgba(95, 140, 183, 0.54);
    }
  }
}
</style>
