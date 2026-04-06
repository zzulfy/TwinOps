import { useEffect, useMemo, useState } from "react";
import {
  fetchAlarmList,
  fetchDevices,
  fetchWatchlist,
  pinWatchlistDevice,
  unpinWatchlistDevice,
  updateAlarmStatus,
} from "../api/backend";
import type {
  AlarmListItem,
  AlarmStatus,
  DeviceData,
  WatchlistItem,
} from "../api/backend";
import type { RouteMatch } from "../types/route";
import DeviceDetailPanel from "../components/DeviceDetailPanel";

export default function DeviceDetailPage({ route, onNavigate }: { route: RouteMatch; onNavigate: (target: string) => void }) {
  const [allDevicesData, setAllDevicesData] = useState<DeviceData[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"" | DeviceData["status"]>("");
  const [watchList, setWatchList] = useState<WatchlistItem[]>([]);
  const [currentDeviceCode, setCurrentDeviceCode] = useState("");
  const [alarmItems, setAlarmItems] = useState<AlarmListItem[]>([]);
  const [alarmStatus, setAlarmStatus] = useState<AlarmStatus>("new");
  const [alarmLoading, setAlarmLoading] = useState(false);
  const [alarmErrorMessage, setAlarmErrorMessage] = useState("");
  const [alarmUpdatingId, setAlarmUpdatingId] = useState<number | null>(null);

  const alarmTabs: Array<{ label: string; value: AlarmStatus }> = [
    { label: "新告警", value: "new" },
    { label: "已确认", value: "acknowledged" },
    { label: "已解决", value: "resolved" },
  ];

  const watchSet = useMemo(() => new Set(watchList.map((item) => item.deviceCode)), [watchList]);

  const filteredDevices = useMemo(() => {
    const normalizedKeyword = keyword.toLowerCase();
    return allDevicesData.filter((device) => {
      const keywordMatched =
        normalizedKeyword.length === 0 ||
        device.name.toLowerCase().includes(normalizedKeyword) ||
        device.deviceCode.toLowerCase().includes(normalizedKeyword);
      const statusMatched = selectedStatus === "" || device.status === selectedStatus;
      return keywordMatched && statusMatched;
    });
  }, [allDevicesData, keyword, selectedStatus]);

  const currentDevice = useMemo(
    () => allDevicesData.find((device) => device.deviceCode === currentDeviceCode),
    [allDevicesData, currentDeviceCode]
  );
  const notFound = Boolean(currentDeviceCode) && !currentDevice && allDevicesData.length > 0;

  const syncRouteState = () => {
    const routeCode = route.path === "/devices/:deviceCode" ? route.params.deviceCode || "" : "";
    setCurrentDeviceCode(routeCode);
    const keywordFromQuery = route.query.get("keyword");
    if (keywordFromQuery !== null) {
      setKeyword(keywordFromQuery);
    }
  };

  const loadAlarmItems = async (deviceCode: string, status: AlarmStatus) => {
    if (!deviceCode) {
      setAlarmItems([]);
      return;
    }
    try {
      setAlarmLoading(true);
      setAlarmItems(await fetchAlarmList(status, 20, deviceCode));
      setAlarmErrorMessage("");
    } catch (error) {
      setAlarmErrorMessage(`告警数据加载失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setAlarmLoading(false);
    }
  };

  useEffect(() => {
    syncRouteState();
  }, [route.path, route.params.deviceCode, route.query]);

  useEffect(() => {
    const loadPage = async () => {
      try {
        const devices = await fetchDevices();
        setAllDevicesData(devices);
        setWatchList(await fetchWatchlist());
        setErrorMessage("");
      } catch (error) {
        setErrorMessage(`设备数据加载失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    void loadPage();
  }, []);

  useEffect(() => {
    void loadAlarmItems(currentDeviceCode, alarmStatus);
  }, [currentDeviceCode, alarmStatus]);

  useEffect(() => {
    if (!currentDeviceCode && filteredDevices.length > 0) {
      setCurrentDeviceCode(filteredDevices[0].deviceCode);
    }
  }, [currentDeviceCode, filteredDevices]);

  return (
    <div className="device-page">
      <div className="page-header">
        <div className="title">设备列表与详情</div>
        <div className="subtitle">搜索、关注并快速进入单设备详情</div>
      </div>

      <div className="filter-bar">
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          className="filter-input"
          type="text"
          placeholder="搜索设备名称或 deviceCode"
        />
        <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as "" | DeviceData["status"])} className="filter-select">
          <option value="">全部状态</option>
          <option value="normal">normal</option>
          <option value="warning">warning</option>
          <option value="error">error</option>
        </select>
        <button
          className="clear-btn"
          onClick={() => {
            setKeyword("");
            setSelectedStatus("");
          }}
        >
          清空筛选
        </button>
        <span className="filter-count">
          显示 {filteredDevices.length} / {allDevicesData.length}
        </span>
      </div>

      {errorMessage ? <div className="status-message error">{errorMessage}</div> : null}
      {!errorMessage && allDevicesData.length === 0 ? <div className="status-message">暂无设备数据</div> : null}
      {!errorMessage && allDevicesData.length > 0 ? (
        <div className="device-layout">
          <div className="list-panel">
            <div className="list-title">设备列表</div>
            {filteredDevices.length === 0 ? <div className="status-message">筛选结果为空，请调整条件</div> : null}
            {filteredDevices.map((device) => (
              <div
                key={device.deviceCode}
                className={`list-item ${currentDevice?.deviceCode === device.deviceCode ? "active" : ""}`.trim()}
              >
                <div className="list-item-main" onClick={() => onNavigate(`/devices/${encodeURIComponent(device.deviceCode)}`)}>
                  <div className="name">{device.name}</div>
                  <div className="meta">
                    {device.deviceCode} · {device.status}
                  </div>
                </div>
                <button
                  className="pin-btn"
                  onClick={async () => {
                    if (watchSet.has(device.deviceCode)) {
                      setWatchList(await unpinWatchlistDevice(device.deviceCode));
                      return;
                    }
                    setWatchList(await pinWatchlistDevice(device.deviceCode));
                  }}
                >
                  {watchSet.has(device.deviceCode) ? "取消关注" : "关注"}
                </button>
              </div>
            ))}
          </div>

          <div className="watch-panel">
            <div className="list-title">关注列表</div>
            {watchList.length === 0 ? <div className="empty-watch">暂无关注设备</div> : null}
            {watchList.map((item) => (
              <div
                key={item.deviceCode}
                className="watch-item"
                onClick={() => onNavigate(`/devices/${encodeURIComponent(item.deviceCode)}`)}
              >
                {item.deviceCode}
              </div>
            ))}
          </div>

          <div className="detail-panel">
            {notFound ? (
              <div className="status-message error">
                未找到设备 {route.params.deviceCode}，请从左侧列表重新选择。
              </div>
            ) : null}
            {!notFound && currentDevice ? (
              <div className="detail-with-alarm-actions">
                <DeviceDetailPanel deviceData={currentDevice} embedded onClose={() => onNavigate("/devices")} />
                <div className="alarm-ops-panel">
                  <div className="list-title">告警操作（设备列表执行）</div>
                  <div className="alarm-tabs">
                    {alarmTabs.map((tab) => (
                      <button
                        key={tab.value}
                        className={`alarm-tab-btn ${alarmStatus === tab.value ? "active" : ""}`.trim()}
                        onClick={() => {
                          if (alarmStatus !== tab.value && !alarmLoading) {
                            setAlarmStatus(tab.value);
                          }
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  {alarmErrorMessage ? <div className="status-message error">{alarmErrorMessage}</div> : null}
                  {!alarmErrorMessage && alarmLoading ? <div className="status-message">告警数据加载中...</div> : null}
                  {!alarmErrorMessage && !alarmLoading && alarmItems.length === 0 ? (
                    <div className="status-message">当前筛选下暂无告警</div>
                  ) : null}
                  {!alarmErrorMessage && !alarmLoading && alarmItems.length > 0 ? (
                    <div className="alarm-ops-list">
                      {alarmItems.map((alarm) => (
                        <div key={alarm.id} className="alarm-ops-item">
                          <div className="alarm-ops-main">
                            <div className="alarm-ops-event">{alarm.event}</div>
                            <div className="alarm-ops-meta">
                              {alarm.time} · {alarm.status}
                            </div>
                          </div>
                          {alarm.status === "new" ? (
                            <button
                              className="alarm-action-btn"
                              disabled={alarmUpdatingId === alarm.id}
                              onClick={async () => {
                                try {
                                  setAlarmUpdatingId(alarm.id);
                                  await updateAlarmStatus(alarm.id, "acknowledged");
                                  await loadAlarmItems(currentDeviceCode, alarmStatus);
                                } finally {
                                  setAlarmUpdatingId(null);
                                }
                              }}
                            >
                              确认
                            </button>
                          ) : null}
                          {alarm.status === "acknowledged" ? (
                            <button
                              className="alarm-action-btn"
                              disabled={alarmUpdatingId === alarm.id}
                              onClick={async () => {
                                try {
                                  setAlarmUpdatingId(alarm.id);
                                  await updateAlarmStatus(alarm.id, "resolved");
                                  await loadAlarmItems(currentDeviceCode, alarmStatus);
                                } finally {
                                  setAlarmUpdatingId(null);
                                }
                              }}
                            >
                              解决
                            </button>
                          ) : null}
                          {alarm.status === "resolved" ? <span className="alarm-resolved-tag">已解决</span> : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
            {!notFound && !currentDevice ? <div className="status-message">请从列表或关注列表选择设备查看详情。</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

