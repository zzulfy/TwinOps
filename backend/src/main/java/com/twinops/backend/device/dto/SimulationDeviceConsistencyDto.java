package com.twinops.backend.device.dto;

import java.util.List;

public record SimulationDeviceConsistencyDto(
    String status,
    boolean consistent,
    boolean repaired,
    int simulationDeviceCount,
    int databaseDeviceCountBefore,
    int databaseDeviceCountAfter,
    int deletedCount,
    int addedCount,
    List<String> extraInDatabase,
    List<String> missingInDatabase,
    List<String> errors,
    String message
) {
}

