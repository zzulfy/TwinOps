<template>
  <div class="layout">
    <LayoutHeader />
    <LayoutFooter />
    <LayoutLoading :loading="loading" />
    <div class="layout-main">
      <div class="main-left">
        <WidgetPanel04 />
        <WidgetPanel01 />
        <WidgetPanel06 />
      </div>
      <div class="main-right" ref="threeContainer"></div>
      <button class="detail-entry" @click="goToDetailPage">查看设备详情</button>
      <div class="mask" v-if="showMask"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { provide, ref, watchEffect } from "vue";
import { useRouter } from "vue-router";
import LayoutHeader from "@/components/LayoutHeader.vue";
import LayoutFooter from "@/components/LayoutFooter.vue";
import LayoutLoading from "@/components/LayoutLoading.vue";
import WidgetPanel01 from "@/components/WidgetPanel01.vue";
import WidgetPanel04 from "@/components/WidgetPanel04.vue";
import WidgetPanel06 from "@/components/WidgetPanel06.vue";
import { useDataCenter } from "@/hooks/useDataCenter";

const router = useRouter();
const threeContainer = ref<HTMLElement | null>(null);
const { loading, startWarming, stopWarming, enableControls, disableControls } = useDataCenter(threeContainer);

watchEffect(() => {
  // threeContainer is bound via template ref.
});

const showMask = ref(false);

const goToDetailPage = () => {
  router.push({ name: "device-detail" });
};

provide("mask", {
  show: () => {
    showMask.value = true;
  },
  hide: () => {
    showMask.value = false;
  },
});

provide("events", { startWarming, stopWarming, enableControls, disableControls });
</script>

<style lang="scss" scoped>
.layout {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background:
    radial-gradient(circle at 14% 14%, rgba(84, 147, 208, 0.12) 0%, transparent 38%),
    radial-gradient(circle at 86% 16%, rgba(79, 178, 139, 0.1) 0%, transparent 34%),
    linear-gradient(138deg, var(--tw-bg-ink) 5%, var(--tw-bg-deep) 52%, var(--tw-bg-haze) 100%);

  &::before {
    position: absolute;
    inset: 0;
    pointer-events: none;
    content: "";
    background-image:
      linear-gradient(rgba(57, 88, 118, 0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(57, 88, 118, 0.07) 1px, transparent 1px);
    background-size: 54px 54px;
    opacity: 0.32;
  }

  .layout-main {
    position: relative;
    width: 100%;
    height: calc(100% - 80px);

    .main-left {
      position: absolute;
      top: 20px;
      left: 20px;
      z-index: 999;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      grid-gap: 20px;
      width: clamp(330px, 24vw, 430px);
      height: calc(100% - 40px);

      :deep(.layout-panel) {
        border-color: var(--tw-panel-edge);
        box-shadow: 0 8px 24px rgba(67, 93, 118, 0.16), inset 0 0 0 1px rgba(255, 255, 255, 0.6);
      }
    }

    .main-right {
      position: absolute;
      top: 0;
      left: calc(clamp(330px, 24vw, 430px) + 40px);
      z-index: 2;
      width: calc(100% - clamp(330px, 24vw, 430px) - 40px);
      height: 100%;
      border: 1px solid rgba(118, 151, 183, 0.34);
      border-radius: var(--tw-radius-lg);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.62), 0 14px 28px rgba(57, 78, 101, 0.16);

      &::before {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 99;
        width: 100%;
        height: 100%;
        pointer-events: none;
        content: "";
        background:
          radial-gradient(circle at 32% 20%, var(--tw-glow-cyan) 0%, transparent 44%),
          radial-gradient(circle at 76% 76%, var(--tw-glow-lime) 0%, transparent 48%),
          radial-gradient(circle, transparent 40%, rgba(28, 53, 80, 0.14) 85%);
      }
    }

    .detail-entry {
      position: absolute;
      top: 18px;
      right: 20px;
      z-index: 1001;
      height: 40px;
      padding: 0 16px;
      font-family: Douyu;
      font-size: 13px;
      letter-spacing: 1px;
      color: var(--tw-color-text-primary);
      cursor: pointer;
      background: linear-gradient(120deg, rgba(255, 255, 255, 0.88) 0%, rgba(239, 247, 255, 0.96) 100%);
      border: 1px solid rgba(107, 149, 190, 0.44);
      border-radius: 999px;
      box-shadow: 0 6px 16px rgba(49, 96, 145, 0.2);
      transition: all var(--tw-motion-duration-base) var(--tw-motion-ease-standard);

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 10px 20px rgba(49, 96, 145, 0.26);
        border-color: rgba(73, 126, 176, 0.6);
      }
    }

    .mask {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 9998;
      width: 100%;
      height: 100%;
      background-color: rgba(225, 235, 244, 0.34);
      backdrop-filter: blur(2px);
      pointer-events: none;
    }
  }
}
</style>
