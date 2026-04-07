import { useEffect, type RefObject } from "react";

type CanvasRef = RefObject<HTMLCanvasElement | null>;
const EDGE_ZONE_RATIO = 0.2;
const INSPECTION_KEYWORDS = [
  "arrow",
  "patrol",
  "inspection",
  "inspect",
  "route",
  "path",
  "waypoint",
  "trace",
  "line",
  "巡检",
  "路径",
  "箭头",
];

export default function useDashboardScene(canvasRef: CanvasRef): void {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    let disposed = false;
    let animationFrameId = 0;
    const cleanups: Array<() => void> = [];

    const boot = async () => {
      const [{ AmbientLight, BoxGeometry, Color, DirectionalLight, Group, MOUSE, Mesh, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, Scene, WebGLRenderer }, { OrbitControls }, { GLTFLoader }, { DRACOLoader }] =
        await Promise.all([
          import("three"),
          import("three/examples/jsm/controls/OrbitControls.js"),
          import("three/examples/jsm/loaders/GLTFLoader.js"),
          import("three/examples/jsm/loaders/DRACOLoader.js"),
        ]);
      if (disposed) {
        return;
      }

      const scene = new Scene();
      scene.background = new Color(0x061326);

      const camera = new PerspectiveCamera(46, 1, 0.1, 200);
      camera.position.set(10, 9, 12);
      camera.lookAt(0, 0, 0);

      const renderer = new WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enableRotate = true;
      controls.enableZoom = true;
      controls.enablePan = true;
      controls.panSpeed = 0.7;
      controls.zoomSpeed = 0.9;
      controls.rotateSpeed = 0.7;
      controls.screenSpacePanning = true;
      controls.mouseButtons = {
        LEFT: MOUSE.ROTATE,
        MIDDLE: MOUSE.DOLLY,
        RIGHT: MOUSE.PAN,
      };
      controls.minDistance = 4;
      controls.maxDistance = 40;
      controls.minPolarAngle = 0.05;
      controls.maxPolarAngle = Math.PI * 0.495;

      const resetLeftDragMode = () => {
        controls.mouseButtons.LEFT = MOUSE.ROTATE;
      };
      const onPointerDown = (event: PointerEvent) => {
        if (event.button !== 0) {
          return;
        }
        const rect = canvas.getBoundingClientRect();
        const localX = event.clientX - rect.left;
        const localY = event.clientY - rect.top;
        const edgeX = rect.width * EDGE_ZONE_RATIO;
        const edgeY = rect.height * EDGE_ZONE_RATIO;
        const inEdgeZone =
          localX <= edgeX || localX >= rect.width - edgeX || localY <= edgeY || localY >= rect.height - edgeY;
        controls.mouseButtons.LEFT = inEdgeZone ? MOUSE.PAN : MOUSE.ROTATE;
      };
      const onPointerUp = (event: PointerEvent) => {
        if (event.button !== 0) {
          return;
        }
        resetLeftDragMode();
      };
      const onWindowBlur = () => {
        resetLeftDragMode();
      };
      canvas.addEventListener("pointerdown", onPointerDown, { capture: true });
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
      window.addEventListener("blur", onWindowBlur);

      const ambientLight = new AmbientLight(0x79a7ff, 1.25);
      scene.add(ambientLight);
      const keyLight = new DirectionalLight(0x8fd4ff, 1.2);
      keyLight.position.set(8, 12, 7);
      scene.add(keyLight);
      const rimLight = new DirectionalLight(0x69ffc6, 0.7);
      rimLight.position.set(-10, 8, -9);
      scene.add(rimLight);

      const ground = new Mesh(
        new PlaneGeometry(26, 26),
        new MeshStandardMaterial({ color: 0x0b213f, roughness: 0.85, metalness: 0.15 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.9;
      scene.add(ground);

      const loader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("/js/draco/");
      loader.setDRACOLoader(dracoLoader);

      const modelGroup = new Group();
      scene.add(modelGroup);
      const fallbackGroup = new Group();
      fallbackGroup.visible = false;
      scene.add(fallbackGroup);

      const rackGeometry = new BoxGeometry(0.9, 2.2, 0.9);
      const rackMaterial = new MeshStandardMaterial({
        color: 0x4f8cf6,
        emissive: 0x123a78,
        roughness: 0.35,
        metalness: 0.55,
      });
      const topGeometry = new BoxGeometry(0.95, 0.12, 0.95);
      const topMaterial = new MeshStandardMaterial({
        color: 0x1d2f4f,
        emissive: 0x12304f,
        roughness: 0.42,
        metalness: 0.4,
      });
      const statusLightGeometry = new BoxGeometry(0.08, 0.08, 0.08);
      const statusLightMaterial = new MeshStandardMaterial({
        color: 0x4effc3,
        emissive: 0x31a87f,
        roughness: 0.25,
        metalness: 0.1,
      });

      for (let row = 0; row < 3; row += 1) {
        for (let col = 0; col < 5; col += 1) {
          const baseX = col * 2.1 - 4.2;
          const baseZ = row * 2.3 - 2.3;
          const rack = new Mesh(rackGeometry, rackMaterial);
          rack.position.set(baseX, 0.2, baseZ);
          fallbackGroup.add(rack);

          const cap = new Mesh(topGeometry, topMaterial);
          cap.position.set(baseX, 1.32, baseZ);
          fallbackGroup.add(cap);

          const statusLight = new Mesh(statusLightGeometry, statusLightMaterial);
          statusLight.position.set(baseX - 0.3, 1.0, baseZ + 0.38);
          fallbackGroup.add(statusLight);
        }
      }

      const expectedModels = [
        { url: "/models/base.glb", scale: 1.6, y: -0.9 },
        { url: "/models/devices.glb", scale: 1.2, y: -0.8 },
      ];
      let pendingModels = expectedModels.length;
      let loadedModels = 0;
      const finalizeModelLoading = () => {
        pendingModels -= 1;
        if (pendingModels > 0) {
          return;
        }
        if (loadedModels === 0) {
          fallbackGroup.visible = true;
          console.warn("[DashboardScene] all simulation models failed to load, fallback rendering enabled");
        }
      };

      const loadModel = (url: string, onLoad: (g: any) => void) => {
        loader.load(
          url,
          (gltf) => {
            if (disposed) {
              return;
            }
            loadedModels += 1;
            onLoad(gltf.scene);
            finalizeModelLoading();
          },
          undefined,
          (error) => {
            console.warn(`[DashboardScene] model load failed: ${url}`, error);
            finalizeModelLoading();
          }
        );
      };
      const hideInspectionOverlays = (root: any) => {
        let hiddenCount = 0;
        root.traverse((node: any) => {
          const materialNames = Array.isArray(node.material)
            ? node.material.map((item: any) => item?.name ?? "").join(" ")
            : node.material?.name ?? "";
          const text = `${node.name ?? ""} ${materialNames}`.toLowerCase();
          const byKeyword = INSPECTION_KEYWORDS.some((keyword) => text.includes(keyword));
          const byLineType = typeof node.type === "string" && node.type.includes("Line");
          if (byKeyword || byLineType) {
            node.visible = false;
            hiddenCount += 1;
          }
        });
        if (hiddenCount > 0) {
          console.info(`[DashboardScene] hidden inspection overlays: ${hiddenCount}`);
        }
      };
      expectedModels.forEach((item) => {
        loadModel(item.url, (model) => {
          hideInspectionOverlays(model);
          model.scale.set(item.scale, item.scale, item.scale);
          model.position.set(0, item.y, 0);
          modelGroup.add(model);
        });
      });

      const resize = () => {
        const width = canvas.clientWidth || canvas.parentElement?.clientWidth || 1;
        const height = canvas.clientHeight || canvas.parentElement?.clientHeight || 1;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };
      resize();
      window.addEventListener("resize", resize);

      const tick = () => {
        if (disposed) {
          return;
        }
        controls.update();
        renderer.render(scene, camera);
        animationFrameId = window.requestAnimationFrame(tick);
      };
      tick();

      cleanups.push(() => {
        canvas.removeEventListener("pointerdown", onPointerDown, { capture: true });
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);
        window.removeEventListener("blur", onWindowBlur);
        window.removeEventListener("resize", resize);
        window.cancelAnimationFrame(animationFrameId);
        controls.dispose();
        rackGeometry.dispose();
        rackMaterial.dispose();
        topGeometry.dispose();
        topMaterial.dispose();
        statusLightGeometry.dispose();
        statusLightMaterial.dispose();
        dracoLoader.dispose();
        renderer.dispose();
      });
    };

    void boot();

    return () => {
      disposed = true;
      cleanups.forEach((fn) => fn());
    };
  }, [canvasRef]);
}

