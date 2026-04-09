package com.twinops.backend.analysis.service;

import com.twinops.backend.analysis.dto.AnalysisAutomationMessage;
import com.twinops.backend.analysis.entity.AnalysisReportEntity;
import com.twinops.backend.analysis.mapper.AnalysisReportMapper;
import com.twinops.backend.analysis.dto.TriggerAnalysisResponse;
import com.twinops.backend.device.entity.DeviceEntity;
import com.twinops.backend.device.mapper.DeviceMapper;
import com.twinops.backend.telemetry.entity.TelemetryEntity;
import com.twinops.backend.telemetry.mapper.TelemetryMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.ApplicationContext;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.TestPropertySource;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest
@EmbeddedKafka(topics = {"analysis.request"}, partitions = 1)
@TestPropertySource(properties = {
    "spring.kafka.bootstrap-servers=${spring.embedded.kafka.brokers}",
    "twinops.analysis.automation.enabled=true",
    "twinops.analysis.automation.scheduler-enabled=false",
    "twinops.analysis.llm.provider=openai",
    "twinops.analysis.llm.api-key=",
    "twinops.analysis.llm.fallback-to-mock=true"
})
class AnalysisKafkaIntegrationTest {

    @Autowired
    private AnalysisAutomationProducer producer;

    @Autowired
    private AnalysisAutomationTriggerService triggerService;

    @Autowired
    private ApplicationContext applicationContext;

    @MockBean
    private AnalysisReportMapper analysisReportMapper;

    @MockBean
    private DeviceMapper deviceMapper;

    @MockBean
    private TelemetryMapper telemetryMapper;

    private final Map<Long, AnalysisReportEntity> reportStore = new ConcurrentHashMap<>();
    private final AtomicLong reportIdSequence = new AtomicLong(1000L);

    @BeforeEach
    void setUp() {
        reportStore.clear();
        reportIdSequence.set(1000L);
        when(analysisReportMapper.selectOne(any())).thenAnswer(invocation -> {
            com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<AnalysisReportEntity> query = invocation.getArgument(0);
            String idempotencyKey = query.getParamNameValuePairs().values().stream()
                .findFirst()
                .map(String::valueOf)
                .orElse(null);
            if (idempotencyKey == null) {
                return null;
            }
            return reportStore.values().stream()
                .filter(report -> idempotencyKey.equals(report.getIdempotencyKey()))
                .findFirst()
                .orElse(null);
        });
        when(analysisReportMapper.insert(any(AnalysisReportEntity.class))).thenAnswer(invocation -> {
            AnalysisReportEntity entity = invocation.getArgument(0);
            entity.setId(reportIdSequence.incrementAndGet());
            entity.setCreatedAt(LocalDateTime.now());
            reportStore.put(entity.getId(), entity);
            return 1;
        });
        when(analysisReportMapper.updateById(any(AnalysisReportEntity.class))).thenAnswer(invocation -> {
            AnalysisReportEntity entity = invocation.getArgument(0);
            reportStore.put(entity.getId(), entity);
            return 1;
        });
        when(analysisReportMapper.selectById(any(Long.class))).thenAnswer(invocation -> reportStore.get(invocation.getArgument(0)));
    }

    @Test
    void shouldPublishAndConsumeKafkaMessage() {
        producer.publish(new AnalysisAutomationMessage("analysis-single", "DEV001", "cpu=90", "manual", "DEV001:manual", 2L));
        verify(analysisReportMapper, timeout(3000)).insert(any(AnalysisReportEntity.class));
    }

    @Test
    void shouldCompleteAutoAggregationToKafkaAndPersistLifecycle() {
        when(deviceMapper.selectList(any())).thenReturn(List.of(device("DEV001", "warning", "A1")));
        when(telemetryMapper.selectOne(any())).thenReturn(metric("92.5", "70.1"));

        TriggerAnalysisResponse response = triggerService.triggerManualBatch();

        assertThat(response.targetCount()).isEqualTo(1);
        assertThat(response.acceptedCount()).isEqualTo(1);
        assertThat(response.failedCount()).isEqualTo(0);
        assertThat(response.status()).isEqualTo("processing");
        verify(analysisReportMapper, timeout(5000).atLeastOnce()).updateById(org.mockito.ArgumentMatchers.<AnalysisReportEntity>argThat(report ->
            "AGGREGATED".equals(report.getDeviceCode())
                && report.getIdempotencyKey() != null
                && report.getIdempotencyKey().startsWith("batch:manual-")
                && "success".equals(report.getStatus())
                && report.getPrediction() != null
        ));
        AnalysisReportEntity persisted = reportStore.values().stream()
            .filter(report -> "AGGREGATED".equals(report.getDeviceCode()))
            .filter(report -> report.getIdempotencyKey() != null && report.getIdempotencyKey().startsWith("batch:manual-"))
            .filter(report -> "success".equals(report.getStatus()))
            .findFirst()
            .orElseThrow();
        assertThat(persisted.getMetricSummary()).contains("mode=aggregated").contains("cpuLoad=70.1").contains("temperature=92.5");
    }

    @Test
    void shouldDisableSchedulerByDefaultCompatibilitySwitch() {
        String[] schedulerBeans = applicationContext.getBeanNamesForType(AnalysisAutomationScheduler.class);
        assertThat(schedulerBeans).isEmpty();
    }

    private static DeviceEntity device(String code, String status, String location) {
        DeviceEntity entity = new DeviceEntity();
        entity.setDeviceCode(code);
        entity.setStatus(status);
        entity.setLocation(location);
        return entity;
    }

    private static TelemetryEntity metric(String temperature, String cpuLoad) {
        TelemetryEntity telemetry = new TelemetryEntity();
        telemetry.setTemperature(new BigDecimal(temperature));
        telemetry.setCpuLoad(new BigDecimal(cpuLoad));
        return telemetry;
    }
}
