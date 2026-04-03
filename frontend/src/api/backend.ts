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

export interface AdminIdentity {
  username: string;
  displayName: string;
  role: "admin";
}

export interface LoginResponse {
  token: string;
  expiresAt: number;
  admin: AdminIdentity;
}

export interface AnalysisReport {
  id: number;
  deviceCode: string;
  metricSummary: string;
  prediction: string | null;
  confidence: number | null;
  riskLevel: string | null;
  recommendedAction: string | null;
  status: "processing" | "success" | "failed";
  errorMessage: string | null;
  createdAt: string;
}

export interface WatchlistItem {
  deviceCode: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const BASE_URL = (import.meta.env.VITE_BACKEND_BASE_URL as string | undefined) || "http://127.0.0.1:8080";

interface RequestOptions {
  method?: "GET" | "PATCH" | "POST" | "DELETE";
  body?: unknown;
}

const TOKEN_KEY = "twinops_admin_token";
const ADMIN_KEY = "twinops_admin_identity";

export const getAdminToken = (): string => localStorage.getItem(TOKEN_KEY) || "";
export const setAdminSession = (response: LoginResponse): void => {
  localStorage.setItem(TOKEN_KEY, response.token);
  localStorage.setItem(ADMIN_KEY, JSON.stringify(response.admin));
};
export const clearAdminSession = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
};
export const getCurrentAdmin = (): AdminIdentity | null => {
  const raw = localStorage.getItem(ADMIN_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AdminIdentity;
  } catch {
    return null;
  }
};
export const isAdminLoggedIn = (): boolean => Boolean(getAdminToken());

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const token = getAdminToken();
  const headers: HeadersInit = {};
  if (options.body) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: Object.keys(headers).length > 0 ? headers : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (response.status === 401) {
    clearAdminSession();
    throw new Error("UNAUTHORIZED");
  }
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

export const loginAdmin = async (username: string, password: string): Promise<LoginResponse> =>
  request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: { username, password },
  });

export const logoutAdmin = async (): Promise<void> => {
  await request<void>("/api/auth/logout", { method: "POST" });
  clearAdminSession();
};

export const fetchAdminMe = async (): Promise<AdminIdentity> => request<AdminIdentity>("/api/auth/me");

export const fetchAnalysisReports = async (limit = 20): Promise<AnalysisReport[]> =>
  request<AnalysisReport[]>(`/api/analysis/reports?limit=${limit}`);

export const fetchAnalysisReport = async (id: number): Promise<AnalysisReport> =>
  request<AnalysisReport>(`/api/analysis/reports/${id}`);

export const createAnalysisReport = async (deviceCode: string, metricSummary: string): Promise<AnalysisReport> =>
  request<AnalysisReport>("/api/analysis/reports", {
    method: "POST",
    body: { deviceCode, metricSummary },
  });

export const fetchWatchlist = async (): Promise<WatchlistItem[]> => request<WatchlistItem[]>("/api/watchlist");

export const pinWatchlistDevice = async (deviceCode: string): Promise<WatchlistItem[]> =>
  request<WatchlistItem[]>("/api/watchlist", {
    method: "POST",
    body: { deviceCode },
  });

export const unpinWatchlistDevice = async (deviceCode: string): Promise<WatchlistItem[]> =>
  request<WatchlistItem[]>(`/api/watchlist/${encodeURIComponent(deviceCode)}`, {
    method: "DELETE",
  });
