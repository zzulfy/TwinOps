<template>
  <div class="layout-header">
    <div class="header-midden">
      <div class="cn">数据中心数字孪生智能运维平台</div>
      <div class="en">
        Data Center Digital Twin Intelligent Operation Platform
      </div>
    </div>
    <div class="header-left">
      <i class="fa-regular fa-envelope"></i>
      <div
        class="message"
        content="【系统通知】感谢大家对我们项目的关注与支持!希望能为我们的项目点一个Star,您的支持对我们来说至关重要。"
      ></div>
    </div>
    <div class="header-right">
      <span>{{ currentTime }}</span>
      <span>{{ currentDate }}</span>
      <span>{{ currentDay }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

// 获取当前时间
const currentTime = ref("");
const currentDate = ref("");
const currentDay = ref("");

// 格式化时间
const formatTime = () => {
  const date = new Date();

  // 时间格式化：HH:MM:SS
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  currentTime.value = `${hours}:${minutes}:${seconds}`;

  // 日期格式化：YYYY-MM-DD
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  currentDate.value = `${year}-${month}-${day}`;

  // 星期几
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  currentDay.value = days[date.getDay()];
};

let timer: number | null = null;

// 组件挂载时开始更新时间
onMounted(() => {
  formatTime();
  timer = window.setInterval(formatTime, 1000);
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});
</script>
<style lang="scss" scoped>
@mixin font-color() {
  background: linear-gradient(0deg, var(--tw-color-text-muted) 0%, var(--tw-color-text-primary) 95%);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
@keyframes text-roll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}
@keyframes light-go {
  from {
    left: 460px;
  }
  to {
    left: 980px;
    opacity: 0;
  }
}
.layout-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  padding: 0 16px;
  background:
    linear-gradient(180deg, rgba(247, 252, 255, 0.95) 0%, rgba(233, 243, 252, 0.92) 100%),
    radial-gradient(circle at 50% -40%, rgba(81, 145, 207, 0.12) 0%, transparent 45%);
  border-bottom: 1px solid rgba(109, 158, 198, 0.28);

  &::before {
    position: absolute;
    inset: 8px 20px auto;
    height: 64px;
    pointer-events: none;
    content: "";
    background: linear-gradient(90deg, rgba(220, 236, 250, 0.62) 0%, rgba(232, 244, 254, 0.54) 45%, rgba(214, 232, 248, 0.6) 100%);
    border: 1px solid rgba(104, 151, 192, 0.22);
    border-radius: 12px;
  }

  &::after {
    position: absolute;
    bottom: -55px;
    left: 460px;
    width: 100%;
    width: 500px;
    height: 100px;
    content: "";
    background: radial-gradient(circle, rgba(88, 153, 217, 0.22) 0%, rgba(255, 255, 255, 0.1) 35%, transparent 74%);
    filter: blur(1px);
    animation: light-go 3s ease-in-out infinite forwards;
  }
  .header-midden {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    overflow-x: hidden;
    font-family: DouYu;
    color: var(--tw-color-text-primary);
    .cn {
      font-size: clamp(22px, 1.8vw, 31px);
      letter-spacing: 1.8px;
      text-transform: uppercase;
      @include font-color;
    }
    .en {
      position: relative;
      margin-top: 2px;
      font-size: clamp(8px, 0.65vw, 11px);
      letter-spacing: 1.4px;
      opacity: 0.9;
      @include font-color;
    }
  }
  .header-left {
    position: absolute;
    top: 20px;
    left: 30px;
    display: flex;
    grid-gap: 6px;
    align-items: center;
    font-size: 18px;
    color: var(--tw-color-text-primary);
    opacity: 0.9;
    .message {
      display: flex;
      width: 400px;
      overflow: hidden;
      font-size: 14px;
      opacity: 0.9;
      &::after {
        width: auto;
        text-wrap: nowrap;
        content: attr(content);
        animation: text-roll 26s linear infinite;
        @include font-color;
      }
    }
  }
  .header-right {
    position: absolute;
    top: 20px;
    right: 30px;
    display: flex;
    grid-gap: 14px;
    font-size: 14px;
    color: var(--tw-color-text-primary);
    span {
      position: relative;
      display: flex;
      align-items: center;
      text-shadow: 0 2px 8px rgba(117, 158, 197, 0.26);
      @include font-color;
      &:not(:last-child)::after {
        position: absolute;
        right: -10px;
        width: 2px;
        height: 10px;
        content: "";
        background-color: #fff;
        opacity: 0.2;
      }
    }
  }

  @media (max-width: 1280px) {
    .header-left {
      .message {
        width: 280px;
      }
    }

    .header-right {
      top: 22px;
      span:last-child {
        display: none;
      }
    }
  }
}
</style>
