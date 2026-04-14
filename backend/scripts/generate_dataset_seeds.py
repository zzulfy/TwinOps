#!/usr/bin/env python3
"""Generate dataset-driven SQL seeds for devices, metrics and alarms.

Inputs:
  - data/SMD/test.csv + data/SMD/labels.csv
  - data/MSDS/test.csv + data/MSDS/labels.csv
  - frontend/public/models/devices.glb
  - frontend/src/config/simulationDeviceCatalog.json

Outputs:
  - backend/sql/002_seed_devices.sql
  - backend/sql/003_seed_metrics.sql
  - backend/sql/004_seed_alarms.sql
  - backend/sql/007_simulation_object_map.csv
"""

from __future__ import annotations

import csv
import json
import math
import re
import struct
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Iterable, List, Sequence

GLB_JSON_CHUNK_TYPE = 0x4E4F534A
GLB_MAGIC = b"glTF"
WINDOW_HOURS = 48
TARGET_DEVICE_COUNT = 32
DEVICE_CATALOG_PATH = ("frontend", "src", "config", "simulationDeviceCatalog.json")
NON_DEVICE_KEYWORDS = (
    "pipe",
    "line",
    "arrow",
    "inspection",
    "route",
    "path",
    "管道",
    "巡检",
    "路径",
    "箭头",
)


@dataclass(frozen=True)
class DeviceSeed:
    code: str
    label_key: str
    name: str
    device_type: str
    status: str
    serial_number: str
    location: str


@dataclass(frozen=True)
class MetricSeed:
    device_code: str
    metric_time: datetime
    temperature: float
    humidity: float
    voltage: float
    current: float
    power: float
    cpu_load: float
    memory_usage: float
    disk_usage: float
    network_traffic: float


@dataclass(frozen=True)
class AlarmSeed:
    device_code: str
    device_name: str
    event: str
    level: int
    status: str
    occurred_at: datetime


@dataclass(frozen=True)
class SimulationObjectSeed:
    object_name: str
    label_key: str
    device_code: str
    interactive: bool


@dataclass(frozen=True)
class DeviceCatalogEntry:
    device_code: str
    object_id: str
    label_key: str
    name: str
    device_type: str
    display_label: str
    visual_family: str


def _read_csv(path: Path) -> List[dict[str, str]]:
    with path.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        return list(reader)


def _to_float(value: str, default: float = 0.0) -> float:
    try:
        return float(value)
    except Exception:
        return default


def _extract_glb_device_labels(glb_path: Path) -> List[str]:
    raw = glb_path.read_bytes()
    if raw[:4] != GLB_MAGIC:
        raise ValueError(f"invalid glb magic: {glb_path}")
    _, length = struct.unpack_from("<II", raw, 4)
    if length > len(raw):
        raise ValueError(f"invalid glb length: {glb_path}")
    offset = 12
    json_chunk = None
    while offset + 8 <= len(raw):
        chunk_len, chunk_type = struct.unpack_from("<II", raw, offset)
        offset += 8
        chunk = raw[offset : offset + chunk_len]
        offset += chunk_len
        if chunk_type == GLB_JSON_CHUNK_TYPE:
            json_chunk = chunk
            break
    if json_chunk is None:
        raise ValueError(f"missing glb json chunk: {glb_path}")
    gltf = json.loads(json_chunk.decode("utf-8"))
    labels: set[str] = set()
    for node in gltf.get("nodes", []):
        name = (node.get("name") or "").strip()
        if not name or name.startswith("Node_"):
            continue
        if "#" not in name:
            continue
        lowered = name.lower()
        if any(keyword in lowered for keyword in NON_DEVICE_KEYWORDS):
            continue
        labels.add(name)
    result = sorted(labels)
    if len(result) < TARGET_DEVICE_COUNT:
        raise ValueError(
            f"expected at least {TARGET_DEVICE_COUNT} device labels from glb, got {len(result)}"
        )
    return result


def _extract_glb_object_labels(glb_path: Path) -> List[str]:
    raw = glb_path.read_bytes()
    if raw[:4] != GLB_MAGIC:
        raise ValueError(f"invalid glb magic: {glb_path}")
    _, length = struct.unpack_from("<II", raw, 4)
    if length > len(raw):
        raise ValueError(f"invalid glb length: {glb_path}")
    offset = 12
    json_chunk = None
    while offset + 8 <= len(raw):
        chunk_len, chunk_type = struct.unpack_from("<II", raw, offset)
        offset += 8
        chunk = raw[offset : offset + chunk_len]
        offset += chunk_len
        if chunk_type == GLB_JSON_CHUNK_TYPE:
            json_chunk = chunk
            break
    if json_chunk is None:
        raise ValueError(f"missing glb json chunk: {glb_path}")
    gltf = json.loads(json_chunk.decode("utf-8"))
    objects: set[str] = set()
    for node in gltf.get("nodes", []):
        name = (node.get("name") or "").strip()
        if not name or name.startswith("Node_"):
            continue
        if "#" not in name:
            continue
        objects.add(name)
    return sorted(objects)


def _load_device_catalog(root: Path, expected_labels: Sequence[str]) -> List[DeviceCatalogEntry]:
    catalog_path = root.joinpath(*DEVICE_CATALOG_PATH)
    payload = json.loads(catalog_path.read_text(encoding="utf-8"))
    if not isinstance(payload, list):
        raise ValueError(f"device catalog must be a list: {catalog_path}")

    catalog: List[DeviceCatalogEntry] = []
    for index, item in enumerate(payload, start=1):
        if not isinstance(item, dict):
            raise ValueError(f"invalid catalog row #{index}: {item!r}")
        try:
            entry = DeviceCatalogEntry(
                device_code=str(item["deviceCode"]).strip(),
                object_id=str(item["objectId"]).strip(),
                label_key=str(item["labelKey"]).strip(),
                name=str(item["name"]).strip(),
                device_type=str(item["deviceType"]).strip(),
                display_label=str(item["displayLabel"]).strip(),
                visual_family=str(item["visualFamily"]).strip(),
            )
        except KeyError as exc:
            raise ValueError(f"missing catalog field {exc.args[0]!r} at row #{index}") from exc
        if (
            not entry.device_code
            or not entry.object_id
            or not entry.label_key
            or not entry.name
            or not entry.device_type
            or not entry.display_label
            or not entry.visual_family
        ):
            raise ValueError(f"blank value in device catalog row #{index}")
        catalog.append(entry)

    if len(catalog) != TARGET_DEVICE_COUNT:
        raise ValueError(
            f"expected {TARGET_DEVICE_COUNT} catalog entries, got {len(catalog)}: {catalog_path}"
        )

    expected_codes = [f"DEV{index:03d}" for index in range(1, TARGET_DEVICE_COUNT + 1)]
    if [item.device_code for item in catalog] != expected_codes:
        raise ValueError(
            f"device catalog must keep sequential deviceCode ordering DEV001~DEV{TARGET_DEVICE_COUNT:03d}"
        )

    expected_object_ids = [f"rack-{index:03d}" for index in range(1, TARGET_DEVICE_COUNT + 1)]
    if [item.object_id for item in catalog] != expected_object_ids:
        raise ValueError(
            f"device catalog must keep sequential objectId ordering rack-001~rack-{TARGET_DEVICE_COUNT:03d}"
        )

    catalog_labels = [item.label_key for item in catalog]
    if catalog_labels != list(expected_labels)[:TARGET_DEVICE_COUNT]:
        raise ValueError(
            "device catalog label order must match the selected sorted GLB labels to preserve simulation mapping"
        )

    unique_fields = {
        "deviceCode": [item.device_code for item in catalog],
        "objectId": [item.object_id for item in catalog],
        "labelKey": catalog_labels,
        "displayLabel": [item.display_label for item in catalog],
    }
    for field, values in unique_fields.items():
        duplicates = sorted({value for value in values if values.count(value) > 1})
        if duplicates:
            raise ValueError(f"duplicate {field} in device catalog: {', '.join(duplicates)}")

    return catalog


def _series_values(row: dict[str, str]) -> List[float]:
    values: List[float] = []
    for k, v in row.items():
        if k == "time_index":
            continue
        values.append(_to_float(v))
    return values


def _find_latest_anomaly_index(smd_labels: Sequence[dict[str, str]]) -> int:
    latest = -1
    for i, row in enumerate(smd_labels):
        if any(_to_float(v) > 0 for k, v in row.items() if k != "time_index"):
            latest = i
    if latest >= 0:
        return latest
    return max(0, len(smd_labels) - 1)


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _series_signal(
    device_index: int,
    smd_values: Sequence[float],
    msds_values: Sequence[float],
) -> float:
    if device_index < 38:
        return smd_values[device_index % len(smd_values)]
    if device_index < 48:
        return msds_values[(device_index - 38) % len(msds_values)]
    a = smd_values[(device_index - 48) % len(smd_values)]
    b = smd_values[(device_index - 45) % len(smd_values)]
    c = msds_values[(device_index - 48) % len(msds_values)]
    return (a + b + c) / 3.0


def _build_metric(signal: float) -> tuple[float, float, float, float, float, float, float, float, float]:
    normalized = _clamp(signal, 0.0, 1.0)
    temperature = 28.0 + normalized * 14.0
    humidity = 45.0 + normalized * 30.0
    voltage = 212.0 + normalized * 16.0
    current = 5.0 + normalized * 4.8
    power = voltage * current * 0.82
    cpu_load = _clamp(28.0 + normalized * 68.0, 0.0, 98.0)
    memory_usage = _clamp(22.0 + normalized * 66.0, 0.0, 98.0)
    disk_usage = _clamp(20.0 + normalized * 58.0, 0.0, 96.0)
    network_traffic = 320.0 + normalized * 780.0
    return (
        round(temperature, 2),
        round(humidity, 2),
        round(voltage, 2),
        round(current, 2),
        round(power, 2),
        round(cpu_load, 2),
        round(memory_usage, 2),
        round(disk_usage, 2),
        round(network_traffic, 2),
    )


def _status_from_labels(
    device_index: int,
    smd_labels_window: Sequence[dict[str, str]],
    msds_labels_window: Sequence[dict[str, str]],
) -> str:
    smd_cols = [k for k in smd_labels_window[0].keys() if k != "time_index"]
    msds_cols = [k for k in msds_labels_window[0].keys() if k != "time_index"]
    anomaly_hits = 0
    if device_index < 38:
        col = smd_cols[device_index % len(smd_cols)]
        anomaly_hits = sum(1 for row in smd_labels_window if _to_float(row.get(col, "0")) > 0)
    elif device_index < 48:
        col = msds_cols[(device_index - 38) % len(msds_cols)]
        anomaly_hits = sum(1 for row in msds_labels_window if _to_float(row.get(col, "0")) > 0)
    else:
        c0 = smd_cols[(device_index - 48) % len(smd_cols)]
        c1 = smd_cols[(device_index - 45) % len(smd_cols)]
        anomaly_hits = sum(
            1
            for row in smd_labels_window
            if _to_float(row.get(c0, "0")) > 0 or _to_float(row.get(c1, "0")) > 0
        )
    if anomaly_hits >= 3:
        return "error"
    if anomaly_hits >= 1:
        return "warning"
    return "normal"


def build_seed_data(
    root: Path,
) -> tuple[List[DeviceSeed], List[MetricSeed], List[AlarmSeed], List[SimulationObjectSeed]]:
    glb_path = root / "frontend" / "public" / "models" / "devices.glb"
    smd_test_path = root / "data" / "SMD" / "test.csv"
    smd_labels_path = root / "data" / "SMD" / "labels.csv"
    msds_test_path = root / "data" / "MSDS" / "test.csv"
    msds_labels_path = root / "data" / "MSDS" / "labels.csv"

    labels = _extract_glb_device_labels(glb_path)
    catalog = _load_device_catalog(root, labels)
    all_object_labels = _extract_glb_object_labels(glb_path)
    smd_test = _read_csv(smd_test_path)
    smd_labels = _read_csv(smd_labels_path)
    msds_test = _read_csv(msds_test_path)
    msds_labels = _read_csv(msds_labels_path)

    latest_anomaly = _find_latest_anomaly_index(smd_labels)
    window_end = max(WINDOW_HOURS - 1, latest_anomaly)
    window_start = max(0, window_end - (WINDOW_HOURS - 1))
    if window_end >= len(smd_test):
        window_end = len(smd_test) - 1
        window_start = max(0, window_end - (WINDOW_HOURS - 1))
    smd_window = smd_test[window_start : window_end + 1]
    smd_labels_window = smd_labels[window_start : window_end + 1]
    if len(smd_window) < WINDOW_HOURS:
        padding = [smd_window[-1]] * (WINDOW_HOURS - len(smd_window))
        padding_labels = [smd_labels_window[-1]] * (WINDOW_HOURS - len(smd_labels_window))
        smd_window = padding + smd_window
        smd_labels_window = padding_labels + smd_labels_window

    def msds_row_for(i: int) -> dict[str, str]:
        if len(msds_test) == 1:
            return msds_test[0]
        ratio = i / max(1, len(smd_window) - 1)
        idx = int(round(ratio * (len(msds_test) - 1)))
        return msds_test[idx]

    def msds_label_row_for(i: int) -> dict[str, str]:
        if len(msds_labels) == 1:
            return msds_labels[0]
        ratio = i / max(1, len(smd_labels_window) - 1)
        idx = int(round(ratio * (len(msds_labels) - 1)))
        return msds_labels[idx]

    end_time = datetime.now().replace(minute=0, second=0, microsecond=0)
    start_time = end_time - timedelta(hours=WINDOW_HOURS - 1)

    devices: List[DeviceSeed] = []
    metrics: List[MetricSeed] = []
    alarms: List[AlarmSeed] = []
    object_mappings: List[SimulationObjectSeed] = []

    status_by_code: dict[str, str] = {}

    msds_labels_window = [msds_label_row_for(i) for i in range(WINDOW_HOURS)]
    for index, catalog_entry in enumerate(catalog):
        code = catalog_entry.device_code
        status = _status_from_labels(index, smd_labels_window, msds_labels_window)
        status_by_code[code] = status
        devices.append(
            DeviceSeed(
                code=code,
                label_key=catalog_entry.label_key,
                name=catalog_entry.name,
                device_type=catalog_entry.device_type,
                status=status,
                serial_number=f"SN{100000 + index + 1}",
                location=f"仿真园区 {chr(ord('A') + (index // 17))} 区 {(index % 17) + 1:02d} 位",
            )
        )
        object_mappings.append(
            SimulationObjectSeed(
                object_name=catalog_entry.label_key,
                label_key=catalog_entry.label_key,
                device_code=code,
                interactive=True,
            )
        )

    interactive_set = {item.label_key for item in catalog}
    decorative_labels = [label for label in all_object_labels if label not in interactive_set]
    for decorative in decorative_labels:
        object_mappings.append(
            SimulationObjectSeed(
                object_name=decorative,
                label_key="",
                device_code="",
                interactive=False,
            )
        )

    for t in range(WINDOW_HOURS):
        metric_time = start_time + timedelta(hours=t)
        smd_vals = _series_values(smd_window[t])
        msds_vals = _series_values(msds_row_for(t))
        for d_index, device in enumerate(devices):
            signal = _series_signal(d_index, smd_vals, msds_vals)
            (
                temperature,
                humidity,
                voltage,
                current,
                power,
                cpu_load,
                memory_usage,
                disk_usage,
                network_traffic,
            ) = _build_metric(signal)
            metrics.append(
                MetricSeed(
                    device_code=device.code,
                    metric_time=metric_time,
                    temperature=temperature,
                    humidity=humidity,
                    voltage=voltage,
                    current=current,
                    power=power,
                    cpu_load=cpu_load,
                    memory_usage=memory_usage,
                    disk_usage=disk_usage,
                    network_traffic=network_traffic,
                )
            )

    for device in devices:
        if device.status == "normal":
            continue
        alarms.append(
            AlarmSeed(
                device_code=device.code,
                device_name=device.name,
                event="关键指标异常" if device.status == "error" else "指标波动预警",
                level=3 if device.status == "error" else 2,
                status="new",
                occurred_at=end_time,
            )
        )

    return devices, metrics, alarms, object_mappings


def _sql_quote(value: str) -> str:
    return value.replace("\\", "\\\\").replace("'", "\\'")


def render_devices_sql(devices: Sequence[DeviceSeed]) -> str:
    lines = [
        "SET NAMES utf8mb4;",
        "",
        "DELETE FROM devices;",
        "",
        "INSERT INTO devices (",
        "  device_code,",
        "  label_key,",
        "  name,",
        "  type,",
        "  status,",
        "  serial_number,",
        "  location",
        ")",
        "VALUES",
    ]
    values = []
    for d in devices:
        values.append(
            "  ('{code}', '{label}', '{name}', '{dtype}', '{status}', '{serial}', '{location}')".format(
                code=_sql_quote(d.code),
                label=_sql_quote(d.label_key),
                name=_sql_quote(d.name),
                dtype=_sql_quote(d.device_type),
                status=_sql_quote(d.status),
                serial=_sql_quote(d.serial_number),
                location=_sql_quote(d.location),
            )
        )
    lines.append(",\n".join(values) + ";")
    return "\n".join(lines) + "\n"


def render_metrics_sql(metrics: Sequence[MetricSeed]) -> str:
    lines = [
        "SET NAMES utf8mb4;",
        "",
        "DELETE FROM device_metrics;",
        "",
        "INSERT INTO device_metrics (",
        "  device_code,",
        "  metric_time,",
        "  temperature,",
        "  humidity,",
        "  voltage,",
        "  current,",
        "  power,",
        "  cpu_load,",
        "  memory_usage,",
        "  disk_usage,",
        "  network_traffic",
        ")",
        "VALUES",
    ]
    values = []
    for m in metrics:
        values.append(
            "  ('{code}', '{time}', {temperature:.2f}, {humidity:.2f}, {voltage:.2f}, {current:.2f}, {power:.2f}, {cpu:.2f}, {memory:.2f}, {disk:.2f}, {network:.2f})".format(
                code=_sql_quote(m.device_code),
                time=m.metric_time.strftime("%Y-%m-%d %H:%M:%S"),
                temperature=m.temperature,
                humidity=m.humidity,
                voltage=m.voltage,
                current=m.current,
                power=m.power,
                cpu=m.cpu_load,
                memory=m.memory_usage,
                disk=m.disk_usage,
                network=m.network_traffic,
            )
        )
    lines.append(",\n".join(values) + ";")
    return "\n".join(lines) + "\n"


def render_alarms_sql(alarms: Sequence[AlarmSeed]) -> str:
    lines = [
        "SET NAMES utf8mb4;",
        "",
        "DELETE FROM alarms;",
    ]
    if not alarms:
        return "\n".join(lines) + "\n"
    lines.extend(
        [
            "",
            "INSERT INTO alarms (",
            "  device_code,",
            "  device_name,",
            "  event,",
            "  level,",
            "  status,",
            "  occurred_at",
            ")",
            "VALUES",
        ]
    )
    values = []
    for a in alarms:
        values.append(
            "  ('{code}', '{name}', '{event}', {level}, '{status}', '{time}')".format(
                code=_sql_quote(a.device_code),
                name=_sql_quote(a.device_name),
                event=_sql_quote(a.event),
                level=a.level,
                status=_sql_quote(a.status),
                time=a.occurred_at.strftime("%Y-%m-%d %H:%M:%S"),
            )
        )
    lines.append(",\n".join(values) + ";")
    return "\n".join(lines) + "\n"


def render_object_map_csv(mappings: Sequence[SimulationObjectSeed]) -> str:
    lines = ["object_name,label_key,device_code,interactive"]
    for item in mappings:
        lines.append(
            "{object_name},{label_key},{device_code},{interactive}".format(
                object_name=item.object_name,
                label_key=item.label_key,
                device_code=item.device_code,
                interactive="true" if item.interactive else "false",
            )
        )
    return "\n".join(lines) + "\n"


def write_outputs(
    root: Path,
    devices: Sequence[DeviceSeed],
    metrics: Sequence[MetricSeed],
    alarms: Sequence[AlarmSeed],
    object_mappings: Sequence[SimulationObjectSeed],
) -> None:
    sql_dir = root / "backend" / "sql"
    (sql_dir / "002_seed_devices.sql").write_text(render_devices_sql(devices), encoding="utf-8")
    (sql_dir / "003_seed_metrics.sql").write_text(render_metrics_sql(metrics), encoding="utf-8")
    (sql_dir / "004_seed_alarms.sql").write_text(render_alarms_sql(alarms), encoding="utf-8")
    (sql_dir / "007_simulation_object_map.csv").write_text(
        render_object_map_csv(object_mappings),
        encoding="utf-8",
    )


def main() -> None:
    repo_root = Path(__file__).resolve().parents[2]
    devices, metrics, alarms, object_mappings = build_seed_data(repo_root)
    write_outputs(repo_root, devices, metrics, alarms, object_mappings)
    print(
        f"seed generated: devices={len(devices)} metrics={len(metrics)} alarms={len(alarms)} "
        f"objectMappings={len(object_mappings)} "
        f"(window={WINDOW_HOURS}h)"
    )


if __name__ == "__main__":
    main()
