package com.twinops.backend.device.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.twinops.backend.testsupport.LocalhostApiClient;
import com.twinops.backend.testsupport.LocalhostApiClient.HttpResult;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

class DeviceLocalhostIntegrationTest {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @BeforeAll
    static void requireLocalhostService() {
        assumeTrue(
            LocalhostApiClient.isReachable(),
            "localhost backend unavailable, skip integration test: " + LocalhostApiClient.baseUrl()
        );
    }

    @Test
    void shouldReturnContinuousDeviceCodesFromListApi() throws IOException {
        String token = LocalhostApiClient.loginAsAdmin();
        HttpResult response = LocalhostApiClient.request(
            "GET",
            "/api/devices",
            null,
            Map.of("Authorization", "Bearer " + token)
        );
        assertThat(response.status()).isEqualTo(200);

        JsonNode root = OBJECT_MAPPER.readTree(response.body());
        assertThat(root.path("success").asBoolean()).isTrue();
        JsonNode data = root.path("data");
        assertThat(data.isArray()).isTrue();
        assertThat(data.size()).isEqualTo(51);

        List<String> actualCodes = IntStream.range(0, data.size())
            .mapToObj(index -> data.get(index).path("deviceCode").asText())
            .toList();
        List<String> expectedCodes = IntStream.rangeClosed(1, 51)
            .mapToObj(index -> String.format("DEV%03d", index))
            .toList();
        assertThat(actualCodes).containsExactlyElementsOf(expectedCodes);

        for (JsonNode item : data) {
            assertThat(item.path("labelKey").asText()).isNotBlank();
        }
    }

    @Test
    void shouldReturnDataOnlyPayloadFromSimulationDataApi() throws IOException {
        String token = LocalhostApiClient.loginAsAdmin();
        HttpResult response = LocalhostApiClient.request(
            "GET",
            "/api/devices/simulation-data",
            null,
            Map.of("Authorization", "Bearer " + token)
        );
        assertThat(response.status()).isEqualTo(200);

        JsonNode root = OBJECT_MAPPER.readTree(response.body());
        assertThat(root.path("success").asBoolean()).isTrue();
        JsonNode data = root.path("data");
        assertThat(data.isArray()).isTrue();
        assertThat(data).isNotEmpty();

        JsonNode sample = data.get(0);
        assertThat(sample.path("deviceCode").asText()).isNotBlank();
        assertThat(sample.path("status").asText()).isIn("normal", "warning", "error");
        assertThat(sample.path("temperature").isNumber()).isTrue();
        assertThat(sample.path("cpuLoad").isNumber()).isTrue();
        assertThat(sample.has("name")).isFalse();
        assertThat(sample.has("labelKey")).isFalse();
    }

    @Test
    void shouldKeepListAndDetailPayloadConsistent() throws IOException {
        String token = LocalhostApiClient.loginAsAdmin();
        HttpResult list = LocalhostApiClient.request(
            "GET",
            "/api/devices",
            null,
            Map.of("Authorization", "Bearer " + token)
        );
        assertThat(list.status()).isEqualTo(200);

        JsonNode listData = OBJECT_MAPPER.readTree(list.body()).path("data");
        assertThat(listData.isArray()).isTrue();
        assertThat(listData).isNotEmpty();
        JsonNode sample = listData.get(0);
        String deviceCode = sample.path("deviceCode").asText();
        assertThat(deviceCode).isNotBlank();

        HttpResult detail = LocalhostApiClient.request(
            "GET",
            "/api/devices/" + deviceCode,
            null,
            Map.of("Authorization", "Bearer " + token)
        );
        assertThat(detail.status()).isEqualTo(200);

        JsonNode detailData = OBJECT_MAPPER.readTree(detail.body()).path("data");
        assertThat(detailData.path("deviceCode").asText()).isEqualTo(sample.path("deviceCode").asText());
        assertThat(detailData.path("labelKey").asText()).isEqualTo(sample.path("labelKey").asText());
        assertThat(detailData.path("name").asText()).isEqualTo(sample.path("name").asText());
        assertThat(detailData.path("type").asText()).isEqualTo(sample.path("type").asText());
        assertThat(detailData.path("status").asText()).isEqualTo(sample.path("status").asText());
        assertThat(detailData.path("location").asText()).isEqualTo(sample.path("location").asText());
    }
}
