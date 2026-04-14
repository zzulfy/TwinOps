import { useEffect, useMemo, useRef, type RefObject } from "react";

type CanvasRef = RefObject<HTMLCanvasElement | null>;

export interface SceneDeviceBinding {
  objectId: string;
  deviceCode: string;
  labelKey: string;
  name: string;
  visualFamily: string;
  status: "normal" | "warning" | "warn" | "error";
}

interface UseDashboardSceneOptions {
  devices: SceneDeviceBinding[];
  onDeviceClick: (deviceCode: string | null) => void;
  interactionEnabled: boolean;
}

type CabinetFeature = "power" | "switchgear" | "control" | "network" | "compact";

interface CabinetProfile {
  width: number;
  height: number;
  depth: number;
  bodyColor: number;
  doorColor: number;
  accentColor: number;
  trimColor: number;
  feature: CabinetFeature;
}

interface SceneSlot {
  x: number;
  z: number;
  rotationY: number;
  bank: string;
}

interface ScenePlacement extends SceneSlot {
  device: SceneDeviceBinding;
}

const PICK_DRAG_THRESHOLD_PX = 6;
const EDGE_PAN_ZONE_RATIO = 0.18;
const EDGE_PAN_ZONE_MIN_PX = 72;
const EDGE_PAN_ZONE_MAX_PX = 124;
const DISABLED_MOUSE_BUTTON = -1;

const STATUS_STYLE = {
  normal: {
    color: 0x58c36f,
    emissive: 0x1b6e39,
    baseEmissive: 0.44,
    pulseAmplitude: 0.05,
    pulseSpeed: 1.4,
    stripOpacity: 0.44,
    beaconOpacity: 0.9,
  },
  warning: {
    color: 0xf0c454,
    emissive: 0x9e6f0d,
    baseEmissive: 0.72,
    pulseAmplitude: 0.34,
    pulseSpeed: 2.2,
    stripOpacity: 0.66,
    beaconOpacity: 0.98,
  },
  error: {
    color: 0xe35d5d,
    emissive: 0xaa2d2d,
    baseEmissive: 0.92,
    pulseAmplitude: 0.52,
    pulseSpeed: 4.4,
    stripOpacity: 0.82,
    beaconOpacity: 1,
  },
} as const;

const DEFAULT_PROFILE: CabinetProfile = {
  width: 0.9,
  height: 2.34,
  depth: 0.92,
  bodyColor: 0xd5dde7,
  doorColor: 0x617887,
  accentColor: 0x8eaed1,
  trimColor: 0x223548,
  feature: "control",
};

const CABINET_PROFILES: Record<string, CabinetProfile> = {
  "mv-switchgear": {
    width: 1.02,
    height: 2.56,
    depth: 1.08,
    bodyColor: 0xd5dde8,
    doorColor: 0x5d7d70,
    accentColor: 0x8fb0d6,
    trimColor: 0x1f3245,
    feature: "switchgear",
  },
  "gis-switchgear": {
    width: 1.16,
    height: 2.52,
    depth: 1.16,
    bodyColor: 0xd9e1eb,
    doorColor: 0x627d74,
    accentColor: 0x78a9d7,
    trimColor: 0x203246,
    feature: "switchgear",
  },
  "lv-switchgear": {
    width: 0.9,
    height: 2.34,
    depth: 0.96,
    bodyColor: 0xd7dfe8,
    doorColor: 0x5f7f73,
    accentColor: 0x89a9c8,
    trimColor: 0x213445,
    feature: "switchgear",
  },
  "power-distribution": {
    width: 0.96,
    height: 2.28,
    depth: 0.98,
    bodyColor: 0xd5dee7,
    doorColor: 0x5d786d,
    accentColor: 0x8ca3bc,
    trimColor: 0x243548,
    feature: "switchgear",
  },
  "integrated-power-cabinet": {
    width: 1.34,
    height: 2.72,
    depth: 1.18,
    bodyColor: 0xd8e1ea,
    doorColor: 0x5f756c,
    accentColor: 0x7ea2ce,
    trimColor: 0x213548,
    feature: "power",
  },
  "svg-cabinet": {
    width: 1.26,
    height: 2.68,
    depth: 1.14,
    bodyColor: 0xd7e1ea,
    doorColor: 0x54756a,
    accentColor: 0x6fbbcb,
    trimColor: 0x1f3346,
    feature: "power",
  },
  "ups-cabinet": {
    width: 1.14,
    height: 2.52,
    depth: 1.06,
    bodyColor: 0xd8e1ea,
    doorColor: 0x5e726b,
    accentColor: 0x86aac8,
    trimColor: 0x243548,
    feature: "power",
  },
  "apf-cabinet": {
    width: 1.12,
    height: 2.46,
    depth: 1.02,
    bodyColor: 0xd7e0ea,
    doorColor: 0x5d746d,
    accentColor: 0x8bb5c7,
    trimColor: 0x233448,
    feature: "power",
  },
  "control-cabinet": {
    width: 0.94,
    height: 2.42,
    depth: 0.9,
    bodyColor: 0xd5dee8,
    doorColor: 0x627989,
    accentColor: 0x7b9bc0,
    trimColor: 0x223548,
    feature: "control",
  },
  "dc-power-cabinet": {
    width: 0.92,
    height: 2.38,
    depth: 0.94,
    bodyColor: 0xd8e0e9,
    doorColor: 0x5d7382,
    accentColor: 0x80a6bd,
    trimColor: 0x213549,
    feature: "control",
  },
  "precision-pdu": {
    width: 0.86,
    height: 2.34,
    depth: 0.82,
    bodyColor: 0xd9e2ea,
    doorColor: 0x627784,
    accentColor: 0x86a8ca,
    trimColor: 0x223446,
    feature: "control",
  },
  "network-cabinet": {
    width: 0.74,
    height: 2.3,
    depth: 0.8,
    bodyColor: 0xd3dce6,
    doorColor: 0x4f6474,
    accentColor: 0x6fa8cf,
    trimColor: 0x1f3144,
    feature: "network",
  },
  "distribution-box": {
    width: 0.7,
    height: 2.02,
    depth: 0.56,
    bodyColor: 0xdce4ed,
    doorColor: 0x6f808f,
    accentColor: 0x93b1cb,
    trimColor: 0x243546,
    feature: "compact",
  },
};

const HERO_FAMILIES = new Set([
  "integrated-power-cabinet",
  "svg-cabinet",
  "ups-cabinet",
  "apf-cabinet",
]);

const SWITCHGEAR_FAMILIES = new Set([
  "mv-switchgear",
  "gis-switchgear",
  "lv-switchgear",
  "power-distribution",
]);

const FAMILY_PRIORITY: Record<string, number> = {
  "svg-cabinet": 0,
  "integrated-power-cabinet": 1,
  "ups-cabinet": 2,
  "apf-cabinet": 3,
  "mv-switchgear": 4,
  "gis-switchgear": 5,
  "lv-switchgear": 6,
  "power-distribution": 7,
  "control-cabinet": 8,
  "dc-power-cabinet": 9,
  "precision-pdu": 10,
  "network-cabinet": 11,
  "distribution-box": 12,
};

const ROOM_LAYOUT = {
  floorCenterX: 14.6,
  floorWidth: 60,
  floorDepth: 21.8,
  wallHeight: 7.9,
  wallZ: 9.15,
  ceilingY: 6.08,
  farWallX: 31.35,
  farWallDepth: 19.6,
  aisleCenterX: 16.75,
  aisleLength: 47.6,
  aisleWidth: 4.4,
  leftTrackZ: -2.72,
  rightTrackZ: 2.88,
  leftPlatformZ: -5.44,
  rightPlatformZ: 5.58,
  platformWidth: 5.36,
  trayCenterX: 16.9,
  trayLength: 46.4,
  trayY: 5.2,
  lightBarY: 5.72,
  entryPortalX: 4.8,
} as const;

const INDOOR_VIEW_BOUNDS = {
  targetMinX: 13.6,
  targetMaxX: 27.8,
  targetMinY: 1.26,
  targetMaxY: 2.38,
  targetMinZ: -2.46,
  targetMaxZ: 2.54,
  cameraMinX: 4.4,
  cameraMaxX: 30.6,
  cameraMinY: 1.64,
  cameraMaxY: 4.86,
  cameraMinZ: -7.12,
  cameraMaxZ: 7.18,
} as const;

function clampValue(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeDeviceStatus(value: SceneDeviceBinding["status"]): "normal" | "warning" | "error" {
  if (value === "error") {
    return "error";
  }
  if (value === "warn" || value === "warning") {
    return "warning";
  }
  return "normal";
}

function parseDeviceOrdinal(deviceCode: string): number {
  return Number.parseInt(deviceCode.replace(/\D/g, ""), 10) || 0;
}

function compareScenePriority(a: SceneDeviceBinding, b: SceneDeviceBinding): number {
  const familyGap =
    (FAMILY_PRIORITY[a.visualFamily] ?? Number.MAX_SAFE_INTEGER) -
    (FAMILY_PRIORITY[b.visualFamily] ?? Number.MAX_SAFE_INTEGER);
  if (familyGap !== 0) {
    return familyGap;
  }
  return parseDeviceOrdinal(a.deviceCode) - parseDeviceOrdinal(b.deviceCode);
}

function categoryForFamily(family: string): "hero" | "switchgear" | "control" {
  if (HERO_FAMILIES.has(family)) {
    return "hero";
  }
  if (SWITCHGEAR_FAMILIES.has(family)) {
    return "switchgear";
  }
  return "control";
}

function slotsFrom(
  values: Array<Pick<SceneSlot, "x" | "z" | "rotationY">>,
  bank: string
): SceneSlot[] {
  return values.map((item) => ({ ...item, bank }));
}

function profileForFamily(family: string): CabinetProfile {
  return CABINET_PROFILES[family] ?? DEFAULT_PROFILE;
}

const BANK_SCALE: Record<string, number> = {
  "left-front": 1.08,
  "right-front": 1.08,
  "left-main": 1.02,
  "right-main": 1.02,
  "left-rear": 0.97,
  "right-rear": 0.97,
  "far-bank": 0.92,
  fallback: 0.94,
};

function scaleForBank(bank: string): number {
  return BANK_SCALE[bank] ?? 1;
}

function buildScenePlacements(devices: SceneDeviceBinding[]): ScenePlacement[] {
  const sorted = [...devices].sort(compareScenePriority);
  const hero = sorted.filter((device) => categoryForFamily(device.visualFamily) === "hero");
  const switchgear = sorted.filter((device) => categoryForFamily(device.visualFamily) === "switchgear");
  const control = sorted.filter((device) => categoryForFamily(device.visualFamily) === "control");

  const leftFrontSlots = slotsFrom(
    [
      { x: 7.05, z: -4.82, rotationY: 0.055 },
      { x: 9.45, z: -4.68, rotationY: 0.048 },
      { x: 11.85, z: -4.8, rotationY: 0.04 },
      { x: 14.25, z: -4.64, rotationY: 0.034 },
    ],
    "left-front"
  );
  const rightFrontSlots = slotsFrom(
    [
      { x: 7.15, z: 4.92, rotationY: Math.PI - 0.052 },
      { x: 9.55, z: 4.74, rotationY: Math.PI - 0.044 },
      { x: 11.95, z: 4.9, rotationY: Math.PI - 0.036 },
      { x: 14.35, z: 4.7, rotationY: Math.PI - 0.03 },
    ],
    "right-front"
  );
  const leftMainSlots = slotsFrom(
    Array.from({ length: 5 }, (_, index) => ({
      x: 16.2 + index * 1.76,
      z: -4.44 + (index % 2 === 0 ? -0.08 : 0.1),
      rotationY: 0.038 + (index % 2 === 0 ? 0.008 : -0.004),
    })),
    "left-main"
  );
  const rightMainSlots = slotsFrom(
    Array.from({ length: 5 }, (_, index) => ({
      x: 16.3 + index * 1.78,
      z: 4.56 + (index % 2 === 0 ? 0.08 : -0.1),
      rotationY: Math.PI + (index % 2 === 0 ? -0.028 : 0.018),
    })),
    "right-main"
  );
  const leftRearSlots = slotsFrom(
    Array.from({ length: 5 }, (_, index) => ({
      x: 22.2 + index * 1.42,
      z: -5.38 + (index % 2 === 0 ? -0.08 : 0.1),
      rotationY: 0.048,
    })),
    "left-rear"
  );
  const rightRearSlots = slotsFrom(
    Array.from({ length: 5 }, (_, index) => ({
      x: 22.15 + index * 1.46,
      z: 5.52 + (index % 2 === 0 ? 0.1 : -0.1),
      rotationY: Math.PI - 0.062,
    })),
    "right-rear"
  );
  const farBankSlots = slotsFrom(
    [
      { x: 29.05, z: -4.3, rotationY: -Math.PI / 2 },
      { x: 29.16, z: -1.42, rotationY: -Math.PI / 2 },
      { x: 29.05, z: 1.56, rotationY: -Math.PI / 2 },
      { x: 29.16, z: 4.42, rotationY: -Math.PI / 2 },
    ],
    "far-bank"
  );

  const placements: ScenePlacement[] = [];
  const assignedCodes = new Set<string>();
  const assign = (list: SceneDeviceBinding[], slots: SceneSlot[]) => {
    slots.forEach((slot, index) => {
      const device = list[index];
      if (!device) {
        return;
      }
      placements.push({ device, ...slot });
      assignedCodes.add(device.deviceCode);
    });
  };

  const frontHeroCount = leftFrontSlots.length + rightFrontSlots.length;
  const rearHeroCount = Math.max(0, hero.length - frontHeroCount);
  const leftRearControlCount = leftRearSlots.length;
  const rightRearControlCount = Math.max(0, rightRearSlots.length - rearHeroCount);
  const rightMainSwitchCount = Math.max(0, rightMainSlots.length - 1);

  assign(hero.slice(0, leftFrontSlots.length), leftFrontSlots);
  assign(hero.slice(leftFrontSlots.length, frontHeroCount), rightFrontSlots);
  assign(switchgear.slice(0, leftMainSlots.length), leftMainSlots);
  assign(switchgear.slice(leftMainSlots.length, leftMainSlots.length + rightMainSwitchCount), rightMainSlots);
  assign(control.slice(0, leftRearControlCount), leftRearSlots);
  assign(hero.slice(frontHeroCount, frontHeroCount + rearHeroCount), rightRearSlots.slice(0, rearHeroCount));
  assign(
    control.slice(leftRearControlCount, leftRearControlCount + rightRearControlCount),
    rightRearSlots.slice(rearHeroCount)
  );
  assign(
    control.slice(leftRearControlCount + rightRearControlCount, leftRearControlCount + rightRearControlCount + 1),
    rightMainSlots.slice(rightMainSwitchCount)
  );
  assign(control.slice(leftRearControlCount + rightRearControlCount + 1), farBankSlots);

  const remaining = sorted.filter((device) => !assignedCodes.has(device.deviceCode));
  const fallbackSlots = slotsFrom(
    remaining.map((_, index) => ({
      x: 17.1 + index * 1.18,
      z: index % 2 === 0 ? -9.46 : 9.38,
      rotationY: index % 2 === 0 ? 0.088 : Math.PI - 0.088,
    })),
    "fallback"
  );
  assign(remaining, fallbackSlots);

  return placements;
}

export default function useDashboardScene(canvasRef: CanvasRef, options: UseDashboardSceneOptions): void {
  const interactionEnabledRef = useRef<boolean>(options.interactionEnabled);
  const onDeviceClickRef = useRef<(deviceCode: string | null) => void>(options.onDeviceClick);
  const devicesRef = useRef<SceneDeviceBinding[]>(options.devices);

  const deviceFingerprint = useMemo(
    () =>
      options.devices
        .map(
          (item) =>
            `${item.objectId}:${item.deviceCode}:${item.labelKey}:${item.name}:${item.visualFamily}:${item.status}`
        )
        .sort()
        .join("|"),
    [options.devices]
  );

  useEffect(() => {
    interactionEnabledRef.current = options.interactionEnabled;
  }, [options.interactionEnabled]);

  useEffect(() => {
    onDeviceClickRef.current = options.onDeviceClick;
  }, [options.onDeviceClick]);

  useEffect(() => {
    devicesRef.current = options.devices;
  }, [options.devices]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    let disposed = false;
    let animationFrameId = 0;
    const cleanups: Array<() => void> = [];

    const boot = async () => {
      const [
        {
          AmbientLight,
          BoxGeometry,
          Color,
          CylinderGeometry,
          DirectionalLight,
          Fog,
          Group,
          Mesh,
          MeshStandardMaterial,
          MOUSE,
          PCFSoftShadowMap,
          PerspectiveCamera,
          PointLight,
          Raycaster,
          Scene,
          SphereGeometry,
          Vector2,
          Vector3,
          WebGLRenderer,
        },
        { OrbitControls },
      ] = await Promise.all([import("three"), import("three/examples/jsm/controls/OrbitControls.js")]);
      if (disposed) {
        return;
      }

      const scene = new Scene();
      scene.background = new Color(0x0a141d);
      scene.fog = new Fog(0x0a141d, 16, 34);

      const camera = new PerspectiveCamera(42, 1, 0.1, 220);
      const introFromPosition = new Vector3(5.9, 2.78, 1.92);
      const introToPosition = new Vector3(6.86, 2.28, 1.42);
      const introFromTarget = new Vector3(15.5, 1.68, 0.64);
      const introToTarget = new Vector3(18.25, 1.56, 0.28);
      const introDurationMs = 1700;
      const easeOutCubic = (value: number) => 1 - (1 - value) ** 3;
      const introStartTime = performance.now();
      camera.position.copy(introFromPosition);
      camera.lookAt(introFromTarget);

      const renderer = new WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = PCFSoftShadowMap;
      renderer.toneMappingExposure = 1.06;

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.072;
      controls.enableRotate = true;
      controls.enableZoom = true;
      controls.enablePan = true;
      controls.panSpeed = 0.56;
      controls.zoomSpeed = 0.6;
      controls.rotateSpeed = 0.46;
      controls.screenSpacePanning = true;
      controls.mouseButtons = {
        LEFT: MOUSE.ROTATE,
        MIDDLE: MOUSE.DOLLY,
        RIGHT: DISABLED_MOUSE_BUTTON as any,
      };
      controls.minDistance = 6.8;
      controls.maxDistance = 16.2;
      controls.minPolarAngle = 0.52;
      controls.maxPolarAngle = 1.5;
      controls.minAzimuthAngle = -Infinity;
      controls.maxAzimuthAngle = Infinity;
      controls.target.copy(introFromTarget);
      controls.enabled = false;

      const raycaster = new Raycaster();
      const pointer = new Vector2();
      const interactiveRoots: any[] = [];
      const animatedSignals: Array<{
        material: any;
        base: number;
        amplitude: number;
        speed: number;
        phase: number;
        opacityBase?: number;
        opacityAmplitude?: number;
      }> = [];

      let pointerDownX = 0;
      let pointerDownY = 0;
      let pointerDownActive = false;

      const geometries: any[] = [];
      const materials: any[] = [];
      const geometryCache = new Map<string, any>();
      const materialCache = new Map<string, any>();
      const familyMaterialCache = new Map<string, any>();
      const resolveLeftDragAction = (clientX: number, clientY: number) => {
        const rect = canvas.getBoundingClientRect();
        const edgePadding = clampValue(
          Math.min(rect.width, rect.height) * EDGE_PAN_ZONE_RATIO,
          EDGE_PAN_ZONE_MIN_PX,
          EDGE_PAN_ZONE_MAX_PX
        );
        const localX = clientX - rect.left;
        const localY = clientY - rect.top;
        const insideEdgeZone =
          localX <= edgePadding ||
          localX >= rect.width - edgePadding ||
          localY <= edgePadding ||
          localY >= rect.height - edgePadding;
        return insideEdgeZone ? MOUSE.PAN : MOUSE.ROTATE;
      };
      const syncHoverCursor = (clientX: number, clientY: number) => {
        if (pointerDownActive) {
          return;
        }
        canvas.style.cursor = resolveLeftDragAction(clientX, clientY) === MOUSE.PAN ? "all-scroll" : "grab";
      };
      const clampIndoorView = () => {
        controls.target.set(
          clampValue(controls.target.x, INDOOR_VIEW_BOUNDS.targetMinX, INDOOR_VIEW_BOUNDS.targetMaxX),
          clampValue(controls.target.y, INDOOR_VIEW_BOUNDS.targetMinY, INDOOR_VIEW_BOUNDS.targetMaxY),
          clampValue(controls.target.z, INDOOR_VIEW_BOUNDS.targetMinZ, INDOOR_VIEW_BOUNDS.targetMaxZ)
        );
        camera.position.set(
          clampValue(camera.position.x, INDOOR_VIEW_BOUNDS.cameraMinX, INDOOR_VIEW_BOUNDS.cameraMaxX),
          clampValue(camera.position.y, INDOOR_VIEW_BOUNDS.cameraMinY, INDOOR_VIEW_BOUNDS.cameraMaxY),
          clampValue(camera.position.z, INDOOR_VIEW_BOUNDS.cameraMinZ, INDOOR_VIEW_BOUNDS.cameraMaxZ)
        );
      };

      const ownedResources = {
        g: <T>(geometry: T): T => {
          geometries.push(geometry);
          return geometry;
        },
        m: <T>(material: T): T => {
          materials.push(material);
          return material;
        },
      };

      const boxGeometry = (width: number, height: number, depth: number) => {
        const key = `box:${width.toFixed(3)}:${height.toFixed(3)}:${depth.toFixed(3)}`;
        const cached = geometryCache.get(key);
        if (cached) {
          return cached;
        }
        const created = ownedResources.g(new BoxGeometry(width, height, depth));
        geometryCache.set(key, created);
        return created;
      };

      const cylinderGeometry = (radius: number, height: number) => {
        const key = `cyl:${radius.toFixed(3)}:${height.toFixed(3)}`;
        const cached = geometryCache.get(key);
        if (cached) {
          return cached;
        }
        const created = ownedResources.g(new CylinderGeometry(radius, radius, height, 16));
        geometryCache.set(key, created);
        return created;
      };

      const sphereGeometry = (radius: number) => {
        const key = `sphere:${radius.toFixed(3)}`;
        const cached = geometryCache.get(key);
        if (cached) {
          return cached;
        }
        const created = ownedResources.g(new SphereGeometry(radius, 14, 14));
        geometryCache.set(key, created);
        return created;
      };

      const solidMaterial = (key: string, color: number, roughness: number, metalness: number) => {
        const cacheKey = `solid:${key}`;
        const cached = materialCache.get(cacheKey);
        if (cached) {
          return cached;
        }
        const created = ownedResources.m(
          new MeshStandardMaterial({
            color,
            roughness,
            metalness,
          })
        );
        materialCache.set(cacheKey, created);
        return created;
      };

      const getFamilyMaterials = (family: string) => {
        const cached = familyMaterialCache.get(family);
        if (cached) {
          return cached;
        }
        const profile = profileForFamily(family);
        const created = {
          body: solidMaterial(`${family}:body`, profile.bodyColor, 0.5, 0.18),
          roof: solidMaterial(`${family}:roof`, 0xe7eef5, 0.34, 0.22),
          door: solidMaterial(`${family}:door`, profile.doorColor, 0.44, 0.24),
          trim: solidMaterial(`${family}:trim`, profile.trimColor, 0.22, 0.56),
          recess: solidMaterial(`${family}:recess`, 0x1e3044, 0.24, 0.34),
          accent: solidMaterial(`${family}:accent`, profile.accentColor, 0.3, 0.28),
          vent: solidMaterial(`${family}:vent`, 0x273949, 0.18, 0.55),
          glass: ownedResources.m(
            new MeshStandardMaterial({
              color: 0x22384f,
              emissive: 0x163246,
              emissiveIntensity: 0.28,
              roughness: 0.14,
              metalness: 0.48,
            })
          ),
          caution: solidMaterial(`${family}:caution`, 0xcda83c, 0.34, 0.18),
        };
        familyMaterialCache.set(family, created);
        return created;
      };

      const signalMaterial = (
        status: "normal" | "warning" | "error",
        phase: number,
        variant: "strip" | "beacon" | "panel"
      ) => {
        const tone = STATUS_STYLE[status];
        const material = ownedResources.m(
          new MeshStandardMaterial({
            color: tone.color,
            emissive: tone.emissive,
            emissiveIntensity: tone.baseEmissive,
            transparent: true,
            opacity:
              variant === "strip"
                ? tone.stripOpacity
                : variant === "panel"
                  ? tone.stripOpacity * 0.72
                  : tone.beaconOpacity,
            roughness: 0.2,
            metalness: 0.16,
          })
        );
        animatedSignals.push({
          material,
          base: tone.baseEmissive,
          amplitude: tone.pulseAmplitude,
          speed: tone.pulseSpeed,
          phase,
          opacityBase:
            variant === "strip"
              ? tone.stripOpacity
              : variant === "panel"
                ? tone.stripOpacity * 0.72
                : tone.beaconOpacity,
          opacityAmplitude: status === "normal" ? 0.02 : variant === "beacon" ? 0.08 : 0.05,
        });
        return material;
      };

      const assignDeviceCode = (root: any, deviceCode: string, objectId: string) => {
        root.traverse((node: any) => {
          if (!node?.isMesh) {
            return;
          }
          node.castShadow = true;
          node.receiveShadow = true;
          node.userData = node.userData || {};
          node.userData.twDeviceCode = deviceCode;
          node.userData.twObjectId = objectId;
        });
      };

      const createBoxMesh = (
        width: number,
        height: number,
        depth: number,
        material: any,
        x: number,
        y: number,
        z: number
      ) => {
        const mesh = new Mesh(boxGeometry(width, height, depth), material);
        mesh.position.set(x, y, z);
        return mesh;
      };

      const addIndicatorCluster = (
        group: any,
        profile: CabinetProfile,
        familyMaterials: any,
        statusKey: "normal" | "warning" | "error",
        phase: number
      ) => {
        const litIndex = statusKey === "error" ? 2 : statusKey === "warning" ? 1 : 0;
        for (let index = 0; index < 3; index += 1) {
          const material =
            index === litIndex ? signalMaterial(statusKey, phase + index * 0.15, "beacon") : familyMaterials.trim;
          const indicator = new Mesh(sphereGeometry(0.04), material);
          indicator.position.set(profile.width * 0.22 + index * 0.12, profile.height - 0.15, profile.depth / 2 + 0.045);
          group.add(indicator);
        }
      };

      const addVentSlats = (
        group: any,
        width: number,
        rows: number,
        startY: number,
        spacing: number,
        z: number,
        material: any,
        x = 0
      ) => {
        for (let index = 0; index < rows; index += 1) {
          const slat = createBoxMesh(width, 0.035, 0.022, material, x, startY + index * spacing, z);
          group.add(slat);
        }
      };

      const addSwitchgearFace = (
        group: any,
        profile: CabinetProfile,
        familyMaterials: any,
        statusKey: "normal" | "warning" | "error",
        phase: number
      ) => {
        const topPanel = createBoxMesh(
          profile.width - 0.18,
          0.38,
          0.04,
          familyMaterials.glass,
          0,
          profile.height - 0.46,
          profile.depth / 2 + 0.03
        );
        group.add(topPanel);

        for (let index = 0; index < 4; index += 1) {
          const y = 0.48 + index * 0.4;
          const module = createBoxMesh(
            profile.width - 0.16,
            0.34,
            0.045,
            familyMaterials.door,
            0,
            y,
            profile.depth / 2 + 0.032
          );
          group.add(module);

          const window = createBoxMesh(
            0.24,
            0.1,
            0.026,
            familyMaterials.glass,
            -profile.width * 0.16,
            y + 0.05,
            profile.depth / 2 + 0.058
          );
          group.add(window);

          const handleLeft = new Mesh(cylinderGeometry(0.015, 0.17), familyMaterials.trim);
          handleLeft.rotation.x = Math.PI / 2;
          handleLeft.position.set(profile.width * 0.19, y + 0.04, profile.depth / 2 + 0.058);
          group.add(handleLeft);

          const handleRight = new Mesh(cylinderGeometry(0.015, 0.13), familyMaterials.trim);
          handleRight.rotation.x = Math.PI / 2;
          handleRight.position.set(profile.width * 0.29, y - 0.07, profile.depth / 2 + 0.058);
          group.add(handleRight);

          if (index === 1 || (statusKey !== "normal" && index === 2)) {
            const glow = createBoxMesh(
              profile.width - 0.28,
              0.22,
              0.018,
              signalMaterial(statusKey, phase + index * 0.2, "panel"),
              0,
              y,
              profile.depth / 2 + 0.068
            );
            group.add(glow);
          }
        }

        addVentSlats(
          group,
          profile.width - 0.24,
          4,
          0.18,
          0.08,
          profile.depth / 2 + 0.03,
          familyMaterials.vent
        );
      };

      const addPowerFace = (
        group: any,
        profile: CabinetProfile,
        familyMaterials: any,
        statusKey: "normal" | "warning" | "error",
        phase: number
      ) => {
        const halfWidth = (profile.width - 0.16) / 2;
        group.add(
          createBoxMesh(
            halfWidth,
            profile.height - 0.34,
            0.046,
            familyMaterials.door,
            -halfWidth / 2 - 0.03,
            profile.height / 2 - 0.08,
            profile.depth / 2 + 0.032
          )
        );
        group.add(
          createBoxMesh(
            halfWidth,
            profile.height - 0.34,
            0.046,
            familyMaterials.door,
            halfWidth / 2 + 0.03,
            profile.height / 2 - 0.08,
            profile.depth / 2 + 0.032
          )
        );
        group.add(
          createBoxMesh(
            profile.width - 0.34,
            0.24,
            0.03,
            familyMaterials.glass,
            0,
            profile.height - 0.45,
            profile.depth / 2 + 0.06
          )
        );
        group.add(
          createBoxMesh(
            0.03,
            profile.height - 0.9,
            0.024,
            signalMaterial(statusKey, phase, "strip"),
            profile.width / 2 - 0.1,
            profile.height / 2 - 0.2,
            profile.depth / 2 + 0.06
          )
        );
        addVentSlats(group, halfWidth - 0.12, 5, 0.52, 0.09, profile.depth / 2 + 0.058, familyMaterials.vent, -halfWidth / 2 - 0.03);
        addVentSlats(group, halfWidth - 0.12, 5, 0.52, 0.09, profile.depth / 2 + 0.058, familyMaterials.vent, halfWidth / 2 + 0.03);
        group.add(
          createBoxMesh(
            profile.width - 0.38,
            0.07,
            0.024,
            familyMaterials.caution,
            0,
            0.44,
            profile.depth / 2 + 0.058
          )
        );
        const handle = new Mesh(cylinderGeometry(0.016, 0.28), familyMaterials.trim);
        handle.rotation.x = Math.PI / 2;
        handle.position.set(0, 1.2, profile.depth / 2 + 0.064);
        group.add(handle);
      };

      const addControlFace = (
        group: any,
        profile: CabinetProfile,
        familyMaterials: any,
        statusKey: "normal" | "warning" | "error",
        phase: number
      ) => {
        group.add(
          createBoxMesh(
            profile.width - 0.18,
            0.42,
            0.05,
            familyMaterials.door,
            0,
            profile.height - 0.5,
            profile.depth / 2 + 0.028
          )
        );
        group.add(
          createBoxMesh(
            profile.width - 0.34,
            0.16,
            0.026,
            familyMaterials.glass,
            0,
            profile.height - 0.46,
            profile.depth / 2 + 0.062
          )
        );
        group.add(
          createBoxMesh(
            profile.width - 0.46,
            0.08,
            0.018,
            signalMaterial(statusKey, phase, "panel"),
            0,
            profile.height - 0.68,
            profile.depth / 2 + 0.066
          )
        );
        for (let row = 0; row < 2; row += 1) {
          for (let col = 0; col < 3; col += 1) {
            group.add(
              createBoxMesh(
                0.08,
                0.08,
                0.02,
                row === 0 && col === 1 ? signalMaterial(statusKey, phase + 0.2, "beacon") : familyMaterials.accent,
                -0.17 + col * 0.17,
                1.46 - row * 0.14,
                profile.depth / 2 + 0.06
              )
            );
          }
        }
        group.add(
          createBoxMesh(
            profile.width - 0.18,
            0.72,
            0.048,
            familyMaterials.door,
            0,
            0.66,
            profile.depth / 2 + 0.03
          )
        );
        addVentSlats(
          group,
          profile.width - 0.28,
          5,
          0.18,
          0.08,
          profile.depth / 2 + 0.058,
          familyMaterials.vent
        );
      };

      const addNetworkFace = (
        group: any,
        profile: CabinetProfile,
        familyMaterials: any,
        statusKey: "normal" | "warning" | "error",
        phase: number
      ) => {
        group.add(
          createBoxMesh(
            profile.width - 0.12,
            0.28,
            0.044,
            familyMaterials.door,
            0,
            profile.height - 0.42,
            profile.depth / 2 + 0.03
          )
        );
        group.add(
          createBoxMesh(
            profile.width - 0.28,
            0.12,
            0.024,
            familyMaterials.glass,
            0,
            profile.height - 0.42,
            profile.depth / 2 + 0.06
          )
        );
        for (let index = 0; index < 8; index += 1) {
          group.add(
            createBoxMesh(
              profile.width - 0.16,
              0.11,
              0.036,
              familyMaterials.door,
              0,
              1.55 - index * 0.17,
              profile.depth / 2 + 0.028
            )
          );
          for (let port = 0; port < 4; port += 1) {
            group.add(
              createBoxMesh(
                0.05,
                0.03,
                0.02,
                port === 2 && index % 3 === 0
                  ? signalMaterial(statusKey, phase + index * 0.12 + port * 0.1, "beacon")
                  : familyMaterials.accent,
                -0.16 + port * 0.11,
                1.55 - index * 0.17,
                profile.depth / 2 + 0.056
              )
            );
          }
        }
        group.add(
          createBoxMesh(
            0.026,
            profile.height - 0.6,
            0.02,
            signalMaterial(statusKey, phase, "strip"),
            -profile.width / 2 + 0.08,
            profile.height / 2 - 0.05,
            profile.depth / 2 + 0.058
          )
        );
      };

      const addCompactFace = (
        group: any,
        profile: CabinetProfile,
        familyMaterials: any,
        statusKey: "normal" | "warning" | "error",
        phase: number
      ) => {
        group.add(
          createBoxMesh(
            profile.width - 0.14,
            profile.height - 0.28,
            0.04,
            familyMaterials.door,
            0,
            profile.height / 2 - 0.06,
            profile.depth / 2 + 0.028
          )
        );
        group.add(
          createBoxMesh(
            profile.width - 0.28,
            0.16,
            0.024,
            familyMaterials.glass,
            0,
            profile.height - 0.38,
            profile.depth / 2 + 0.056
          )
        );
        group.add(
          createBoxMesh(
            0.024,
            profile.height - 0.66,
            0.02,
            signalMaterial(statusKey, phase, "strip"),
            profile.width / 2 - 0.08,
            profile.height / 2 - 0.12,
            profile.depth / 2 + 0.055
          )
        );
        group.add(createBoxMesh(0.14, 0.18, 0.026, familyMaterials.accent, -0.12, 0.72, profile.depth / 2 + 0.056));
        group.add(createBoxMesh(0.14, 0.18, 0.026, familyMaterials.accent, 0.12, 0.72, profile.depth / 2 + 0.056));
      };

      const addFamilyShellDetails = (group: any, profile: CabinetProfile, familyMaterials: any) => {
        if (profile.feature === "switchgear") {
          group.add(
            createBoxMesh(
              profile.width * 0.82,
              0.18,
              profile.depth * 0.34,
              familyMaterials.roof,
              0,
              profile.height + 0.24,
              -0.02
            )
          );
          group.add(
            createBoxMesh(
              0.05,
              profile.height - 0.3,
              profile.depth + 0.04,
              familyMaterials.trim,
              -profile.width / 2 + 0.06,
              profile.height / 2 + 0.02,
              0
            )
          );
          group.add(
            createBoxMesh(
              0.05,
              profile.height - 0.3,
              profile.depth + 0.04,
              familyMaterials.trim,
              profile.width / 2 - 0.06,
              profile.height / 2 + 0.02,
              0
            )
          );
          return;
        }

        if (profile.feature === "power") {
          group.add(
            createBoxMesh(
              profile.width * 0.72,
              0.22,
              profile.depth * 0.42,
              familyMaterials.roof,
              0,
              profile.height + 0.28,
              -profile.depth * 0.06
            )
          );
          group.add(
            createBoxMesh(
              0.14,
              profile.height - 0.5,
              profile.depth * 0.18,
              familyMaterials.body,
              profile.width / 2 + 0.05,
              profile.height / 2 - 0.1,
              -profile.depth * 0.16
            )
          );
          group.add(
            createBoxMesh(
              0.09,
              0.18,
              profile.depth * 0.48,
              familyMaterials.accent,
              -profile.width / 2 + 0.08,
              profile.height - 0.52,
              -0.02
            )
          );
          return;
        }

        if (profile.feature === "network") {
          group.add(
            createBoxMesh(
              profile.width + 0.06,
              profile.height - 0.42,
              0.028,
              familyMaterials.trim,
              0,
              profile.height / 2 + 0.02,
              profile.depth / 2 + 0.085
            )
          );
          group.add(
            createBoxMesh(
              profile.width * 0.6,
              0.14,
              profile.depth * 0.22,
              familyMaterials.roof,
              0,
              profile.height + 0.18,
              -profile.depth * 0.08
            )
          );
          return;
        }

        if (profile.feature === "compact") {
          group.add(
            createBoxMesh(
              profile.width - 0.12,
              0.32,
              profile.depth - 0.08,
              familyMaterials.trim,
              0,
              0.26,
              0
            )
          );
          return;
        }

        group.add(
          createBoxMesh(
            profile.width * 0.58,
            0.12,
            profile.depth * 0.18,
            familyMaterials.roof,
            0,
            profile.height + 0.18,
            -profile.depth * 0.06
          )
        );
        group.add(
          createBoxMesh(
            profile.width - 0.24,
            0.22,
            0.03,
            familyMaterials.accent,
            0,
            0.32,
            profile.depth / 2 + 0.052
          )
        );
      };

      const createCabinet = (placement: ScenePlacement) => {
        const { device, x, z, rotationY, bank } = placement;
        const profile = profileForFamily(device.visualFamily);
        const familyMaterials = getFamilyMaterials(device.visualFamily);
        const statusKey = normalizeDeviceStatus(device.status);
        const phase = parseDeviceOrdinal(device.deviceCode) * 0.35;
        const bankScale = scaleForBank(bank);
        const group = new Group();
        const baseY = profile.height / 2 + 0.08;

        group.add(
          createBoxMesh(
            profile.width + 0.06,
            0.16,
            profile.depth + 0.08,
            familyMaterials.trim,
            0,
            0.08,
            0
          )
        );
        group.add(createBoxMesh(profile.width, profile.height, profile.depth, familyMaterials.body, 0, baseY, 0));
        group.add(
          createBoxMesh(
            profile.width + 0.08,
            0.08,
            profile.depth + 0.1,
            familyMaterials.roof,
            0,
            profile.height + 0.12,
            0
          )
        );
        group.add(
          createBoxMesh(
            profile.width - 0.1,
            profile.height - 0.18,
            0.018,
            familyMaterials.recess,
            0,
            baseY,
            profile.depth / 2 + 0.02
          )
        );
        group.add(
          createBoxMesh(
            profile.width - 0.2,
            0.07,
            0.024,
            familyMaterials.accent,
            0,
            profile.height - 0.12,
            profile.depth / 2 + 0.056
          )
        );
        addFamilyShellDetails(group, profile, familyMaterials);

        if (profile.feature === "switchgear") {
          addSwitchgearFace(group, profile, familyMaterials, statusKey, phase);
        } else if (profile.feature === "power") {
          addPowerFace(group, profile, familyMaterials, statusKey, phase);
        } else if (profile.feature === "network") {
          addNetworkFace(group, profile, familyMaterials, statusKey, phase);
        } else if (profile.feature === "compact") {
          addCompactFace(group, profile, familyMaterials, statusKey, phase);
        } else {
          addControlFace(group, profile, familyMaterials, statusKey, phase);
        }

        addIndicatorCluster(group, profile, familyMaterials, statusKey, phase);
        group.position.set(x, 0, z);
        group.rotation.y = rotationY;
        group.scale.setScalar(bankScale);
        assignDeviceCode(group, device.deviceCode, device.objectId);
        interactiveRoots.push(group);
        scene.add(group);
      };

      const floorBase = new Mesh(
        boxGeometry(ROOM_LAYOUT.floorWidth, 0.1, ROOM_LAYOUT.floorDepth),
        solidMaterial("room:floor", 0x0c141d, 0.74, 0.18)
      );
      floorBase.position.set(ROOM_LAYOUT.floorCenterX, -0.05, 0);
      floorBase.receiveShadow = true;
      scene.add(floorBase);

      const platformMaterial = solidMaterial("room:platform", 0x101d2a, 0.48, 0.28);
      const platformEdgeMaterial = solidMaterial("room:platform-edge", 0x243a4f, 0.18, 0.62);
      const aisleMaterial = solidMaterial("room:aisle", 0x7685a0, 0.2, 0.32);
      const seamMaterial = solidMaterial("room:seam", 0x2a4258, 0.16, 0.58);

      const leftPlatform = new Mesh(
        boxGeometry(ROOM_LAYOUT.aisleLength + 0.8, 0.08, ROOM_LAYOUT.platformWidth),
        platformMaterial
      );
      leftPlatform.position.set(ROOM_LAYOUT.aisleCenterX + 0.3, 0.005, ROOM_LAYOUT.leftPlatformZ);
      leftPlatform.receiveShadow = true;
      scene.add(leftPlatform);

      const rightPlatform = new Mesh(
        boxGeometry(ROOM_LAYOUT.aisleLength + 0.8, 0.08, ROOM_LAYOUT.platformWidth),
        platformMaterial
      );
      rightPlatform.position.set(ROOM_LAYOUT.aisleCenterX + 0.3, 0.005, ROOM_LAYOUT.rightPlatformZ);
      rightPlatform.receiveShadow = true;
      scene.add(rightPlatform);

      const aisle = new Mesh(
        boxGeometry(ROOM_LAYOUT.aisleLength - 0.8, 0.035, ROOM_LAYOUT.aisleWidth),
        aisleMaterial
      );
      aisle.position.set(ROOM_LAYOUT.aisleCenterX, 0.03, 0.08);
      aisle.receiveShadow = true;
      scene.add(aisle);

      const leftTrack = new Mesh(
        boxGeometry(ROOM_LAYOUT.aisleLength - 1.2, 0.03, 0.18),
        platformEdgeMaterial
      );
      leftTrack.position.set(ROOM_LAYOUT.aisleCenterX, 0.04, ROOM_LAYOUT.leftTrackZ);
      scene.add(leftTrack);

      const rightTrack = new Mesh(
        boxGeometry(ROOM_LAYOUT.aisleLength - 1.2, 0.03, 0.18),
        platformEdgeMaterial
      );
      rightTrack.position.set(ROOM_LAYOUT.aisleCenterX, 0.04, ROOM_LAYOUT.rightTrackZ);
      scene.add(rightTrack);

      const leftOuterBand = new Mesh(
        boxGeometry(ROOM_LAYOUT.aisleLength - 1.8, 0.024, 0.14),
        seamMaterial
      );
      leftOuterBand.position.set(ROOM_LAYOUT.aisleCenterX, 0.04, ROOM_LAYOUT.leftPlatformZ - ROOM_LAYOUT.platformWidth / 2 + 0.1);
      scene.add(leftOuterBand);

      const rightOuterBand = new Mesh(
        boxGeometry(ROOM_LAYOUT.aisleLength - 1.8, 0.024, 0.14),
        seamMaterial
      );
      rightOuterBand.position.set(ROOM_LAYOUT.aisleCenterX, 0.04, ROOM_LAYOUT.rightPlatformZ + ROOM_LAYOUT.platformWidth / 2 - 0.1);
      scene.add(rightOuterBand);

      for (let index = 0; index < 7; index += 1) {
        const x = 7.85 + index * 5.28;
        const seam = new Mesh(
          boxGeometry(0.05, 0.014, ROOM_LAYOUT.aisleWidth + ROOM_LAYOUT.platformWidth * 2 - 0.5),
          seamMaterial
        );
        seam.position.set(x, 0.038, 0.08);
        scene.add(seam);
      }

      const wallMaterial = solidMaterial("room:wall", 0x142331, 0.66, 0.08);
      const wallPanelMaterial = solidMaterial("room:wall-panel", 0x1b2d3d, 0.56, 0.12);
      const kickplateMaterial = solidMaterial("room:kickplate", 0x22384b, 0.24, 0.34);

      const leftWall = new Mesh(boxGeometry(ROOM_LAYOUT.floorWidth, ROOM_LAYOUT.wallHeight, 0.16), wallMaterial);
      leftWall.position.set(ROOM_LAYOUT.floorCenterX, ROOM_LAYOUT.wallHeight / 2, -ROOM_LAYOUT.wallZ);
      leftWall.receiveShadow = true;
      scene.add(leftWall);

      const rightWall = new Mesh(boxGeometry(ROOM_LAYOUT.floorWidth, ROOM_LAYOUT.wallHeight, 0.16), wallMaterial);
      rightWall.position.set(ROOM_LAYOUT.floorCenterX, ROOM_LAYOUT.wallHeight / 2, ROOM_LAYOUT.wallZ);
      rightWall.receiveShadow = true;
      scene.add(rightWall);

      for (let index = 0; index < 5; index += 1) {
        const x = 7.4 + index * 5.55;
        const leftWallPanel = createBoxMesh(4.7, 5.1, 0.04, wallPanelMaterial, x, 2.76, -ROOM_LAYOUT.wallZ + 0.08);
        const rightWallPanel = createBoxMesh(4.7, 5.1, 0.04, wallPanelMaterial, x, 2.76, ROOM_LAYOUT.wallZ - 0.08);
        scene.add(leftWallPanel);
        scene.add(rightWallPanel);
      }

      const leftKickplate = new Mesh(
        boxGeometry(ROOM_LAYOUT.floorWidth - 2.6, 0.26, 0.12),
        kickplateMaterial
      );
      leftKickplate.position.set(ROOM_LAYOUT.floorCenterX + 0.2, 0.13, -ROOM_LAYOUT.wallZ + 0.12);
      scene.add(leftKickplate);

      const rightKickplate = new Mesh(
        boxGeometry(ROOM_LAYOUT.floorWidth - 2.6, 0.26, 0.12),
        kickplateMaterial
      );
      rightKickplate.position.set(ROOM_LAYOUT.floorCenterX + 0.2, 0.13, ROOM_LAYOUT.wallZ - 0.12);
      scene.add(rightKickplate);

      const farWall = new Mesh(
        boxGeometry(0.22, ROOM_LAYOUT.wallHeight, ROOM_LAYOUT.farWallDepth),
        solidMaterial("room:far-wall", 0x101c28, 0.62, 0.1)
      );
      farWall.position.set(ROOM_LAYOUT.farWallX, ROOM_LAYOUT.wallHeight / 2, 0);
      farWall.receiveShadow = true;
      scene.add(farWall);

      const farWallBand = new Mesh(
        boxGeometry(0.1, 1.24, ROOM_LAYOUT.farWallDepth - 1.4),
        solidMaterial("room:far-band", 0x1d3143, 0.24, 0.28)
      );
      farWallBand.position.set(ROOM_LAYOUT.farWallX - 0.08, 1.12, 0);
      scene.add(farWallBand);

      const rearDoor = new Mesh(
        boxGeometry(0.12, 2.44, 2.36),
        solidMaterial("room:rear-door", 0x0e1924, 0.34, 0.18)
      );
      rearDoor.position.set(ROOM_LAYOUT.farWallX - 0.12, 1.36, 0);
      scene.add(rearDoor);

      const ceiling = new Mesh(
        boxGeometry(ROOM_LAYOUT.floorWidth, 0.16, ROOM_LAYOUT.farWallDepth + 0.4),
        solidMaterial("room:ceiling", 0x0c1620, 0.52, 0.08)
      );
      ceiling.position.set(ROOM_LAYOUT.floorCenterX, ROOM_LAYOUT.ceilingY, 0);
      ceiling.receiveShadow = true;
      scene.add(ceiling);

      const ceilingSoffitMaterial = solidMaterial("room:ceiling-soffit", 0x172636, 0.44, 0.12);
      const centerCeilingPanelMaterial = solidMaterial("room:ceiling-panel", 0x111d2a, 0.4, 0.08);
      const leftSoffit = new Mesh(boxGeometry(ROOM_LAYOUT.trayLength, 0.24, 1.14), ceilingSoffitMaterial);
      leftSoffit.position.set(ROOM_LAYOUT.trayCenterX, ROOM_LAYOUT.ceilingY - 0.24, -7.18);
      leftSoffit.receiveShadow = true;
      scene.add(leftSoffit);

      const rightSoffit = new Mesh(boxGeometry(ROOM_LAYOUT.trayLength, 0.24, 1.14), ceilingSoffitMaterial);
      rightSoffit.position.set(ROOM_LAYOUT.trayCenterX, ROOM_LAYOUT.ceilingY - 0.24, 7.2);
      rightSoffit.receiveShadow = true;
      scene.add(rightSoffit);

      const centerCeilingPanel = new Mesh(
        boxGeometry(ROOM_LAYOUT.aisleLength - 2.4, 0.12, 7.2),
        centerCeilingPanelMaterial
      );
      centerCeilingPanel.position.set(ROOM_LAYOUT.aisleCenterX, ROOM_LAYOUT.ceilingY - 0.18, 0.08);
      centerCeilingPanel.receiveShadow = true;
      scene.add(centerCeilingPanel);

      const ceilingRevealMaterial = solidMaterial("room:ceiling-reveal", 0x09131b, 0.18, 0.2);
      const leftLightReveal = new Mesh(
        boxGeometry(ROOM_LAYOUT.trayLength - 2.8, 0.08, 0.34),
        ceilingRevealMaterial
      );
      leftLightReveal.position.set(ROOM_LAYOUT.trayCenterX, ROOM_LAYOUT.ceilingY - 0.2, -2.98);
      scene.add(leftLightReveal);

      const rightLightReveal = new Mesh(
        boxGeometry(ROOM_LAYOUT.trayLength - 2.8, 0.08, 0.34),
        ceilingRevealMaterial
      );
      rightLightReveal.position.set(ROOM_LAYOUT.trayCenterX, ROOM_LAYOUT.ceilingY - 0.2, 3.14);
      scene.add(rightLightReveal);

      const centerRibbonReveal = new Mesh(
        boxGeometry(ROOM_LAYOUT.aisleLength - 7.4, 0.08, 0.28),
        ceilingRevealMaterial
      );
      centerRibbonReveal.position.set(ROOM_LAYOUT.aisleCenterX + 0.8, ROOM_LAYOUT.ceilingY - 0.2, 0.08);
      scene.add(centerRibbonReveal);

      const lightBarMaterial = ownedResources.m(
        new MeshStandardMaterial({
          color: 0xc0e4ff,
          emissive: 0x74b0de,
          emissiveIntensity: 1.12,
          transparent: true,
          opacity: 0.76,
          roughness: 0.18,
          metalness: 0.08,
        })
      );
      const leftLightBar = new Mesh(boxGeometry(ROOM_LAYOUT.trayLength - 3.8, 0.035, 0.14), lightBarMaterial);
      leftLightBar.position.set(ROOM_LAYOUT.trayCenterX, ROOM_LAYOUT.ceilingY - 0.16, -2.98);
      scene.add(leftLightBar);

      const rightLightBar = new Mesh(boxGeometry(ROOM_LAYOUT.trayLength - 3.8, 0.035, 0.14), lightBarMaterial);
      rightLightBar.position.set(ROOM_LAYOUT.trayCenterX, ROOM_LAYOUT.ceilingY - 0.16, 3.14);
      scene.add(rightLightBar);

      const centerRibbonLight = new Mesh(boxGeometry(ROOM_LAYOUT.aisleLength - 8.4, 0.03, 0.12), lightBarMaterial);
      centerRibbonLight.position.set(ROOM_LAYOUT.aisleCenterX + 0.8, ROOM_LAYOUT.ceilingY - 0.16, 0.08);
      scene.add(centerRibbonLight);

      const farLight = new Mesh(boxGeometry(0.04, 0.12, ROOM_LAYOUT.farWallDepth - 2.4), lightBarMaterial);
      farLight.position.set(ROOM_LAYOUT.farWallX - 0.06, 0.94, 0);
      scene.add(farLight);

      scene.add(new AmbientLight(0xf1f6ff, 0.46));

      const keyLight = new DirectionalLight(0xf7fbff, 1.18);
      keyLight.position.set(5.8, 10.8, 8.6);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 48;
      keyLight.shadow.camera.left = -18;
      keyLight.shadow.camera.right = 23;
      keyLight.shadow.camera.top = 14;
      keyLight.shadow.camera.bottom = -14;
      scene.add(keyLight);

      const fillLight = new DirectionalLight(0xb7d6f2, 0.38);
      fillLight.position.set(22.4, 7.2, -8.8);
      scene.add(fillLight);

      const leftFrontGlow = new PointLight(0x9dcfff, 0.38, 18, 2.1);
      leftFrontGlow.position.set(9.4, 2.96, -4.92);
      scene.add(leftFrontGlow);

      const rightFrontGlow = new PointLight(0x9ecfff, 0.42, 20, 2.1);
      rightFrontGlow.position.set(10.1, 2.92, 4.96);
      scene.add(rightFrontGlow);

      const heroGlow = new PointLight(0x6bbbf8, 0.44, 20, 2.1);
      heroGlow.position.set(18.2, 3.18, -4.2);
      scene.add(heroGlow);

      const rightLaneGlow = new PointLight(0x6faef0, 0.46, 22, 2.2);
      rightLaneGlow.position.set(20.8, 3.1, 4.68);
      scene.add(rightLaneGlow);

      const rearGlow = new PointLight(0x4f88be, 0.58, 18, 2.2);
      rearGlow.position.set(28.6, 2.8, 0.2);
      scene.add(rearGlow);

      const pickDevice = (clientX: number, clientY: number) => {
        if (!interactionEnabledRef.current) {
          return;
        }
        const rect = canvas.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) {
          return;
        }
        pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const intersections = raycaster.intersectObjects(interactiveRoots, true);
        for (const item of intersections) {
          let node: any = item.object;
          while (node) {
            const code = node.userData?.twDeviceCode as string | undefined;
            if (code) {
              onDeviceClickRef.current(code);
              return;
            }
            node = node.parent;
          }
        }
        onDeviceClickRef.current(null);
      };

      const onPointerDown = (event: PointerEvent) => {
        if (event.button !== 0) {
          return;
        }
        controls.mouseButtons.LEFT = resolveLeftDragAction(event.clientX, event.clientY);
        pointerDownX = event.clientX;
        pointerDownY = event.clientY;
        pointerDownActive = true;
        canvas.style.cursor = "grabbing";
      };

      const onPointerUp = (event: PointerEvent) => {
        if (event.button !== 0) {
          return;
        }
        const wasPointerDown = pointerDownActive;
        const startX = pointerDownX;
        const startY = pointerDownY;
        pointerDownActive = false;
        controls.mouseButtons.LEFT = MOUSE.ROTATE;
        if (!wasPointerDown) {
          return;
        }
        const rect = canvas.getBoundingClientRect();
        if (
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        ) {
          syncHoverCursor(event.clientX, event.clientY);
        } else {
          canvas.style.cursor = "grab";
        }
        if (
          Math.abs(event.clientX - startX) > PICK_DRAG_THRESHOLD_PX ||
          Math.abs(event.clientY - startY) > PICK_DRAG_THRESHOLD_PX
        ) {
          return;
        }
        const releasedInsideCanvas =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;
        if (!releasedInsideCanvas) {
          return;
        }
        pickDevice(event.clientX, event.clientY);
      };

      const onPointerCancel = () => {
        pointerDownActive = false;
        controls.mouseButtons.LEFT = MOUSE.ROTATE;
        canvas.style.cursor = "grab";
      };

      const onContextMenu = (event: MouseEvent) => {
        event.preventDefault();
      };

      const onPointerMove = (event: PointerEvent) => {
        syncHoverCursor(event.clientX, event.clientY);
      };

      const onPointerLeave = () => {
        if (!pointerDownActive) {
          canvas.style.cursor = "grab";
        }
      };

      canvas.addEventListener("pointerdown", onPointerDown, { capture: true });
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerleave", onPointerLeave);
      canvas.addEventListener("contextmenu", onContextMenu);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerCancel);
      window.addEventListener("blur", onPointerCancel);
      canvas.style.cursor = "grab";

      buildScenePlacements([...devicesRef.current]).forEach(createCabinet);

      const resize = () => {
        const width = canvas.clientWidth || canvas.parentElement?.clientWidth || 1;
        const height = canvas.clientHeight || canvas.parentElement?.clientHeight || 1;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        clampIndoorView();
      };
      resize();
      window.addEventListener("resize", resize);

      const tick = () => {
        if (disposed) {
          return;
        }
        const time = performance.now() / 1000;
        const introProgress = Math.min((performance.now() - introStartTime) / introDurationMs, 1);
        if (introProgress < 1) {
          const eased = easeOutCubic(introProgress);
          camera.position.lerpVectors(introFromPosition, introToPosition, eased);
          controls.target.lerpVectors(introFromTarget, introToTarget, eased);
          clampIndoorView();
          camera.lookAt(controls.target);
        } else {
          if (!controls.enabled) {
            camera.position.copy(introToPosition);
            controls.target.copy(introToTarget);
            controls.enabled = true;
          }
          controls.update();
          clampIndoorView();
          camera.lookAt(controls.target);
        }
        animatedSignals.forEach((item) => {
          const wave = 0.5 + 0.5 * Math.sin(time * item.speed + item.phase);
          item.material.emissiveIntensity = item.base + wave * item.amplitude;
          if (typeof item.opacityBase === "number") {
            item.material.opacity = item.opacityBase + wave * (item.opacityAmplitude ?? 0);
          }
        });
        renderer.render(scene, camera);
        animationFrameId = window.requestAnimationFrame(tick);
      };
      tick();

      cleanups.push(() => {
        canvas.removeEventListener("pointerdown", onPointerDown, { capture: true });
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerleave", onPointerLeave);
        canvas.removeEventListener("contextmenu", onContextMenu);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerCancel);
        window.removeEventListener("blur", onPointerCancel);
        window.removeEventListener("resize", resize);
        window.cancelAnimationFrame(animationFrameId);
        controls.dispose();
        geometries.forEach((geometry) => geometry?.dispose?.());
        materials.forEach((material) => material?.dispose?.());
        renderer.dispose();
      });
    };

    void boot();

    return () => {
      disposed = true;
      cleanups.forEach((fn) => fn());
    };
  }, [canvasRef, deviceFingerprint]);
}
