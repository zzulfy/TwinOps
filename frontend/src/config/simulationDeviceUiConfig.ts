import simulationDeviceCatalog from "./simulationDeviceCatalog.json";

export interface SimulationDeviceCatalogEntry {
  deviceCode: string;
  objectId: string;
  labelKey: string;
  name: string;
  deviceType: string;
  displayLabel: string;
  visualFamily: string;
}

export interface SimulationDeviceUiConfig {
  objectId: string;
  deviceCode: string | null;
  labelKey: string;
  displayName: string;
  displayLabel: string;
  visualFamily?: string;
  interactive: boolean;
}

export const SIMULATION_DEVICE_CATALOG = simulationDeviceCatalog as SimulationDeviceCatalogEntry[];

export const SIMULATION_INTERACTIVE_DEVICE_CONFIG: SimulationDeviceUiConfig[] =
  SIMULATION_DEVICE_CATALOG.map((item) => ({
    objectId: item.objectId,
    deviceCode: item.deviceCode,
    labelKey: item.labelKey,
    displayName: item.name,
    displayLabel: item.displayLabel,
    visualFamily: item.visualFamily,
    interactive: true,
  }));

export const SIMULATION_DECORATIVE_OBJECT_CONFIG: SimulationDeviceUiConfig[] = [
  {
    objectId: "corridor-light-left",
    deviceCode: null,
    labelKey: "decorative-left-light",
    displayName: "左侧走廊灯带",
    displayLabel: "decorative-left-light",
    interactive: false,
  },
  {
    objectId: "corridor-light-right",
    deviceCode: null,
    labelKey: "decorative-right-light",
    displayName: "右侧走廊灯带",
    displayLabel: "decorative-right-light",
    interactive: false,
  },
];

export const SIMULATION_DEVICE_UI_CONFIG: SimulationDeviceUiConfig[] = [
  ...SIMULATION_INTERACTIVE_DEVICE_CONFIG,
  ...SIMULATION_DECORATIVE_OBJECT_CONFIG,
];
