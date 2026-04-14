package com.twinops.backend.device.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Component
public class GlbSimulationDeviceModelSource implements SimulationDeviceModelSource {

    private static final int GLB_MAGIC = 0x46546C67;
    private static final int JSON_CHUNK_TYPE = 0x4E4F534A;
    private static final List<String> EXCLUDE_KEYWORDS = List.of(
        "pipe", "line", "arrow", "inspection", "inspect", "route", "path", "管道", "巡检", "路径", "箭头"
    );

    private final ObjectMapper objectMapper;
    private final String modelPath;

    public GlbSimulationDeviceModelSource(
        ObjectMapper objectMapper,
        @Value("${twinops.simulation.devices-model-path:../frontend/public/models/devices.glb}") String modelPath
    ) {
        this.objectMapper = objectMapper;
        this.modelPath = modelPath;
    }

    @Override
    public Set<String> loadDeviceLabelKeys() {
        Path path = resolvePath();
        try {
            byte[] bytes = Files.readAllBytes(path);
            JsonNode root = extractJsonRoot(bytes);
            JsonNode nodes = root.path("nodes");
            Set<String> result = new LinkedHashSet<>();
            if (nodes.isArray()) {
                for (JsonNode node : nodes) {
                    String name = node.path("name").asText("");
                    if (isDeviceLabel(name)) {
                        result.add(name);
                    }
                }
            }
            return result;
        } catch (Exception ex) {
            throw new IllegalStateException("failed to load simulation model labels from " + path, ex);
        }
    }

    private Path resolvePath() {
        Path configured = Paths.get(modelPath);
        if (configured.isAbsolute()) {
            return configured.normalize();
        }
        Path normalized = Paths.get("").toAbsolutePath().normalize().resolve(configured).normalize();
        if (!Files.exists(normalized)) {
            // Runtime often starts from backend/, fallback to repo-root relative path.
            Path fallback = Paths.get("").toAbsolutePath().normalize().resolve("..").resolve(configured).normalize();
            if (Files.exists(fallback)) {
                return fallback;
            }
        }
        return normalized;
    }

    private JsonNode extractJsonRoot(byte[] bytes) throws IOException {
        if (bytes.length < 20) {
            throw new IllegalStateException("invalid glb: file too short");
        }
        ByteBuffer buffer = ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN);
        int magic = buffer.getInt();
        if (magic != GLB_MAGIC) {
            throw new IllegalStateException("invalid glb: bad magic");
        }
        int version = buffer.getInt();
        int length = buffer.getInt();
        if (length > bytes.length) {
            throw new IllegalStateException("invalid glb: declared length overflow");
        }
        byte[] jsonBytes = null;
        while (buffer.remaining() >= 8) {
            int chunkLength = buffer.getInt();
            int chunkType = buffer.getInt();
            if (chunkLength < 0 || chunkLength > buffer.remaining()) {
                throw new IllegalStateException("invalid glb: chunk length overflow");
            }
            byte[] chunk = new byte[chunkLength];
            buffer.get(chunk);
            if (chunkType == JSON_CHUNK_TYPE) {
                jsonBytes = chunk;
                break;
            }
        }
        if (jsonBytes == null) {
            throw new IllegalStateException("invalid glb: missing json chunk");
        }
        String jsonText = new String(jsonBytes, StandardCharsets.UTF_8);
        return objectMapper.readTree(jsonText);
    }

    private boolean isDeviceLabel(String name) {
        if (name == null || name.isBlank()) {
            return false;
        }
        if (name.startsWith("Node_")) {
            return false;
        }
        if (!name.contains("#")) {
            return false;
        }
        String lower = name.toLowerCase(Locale.ROOT);
        for (String keyword : EXCLUDE_KEYWORDS) {
            if (lower.contains(keyword.toLowerCase(Locale.ROOT))) {
                return false;
            }
        }
        return true;
    }
}
