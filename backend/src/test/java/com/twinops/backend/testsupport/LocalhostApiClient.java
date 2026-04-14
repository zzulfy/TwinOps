package com.twinops.backend.testsupport;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Map;

public final class LocalhostApiClient {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final int CONNECT_TIMEOUT_MS = 2000;
    private static final int READ_TIMEOUT_MS = 5000;
    private static final String BASE_URL_PROPERTY = "it.base-url";
    private static final String DEFAULT_BASE_URL = "http://127.0.0.1:8080";

    private LocalhostApiClient() {
    }

    public static String baseUrl() {
        String configured = System.getProperty(BASE_URL_PROPERTY);
        if (configured == null || configured.isBlank()) {
            return DEFAULT_BASE_URL;
        }
        String trimmed = configured.trim();
        while (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }

    public static boolean isReachable() {
        try {
            HttpResult result = request("OPTIONS", "/api/auth/login", null, Map.of());
            return result.status() > 0;
        } catch (Exception ex) {
            return false;
        }
    }

    public static String loginAsAdmin() throws IOException {
        HttpResult login = request(
            "POST",
            "/api/auth/login",
            "{\"username\":\"admin\",\"password\":\"admin123456\"}",
            Map.of("Content-Type", "application/json")
        );
        if (login.status() != 200) {
            throw new IOException("login failed, status=" + login.status() + ", body=" + login.body());
        }
        JsonNode node = OBJECT_MAPPER.readTree(login.body());
        String token = node.path("data").path("token").asText();
        if (token == null || token.isBlank()) {
            throw new IOException("login token missing in response: " + login.body());
        }
        return token;
    }

    public static HttpResult request(
        String method,
        String path,
        String body,
        Map<String, String> headers
    ) throws IOException {
        URL url = new URL(baseUrl() + path);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod(method);
        connection.setConnectTimeout(CONNECT_TIMEOUT_MS);
        connection.setReadTimeout(READ_TIMEOUT_MS);
        connection.setUseCaches(false);
        connection.setDoInput(true);

        for (Map.Entry<String, String> entry : headers.entrySet()) {
            connection.setRequestProperty(entry.getKey(), entry.getValue());
        }

        if (body != null) {
            byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
            connection.setDoOutput(true);
            connection.setRequestProperty("Content-Length", String.valueOf(bytes.length));
            try (OutputStream outputStream = connection.getOutputStream()) {
                outputStream.write(bytes);
            }
        }

        int status = connection.getResponseCode();
        InputStream stream = status >= 400 ? connection.getErrorStream() : connection.getInputStream();
        String responseBody = "";
        if (stream != null) {
            responseBody = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
            stream.close();
        }
        connection.disconnect();
        return new HttpResult(status, responseBody);
    }

    public record HttpResult(int status, String body) {
    }
}
