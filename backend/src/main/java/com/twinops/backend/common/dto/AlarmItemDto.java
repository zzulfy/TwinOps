package com.twinops.backend.common.dto;

public record AlarmItemDto(Long id, String name, String event, Integer type, String time, String status) {
}
