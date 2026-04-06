import { useEffect, useRef } from "react";

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
}: UseAutoRefreshOptions): void => {
  const runningRef = useRef(false);
  const onTickRef = useRef(onTick);
  const onErrorRef = useRef(onError);

  onTickRef.current = onTick;
  onErrorRef.current = onError;

  useEffect(() => {
    let active = true;
    let timer: number | null = null;

    const resolveIntervalMs = () => {
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

    const shouldRun = () => runWhenHidden || document.visibilityState === "visible";

    const clearTimer = () => {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    const executeTick = async () => {
      if (!active || runningRef.current) {
        return;
      }
      runningRef.current = true;
      try {
        await onTickRef.current();
      } catch (error) {
        if (onErrorRef.current) {
          onErrorRef.current(error);
        } else {
          console.error("auto refresh tick failed", error);
        }
      } finally {
        runningRef.current = false;
      }
    };

    const restartTimer = () => {
      clearTimer();
      if (!active || !shouldRun()) {
        return;
      }
      timer = window.setInterval(() => {
        if (!shouldRun()) {
          return;
        }
        void executeTick();
      }, resolveIntervalMs());
    };

    const handleVisibilityChange = () => {
      restartTimer();
      if (shouldRun()) {
        void executeTick();
      }
    };

    if (immediate && shouldRun()) {
      void executeTick();
    }
    restartTimer();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      clearTimer();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [immediate, intervalMs, runWhenHidden]);
};

export default useAutoRefresh;
