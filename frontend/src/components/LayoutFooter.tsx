import { useEffect, useState } from "react";
import { fetchAlarmList } from "../api/backend";
import type { AlarmListItem } from "../api/backend";

function AlarmDeviceList({
  devices,
  loading,
  errorMessage,
  onClose,
}: {
  devices: AlarmListItem[];
  loading: boolean;
  errorMessage: string;
  onClose: () => void;
}) {
  const getTypeColor = (type: 1 | 2 | 3) => ({ 1: "#74fabd", 2: "#5bc7fa", 3: "#f1bd49" })[type];
  const getTypeText = (type: 1 | 2 | 3) => ({ 1: "一般", 2: "中等", 3: "严重" })[type];

  return (
    <div className="alarm-device-list" onClick={(event) => event.stopPropagation()}>
      <div className="header">
        <div className="title">告警设备列表</div>
        <div className="close-btn" onClick={onClose}>
          ×
        </div>
      </div>
      <div className="content">
        {loading ? <div className="status-message">告警数据加载中...</div> : null}
        {!loading && errorMessage ? <div className="status-message error">{errorMessage}</div> : null}
        {!loading && !errorMessage && devices.length === 0 ? <div className="status-message">暂无告警数据</div> : null}
        {!loading && !errorMessage && devices.length > 0
          ? devices.map((item) => (
              <div className="device-item" key={item.id}>
                <div className="device-info">
                  <div className="device-name">{item.name}</div>
                  <div className="device-event">{item.event}</div>
                </div>
                <div className="device-time">{item.time}</div>
                <div className="device-type" style={{ background: getTypeColor(item.type) }}>
                  {getTypeText(item.type)}
                </div>
              </div>
            ))
          : null}
      </div>
    </div>
  );
}

export default function LayoutFooter() {
  const [showAlarmList, setShowAlarmList] = useState(false);
  const [alarmDevices, setAlarmDevices] = useState<AlarmListItem[]>([]);
  const [alarmLoading, setAlarmLoading] = useState(false);
  const [alarmErrorMessage, setAlarmErrorMessage] = useState("");

  useEffect(() => {
    if (!showAlarmList) {
      return;
    }
    const load = async () => {
      try {
        setAlarmLoading(true);
        setAlarmDevices(await fetchAlarmList("new", 20));
        setAlarmErrorMessage("");
      } catch (error) {
        setAlarmErrorMessage(`告警数据加载失败: ${error instanceof Error ? error.message : String(error)}`);
        setAlarmDevices([]);
      } finally {
        setAlarmLoading(false);
      }
    };
    void load();
  }, [showAlarmList]);

  return (
    <div className="layout-footer">
      <div className="item" style={{ cursor: "pointer", color: "var(--tw-state-normal)" }} onClick={() => setShowAlarmList(true)}>
        设备告警
      </div>
      {showAlarmList ? (
        <AlarmDeviceList
          devices={alarmDevices}
          loading={alarmLoading}
          errorMessage={alarmErrorMessage}
          onClose={() => setShowAlarmList(false)}
        />
      ) : null}
    </div>
  );
}

