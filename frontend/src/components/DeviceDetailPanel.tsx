import type { DeviceData } from "../api/backend";

function InfoItem({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="info-item">
      <div className="info-label">{label}</div>
      <div className={`info-value ${valueClass}`.trim()}>{value}</div>
    </div>
  );
}

export default function DeviceDetailPanel({
  deviceData,
  embedded,
  onClose,
}: {
  deviceData: DeviceData;
  embedded?: boolean;
  onClose: () => void;
}) {
  const getStatusClass = (status: string) =>
    ({ normal: "status-normal", warning: "status-warning", error: "status-error" }[
      status as "normal" | "warning" | "error"
    ] || "status-normal");
  const getStatusText = (status: string) =>
    ({ normal: "正常", warning: "警告", error: "故障" }[
      status as "normal" | "warning" | "error"
    ] || "正常");
  const getAlarmTypeColor = (type: string) =>
    ({ warning: "var(--tw-state-warning)", error: "var(--tw-state-danger)", info: "var(--tw-state-normal)" }[
      type as "warning" | "error" | "info"
    ] || "var(--tw-state-normal)");
  const getAlarmTypeIcon = (type: string) =>
    ({ warning: "⚠", error: "❌", info: "ℹ" }[type as "warning" | "error" | "info"] || "ℹ");

  return (
    <div className={`device-detail-panel ${embedded ? "embedded" : ""}`} onClick={(event) => event.stopPropagation()}>
      <div className="header">
        <div className="title">{deviceData.name}</div>
        <div className="close-btn" onClick={onClose}>
          ×
        </div>
      </div>
      <div className="content">
        <div className="info-section">
          <div className="info-title">设备基本信息</div>
          <InfoItem label="设备类型" value={deviceData.type} />
          <InfoItem label="设备状态" value={getStatusText(deviceData.status)} valueClass={getStatusClass(deviceData.status)} />
          <InfoItem label="设备编号" value={deviceData.serialNumber} />
          <InfoItem label="安装位置" value={deviceData.location} />
        </div>
        <div className="info-section">
          <div className="info-title">实时参数</div>
          <InfoItem label="温度" value={`${deviceData.temperature}°C`} />
          <InfoItem label="湿度" value={`${deviceData.humidity}%`} />
          <InfoItem label="电压" value={`${deviceData.voltage}V`} />
          <InfoItem label="电流" value={`${deviceData.current}A`} />
          <InfoItem label="功率" value={`${deviceData.power}W`} />
        </div>
        <div className="info-section">
          <div className="info-title">运行状态</div>
          <InfoItem label="CPU 负载" value={`${deviceData.cpuLoad}%`} />
          <InfoItem label="内存使用" value={`${deviceData.memoryUsage}%`} />
          <InfoItem label="磁盘使用" value={`${deviceData.diskUsage}%`} />
          <InfoItem label="网络流量" value={`${deviceData.networkTraffic} Mbps`} />
        </div>
        <div className="info-section">
          <div className="info-title">告警信息</div>
          <div className="alarm-list">
            {deviceData.alarms.map((alarm) => (
              <div className="alarm-item" key={alarm.id}>
                <div className="alarm-icon" style={{ background: getAlarmTypeColor(alarm.type) }}>
                  {getAlarmTypeIcon(alarm.type)}
                </div>
                <div className="alarm-info">
                  <div className="alarm-name">{alarm.name}</div>
                  <div className="alarm-time">{alarm.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

