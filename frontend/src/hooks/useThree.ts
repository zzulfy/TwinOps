import { onMounted, onUnmounted, ref, shallowRef, nextTick, type Ref } from "vue";
import { isFunction } from "lodash";
import * as THREE from "three";

type OrbitControlsLike = {
  enabled: boolean;
  minPolarAngle: number;
  enableDamping: boolean;
  dampingFactor: number;
  target: THREE.Vector3;
  maxPolarAngle: number;
  minDistance: number;
  maxDistance: number;
  update: () => void;
};

type CSS2DRendererLike = {
  domElement: HTMLElement;
  setSize: (width: number, height: number) => void;
  render: (scene: THREE.Scene, camera: THREE.Camera) => void;
};

type GltfLike = {
  scene: THREE.Group;
};

export function useThree(externalContainer?: Ref<HTMLElement | null>) {
  const container = externalContainer || ref<HTMLElement | null>(null);
  const scene = shallowRef<THREE.Scene | null>(null);
  const camera = shallowRef<THREE.Camera | null>(null);
  const renderer = shallowRef<THREE.WebGLRenderer | null>(null);
  const cssRenderer = shallowRef<CSS2DRendererLike | null>(null);
  const controls = shallowRef<OrbitControlsLike | null>(null);
  const composers = new Map<string, any>();
  const mixers: THREE.AnimationMixer[] = [];
  const clock = new THREE.Clock();
  const renderMixins = new Map<string, (delta: number) => void>();
  let tweenUpdate: (() => void) | null = null;
  let controlsPromise: Promise<{
    OrbitControls: new (camera: THREE.Camera, element: HTMLElement) => OrbitControlsLike;
  }> | null = null;
  let cssRendererPromise: Promise<{
    CSS2DRenderer: new () => CSS2DRendererLike;
  }> | null = null;
  let gltfLoaderPromise: Promise<{
    GLTFLoader: new () => {
      setDRACOLoader: (loader: any) => void;
      load: (
        url: string,
        onLoad: (object: GltfLike) => void,
        onProgress: undefined,
        onError: (error: unknown) => void
      ) => void;
    };
    DRACOLoader: new () => {
      setDecoderPath: (path: string) => void;
      setDecoderConfig: (config: Record<string, string>) => void;
    };
  }> | null = null;
  let dracoLoader: {
    setDecoderPath: (path: string) => void;
    setDecoderConfig: (config: Record<string, string>) => void;
  } | null = null;

  const getOrbitControls = async () => {
    if (!controlsPromise) {
      controlsPromise = import("three/examples/jsm/controls/OrbitControls.js").then((mod) => ({
        OrbitControls: mod.OrbitControls as unknown as new (
          camera: THREE.Camera,
          element: HTMLElement
        ) => OrbitControlsLike,
      }));
    }
    return controlsPromise;
  };

  const getCSS2DRenderer = async () => {
    if (!cssRendererPromise) {
      cssRendererPromise = import("three/examples/jsm/renderers/CSS2DRenderer.js").then((mod) => ({
        CSS2DRenderer: mod.CSS2DRenderer as unknown as new () => CSS2DRendererLike,
      }));
    }
    return cssRendererPromise;
  };

  const ensureTweenUpdate = async (): Promise<void> => {
    if (tweenUpdate) return;
    try {
      const module = await import("three/examples/jsm/libs/tween.module.js");
      tweenUpdate = () => module.default.update();
    } catch (error) {
      console.warn("Tween 模块加载失败，跳过补间更新", error);
      tweenUpdate = null;
    }
  };

  const getLoaders = async () => {
    if (!gltfLoaderPromise) {
      gltfLoaderPromise = Promise.all([
        import("three/examples/jsm/loaders/GLTFLoader.js"),
        import("three/examples/jsm/loaders/DRACOLoader.js"),
      ]).then(([gltfModule, dracoModule]) => ({
        GLTFLoader: gltfModule.GLTFLoader as unknown as {
          new (): {
            setDRACOLoader: (loader: any) => void;
            load: (
              url: string,
              onLoad: (object: GltfLike) => void,
              onProgress: undefined,
              onError: (error: unknown) => void
            ) => void;
          };
        },
        DRACOLoader: dracoModule.DRACOLoader as unknown as {
          new (): {
            setDecoderPath: (path: string) => void;
            setDecoderConfig: (config: Record<string, string>) => void;
          };
        },
      }));
    }
    return gltfLoaderPromise;
  };

  const animate = (): void => {
    const delta = clock.getDelta();
    if (renderer.value && scene.value && camera.value) {
      renderer.value.render(scene.value, camera.value);
      const mixerUpdateDelta = clock.getDelta();
      mixers.forEach((mixer: THREE.AnimationMixer) =>
        mixer.update(mixerUpdateDelta)
      );
      composers.forEach((composer) => composer.render(delta));
      renderMixins.forEach((mixin) => isFunction(mixin) && mixin(delta));
      if (cssRenderer.value) {
        cssRenderer.value.render(scene.value, camera.value);
      }
      tweenUpdate?.();
    }
    requestAnimationFrame(animate);
  };

  const boostrap = async (): Promise<void> => {
    if (!container.value) return;
    const { clientWidth, clientHeight } = container.value;

    // Scene
    scene.value = new THREE.Scene();

    // Camera
    camera.value = new THREE.PerspectiveCamera(
      45,
      clientWidth / clientHeight,
      1,
      10000
    );
    camera.value.position.set(20, 15, 20);

    // Renderer
    renderer.value = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.value.shadowMap.enabled = false;
    renderer.value.setSize(clientWidth, clientHeight);
    renderer.value.setClearAlpha(0.5);
    container.value.appendChild(renderer.value.domElement);

    try {
      const [{ CSS2DRenderer }, { OrbitControls }] = await Promise.all([
        getCSS2DRenderer(),
        getOrbitControls(),
      ]);

      cssRenderer.value = new CSS2DRenderer();
      cssRenderer.value.setSize(clientWidth, clientHeight);
      cssRenderer.value.domElement.className = "css2d-renderer";
      cssRenderer.value.domElement.style.position = "absolute";
      cssRenderer.value.domElement.style.top = "0px";
      cssRenderer.value.domElement.style.pointerEvents = "none";
      cssRenderer.value.domElement.style.zIndex = "100";
      container.value.appendChild(cssRenderer.value.domElement);

      if (camera.value && renderer.value) {
        controls.value = new OrbitControls(
          camera.value,
          renderer.value.domElement
        );
        controls.value.minPolarAngle = 0;
        controls.value.enableDamping = true;
        controls.value.dampingFactor = 0.1;
        controls.value.target.set(0, 5, 0);
        controls.value.maxPolarAngle = Math.PI / 2;
        controls.value.minDistance = 10;
        controls.value.maxDistance = 100;
        controls.value.update();
      }
    } catch (error) {
      console.warn("Three Addons 延迟加载失败，启用无标签简化模式", error);
    }

    // Lights
    if (scene.value) {
      const ambientLight = new THREE.AmbientLight(0x999999, 10);
      scene.value.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(20, 20, 20);
      directionalLight.position.multiplyScalar(1);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
      scene.value.add(directionalLight);
    }

    await ensureTweenUpdate();
  };

  const loadGltf = async (url: string): Promise<GltfLike> => {
    const { GLTFLoader, DRACOLoader } = await getLoaders();
    if (!dracoLoader) {
      dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("/js/draco/gltf/");
      dracoLoader.setDecoderConfig({ type: "js" });
    }

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    const onCompleted = (object: GltfLike, resolve: (value: GltfLike) => void) =>
      resolve(object);
    const onError = (error: unknown, reject: (reason?: unknown) => void) => {
      console.error("模型加载失败:", url, error);
      reject(error);
    };

    return new Promise<GltfLike>((resolve, reject) => {
      loader.load(
        url,
        (object: GltfLike) => onCompleted(object, resolve),
        undefined,
        (error: unknown) => onError(error, reject)
      );
    });
  };

  const boostrapPromise = new Promise<void>((resolve, reject) => {
    onMounted(() => {
      const init = () => {
        console.log("boostrap 调用时 container.value:", container.value);
        try {
          // 确保容器有正确的尺寸
          if (!container.value || container.value.clientHeight === 0) {
            console.log("容器尺寸为0，等待DOM更新");
            setTimeout(init, 100);
            return;
          }

          boostrap()
            .then(() => {
              if (scene.value && camera.value && renderer.value) {
                console.log("Three.js 场景初始化成功");
                window.addEventListener("resize", handleResize);
                animate();
                resolve();
                return;
              }

              console.error("Three.js 场景初始化失败：缺少必要组件", {
                scene: !!scene.value,
                camera: !!camera.value,
                renderer: !!renderer.value,
                container: !!container.value,
              });
              reject(new Error("Three.js 场景初始化失败"));
            })
            .catch((error) => {
              console.error("Three.js 场景初始化过程中发生错误：", error);
              reject(error);
            });
        } catch (error) {
          console.error("Three.js 场景初始化过程中发生错误：", error);
          reject(error);
        }
      };

      // 检查容器是否已经准备好，否则等待更长时间
      if (container.value) {
        console.log("容器已经准备好，立即初始化");
        init();
      } else {
        console.log("容器尚未准备好，等待 500ms 后重试");
        setTimeout(init, 500);
      }
    });

    onUnmounted(() => {
      window.removeEventListener("resize", handleResize);
    });
  });

  // 窗口大小变化处理
  const handleResize = () => {
    if (!container.value || !camera.value || !renderer.value || !cssRenderer.value) return;

    const { clientWidth, clientHeight } = container.value;

    // 确保是透视相机
    if (camera.value instanceof THREE.PerspectiveCamera) {
      camera.value.aspect = clientWidth / clientHeight;
      camera.value.updateProjectionMatrix();
    }

    renderer.value.setSize(clientWidth, clientHeight);
    cssRenderer.value.setSize(clientWidth, clientHeight);
  };

  // 启用/禁用轨道控制
  const enableControls = () => {
    if (controls.value) {
      controls.value.enabled = true;
    }
  };

  const disableControls = () => {
    if (controls.value) {
      controls.value.enabled = false;
    }
  };

  return {
    container,
    scene,
    camera,
    renderer,
    cssRenderer,
    controls,
    mixers,
    renderMixins,
    composers,
    loadGltf,
    enableControls,
    disableControls,
    boostrapPromise,
  };
}

export default useThree;
