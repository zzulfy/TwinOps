from pathlib import Path

from generate_dataset_seeds import (
    TARGET_DEVICE_COUNT,
    WINDOW_HOURS,
    build_seed_data,
    render_alarms_sql,
    render_devices_sql,
    render_metrics_sql,
    render_object_map_csv,
)


def test_build_seed_data_counts_and_mapping():
    repo_root = Path(__file__).resolve().parents[2]
    devices, metrics, alarms, object_mappings = build_seed_data(repo_root)

    assert len(devices) == TARGET_DEVICE_COUNT
    assert len({d.label_key for d in devices}) == TARGET_DEVICE_COUNT
    assert len(metrics) == TARGET_DEVICE_COUNT * WINDOW_HOURS
    assert len({m.device_code for m in metrics}) == TARGET_DEVICE_COUNT
    assert any(d.status in ("warning", "error") for d in devices)
    assert all(a.device_code in {d.code for d in devices} for a in alarms)
    assert len([item for item in object_mappings if item.interactive]) == TARGET_DEVICE_COUNT


def test_sql_rendering_smoke():
    repo_root = Path(__file__).resolve().parents[2]
    devices, metrics, alarms, object_mappings = build_seed_data(repo_root)

    device_sql = render_devices_sql(devices)
    metric_sql = render_metrics_sql(metrics)
    alarm_sql = render_alarms_sql(alarms)
    object_map_csv = render_object_map_csv(object_mappings)

    assert "INSERT INTO devices" in device_sql
    assert "INSERT INTO device_metrics" in metric_sql
    assert "DELETE FROM alarms" in alarm_sql
    assert "object_name,label_key,device_code,interactive" in object_map_csv
    assert "DEV001" in device_sql


if __name__ == "__main__":
    test_build_seed_data_counts_and_mapping()
    test_sql_rendering_smoke()
    print("seed script tests passed")
