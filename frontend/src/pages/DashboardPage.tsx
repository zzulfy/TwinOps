import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchDashboardSummary,
  fetchSimulationDeviceData,
  fetchSimulationConsistency,
  logoutAdmin,
  type SimulationDeviceData,
} from "../api/backend";
import useAutoRefresh from "../hooks/useAutoRefresh";
import useDashboardScene from "../hooks/useDashboardScene";
import LayoutHeader from "../components/LayoutHeader";
import WidgetPanel01 from "../components/WidgetPanel01";
import WidgetPanel04 from "../components/WidgetPanel04";
import WidgetPanel06 from "../components/WidgetPanel06";
import SimulationDeviceDialog from "../components/SimulationDeviceDialog";
import { SIMULATION_INTERACTIVE_DEVICE_CONFIG } from "../config/simulationDeviceUiConfig";

interface SimulationDeviceViewModel extends SimulationDeviceData {
  objectId: string;
  labelKey: string;
  displayName: string;
  displayLabel: string;
  visualFamily: string | undefined;
}

export default function DashboardPage({ onNavigate }: { onNavigate: (target: string) => void }) {
  const sceneCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [simulationData, setSimulationData] = useState<SimulationDeviceData[]>([]);
  const [selectedDeviceCode, setSelectedDeviceCode] = useState<string | null>(null);
  const [showMask] = useState(false);
  const [summaryUpdatedAt, setSummaryUpdatedAt] = useState("");
  const [refreshingSummary, setRefreshingSummary] = useState(false);
  const [dashboardSummaryVersion, setDashboardSummaryVersion] = useState(0);

  const refreshSummary = async () => {
    if (refreshingSummary) {
      return;
    }
    try {
      setRefreshingSummary(true);
      await fetchDashboardSummary({ force: true });
      const date = new Date();
      const display = `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
      setSummaryUpdatedAt(display);
      setDashboardSummaryVersion((value) => value + 1);
    } finally {
      setRefreshingSummary(false);
    }
  };

  useAutoRefresh({
    intervalMs: 60000,
    runWhenHidden: true,
    onTick: refreshSummary,
  });

  const { renderedDevices, configOnlyCodes, dataOnlyCodes } = useMemo(() => {
    const dataByCode = new Map(simulationData.map((item) => [item.deviceCode, item]));
    const configCodes = new Set(
      SIMULATION_INTERACTIVE_DEVICE_CONFIG.map((item) => item.deviceCode).filter(
        (code): code is string => Boolean(code)
      )
    );
    const dataCodes = new Set(simulationData.map((item) => item.deviceCode));

    const missingInData = [...configCodes].filter((code) => !dataCodes.has(code)).sort();
    const missingInConfig = [...dataCodes].filter((code) => !configCodes.has(code)).sort();

    const merged = SIMULATION_INTERACTIVE_DEVICE_CONFIG.reduce<SimulationDeviceViewModel[]>(
      (result, item) => {
        if (!item.deviceCode) {
          return result;
        }
        const data = dataByCode.get(item.deviceCode);
        if (!data) {
          return result;
        }
        result.push({
          ...data,
          objectId: item.objectId,
          labelKey: item.labelKey,
          displayName: item.displayName,
          displayLabel: item.displayLabel,
          visualFamily: item.visualFamily,
        });
        return result;
      },
      []
    );

    return {
      renderedDevices: merged,
      configOnlyCodes: missingInData,
      dataOnlyCodes: missingInConfig,
    };
  }, [simulationData]);

  useEffect(() => {
    if (configOnlyCodes.length === 0 && dataOnlyCodes.length === 0) {
      return;
    }
    console.warn("[DashboardPage] simulation ui-data mismatch", {
      configOnlyCodes,
      dataOnlyCodes,
      configDeviceCount: SIMULATION_INTERACTIVE_DEVICE_CONFIG.length,
      backendDeviceCount: simulationData.length,
    });
  }, [configOnlyCodes, dataOnlyCodes, simulationData.length]);

  const sceneBindings = useMemo(
    () =>
      renderedDevices.map((device) => ({
        objectId: device.objectId,
        deviceCode: device.deviceCode,
        labelKey: device.labelKey,
        name: device.displayName,
        visualFamily: device.visualFamily || "control-cabinet",
        status: device.status,
      })),
    [renderedDevices]
  );
  const selectedDevice = useMemo(
    () => renderedDevices.find((device) => device.deviceCode === selectedDeviceCode) || null,
    [renderedDevices, selectedDeviceCode]
  );
  const sceneDeviceCountLabel = useMemo(
    () => `演示 ${renderedDevices.length} / 数据 ${simulationData.length}`,
    [renderedDevices.length, simulationData.length]
  );
  const sceneDeviceCountClassName =
    renderedDevices.length === simulationData.length ? "scene-title-meta is-match" : "scene-title-meta is-mismatch";
  const onSceneDeviceClick = useCallback((deviceCode: string | null) => {
    setSelectedDeviceCode(deviceCode);
  }, []);
  useDashboardScene(sceneCanvasRef, {
    devices: sceneBindings,
    onDeviceClick: onSceneDeviceClick,
    interactionEnabled: true,
  });

  useEffect(() => {
    if (!selectedDeviceCode) {
      return;
    }
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedDeviceCode(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [selectedDeviceCode]);

  useEffect(() => {
    const loadDevicesWithConsistency = async () => {
      try {
        const consistency = await fetchSimulationConsistency(true);
        if (!consistency.consistent) {
          console.warn(
            `[DashboardPage] simulation consistency unresolved after auto repair: ${
              consistency.message || "unknown reason"
            }`
          );
        }
      } catch (error) {
        console.warn("[DashboardPage] simulation consistency check failed", error);
      }

      try {
        const deviceList = await fetchSimulationDeviceData();
        setSimulationData(deviceList);
      } catch (error) {
        console.error("[DashboardPage] failed to initialize simulation devices", error);
        setSimulationData([]);
      }
    };
    void loadDevicesWithConsistency();
  }, []);

  return (
    <div className="layout">
      <LayoutHeader
        showSummaryActions
        summaryUpdatedAt={summaryUpdatedAt}
        refreshing={refreshingSummary}
        onRefreshSummary={() => {
          void refreshSummary();
        }}
        onLogout={async () => {
          await logoutAdmin();
          onNavigate("/login");
        }}
      />
      <div className="layout-main">
        <div className="main-left">
          <WidgetPanel04 dashboardSummaryVersion={dashboardSummaryVersion} />
          <WidgetPanel01 dashboardSummaryVersion={dashboardSummaryVersion} />
          <WidgetPanel06 />
        </div>
        <div className="main-right">
          <canvas ref={sceneCanvasRef} className="scene-canvas" />
          <div className="scene-title-board">
            <div className="scene-title-main">220 kV 配电与控制室</div>
            <div className={sceneDeviceCountClassName}>{sceneDeviceCountLabel}</div>
          </div>
          {selectedDevice ? (
            <button
              type="button"
              className="simulation-dialog-backdrop"
              onClick={() => setSelectedDeviceCode(null)}
              aria-label="关闭设备详情"
            />
          ) : null}
          {selectedDevice ? (
            <SimulationDeviceDialog
              device={selectedDevice}
              onClose={() => setSelectedDeviceCode(null)}
            />
          ) : null}
        </div>
        {showMask ? <div className="mask"></div> : null}
      </div>
    </div>
  );
}

