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
      <div v-else-if="list.length === 0" class="panel-message">
        暂无预警数据
      </div>
      <div class="item-list" ref="container">
        <div
          class="item"
          v-for="(item, index) in list"
          :key="item.id ?? index"
          :class="[`type-${item.type}`]"
        >
          <div
            class="item-circle"
            :class="[`dot-${item.type}`]"
          ></div>

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
  </LayoutPanel>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
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

const list = ref<AlarmItem[]>([]);
const errorMessage = ref("");
const currentStatus = ref<AlarmStatus>("new");
const loading = ref(false);
const container = ref<HTMLElement | null>(null);
const ALARM_AUTO_REFRESH_MS = 20000;
const statusTabs: Array<{ label: string; value: AlarmStatus }> = [
  { label: "新告警", value: "new" },
  { label: "已确认", value: "acknowledged" },
  { label: "已解决", value: "resolved" },
];

const loadAlarms = async () => {
  if (loading.value) {
    return;
  }
  try {
    loading.value = true;
    const data = await fetchAlarmList(currentStatus.value);
    list.value = data.map((item) => ({
      id: item.id,
      name: item.name,
      event: item.event,
      type: item.type,
      time: item.time,
      status: item.status,
    }));
    errorMessage.value = "";
  } catch (error) {
    errorMessage.value = `预警数据加载失败: ${
      error instanceof Error ? error.message : String(error)
    }`;
    list.value = [];
  } finally {
    loading.value = false;
  }
};

const switchStatus = async (status: AlarmStatus) => {
  if (loading.value || currentStatus.value === status) return;
  currentStatus.value = status;
  await loadAlarms();
};

let timer: number | null = null;
onMounted(() => {
  void loadAlarms();

  if (timer) window.clearInterval(timer);
  timer = window.setInterval(() => {
    if (!container.value || list.value.length === 0) return;
    container.value.classList.add("scroll");
    window.setTimeout(() => {
      if (!timer) return;
      const containerElement = container.value;
      if (!containerElement) return;
      containerElement.classList.remove("scroll");
      const item = list.value.shift();
      if (item) {
        list.value.push(item);
      }
    }, 2000);
  }, 3000);
});

useAutoRefresh({
  intervalMs: ALARM_AUTO_REFRESH_MS,
  immediate: false,
  onTick: loadAlarms,
});

onUnmounted(() => {
  if (timer) {
    window.clearInterval(timer);
    timer = null;
  }
});
</script>

<style lang="scss" scoped>
@keyframes row-out {
  from {
    top: 0;
  }
  to {
    top: -36px;
  }
}
.wrap {
  height: 100%;
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

.item-list {
  display: flex;
  flex-direction: column;
  grid-gap: 8px;
  height: 630px;

  &.scroll {
    position: relative;
    animation: row-out 1s linear forwards;
    .row:first-child {
      opacity: 0;
      transition: opacity 1s;
    }
  }
  .item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 5px;
    font-size: 16px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.2s ease;
    color: var(--tw-color-text-on-dark);

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
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.42);
      border-color: rgba(255, 255, 255, 0.32);
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
  }
}
</style>
