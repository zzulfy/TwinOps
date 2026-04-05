<template>
  <div class="layout">
    <LayoutHeader
      :show-summary-actions="true"
      :summary-updated-at="summaryUpdatedAt"
      :refreshing="refreshingSummary"
      @refresh-summary="refreshSummary"
      @go-analysis="goToAnalysis"
      @logout="logout"
    />
    <LayoutFooter />
    <LayoutLoading :loading="loading" />
    <div class="layout-main">
      <div class="main-left">
        <WidgetPanel04 />
        <WidgetPanel01 />
        <WidgetPanel06 />
      </div>
      <div class="main-right" ref="threeContainer"></div>
      <button class="detail-entry" @click="goToDetailPage">设备列表</button>
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
import useAutoRefresh from "@/hooks/useAutoRefresh";
import { fetchDashboardSummary, logoutAdmin } from "@/api/backend";

const router = useRouter();
const threeContainer = ref<HTMLElement | null>(null);
const { loading, startWarming, stopWarming, enableControls, disableControls } =
  useDataCenter(threeContainer);

watchEffect(() => {
  // threeContainer is bound via template ref.
});

const showMask = ref(false);
const summaryUpdatedAt = ref("");
const refreshingSummary = ref(false);
const dashboardSummaryVersion = ref(0);
const autoRefreshError = ref("");
const DASHBOARD_AUTO_REFRESH_MS = 20000;

const formatTime = (date: Date) =>
  `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;

const refreshSummary = async () => {
  if (refreshingSummary.value) {
    return;
  }
  try {
    refreshingSummary.value = true;
    await fetchDashboardSummary({ force: true });
    summaryUpdatedAt.value = formatTime(new Date());
    dashboardSummaryVersion.value += 1;
    autoRefreshError.value = "";
  } finally {
    refreshingSummary.value = false;
  }
};

const goToDetailPage = () => {
  router.push({ name: "devices" });
};

const goToAnalysis = () => {
  router.push({ name: "analysis-center" });
};

const logout = async () => {
  await logoutAdmin();
  router.push({ name: "login" });
};

provide("mask", {
  show: () => {
    showMask.value = true;
  },
  hide: () => {
    showMask.value = false;
  },
});

provide("events", {
  startWarming,
  stopWarming,
  enableControls,
  disableControls,
});
provide("dashboardSummaryVersion", dashboardSummaryVersion);
provide("dashboardAutoRefreshError", autoRefreshError);

useAutoRefresh({
  intervalMs: DASHBOARD_AUTO_REFRESH_MS,
  onTick: refreshSummary,
  onError: (error) => {
    autoRefreshError.value = `看板自动刷新失败: ${
      error instanceof Error ? error.message : String(error)
    }`;
  },
});
</script>

<style lang="scss" scoped>
.layout {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: radial-gradient(
      circle at 14% 14%,
      rgba(69, 157, 255, 0.22) 0%,
      transparent 42%
    ),
    radial-gradient(
      circle at 86% 16%,
      rgba(70, 215, 160, 0.16) 0%,
      transparent 38%
    ),
    linear-gradient(
      138deg,
      var(--tw-bg-ink) 5%,
      var(--tw-bg-deep) 52%,
      var(--tw-bg-haze) 100%
    );

  &::before {
    position: absolute;
    inset: 0;
    pointer-events: none;
    content: "";
    background-image: linear-gradient(
        rgba(75, 120, 170, 0.16) 1px,
        transparent 1px
      ),
      linear-gradient(90deg, rgba(75, 120, 170, 0.12) 1px, transparent 1px);
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
        box-shadow: var(--tw-shadow-panel),
          inset 0 0 0 1px rgba(139, 196, 255, 0.14);
      }
    }

    .main-right {
      position: absolute;
      top: 0;
      left: calc(clamp(330px, 24vw, 430px) + 40px);
      z-index: 2;
      width: calc(100% - clamp(330px, 24vw, 430px) - 40px);
      height: 100%;
      border: 1px solid rgba(90, 140, 204, 0.5);
      border-radius: var(--tw-radius-lg);
      box-shadow: inset 0 0 0 1px rgba(126, 190, 255, 0.22),
        0 16px 30px rgba(4, 11, 23, 0.5);

      &::before {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 99;
        width: 100%;
        height: 100%;
        pointer-events: none;
        content: "";
        background: radial-gradient(
            circle at 32% 20%,
            var(--tw-glow-cyan) 0%,
            transparent 44%
          ),
          radial-gradient(
            circle at 76% 76%,
            var(--tw-glow-lime) 0%,
            transparent 48%
          ),
          radial-gradient(circle, transparent 40%, rgba(7, 17, 34, 0.46) 88%);
      }
    }

    .detail-entry {
      position: absolute;
      top: 18px;
      right: 20px;
      z-index: 1001;
      height: 40px;
      padding: 0 16px;
      font-family: var(--tw-font-title);
      font-size: 13px;
      letter-spacing: 1px;
      color: var(--tw-color-text-on-dark);
      cursor: pointer;
      background: linear-gradient(
        120deg,
        var(--tw-cta-start) 0%,
        var(--tw-cta-end) 100%
      );
      border: 1px solid var(--tw-cta-border);
      border-radius: 999px;
      box-shadow: var(--tw-cta-shadow);
      transition: all var(--tw-motion-duration-base)
        var(--tw-motion-ease-standard);

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 14px 24px rgba(11, 75, 150, 0.56);
        border-color: rgba(170, 218, 255, 0.8);
      }
    }

    .mask {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 9998;
      width: 100%;
      height: 100%;
      background-color: rgba(8, 18, 34, 0.42);
      backdrop-filter: blur(2px);
      pointer-events: none;
    }
  }
}
</style>
