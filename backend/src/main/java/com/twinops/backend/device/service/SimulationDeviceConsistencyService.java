package com.twinops.backend.device.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.twinops.backend.alarm.mapper.AlarmMapper;
import com.twinops.backend.common.logging.LogFields;
import com.twinops.backend.device.dto.SimulationDeviceConsistencyDto;
import com.twinops.backend.device.entity.DeviceEntity;
import com.twinops.backend.device.mapper.DeviceMapper;
import com.twinops.backend.telemetry.entity.TelemetryEntity;
import com.twinops.backend.telemetry.mapper.TelemetryMapper;
import com.twinops.backend.watchlist.mapper.AdminWatchlistMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class SimulationDeviceConsistencyService {

    private static final Logger log = LoggerFactory.getLogger(SimulationDeviceConsistencyService.class);
    private static final Pattern SEED_ROW_PATTERN = Pattern.compile(
        "\\('([^']+)',\\s*'([^']+)',\\s*'([^']+)',\\s*'([^']+)',\\s*'([^']+)',\\s*'([^']+)',\\s*'([^']+)'\\)"
    );

    private final DeviceMapper deviceMapper;
    private final TelemetryMapper telemetryMapper;
    private final AlarmMapper alarmMapper;
    private final AdminWatchlistMapper adminWatchlistMapper;
    private final SimulationDeviceModelSource simulationDeviceModelSource;
    private final String seedDevicesSqlPath;
    private final String simulationObjectMapPath;

    public SimulationDeviceConsistencyService(
        DeviceMapper deviceMapper,
        TelemetryMapper telemetryMapper,
        AlarmMapper alarmMapper,
        AdminWatchlistMapper adminWatchlistMapper,
        SimulationDeviceModelSource simulationDeviceModelSource,
        @Value("${twinops.simulation.seed-devices-sql-path:./sql/002_seed_devices.sql}") String seedDevicesSqlPath,
        @Value("${twinops.simulation.object-map-path:./sql/007_simulation_object_map.csv}") String simulationObjectMapPath
    ) {
        this.deviceMapper = deviceMapper;
        this.telemetryMapper = telemetryMapper;
        this.alarmMapper = alarmMapper;
        this.adminWatchlistMapper = adminWatchlistMapper;
        this.simulationDeviceModelSource = simulationDeviceModelSource;
        this.seedDevicesSqlPath = seedDevicesSqlPath;
        this.simulationObjectMapPath = simulationObjectMapPath;
    }

    @Transactional
    public SimulationDeviceConsistencyDto checkAndRepair(boolean autoRepair) {
        List<String> errors = new ArrayList<>();
        try {
            Set<String> simulationLabelKeys = new LinkedHashSet<>(loadSimulationDeviceLabelKeys());
            List<DeviceEntity> devicesBefore = listDevices();
            int databaseBefore = devicesBefore.size();
            Set<String> databaseLabelKeys = devicesBefore.stream()
                .map(DeviceEntity::getLabelKey)
                .filter(value -> value != null && !value.isBlank())
                .collect(Collectors.toCollection(LinkedHashSet::new));

            List<String> extraInDatabase = diff(databaseLabelKeys, simulationLabelKeys);
            List<String> missingInDatabase = diff(simulationLabelKeys, databaseLabelKeys);
            int deletedCount = 0;
            int addedCount = 0;
            boolean repaired = false;

            if (autoRepair && (!extraInDatabase.isEmpty() || !missingInDatabase.isEmpty())) {
                deletedCount = deleteExtraDevices(devicesBefore, extraInDatabase);
                addedCount = insertMissingDevices(missingInDatabase, listDevices());
                repaired = true;
            }

            List<DeviceEntity> devicesAfter = listDevices();
            int databaseAfter = devicesAfter.size();
            Set<String> databaseLabelAfter = devicesAfter.stream()
                .map(DeviceEntity::getLabelKey)
                .filter(value -> value != null && !value.isBlank())
                .collect(Collectors.toCollection(LinkedHashSet::new));
            List<String> extraAfter = diff(databaseLabelAfter, simulationLabelKeys);
            List<String> missingAfter = diff(simulationLabelKeys, databaseLabelAfter);
            int telemetryRepairedCount = autoRepair ? ensureTelemetryCoverage(devicesAfter) : 0;
            boolean consistent = extraAfter.isEmpty() && missingAfter.isEmpty();

            if (!consistent) {
                errors.add("simulation-device-set and database-device-set are still inconsistent after repair attempt");
            }

            String status = consistent ? (repaired ? "repaired" : "ok") : "failed";
            String message = consistent
                ? (repaired
                    ? "simulation-device consistency repaired successfully"
                    : "simulation-device consistency check passed")
                : "simulation-device consistency check failed";
            if (telemetryRepairedCount > 0) {
                message = message + ", telemetry baseline restored for " + telemetryRepairedCount + " devices";
            }
            log.info("{}={} {}={} {}={} {}={} simulationCount={} dbBefore={} dbAfter={} deletedCount={} addedCount={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "device",
                LogFields.EVENT, "device.simulation_consistency",
                LogFields.RESULT, status,
                simulationLabelKeys.size(),
                databaseBefore,
                databaseAfter,
                deletedCount,
                addedCount
            );
            return new SimulationDeviceConsistencyDto(
                status,
                consistent,
                repaired,
                simulationLabelKeys.size(),
                databaseBefore,
                databaseAfter,
                deletedCount,
                addedCount,
                extraAfter,
                missingAfter,
                errors,
                message
            );
        } catch (Exception ex) {
            errors.add(ex.getMessage());
            log.error("{}={} {}={} {}={} {}={} {}={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "device",
                LogFields.EVENT, "device.simulation_consistency",
                LogFields.RESULT, "failed",
                LogFields.ERROR_CODE, "SIMULATION_CONSISTENCY_EXCEPTION",
                ex
            );
            return new SimulationDeviceConsistencyDto(
                "failed",
                false,
                false,
                0,
                0,
                0,
                0,
                0,
                List.of(),
                List.of(),
                errors,
                "simulation-device consistency check failed: " + ex.getMessage()
            );
        }
    }

    private Set<String> loadSimulationDeviceLabelKeys() {
        Set<String> labelsFromObjectMap = loadInteractiveLabelKeysFromObjectMap();
        if (!labelsFromObjectMap.isEmpty()) {
            return labelsFromObjectMap;
        }
        return simulationDeviceModelSource.loadDeviceLabelKeys();
    }

    private Set<String> loadInteractiveLabelKeysFromObjectMap() {
        Path resolved = resolvePath(simulationObjectMapPath);
        if (!Files.exists(resolved)) {
            return Set.of();
        }
        try {
            List<String> lines = Files.readAllLines(resolved, StandardCharsets.UTF_8);
            if (lines.isEmpty()) {
                return Set.of();
            }
            Set<String> labelKeys = new LinkedHashSet<>();
            for (int index = 1; index < lines.size(); index += 1) {
                String row = lines.get(index);
                if (row == null || row.isBlank()) {
                    continue;
                }
                String[] columns = row.split(",", -1);
                if (columns.length < 4) {
                    continue;
                }
                String labelKey = columns[1].trim();
                String interactiveFlag = columns[3].trim().toLowerCase(Locale.ROOT);
                if ("true".equals(interactiveFlag) && !labelKey.isBlank()) {
                    labelKeys.add(labelKey);
                }
            }
            return labelKeys;
        } catch (Exception ex) {
            log.warn("{}={} {}={} {}={} {}={} {}={} path={} msg={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "device",
                LogFields.EVENT, "device.simulation_object_map.load",
                LogFields.RESULT, "failed",
                LogFields.ERROR_CODE, "SIMULATION_OBJECT_MAP_READ_FAILED",
                resolved,
                ex.getMessage()
            );
            return Set.of();
        }
    }

    private List<DeviceEntity> listDevices() {
        QueryWrapper<DeviceEntity> wrapper = new QueryWrapper<>();
        wrapper.orderByAsc("device_code");
        return deviceMapper.selectList(wrapper);
    }

    private List<String> diff(Set<String> left, Set<String> right) {
        return left.stream()
            .filter(item -> !right.contains(item))
            .sorted()
            .toList();
    }

    private int deleteExtraDevices(List<DeviceEntity> devicesBefore, List<String> extraLabelKeys) {
        if (extraLabelKeys.isEmpty()) {
            return 0;
        }
        Map<String, String> labelToCode = devicesBefore.stream()
            .filter(device -> device.getLabelKey() != null && !device.getLabelKey().isBlank())
            .collect(Collectors.toMap(DeviceEntity::getLabelKey, DeviceEntity::getDeviceCode, (a, b) -> a, LinkedHashMap::new));
        List<String> extraCodes = extraLabelKeys.stream()
            .map(labelToCode::get)
            .filter(code -> code != null && !code.isBlank())
            .distinct()
            .toList();
        if (extraCodes.isEmpty()) {
            return 0;
        }

        adminWatchlistMapper.delete(new QueryWrapper<com.twinops.backend.watchlist.entity.AdminWatchlistEntity>().in("device_code", extraCodes));
        alarmMapper.delete(new QueryWrapper<com.twinops.backend.alarm.entity.AlarmEntity>().in("device_code", extraCodes));
        telemetryMapper.delete(new QueryWrapper<TelemetryEntity>().in("device_code", extraCodes));
        deviceMapper.delete(new QueryWrapper<DeviceEntity>().in("device_code", extraCodes));
        return extraCodes.size();
    }

    private int insertMissingDevices(List<String> missingLabelKeys, List<DeviceEntity> existingDevices) {
        if (missingLabelKeys.isEmpty()) {
            return 0;
        }
        Map<String, SeedDevice> seedByLabel = loadSeedDevices();
        Set<String> usedCodes = existingDevices.stream()
            .map(DeviceEntity::getDeviceCode)
            .filter(code -> code != null && !code.isBlank())
            .collect(Collectors.toCollection(LinkedHashSet::new));

        int added = 0;
        for (String labelKey : missingLabelKeys) {
            SeedDevice seedDevice = seedByLabel.get(labelKey);
            String deviceCode = seedDevice != null ? seedDevice.deviceCode() : nextDeviceCode(usedCodes);
            if (usedCodes.contains(deviceCode)) {
                deviceCode = nextDeviceCode(usedCodes);
            }
            usedCodes.add(deviceCode);
            DeviceEntity entity = new DeviceEntity();
            entity.setDeviceCode(deviceCode);
            entity.setLabelKey(labelKey);
            entity.setName(seedDevice != null ? seedDevice.name() : labelKey);
            entity.setType(seedDevice != null ? seedDevice.type() : "一次设备");
            entity.setStatus(normalizeStatus(seedDevice != null ? seedDevice.status() : "normal"));
            entity.setSerialNumber(seedDevice != null ? seedDevice.serialNumber() : generatedSerial(deviceCode));
            entity.setLocation(seedDevice != null ? seedDevice.location() : "仿真园区 自动补齐");
            deviceMapper.insert(entity);
            insertBaselineMetric(deviceCode);
            added += 1;
        }
        return added;
    }

    private int ensureTelemetryCoverage(List<DeviceEntity> devices) {
        int repairedCount = 0;
        for (DeviceEntity device : devices) {
            String deviceCode = device.getDeviceCode();
            if (deviceCode == null || deviceCode.isBlank()) {
                continue;
            }
            QueryWrapper<TelemetryEntity> wrapper = new QueryWrapper<>();
            wrapper.eq("device_code", deviceCode).last("LIMIT 1");
            TelemetryEntity telemetry = telemetryMapper.selectOne(wrapper);
            if (telemetry == null) {
                insertBaselineMetric(deviceCode);
                repairedCount += 1;
            }
        }
        return repairedCount;
    }

    private void insertBaselineMetric(String deviceCode) {
        TelemetryEntity metric = new TelemetryEntity();
        metric.setDeviceCode(deviceCode);
        metric.setMetricTime(LocalDateTime.now().withMinute(0).withSecond(0).withNano(0));
        metric.setTemperature(new BigDecimal("30.00"));
        metric.setHumidity(new BigDecimal("60.00"));
        metric.setVoltage(new BigDecimal("220.00"));
        metric.setCurrent(new BigDecimal("6.50"));
        metric.setPower(new BigDecimal("1430.00"));
        metric.setCpuLoad(new BigDecimal("45.00"));
        metric.setMemoryUsage(new BigDecimal("50.00"));
        metric.setDiskUsage(new BigDecimal("48.00"));
        metric.setNetworkTraffic(new BigDecimal("190.00"));
        telemetryMapper.insert(metric);
    }

    private Map<String, SeedDevice> loadSeedDevices() {
        Path resolved = resolvePath(seedDevicesSqlPath);
        if (!Files.exists(resolved)) {
            return Map.of();
        }
        try {
            String sql = Files.readString(resolved, StandardCharsets.UTF_8);
            Matcher matcher = SEED_ROW_PATTERN.matcher(sql);
            Map<String, SeedDevice> result = new LinkedHashMap<>();
            while (matcher.find()) {
                SeedDevice row = new SeedDevice(
                    matcher.group(1),
                    matcher.group(2),
                    matcher.group(3),
                    matcher.group(4),
                    matcher.group(5),
                    matcher.group(6),
                    matcher.group(7)
                );
                result.put(row.labelKey(), row);
            }
            return result;
        } catch (Exception ex) {
            log.warn("{}={} {}={} {}={} {}={} {}={} path={} msg={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "device",
                LogFields.EVENT, "device.simulation_seed.load",
                LogFields.RESULT, "failed",
                LogFields.ERROR_CODE, "SEED_SQL_READ_FAILED",
                resolved,
                ex.getMessage()
            );
            return Map.of();
        }
    }

    private Path resolvePath(String configuredPath) {
        Path configured = Paths.get(configuredPath);
        Path resolved = configured.isAbsolute()
            ? configured.normalize()
            : Paths.get("").toAbsolutePath().normalize().resolve(configured).normalize();
        if (!Files.exists(resolved)) {
            Path fallback = Paths.get("").toAbsolutePath().normalize().resolve("..").resolve(configured).normalize();
            if (Files.exists(fallback)) {
                return fallback;
            }
        }
        return resolved;
    }

    private String nextDeviceCode(Set<String> usedCodes) {
        for (int index = 1; index <= 999; index += 1) {
            String code = String.format(Locale.ROOT, "DEV%03d", index);
            if (!usedCodes.contains(code)) {
                return code;
            }
        }
        throw new IllegalStateException("no free device_code available");
    }

    private String generatedSerial(String deviceCode) {
        String suffix = deviceCode.length() > 3 ? deviceCode.substring(3) : "000";
        return "SN9" + suffix;
    }

    private String normalizeStatus(String status) {
        if (status == null) {
            return "normal";
        }
        return switch (status) {
            case "normal", "warning", "error" -> status;
            default -> "normal";
        };
    }

    private String safeRequestId() {
        String requestId = MDC.get(LogFields.REQUEST_ID);
        return requestId == null || requestId.isBlank() ? "n/a" : requestId;
    }

    private record SeedDevice(
        String deviceCode,
        String labelKey,
        String name,
        String type,
        String status,
        String serialNumber,
        String location
    ) {
    }
}
