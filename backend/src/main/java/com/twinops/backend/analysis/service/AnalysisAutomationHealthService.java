package com.twinops.backend.analysis.service;

import com.twinops.backend.analysis.dto.AnalysisAutomationHealthDto;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.config.KafkaListenerEndpointRegistry;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class AnalysisAutomationHealthService {

    private static final String CONSUMER_LISTENER_ID = "analysisAutomationConsumer";
    private static final Duration KAFKA_CHECK_TIMEOUT = Duration.ofSeconds(3);

    private final KafkaListenerEndpointRegistry listenerRegistry;
    private final String topic;
    private final String bootstrapServers;
    private final boolean automationEnabled;

    public AnalysisAutomationHealthService(
        KafkaListenerEndpointRegistry listenerRegistry,
        @Value("${twinops.analysis.automation.topic:analysis.request}") String topic,
        @Value("${spring.kafka.bootstrap-servers:}") String bootstrapServers,
        @Value("${twinops.analysis.automation.enabled:true}") boolean automationEnabled
    ) {
        this.listenerRegistry = listenerRegistry;
        this.topic = topic;
        this.bootstrapServers = bootstrapServers == null ? "" : bootstrapServers.trim();
        this.automationEnabled = automationEnabled;
    }

    public AnalysisAutomationHealthDto getHealth() {
        boolean listenerRegistered = listenerRegistry.getListenerContainer(CONSUMER_LISTENER_ID) != null;
        boolean listenerRunning = listenerRegistered && listenerRegistry.getListenerContainer(CONSUMER_LISTENER_ID).isRunning();
        KafkaCheckResult kafkaCheck = checkKafkaReachability();

        String status;
        String message;
        if (!automationEnabled) {
            status = "disabled";
            message = "analysis automation is disabled";
        } else if (!listenerRegistered) {
            status = "down";
            message = "analysis automation consumer listener not registered";
        } else if (!listenerRunning) {
            status = "down";
            message = "analysis automation consumer listener not running";
        } else if (!kafkaCheck.reachable()) {
            status = "down";
            message = kafkaCheck.message();
        } else {
            status = "up";
            message = "analysis automation consumer is running and kafka topic is reachable";
        }

        return new AnalysisAutomationHealthDto(
            status,
            automationEnabled,
            listenerRegistered,
            listenerRunning,
            kafkaCheck.reachable(),
            topic,
            bootstrapServers,
            message
        );
    }

    private KafkaCheckResult checkKafkaReachability() {
        if (bootstrapServers.isBlank()) {
            return new KafkaCheckResult(false, "kafka bootstrap servers not configured");
        }
        Map<String, Object> props = Map.of(
            AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers,
            AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, (int) KAFKA_CHECK_TIMEOUT.toMillis(),
            AdminClientConfig.DEFAULT_API_TIMEOUT_MS_CONFIG, (int) KAFKA_CHECK_TIMEOUT.toMillis()
        );
        try (AdminClient adminClient = AdminClient.create(props)) {
            adminClient.describeTopics(List.of(topic))
                .allTopicNames()
                .get(KAFKA_CHECK_TIMEOUT.toMillis(), TimeUnit.MILLISECONDS);
            return new KafkaCheckResult(true, "ok");
        } catch (Exception ex) {
            return new KafkaCheckResult(false, "kafka topic check failed: " + ex.getMessage());
        }
    }

    private record KafkaCheckResult(boolean reachable, String message) {
    }
}

