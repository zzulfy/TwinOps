package com.twinops.backend.auth.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.twinops.backend.BackendApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(
    classes = BackendApplication.class,
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
class AuthFlowIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldRejectProtectedApiWithoutToken() {
        ResponseEntity<String> response =
            restTemplate.getForEntity(url("/api/auth/me"), String.class);
        assertThat(response.getStatusCode().value()).isEqualTo(401);
        assertThat(response.getBody()).contains("admin login required");
    }

    @Test
    void shouldAllowProtectedApiAfterLoginWithBearerToken() throws Exception {
        HttpHeaders loginHeaders = new HttpHeaders();
        loginHeaders.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> loginRequest = new HttpEntity<>(
            "{\"username\":\"admin\",\"password\":\"admin123456\"}",
            loginHeaders
        );
        ResponseEntity<String> loginResponse = restTemplate.postForEntity(
            url("/api/auth/login"),
            loginRequest,
            String.class
        );

        assertThat(loginResponse.getStatusCode().value()).isEqualTo(200);
        JsonNode loginJson = objectMapper.readTree(loginResponse.getBody());
        String token = loginJson.path("data").path("token").asText();
        assertThat(token).isNotBlank();

        HttpHeaders meHeaders = new HttpHeaders();
        meHeaders.setBearerAuth(token);
        ResponseEntity<String> meResponse = restTemplate.exchange(
            url("/api/auth/me"),
            HttpMethod.GET,
            new HttpEntity<>(meHeaders),
            String.class
        );

        assertThat(meResponse.getStatusCode().value()).isEqualTo(200);
        assertThat(meResponse.getBody()).contains("\"username\":\"admin\"");
    }

    @Test
    void shouldPassCorsPreflightForProtectedApi() {
        HttpHeaders headers = new HttpHeaders();
        headers.setOrigin("http://127.0.0.1:4173");
        headers.add(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET");
        headers.add(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "authorization,content-type");

        ResponseEntity<String> response = restTemplate.exchange(
            url("/api/auth/me"),
            HttpMethod.OPTIONS,
            new HttpEntity<>(headers),
            String.class
        );

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
    }

    private String url(String path) {
        return "http://127.0.0.1:" + port + path;
    }
}
