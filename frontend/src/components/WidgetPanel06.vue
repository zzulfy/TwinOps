<template>
  <LayoutPanel title="预警情况">
    <div class="wrap">
      <div class="status-tabs">
        <button
          v-for="item in statusTabs"
          :key="item.value"
          class="tab-btn"
          :class="{ active: currentStatus === item.value }"
          @click="switchStatus(item.value)"
        >
          {{ item.label }}
        </button>
      </div>
      <div v-if="errorMessage" class="panel-message">{{ errorMessage }}</div>
      <div v-else-if="displayList.length === 0" class="panel-message">
        暂无预警数据
      </div>
      <div v-else ref="viewportRef" class="item-viewport">
        <div class="item-list">
          <div
            class="item"
            v-for="item in displayList"
            :key="item.id"
            :class="[`type-${item.type}`]"
          >
            <div class="item-circle" :class="[`dot-${item.type}`]"></div>
            <div class="item-name">{{ item.name }}</div>
            <div class="item-type">{{ item.event }}</div>
            <div class="item-status" :class="`is-${item.status}`">
              {{
                item.status === "new"
                  ? "新告警"
                  : item.status === "acknowledged"
                  ? "已确认"
                  : "已解决"
              }}
            </div>
            <div class="item-time">{{ item.time }}</div>
          </div>
        </div>
      </div>
    </div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import { fetchAlarmList, type AlarmStatus } from "@/api/backend";
import useAutoRefresh from "@/hooks/useAutoRefresh";
import LayoutPanel from "./LayoutPanel.vue";

interface AlarmItem {
  id: number;
  name: string;
  event: string;
  type: 1 | 2 | 3;
  time: string;
  status: AlarmStatus;
}

const displayList = ref<AlarmItem[]>([]);
const errorMessage = ref("");
const currentStatus = ref<AlarmStatus>("new");
const loading = ref(false);
const viewportRef = ref<HTMLElement | null>(null);

const ALARM_AUTO_REFRESH_MS = 20000;

const statusTabs: Array<{ label: string; value: AlarmStatus }> = [
  { label: "新告警", value: "new" },
  { label: "已确认", value: "acknowledged" },
  { label: "已解决", value: "resolved" },
];

const mapAlarmItems = (
  items: Awaited<ReturnType<typeof fetchAlarmList>>
): AlarmItem[] =>
  items.map((item) => ({
    id: item.id,
    name: item.name,
    event: item.event,
    type: item.type,
    time: item.time,
    status: item.status,
  }));

const applyIncomingList = async (next: AlarmItem[]) => {
  const previousScrollTop = viewportRef.value?.scrollTop ?? 0;
  displayList.value = next;
  await nextTick();
  const viewport = viewportRef.value;
  if (!viewport) {
    return;
  }
  const maxScrollableTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
  viewport.scrollTop = Math.min(previousScrollTop, maxScrollableTop);
};

const loadAlarms = async () => {
  if (loading.value) {
    return;
  }
  try {
    loading.value = true;
    const data = await fetchAlarmList(currentStatus.value);
    await applyIncomingList(mapAlarmItems(data));
    errorMessage.value = "";
  } catch (error) {
    errorMessage.value = `预警数据加载失败: ${
      error instanceof Error ? error.message : String(error)
    }`;
    displayList.value = [];
  } finally {
    loading.value = false;
  }
};

const switchStatus = async (status: AlarmStatus) => {
  if (loading.value || currentStatus.value === status) return;
  currentStatus.value = status;
  await loadAlarms();
};

onMounted(() => {
  void loadAlarms();
});

useAutoRefresh({
  intervalMs: ALARM_AUTO_REFRESH_MS,
  immediate: false,
  onTick: loadAlarms,
});
</script>

<style lang="scss" scoped>
.wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.status-tabs {
  display: flex;
  grid-gap: 8px;
  margin-bottom: 8px;
}

.tab-btn {
  height: 24px;
  padding: 0 10px;
  font-size: 12px;
  color: var(--tw-color-text-secondary);
  cursor: pointer;
  background: rgba(14, 30, 53, 0.8);
  border: 1px solid var(--tw-border-soft);
  border-radius: 999px;

  &.active {
    color: var(--tw-color-text-on-dark);
    background: linear-gradient(
      120deg,
      var(--tw-cta-start) 0%,
      var(--tw-cta-end) 100%
    );
    border-color: var(--tw-cta-border);
  }
}

.panel-message {
  padding: 10px;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--tw-color-text-on-light);
  border: 1px solid var(--tw-border-soft);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  font-family: var(--tw-font-body);
}

.item-viewport {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 5px;
  font-size: 16px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--tw-color-text-on-dark);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &.type-1 {
    background: var(--tw-alarm-row-bg-1);
  }

  &.type-2 {
    background: var(--tw-alarm-row-bg-2);
  }

  &.type-3 {
    background: var(--tw-alarm-row-bg-3);
  }

  &:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.36);
    border-color: rgba(255, 255, 255, 0.3);
  }
}

.item-circle {
  position: absolute;
  left: 10px;
  width: 5px;
  height: 10px;
  border-radius: 2px;

  &.dot-1 {
    background: var(--tw-state-success);
  }

  &.dot-2 {
    background: var(--tw-state-warning);
  }

  &.dot-3 {
    background: var(--tw-state-danger);
  }
}

.item-name {
  width: 50%;
  padding-left: 15px;
  color: inherit;
  font-family: var(--tw-font-body);
}

.item-type {
  width: 30%;
  color: inherit;
  opacity: 0.88;
  font-family: var(--tw-font-body);
}

.item-status {
  width: 18%;
  text-align: center;
  font-size: 11px;
  font-family: var(--tw-font-body);
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  padding: 2px 8px;
  white-space: nowrap;

  &.is-new {
    color: var(--tw-color-text-on-dark);
    background: rgba(255, 109, 109, 0.26);
  }
  &.is-acknowledged {
    color: var(--tw-color-text-on-light);
    background: rgba(255, 214, 133, 0.92);
  }
  &.is-resolved {
    color: var(--tw-color-text-on-dark);
    background: rgba(62, 215, 149, 0.26);
  }
}

.item-time {
  width: 12%;
  text-align: end;
  color: inherit;
  opacity: 0.78;
  font-family: var(--tw-font-body);
}

.item-viewport::-webkit-scrollbar {
  width: 6px;
}

.item-viewport::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
}

.item-viewport::-webkit-scrollbar-thumb {
  background: rgba(132, 185, 244, 0.45);
  border-radius: 999px;
}
</style>
