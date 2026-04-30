package com.twinops.backend.analysis.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.twinops.backend.analysis.dto.RcaInferenceRequestDto;
import com.twinops.backend.analysis.dto.RcaInferenceResponseDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.net.http.HttpClient.Version;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Component
public class RcaEngineClient {

    private static final DateTimeFormatter RCA_TIME_FMT = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

    private final boolean enabled;
    private final String baseUrl;
    private final String profile;
    private final Duration timeout;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public RcaEngineClient(
        @Value("${twinops.analysis.rca.enabled:false}") boolean enabled,
        @Value("${twinops.analysis.rca.base-url:http://127.0.0.1:8091}") String baseUrl,
        @Value("${twinops.analysis.rca.profile:msds_device_stress_v1}") String profile,
        @Value("${twinops.analysis.rca.timeout-ms:3000}") long timeoutMs
    ) {
        this.enabled = enabled;
        this.baseUrl = baseUrl;
        this.profile = profile;
        this.timeout = Duration.ofMillis(timeoutMs);
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(this.timeout)
            .version(HttpClient.Version.HTTP_1_1)
            .build();
        this.objectMapper = new ObjectMapper();
    }

    public Optional<RcaInferenceResponseDto> infer(DeviceRcaFeatureWindow featureWindow) {
        if (!enabled) {
            return Optional.empty();
        }
        try {
            RcaInferenceRequestDto requestBody = new RcaInferenceRequestDto(
                featureWindow.requestId(),
                profile,
                featureWindow.windowStart().atOffset(ZoneOffset.UTC).format(RCA_TIME_FMT),
                featureWindow.windowEnd().atOffset(ZoneOffset.UTC).format(RCA_TIME_FMT),
                featureWindow.stepMinutes(),
                featureWindow.devices(),
                featureWindow.series()
            );
            String payload = objectMapper.writeValueAsString(requestBody);
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/infer/device-rca"))
                .timeout(timeout)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("rca sidecar status=" + response.statusCode() + " body=" + response.body());
            }
            return Optional.of(objectMapper.readValue(response.body(), RcaInferenceResponseDto.class));
        } catch (Exception ex) {
            throw new IllegalStateException("rca sidecar call failed: " + ex.getMessage(), ex);
        }
    }

    public boolean enabled() {
        return enabled;
    }
}
