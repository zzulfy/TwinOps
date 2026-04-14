package com.twinops.backend.device.service;

import com.twinops.backend.alarm.mapper.AlarmMapper;
import com.twinops.backend.device.dto.SimulationDeviceConsistencyDto;
import com.twinops.backend.device.entity.DeviceEntity;
import com.twinops.backend.device.mapper.DeviceMapper;
import com.twinops.backend.telemetry.mapper.TelemetryMapper;
import com.twinops.backend.watchlist.mapper.AdminWatchlistMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.times;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SimulationDeviceConsistencyServiceTest {

    @Mock
    private DeviceMapper deviceMapper;
    @Mock
    private TelemetryMapper telemetryMapper;
    @Mock
    private AlarmMapper alarmMapper;
    @Mock
    private AdminWatchlistMapper adminWatchlistMapper;
    @Mock
    private SimulationDeviceModelSource simulationDeviceModelSource;

    @TempDir
    Path tempDir;

    private Path seedSqlPath;
    private Path objectMapPath;

    @BeforeEach
    void setUp() throws Exception {
        seedSqlPath = tempDir.resolve("002_seed_devices.sql");
        objectMapPath = tempDir.resolve("007_simulation_object_map.csv");
        Files.writeString(
            seedSqlPath,
            "INSERT INTO devices (device_code,label_key,name,type,status,serial_number,location) VALUES\n"
                + "('DEV001','1#设备','1#设备','一次设备','normal','SN100001','A'),\n"
                + "('DEV002','2#设备','2#设备','一次设备','warning','SN100002','B');\n"
        );
        Files.writeString(
            objectMapPath,
            "object_name,label_key,device_code,interactive\n"
                + "1#设备,1#设备,DEV001,true\n"
                + "2#设备,2#设备,DEV002,true\n"
                + "1#管道,,,false\n"
        );
    }

    @Test
    void shouldRepairByDeletingExtraAndAddingMissing() {
        SimulationDeviceConsistencyService service = new SimulationDeviceConsistencyService(
            deviceMapper,
            telemetryMapper,
            alarmMapper,
            adminWatchlistMapper,
            simulationDeviceModelSource,
            seedSqlPath.toString(),
            objectMapPath.toString()
        );

        when(deviceMapper.selectList(any())).thenReturn(
            List.of(device("DEV001", "1#设备"), device("DEV099", "9#设备")),
            List.of(device("DEV001", "1#设备")),
            List.of(device("DEV001", "1#设备"), device("DEV002", "2#设备"))
        );
        when(deviceMapper.delete(any())).thenReturn(1);
        when(alarmMapper.delete(any())).thenReturn(1);
        when(telemetryMapper.delete(any())).thenReturn(1);
        when(adminWatchlistMapper.delete(any())).thenReturn(1);
        when(deviceMapper.insert(org.mockito.ArgumentMatchers.<DeviceEntity>any())).thenReturn(1);
        when(telemetryMapper.insert(org.mockito.ArgumentMatchers.<com.twinops.backend.telemetry.entity.TelemetryEntity>any())).thenReturn(1);

        SimulationDeviceConsistencyDto result = service.checkAndRepair(true);

        assertEquals("repaired", result.status());
        assertTrue(result.consistent());
        assertTrue(result.repaired());
        assertEquals(1, result.deletedCount());
        assertEquals(1, result.addedCount());
        assertTrue(result.extraInDatabase().isEmpty());
        assertTrue(result.missingInDatabase().isEmpty());
        verify(deviceMapper).insert(any(DeviceEntity.class));
    }

    @Test
    void shouldReportFailedWhenAutoRepairDisabledAndSetsDiffer() {
        SimulationDeviceConsistencyService service = new SimulationDeviceConsistencyService(
            deviceMapper,
            telemetryMapper,
            alarmMapper,
            adminWatchlistMapper,
            simulationDeviceModelSource,
            seedSqlPath.toString(),
            objectMapPath.toString()
        );

        when(deviceMapper.selectList(any())).thenReturn(
            List.of(device("DEV001", "1#设备"), device("DEV099", "9#设备")),
            List.of(device("DEV001", "1#设备"), device("DEV099", "9#设备"))
        );

        SimulationDeviceConsistencyDto result = service.checkAndRepair(false);

        assertEquals("failed", result.status());
        assertFalse(result.consistent());
        assertFalse(result.repaired());
        assertEquals(List.of("9#设备"), result.extraInDatabase());
        assertEquals(List.of("2#设备"), result.missingInDatabase());
    }

    @Test
    void shouldRepairMissingTelemetryUsingBaselineMetrics() {
        SimulationDeviceConsistencyService service = new SimulationDeviceConsistencyService(
            deviceMapper,
            telemetryMapper,
            alarmMapper,
            adminWatchlistMapper,
            simulationDeviceModelSource,
            seedSqlPath.toString(),
            objectMapPath.toString()
        );

        when(deviceMapper.selectList(any())).thenReturn(
            List.of(device("DEV001", "1#设备"), device("DEV002", "2#设备")),
            List.of(device("DEV001", "1#设备"), device("DEV002", "2#设备"))
        );
        when(telemetryMapper.selectOne(any())).thenReturn(null);
        when(telemetryMapper.insert(org.mockito.ArgumentMatchers.<com.twinops.backend.telemetry.entity.TelemetryEntity>any())).thenReturn(1);

        SimulationDeviceConsistencyDto result = service.checkAndRepair(true);

        assertEquals("ok", result.status());
        assertTrue(result.consistent());
        assertTrue(result.message().contains("telemetry baseline restored for 2 devices"));
        verify(telemetryMapper, times(2)).insert(org.mockito.ArgumentMatchers.<com.twinops.backend.telemetry.entity.TelemetryEntity>any());
    }

    private static DeviceEntity device(String code, String labelKey) {
        DeviceEntity entity = new DeviceEntity();
        entity.setDeviceCode(code);
        entity.setLabelKey(labelKey);
        entity.setName(labelKey);
        entity.setType("一次设备");
        entity.setStatus("normal");
        entity.setSerialNumber("SN000000");
        entity.setLocation("A");
        return entity;
    }
}
