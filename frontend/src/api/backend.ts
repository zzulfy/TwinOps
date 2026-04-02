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
  status: AlarmStatus;
}

export type AlarmStatus = "new" | "acknowledged" | "resolved";

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

interface RequestOptions {
  method?: "GET" | "PATCH";
  body?: unknown;
}

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
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

let dashboardSummaryCache: DashboardSummary | null = null;
let dashboardSummaryInFlight: Promise<DashboardSummary> | null = null;

export const fetchDashboardSummary = async (options: { force?: boolean } = {}): Promise<DashboardSummary> => {
  if (!options.force && dashboardSummaryCache) {
    return dashboardSummaryCache;
  }
  if (!options.force && dashboardSummaryInFlight) {
    return dashboardSummaryInFlight;
  }
  dashboardSummaryInFlight = request<DashboardSummary>("/api/dashboard/summary")
    .then((data) => {
      dashboardSummaryCache = data;
      return data;
    })
    .finally(() => {
      dashboardSummaryInFlight = null;
    });
  return dashboardSummaryInFlight;
};

export const fetchAlarmList = async (status?: AlarmStatus, limit = 20): Promise<AlarmListItem[]> => {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (status) {
    params.set("status", status);
  }
  return request<AlarmListItem[]>(`/api/alarms?${params.toString()}`);
};

export const updateAlarmStatus = async (id: number, status: AlarmStatus): Promise<AlarmListItem> =>
  request<AlarmListItem>(`/api/alarms/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
