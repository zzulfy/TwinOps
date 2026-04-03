import { onMounted, onUnmounted, ref, shallowRef } from "vue";
import { isElement } from "lodash";

type EchartsModule = typeof import("@/utils/echartsRuntime");
type EchartsOption = import("echarts").EChartsOption;

/**
 * 用法如下
 * - 函数执行后导出`container`、`setOption`、`resize`方法
 * - 将`container`通过`ref`绑定到模板容器中
 * - 获取数据后通过`setOption`设置图表数据
 * - 如果需要重新渲染图表，调用`resize`方法
 */
export function useEcharts() {
  const container = ref<HTMLElement | null>(null);
  const chart = shallowRef<import("@/utils/echartsRuntime").EChartsType | null>(
    null
  );
  const moduleRef = shallowRef<EchartsModule | null>(null);
  const loadError = ref<string | null>(null);
  let modulePromise: Promise<EchartsModule> | null = null;

  const loadModule = async (): Promise<EchartsModule> => {
    if (moduleRef.value) return moduleRef.value;
    if (!modulePromise) {
      modulePromise = import("@/utils/echartsRuntime").then((mod) => {
        moduleRef.value = mod;
        return mod;
      });
    }
    return modulePromise;
  };

  const resize = (): void => chart.value?.resize();
  const clear = (): void => chart.value?.clear();
  const boostrap = async (theme: string = "light"): Promise<boolean> => {
    let echartsMod: EchartsModule;
    try {
      echartsMod = await loadModule();
      loadError.value = null;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      loadError.value = `图表模块加载失败: ${message}`;
      console.error(loadError.value);
      return false;
    }

    if (chart.value) chart.value?.dispose();
    if (isElement(container.value)) {
      chart.value = echartsMod.init(container.value, theme);
    } else {
      console.warn("容器还未初始化");
      return false;
    }

    window.removeEventListener("resize", resize);
    window.addEventListener("resize", resize);
    return true;
  };

  const setOption = async (option: EchartsOption): Promise<boolean> => {
    if (!chart.value) {
      const ready = await boostrap();
      if (!ready) return false;
    }
    chart.value?.setOption(option);
    return true;
  };

  onUnmounted(() => {
    window.removeEventListener("resize", resize);
  });
  onMounted(() => {
    window.addEventListener("resize", resize);
  });

  return { container, chart, setOption, resize, clear, loadError };
}

export default useEcharts;
