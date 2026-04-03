package com.twinops.backend.alarm.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.twinops.backend.alarm.service.AlarmService;
import com.twinops.backend.common.dto.AlarmItemDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AlarmController.class)
class AlarmControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AlarmService alarmService;

    @Test
    void shouldListAlarmsByStatusAndLimit() throws Exception {
        List<AlarmItemDto> alarms = List.of(
            new AlarmItemDto(1L, "1# 服务器机柜", "温度过高", 2, "08:21", "new"),
            new AlarmItemDto(2L, "2# 网络设备", "网络波动", 1, "08:22", "new")
        );

        when(alarmService.listByStatus("new", 5)).thenReturn(alarms);

        mockMvc.perform(get("/api/alarms").param("status", "new").param("limit", "5"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.length()").value(2))
            .andExpect(jsonPath("$.data[0].status").value("new"));
    }

    @Test
    void shouldUpdateAlarmStatus() throws Exception {
        AlarmItemDto updated = new AlarmItemDto(1L, "1# 服务器机柜", "温度过高", 2, "08:21", "acknowledged");
        when(alarmService.updateStatus(1L, "acknowledged")).thenReturn(updated);

        mockMvc.perform(patch("/api/alarms/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("status", "acknowledged"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.id").value(1))
            .andExpect(jsonPath("$.data.status").value("acknowledged"));
    }

    @Test
    void shouldListAlarmsByDeviceCode() throws Exception {
        List<AlarmItemDto> alarms = List.of(
            new AlarmItemDto(3L, "DEV001", "温度过高", 2, "08:25", "new")
        );
        when(alarmService.listByDeviceAndStatus("DEV001", "new", 20)).thenReturn(alarms);

        mockMvc.perform(get("/api/alarms").param("deviceCode", "DEV001").param("status", "new"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.length()").value(1))
            .andExpect(jsonPath("$.data[0].name").value("DEV001"));
    }
}
