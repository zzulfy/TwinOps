package com.twinops.backend.analysis.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.twinops.backend.testsupport.LocalhostApiClient;
import com.twinops.backend.testsupport.LocalhostApiClient.HttpResult;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

class AnalysisKafkaIntegrationTest {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @BeforeAll
    static void requireLocalhostService() {
        assumeTrue(
            LocalhostApiClient.isReachable(),
            "localhost backend unavailable, skip integration test: " + LocalhostApiClient.baseUrl()
        );
    }

    @Test
    void shouldExposeAutomationHealthOnLocalhost() throws IOException {
        String token = LocalhostApiClient.loginAsAdmin();
        HttpResult health = LocalhostApiClient.request(
            "GET",
            "/api/analysis/health",
            null,
            Map.of("Authorization", "Bearer " + token)
        );
        assertThat(health.status()).isEqualTo(200);
        JsonNode root = OBJECT_MAPPER.readTree(health.body());
        assertThat(root.path("success").asBoolean()).isTrue();
        assertThat(root.path("data").path("status").asText()).isNotBlank();
        assertThat(root.path("data").path("topic").asText()).isEqualTo("analysis.request");
    }

    @Test
    void shouldTriggerAnalysisBatchViaLocalhost() throws IOException {
        String token = LocalhostApiClient.loginAsAdmin();
        HttpResult health = LocalhostApiClient.request(
            "GET",
            "/api/analysis/health",
            null,
            Map.of("Authorization", "Bearer " + token)
        );
        JsonNode healthJson = OBJECT_MAPPER.readTree(health.body());
        boolean listenerRunning = healthJson.path("data").path("listenerRunning").asBoolean(false);
        boolean kafkaReachable = healthJson.path("data").path("kafkaReachable").asBoolean(false);
        assumeTrue(
            listenerRunning && kafkaReachable,
            "analysis automation not ready on localhost, skip trigger flow test"
        );

        HttpResult trigger = LocalhostApiClient.request(
            "POST",
            "/api/analysis/reports/trigger",
            "{}",
            Map.of(
                "Authorization", "Bearer " + token,
                "Content-Type", "application/json"
            )
        );
        assertThat(trigger.status()).isEqualTo(200);

        JsonNode triggerJson = OBJECT_MAPPER.readTree(trigger.body());
        assertThat(triggerJson.path("success").asBoolean()).isTrue();
        String status = triggerJson.path("data").path("status").asText();
        assertThat(status).isIn("processing", "partial", "failed", "skipped");
        assertThat(triggerJson.path("data").path("targetCount").asInt()).isGreaterThanOrEqualTo(0);
    }
}
