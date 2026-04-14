import type { SimulationDeviceData } from "../api/backend";

export interface SimulationDeviceDialogData extends SimulationDeviceData {
  displayName: string;
  displayLabel: string;
}

function formatStatus(status: SimulationDeviceData["status"]): string {
  if (status === "error") {
    return "故障";
  }
  if (status === "warning") {
    return "警告";
  }
  return "正常";
}

export default function SimulationDeviceDialog({
  device,
  onClose,
}: {
  device: SimulationDeviceDialogData;
  onClose: () => void;
}) {
  return (
    <div
      className="simulation-device-dialog"
      role="dialog"
      aria-modal="true"
      aria-label={`设备详情 ${device.deviceCode}`}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="dialog-header">
        <div className="dialog-title">
          <strong>{device.deviceCode}</strong> {device.displayName}
        </div>
        <button type="button" className="dialog-close" onClick={onClose} aria-label="关闭设备详情">
          ×
        </button>
      </div>
      <div className="dialog-grid">
        <div>
          <span className="k">状态</span>
          <span className={`v status-${device.status}`}>{formatStatus(device.status)}</span>
        </div>
        <div>
          <span className="k">类型</span>
          <span className="v">{device.type}</span>
        </div>
        <div>
          <span className="k">标签</span>
          <span className="v">{device.displayLabel}</span>
        </div>
        <div>
          <span className="k">位置</span>
          <span className="v">{device.location}</span>
        </div>
        <div>
          <span className="k">温度</span>
          <span className="v">{device.temperature}°C</span>
        </div>
        <div>
          <span className="k">湿度</span>
          <span className="v">{device.humidity}%</span>
        </div>
        <div>
          <span className="k">功率</span>
          <span className="v">{device.power}W</span>
        </div>
        <div>
          <span className="k">CPU</span>
          <span className="v">{device.cpuLoad}%</span>
        </div>
      </div>
      <div className="dialog-alarms">
        <div className="alarm-title">最近告警</div>
        {device.alarms.length === 0 ? <div className="alarm-empty">暂无告警</div> : null}
        {device.alarms.slice(0, 2).map((alarm) => (
          <div className="alarm-row" key={alarm.id}>
            <span className={`alarm-type ${alarm.type}`}>{alarm.type}</span>
            <span className="alarm-name">{alarm.name}</span>
            <span className="alarm-time">{alarm.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
