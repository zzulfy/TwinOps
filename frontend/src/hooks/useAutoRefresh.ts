import { onMounted, onUnmounted, ref } from "vue";

interface UseAutoRefreshOptions {
  intervalMs: number;
  immediate?: boolean;
  runWhenHidden?: boolean;
  onTick: () => Promise<void> | void;
  onError?: (error: unknown) => void;
}

export const useAutoRefresh = ({
  intervalMs,
  immediate = true,
  runWhenHidden = false,
  onTick,
  onError,
}: UseAutoRefreshOptions) => {
  const running = ref(false);
  const active = ref(false);
  let timer: number | null = null;

  const resolveIntervalMs = () => {
    if (typeof window === "undefined") {
      return intervalMs;
    }
    const overrideRaw = window.localStorage.getItem("tw_auto_refresh_interval_ms");
    if (!overrideRaw) {
      return intervalMs;
    }
    const override = Number(overrideRaw);
    if (!Number.isFinite(override) || override <= 0) {
      return intervalMs;
    }
    return override;
  };

  const clearTimer = () => {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  const executeTick = async () => {
    if (running.value) {
      return;
    }
    running.value = true;
    try {
      await onTick();
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        // Keep page functional even if one refresh tick fails.
        console.error("auto refresh tick failed", error);
      }
    } finally {
      running.value = false;
    }
  };

  const shouldRun = () =>
    runWhenHidden ||
    typeof document === "undefined" ||
    document.visibilityState === "visible";

  const start = async () => {
    if (active.value) {
      return;
    }
    active.value = true;
    if (immediate && shouldRun()) {
      await executeTick();
    }
    if (!shouldRun()) {
      return;
    }
    clearTimer();
    timer = window.setInterval(() => {
      if (!shouldRun()) {
        return;
      }
      void executeTick();
    }, resolveIntervalMs());
  };

  const stop = () => {
    active.value = false;
    clearTimer();
  };

  const handleVisibilityChange = () => {
    if (!active.value) {
      return;
    }
    if (!shouldRun()) {
      clearTimer();
      return;
    }
    clearTimer();
    timer = window.setInterval(() => {
      if (!shouldRun()) {
        return;
      }
      void executeTick();
    }, resolveIntervalMs());
    void executeTick();
  };

  onMounted(() => {
    void start();
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }
  });

  onUnmounted(() => {
    stop();
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
  });

  return {
    start,
    stop,
    trigger: executeTick,
    running,
  };
};

export default useAutoRefresh;
