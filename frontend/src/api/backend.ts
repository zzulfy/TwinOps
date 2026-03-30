export interface DeviceAlarm {
  id: number;
  name: string;
  type: "warning" | "error" | "info";
  time: string;
}

export interface DeviceData {
  deviceCode: string;
  name: string;
  type: string;
  status: "normal" | "warning" | "error";
  serialNumber: string;
  location: string;
  temperature: number;
  humidity: number;
  voltage: number;
  current: number;
  power: number;
  cpuLoad: number;
  memoryUsage: number;
  diskUsage: number;
  networkTraffic: number;
  alarms: DeviceAlarm[];
}

export interface AlarmListItem {
  id: number;
  name: string;
  event: string;
  type: 1 | 2 | 3;
  time: string;
  status: string;
}

export interface DashboardSummary {
  deviceScale: Array<{ icon: string; label: string; value: string; unit: string }>;
  alarms: AlarmListItem[];
  faultRate: { labels: string[]; values: number[] };
  resourceUsage: { labels: string[]; values: number[] };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const BASE_URL = (import.meta.env.VITE_BACKEND_BASE_URL as string | undefined) || "http://127.0.0.1:8080";

const request = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const result = (await response.json()) as ApiResponse<T>;
  if (!result.success) {
    throw new Error(result.message || "request failed");
  }
  return result.data;
};

export const fetchDevices = async (): Promise<DeviceData[]> => request<DeviceData[]>("/api/devices");

export const fetchDashboardSummary = async (): Promise<DashboardSummary> =>
  request<DashboardSummary>("/api/dashboard/summary");

export const fetchAlarmList = async (): Promise<AlarmListItem[]> => request<AlarmListItem[]>("/api/alarms?limit=20");
