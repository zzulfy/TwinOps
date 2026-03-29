import {
  onMounted,
  onUnmounted,
  createVNode,
  defineComponent,
  h,
  render,
  nextTick,
  shallowRef,
  ref,
  reactive,
  type Ref,
} from "vue";
import * as THREE from "three";
import { sample } from "lodash";
import WidgetLabel from "@/components/WidgetLabel.vue";
import useThree from "./useThree";

type CSS2DObjectCtor = new (element: HTMLElement) => THREE.Object3D;
let css2DObjectCtorPromise: Promise<CSS2DObjectCtor> | null = null;

const getCSS2DObjectCtor = async (): Promise<CSS2DObjectCtor> => {
  if (!css2DObjectCtorPromise) {
    css2DObjectCtorPromise = import("three/examples/jsm/renderers/CSS2DRenderer.js").then(
      (mod) => mod.CSS2DObject as unknown as CSS2DObjectCtor
    );
  }
  return css2DObjectCtorPromise;
};

// 模型路径信息
const Sources = {
  BuildingModel: "/models/base.glb",
  DeviceModel: "/models/devices.glb",
  LineModel: "/models/lines.gltf",
};

// 设备名称点位信息
const LabelPositions = [
  {
    name: "1# 服务器机柜",
    position: [-32, 8, -22],
  },
  {
    name: "2# 服务器机柜",
    position: [-20.2, 8, -22],
  },
  {
    name: "3# 服务器机柜",
    position: [-8.4, 8, -22],
  },
  {
    name: "4# 服务器机柜",
    position: [3.4, 8, -22],
  },
  {
    name: "5# 服务器机柜",
    position: [15.2, 8, -22],
  },
  {
    name: "6# 服务器机柜",
    position: [27, 8, -22],
  },
  {
    name: "1# 网络设备",
    position: [-32, 8, -6],
  },
  {
    name: "2# 网络设备",
    position: [-20.2, 8, -6],
  },
  {
    name: "3# 网络设备",
    position: [-8.4, 8, -6],
  },
  {
    name: "4# 网络设备",
    position: [3.4, 8, -6],
  },
  {
    name: "5# 网络设备",
    position: [15.2, 8, -6],
  },
  {
    name: "6# 网络设备",
    position: [27, 8, -6],
  },
  {
    name: "1# 电源柜",
    position: [-33, 6, 14],
  },
  {
    name: "2# 电源柜",
    position: [-21.2, 6, 14],
  },
  {
    name: "3# 电源柜",
    position: [-9.4, 6, 14],
  },
  {
    name: "4# 电源柜",
    position: [2.4, 6, 14],
  },
  {
    name: "5# 电源柜",
    position: [14.2, 6, 14],
  },
  {
    name: "6# 电源柜",
    position: [26, 6, 14],
  },
];

export function useDataCenter(externalContainer?: Ref<HTMLElement | null>) {
  const {
    container,
    scene,
    loadGltf,
    renderMixins,
    enableControls,
    disableControls,
    boostrapPromise,
  } = useThree(externalContainer);

  interface ModelsType {
    building: THREE.Group | null;
    devices: THREE.Group | null;
    lines: THREE.Group | null;
  }

  const models: ModelsType = {
    building: null,
    devices: null,
    lines: null,
  };
  const loading = reactive({
    total: 3, // 全部
    loaded: 0, // 已加载
    isLoading: true, // 执行状态
  });

  const devices = shallowRef<THREE.Mesh[]>([]);
  const warmingTimer = ref<number | null>(null);
  const warmingCurrent = shallowRef<THREE.Mesh | null>(null);

  // 加载模型
  const loadModel = async () => {
    const loadBuildingModel = async () => {
      try {
        console.log("开始加载建筑模型:", Sources.BuildingModel);
        const gltf = await loadGltf(Sources.BuildingModel);
        loading.loaded += 1;
        models.building = gltf.scene;
        scene.value!.add(gltf.scene);
        console.log("建筑模型加载成功");
      } catch (error) {
        console.error("建筑模型加载失败:", error);
        loading.loaded += 1; // 即使失败，也要增加加载计数，避免界面卡死
      }
    };
    const loadDeviceModel = async () => {
      try {
        console.log("开始加载设备模型:", Sources.DeviceModel);
        const gltf: { scene: THREE.Group } = await loadGltf(
          Sources.DeviceModel
        );
        // 打印设备模型结构
        console.log("设备模型结构:", gltf.scene);
        console.log("设备模型子对象:", gltf.scene.children);
        gltf.scene.children.forEach((child, index) => {
          console.log(`子对象 ${index}:`, child.name);
          if (child.children) {
            child.children.forEach((grandChild, grandIndex) => {
              console.log(`  孙对象 ${grandIndex}:`, grandChild.name);
            });
          }
        });

        // 查找并加载所有设备组的设备
        // 遍历场景所有子对象，找到所有可能包含设备的组
        gltf.scene.children.forEach((child, index) => {
          if (child.name.includes("设备") && child.children) {
            console.log(`加载设备组 ${index}: ${child.name}，包含 ${child.children.length} 个设备`);
            devices.value.push(
              ...(child.children as unknown as THREE.Mesh[])
            );
          }
        });

        console.log("加载的设备总数:", devices.value.length);
        loading.loaded += 1;
        models.devices = gltf.scene;
        scene.value!.add(gltf.scene);
        console.log("设备模型加载成功");
        console.log("加载的设备数量:", devices.value.length);
      } catch (error) {
        console.error("设备模型加载失败:", error);
        loading.loaded += 1; // 即使失败，也要增加加载计数，避免界面卡死
      }
    };
    const loadLineModel = async () => {
      try {
        console.log("开始加载线路模型:", Sources.LineModel);
        const gltf = await loadGltf(Sources.LineModel);
        loading.loaded += 1;
        models.lines = gltf.scene;
        scene.value!.add(gltf.scene);
        console.log("线路模型加载成功");
      } catch (error) {
        console.error("线路模型加载失败:", error);
        loading.loaded += 1; // 即使失败，也要增加加载计数，避免界面卡死
      }
    };
    await Promise.all([
      loadBuildingModel(),
      loadDeviceModel(),
      loadLineModel(),
    ]);
    // 移除道路箭头
    removeRoadArrows();
    // 打印设备加载信息
    console.log("设备数组长度:", devices.value.length);
    console.log("设备数组内容:", devices.value);
    // 自动启动模拟告警（常开）
    startWarming();
    loading.isLoading = false;
    loading.loaded = 3;
  };
  // 移除道路箭头
  const removeRoadArrows = () => {
    if (!models.building) return;
    const arrowsToRemove: THREE.Object3D[] = [];
    models.building.traverse((mesh: THREE.Object3D) => {
      if ("name" in mesh && mesh.name.includes("道路箭头")) {
        arrowsToRemove.push(mesh);
      }
    });
    arrowsToRemove.forEach(arrow => {
      if (arrow.parent) {
        arrow.parent.remove(arrow);
      }
    });
    console.log(`已移除 ${arrowsToRemove.length} 个道路箭头`);
  };

  // 添加设备名称标识
  const addDeviceLabels = () => {
    console.log("addDeviceLabels 函数被调用");
    if (!scene.value) {
      console.warn("场景未初始化，无法添加设备标签");
      return;
    }

    getCSS2DObjectCtor()
      .then((CSS2DObjectCtorClass) => {
        const cRender = <T extends object>(
          component: any,
          props: T
        ): HTMLElement | null => {
          const newComponent = defineComponent({
            render() {
              return h(component, props);
            },
          });
          const instance = createVNode(newComponent);
          render(instance, document.createElement("div"));
          return instance.el as HTMLElement;
        };
        console.log("LabelPositions 数组长度:", LabelPositions.length);
        LabelPositions.forEach((item, index) => {
          console.log(`正在添加第 ${index + 1} 个设备标签:`, item);
          const element = cRender(WidgetLabel, item);
          if (element) {
            console.log("成功创建 DOM 元素:", element.outerHTML);
            const label = new CSS2DObjectCtorClass(element);
            label.position.set(
              item.position[0],
              item.position[1],
              item.position[2]
            );
            scene.value!.add(label);
            console.log("成功添加到场景");
          } else {
            console.warn("无法创建 DOM 元素");
          }
        });
      })
      .catch((error) => {
        console.warn("标签渲染模块加载失败，跳过设备标签", error);
      });
  };

  // 开始模拟告警
  const startWarming = () => {
    // 停止之前的定时器
    if (warmingTimer.value) {
      window.clearInterval(warmingTimer.value);
      warmingTimer.value = null;
    }

    // 预警设备名称列表（与 WidgetPanel06.vue 中的预警列表对应）
    const alarmDeviceNames = [
      "1# 服务器机柜",
      "2# 服务器机柜",
      "3# 服务器机柜",
      "1# 网络设备",
      "6# 网络设备",
      "1# 电源柜",
      "2# 电源柜",
      "3# 电源柜",
      "4# 电源柜",
      "5# 电源柜",
      "6# 电源柜"
    ];

    console.log("设备数组内容:", devices.value);
    console.log("设备数组长度:", devices.value.length);

    // 根据设备名称找到对应的索引
    // 现在设备数组可能包含了多个设备组的设备，我们需要根据 LabelPositions 数组中的位置来匹配
    const alarmDeviceIndices = alarmDeviceNames.map(name => {
      const labelIndex = LabelPositions.findIndex(pos => pos.name === name);
      console.log(`设备 "${name}" 在 LabelPositions 中的索引:`, labelIndex);
      return labelIndex;
    }).filter(index => index !== -1); // 过滤掉未找到的设备

    console.log("告警设备索引:", alarmDeviceIndices);

    // 瞬间标红所有告警设备
    alarmDeviceIndices.forEach(index => {
      const device = devices.value[index];
      if (device) {
        console.log(`找到告警设备 ${index}:`, device);
        device.traverse((originalMesh: THREE.Object3D) => {
          if (!(originalMesh instanceof THREE.Mesh)) return;
          const mesh = originalMesh as unknown as THREE.Mesh & {
            currentHex?: number;
          };
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((m) => m.clone());
          } else {
            mesh.material = mesh.material.clone();
          }
          const material = Array.isArray(mesh.material)
            ? mesh.material[0]
            : mesh.material;
          if (material && "emissive" in material) {
            const emissiveMaterial = material as unknown as {
              emissive: { getHex: () => number; setHex: (hex: number) => void };
            };
            mesh.currentHex =
              mesh.currentHex ?? emissiveMaterial.emissive.getHex();
            emissiveMaterial.emissive.setHex(0xff0000);
          }
        });
      } else {
        console.warn(`未找到索引为 ${index} 的设备`);
      }
    });
  };

  // 停止模拟告警
  const stopWarming = () => {
    if (warmingTimer.value) {
      window.clearInterval(warmingTimer.value);
      warmingTimer.value = null;
    }
    // 恢复所有设备的原始颜色
    devices.value.forEach(device => {
      if (device) {
        device.traverse((mesh: THREE.Object3D) => {
          if (!(mesh instanceof THREE.Mesh)) return;
          const meshWithCurrentHex = mesh as unknown as {
    currentHex: number;
    material: THREE.Material | THREE.Material[]
  };
          if (Array.isArray(meshWithCurrentHex.material)) {
            meshWithCurrentHex.material.forEach((m: THREE.Material) => {
              if (m && "emissive" in m) {
                const emissiveMaterial = m as unknown as {
                  emissive: { setHex: (hex: number) => void };
                };
                emissiveMaterial.emissive.setHex(meshWithCurrentHex.currentHex);
              }
            });
          } else if (
            meshWithCurrentHex.material &&
            "emissive" in meshWithCurrentHex.material
          ) {
            const emissiveMaterial = meshWithCurrentHex.material as unknown as {
              emissive: { setHex: (hex: number) => void };
            };
            emissiveMaterial.emissive.setHex(meshWithCurrentHex.currentHex);
          }
        });
      }
    });
  };

  onMounted(() => {
    console.log("useDataCenter onMounted 钩子被调用");
    nextTick(async () => {
      try {
        console.log("开始等待 boostrapPromise 解析");
        await boostrapPromise;
        console.log("boostrapPromise 已解析");
        // 确保场景已初始化
        if (scene.value) {
          console.log("场景已初始化，开始加载模型");
          await loadModel();
          addDeviceLabels();
        } else {
          console.error("场景初始化失败，无法继续加载模型");
        }
      } catch (error) {
        console.error("初始化过程中发生错误：", error);
      }
    });
  });

  // 组件卸载时清理定时器
  onUnmounted(() => {
    stopWarming();
  });
  return {
    container,
    loadModel,
    loading,
    startWarming,
    stopWarming,
    enableControls,
    disableControls,
  };
}

export default useDataCenter;
