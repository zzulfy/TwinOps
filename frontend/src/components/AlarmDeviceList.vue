<template>
  <div class="alarm-device-list" @click.stop>
    <div class="header">
      <div class="title">告警设备列表</div>
      <div class="close-btn" @click="onClose">×</div>
    </div>
    <div class="content">
      <div class="device-item" v-for="item in devices" :key="item.id">
        <div class="device-info">
          <div class="device-name">{{ item.name }}</div>
          <div class="device-event">{{ item.event }}</div>
        </div>
        <div class="device-time">{{ item.time }}</div>
        <div
          class="device-type"
          :style="{ background: getTypeColor(item.type) }"
        >
          {{ getTypeText(item.type) }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">

interface AlarmDevice {
  id: number;
  name: string;
  event: string;
  type: 1 | 2 | 3;
  time: string;
}

const props = defineProps<{
  devices: AlarmDevice[];
}>();

const emit = defineEmits<{
  close: [];
}>();

const getTypeColor = (type: 1 | 2 | 3) => {
  const colors = {
    1: "#74fabd",
    2: "#5bc7fa",
    3: "#f1bd49",
  };
  return colors[type];
};

const getTypeText = (type: 1 | 2 | 3) => {
  const texts = {
    1: "一般",
    2: "中等",
    3: "严重",
  };
  return texts[type];
};

const onClose = () => {
  emit("close");
};
</script>
<style lang="scss" scoped>
.alarm-device-list {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  max-height: 80vh;
  background-color: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  z-index: 99999;
  backdrop-filter: blur(10px);

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .title {
      font-size: 18px;
      font-weight: bold;
      color: #fff;
    }

    .close-btn {
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 24px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
      }
    }
  }

  .content {
    padding: 20px;
    max-height: calc(80vh - 60px);
    overflow-y: auto;

    .device-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      margin-bottom: 10px;
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }

      .device-info {
        flex: 1;

        .device-name {
          font-size: 16px;
          color: #fff;
          margin-bottom: 5px;
        }

        .device-event {
          font-size: 14px;
          color: #999;
        }
      }

      .device-time {
        font-size: 14px;
        color: #666;
        margin-right: 15px;
        min-width: 80px;
        text-align: right;
      }

      .device-type {
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 12px;
        color: #fff;
        font-weight: bold;
      }
    }
  }
}

// 滚动条样式
.content::-webkit-scrollbar {
  width: 6px;
}

.content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
