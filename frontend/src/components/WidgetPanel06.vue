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
      <div v-else-if="list.length === 0" class="panel-message">暂无预警数据</div>
      <div class="item-list" ref="container">
        <div
          class="item"
          v-for="(item, index) in list"
          :key="item.id ?? index"
          :style="{ background: generateTypeColor(item.type, true) }"
        >
          <div
            class="item-circle"
            :style="{ background: generateTypeColor(item.type) }"
          ></div>

          <div class="item-name">{{ item.name }}</div>
          <div class="item-type">{{ item.event }}</div>
          <div class="item-actions">
            <button
              v-if="item.status === 'new'"
              class="action-btn"
              @click="changeAlarmStatus(item, 'acknowledged')"
            >
              确认
            </button>
            <button
              v-else-if="item.status === 'acknowledged'"
              class="action-btn"
              @click="changeAlarmStatus(item, 'resolved')"
            >
              解决
            </button>
            <span v-else class="resolved-tag">已解决</span>
          </div>
          <div class="item-time">{{ item.time }}</div>
        </div>
      </div>
    </div>
  </LayoutPanel>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, inject } from "vue";
import LayoutPanel from "./LayoutPanel.vue";
import { fetchAlarmList, type AlarmStatus, updateAlarmStatus } from "@/api/backend";

interface EventsType {
  startWarming: () => void;
  stopWarming: () => void;
  enableControls: () => void;
  disableControls: () => void;
}

const { disableControls, enableControls } = inject<EventsType>("events") as EventsType;
interface MaskType {
  show: () => void;
  hide: () => void;
}

const mask = inject<MaskType>("mask") as MaskType;

interface AlarmItem {
  id: number;
  name: string;
  event: string;
  type: 1 | 2 | 3;
  time: string;
  status: AlarmStatus;
}

const showAlarmList = ref(false);

// 监听弹窗显示/隐藏，禁用/启用3D视图控制并显示/隐藏遮罩层
watch(showAlarmList, (newVal) => {
  if (newVal) {
    disableControls();
    mask.show();
  } else {
    enableControls();
    mask.hide();
  }
});

const list = ref<AlarmItem[]>([]);
const errorMessage = ref("");
const currentStatus = ref<AlarmStatus>("new");
const loading = ref(false);
const container = ref<HTMLElement | null>(null);
const statusTabs: Array<{ label: string; value: AlarmStatus }> = [
  { label: "新告警", value: "new" },
  { label: "已确认", value: "acknowledged" },
  { label: "已解决", value: "resolved" },
];

const loadAlarms = async () => {
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
    errorMessage.value = `预警数据加载失败: ${error instanceof Error ? error.message : String(error)}`;
  } finally {
    loading.value = false;
  }
};

const switchStatus = async (status: AlarmStatus) => {
  if (loading.value || currentStatus.value === status) return;
  currentStatus.value = status;
  await loadAlarms();
};

const changeAlarmStatus = async (item: AlarmItem, nextStatus: AlarmStatus) => {
  const oldStatus = item.status;
  item.status = nextStatus;
  try {
    const updated = await updateAlarmStatus(item.id, nextStatus);
    if (currentStatus.value !== updated.status) {
      list.value = list.value.filter((alarm) => alarm.id !== item.id);
      return;
    }
    item.status = updated.status;
  } catch (error) {
    item.status = oldStatus;
    errorMessage.value = `告警状态更新失败: ${error instanceof Error ? error.message : String(error)}`;
  }
};

const generateTypeColor = (type: 1 | 2 | 3, gradual = false) => {
  const colors = {
    1: "#86a17f", // 低风险
    2: "#c8a36a", // 中等风险
    3: "#cc5f5f", // 高风险
  };
  if (gradual) {
    return `linear-gradient(90deg, ${colors[type]}2e , transparent )`;
  }
  return colors[type];
};

let timer: number | null = null;
onMounted(() => {
  loadAlarms();

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

// 组件卸载时清理定时器
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
    color: #e5f1ff;
    background: linear-gradient(120deg, var(--tw-cta-start) 0%, var(--tw-cta-end) 100%);
    border-color: var(--tw-cta-border);
  }
}

.panel-message {
  padding: 10px;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--tw-color-text-secondary);
  border: 1px solid var(--tw-border-soft);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.72);
}

.item-list {
  display: flex;
  flex-direction: column;
  grid-gap: 8px;
  height: 630px;

  // overflow: hidden;
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
    background: rgba(18, 18, 18, 0.68);
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    transition: all 0.2s ease;

    &:hover {
      background: rgba(28, 28, 28, 0.85);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.42);
      border-color: rgba(255, 255, 255, 0.32);
    }

    .item-circle {
      position: absolute;
      left: 10px;
      width: 5px;
      height: 10px;
      border-radius: 2px;
    }
    .item-name {
      width: 50%;
      padding-left: 15px;
      color: var(--tw-color-text-secondary);
    }
    .item-type {
      width: 30%;
      color: var(--tw-color-text-muted);
    }
    .item-actions {
      width: 18%;
      text-align: center;

      .action-btn {
        height: 22px;
        padding: 0 8px;
        font-size: 11px;
        color: #e3f0ff;
        cursor: pointer;
        background: linear-gradient(120deg, var(--tw-cta-start) 0%, var(--tw-cta-end) 100%);
        border: 1px solid var(--tw-cta-border);
        border-radius: 999px;
      }

      .resolved-tag {
        font-size: 11px;
        color: #89dca8;
      }
    }
    .item-time {
      width: 12%;
      text-align: end;
      color: rgba(255, 255, 255, 0.46);
    }
  }
}
</style>
