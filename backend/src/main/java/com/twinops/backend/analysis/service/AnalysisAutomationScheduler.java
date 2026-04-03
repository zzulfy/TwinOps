package com.twinops.backend.analysis.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.twinops.backend.analysis.dto.AnalysisAutomationMessage;
import com.twinops.backend.common.logging.LogFields;
import com.twinops.backend.device.entity.DeviceEntity;
import com.twinops.backend.device.mapper.DeviceMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
@ConditionalOnProperty(prefix = "twinops.analysis.automation", name = "enabled", havingValue = "true", matchIfMissing = true)
public class AnalysisAutomationScheduler {

    private static final Logger log = LoggerFactory.getLogger(AnalysisAutomationScheduler.class);
    private static final DateTimeFormatter SLOT_FMT = DateTimeFormatter.ofPattern("yyyyMMddHH");

    private final DeviceMapper deviceMapper;
    private final AnalysisAutomationProducer producer;
    private final String topic;

    public AnalysisAutomationScheduler(
        DeviceMapper deviceMapper,
        AnalysisAutomationProducer producer,
        @Value("${twinops.analysis.automation.topic:analysis.request}") String topic
    ) {
        this.deviceMapper = deviceMapper;
        this.producer = producer;
        this.topic = topic;
    }

    @Scheduled(cron = "0 0 0,12 * * *")
    public void publishHalfDayBatch() {
        LocalDateTime now = LocalDateTime.now();
        String slot = now.withMinute(0).withSecond(0).withNano(0).format(SLOT_FMT);
        QueryWrapper<DeviceEntity> wrapper = new QueryWrapper<>();
        wrapper.in("status", List.of("warning", "error"));
        List<DeviceEntity> targets = deviceMapper.selectList(wrapper);

        log.info("{}={} {}={} {}={} {}={} topic={} slot={} targetCount={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "analysis",
            LogFields.EVENT, "analysis.automation.schedule.trigger",
            LogFields.RESULT, "started",
            topic,
            slot,
            targets.size()
        );

        for (DeviceEntity target : targets) {
            String metricSummary = "auto-analysis slot=%s status=%s location=%s".formatted(
                slot,
                target.getStatus(),
                target.getLocation()
            );
            AnalysisAutomationMessage message = new AnalysisAutomationMessage(
                target.getDeviceCode(),
                metricSummary,
                slot,
                target.getDeviceCode() + ":" + slot
            );
            producer.publish(message);
        }
    }

    private String safeRequestId() {
        String requestId = MDC.get(LogFields.REQUEST_ID);
        return requestId == null || requestId.isBlank() ? "n/a" : requestId;
    }
}
