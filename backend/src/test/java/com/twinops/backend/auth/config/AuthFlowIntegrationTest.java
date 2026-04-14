package com.twinops.backend.auth.config;

import com.twinops.backend.testsupport.LocalhostApiClient;
import com.twinops.backend.testsupport.LocalhostApiClient.HttpResult;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

class AuthFlowIntegrationTest {

    @BeforeAll
    static void requireLocalhostService() {
        assumeTrue(
            LocalhostApiClient.isReachable(),
            "localhost backend unavailable, skip integration test: " + LocalhostApiClient.baseUrl()
        );
    }

    @Test
    void shouldRejectProtectedApiWithoutToken() throws IOException {
        HttpResult response = LocalhostApiClient.request("GET", "/api/auth/me", null, Map.of());
        assertThat(response.status()).isEqualTo(401);
        assertThat(response.body()).contains("admin login required");
    }

    @Test
    void shouldAllowProtectedApiAfterLoginWithBearerToken() throws IOException {
        String token = LocalhostApiClient.loginAsAdmin();
        HttpResult meResponse = LocalhostApiClient.request(
            "GET",
            "/api/auth/me",
            null,
            Map.of("Authorization", "Bearer " + token)
        );
        assertThat(meResponse.status()).isEqualTo(200);
        assertThat(meResponse.body()).contains("\"username\":\"admin\"");
    }

    @Test
    void shouldPassCorsPreflightForProtectedApi() throws IOException {
        HttpResult response = LocalhostApiClient.request(
            "OPTIONS",
            "/api/auth/me",
            null,
            Map.of(
                "Origin", "http://127.0.0.1:4173",
                "Access-Control-Request-Method", "GET",
                "Access-Control-Request-Headers", "authorization,content-type"
            )
        );
        assertThat(response.status()).isBetween(200, 299);
    }
}
