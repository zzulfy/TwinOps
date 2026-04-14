package com.twinops.backend.device.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GlbSimulationDeviceModelSourceTest {

    @TempDir
    Path tempDir;

    @Test
    void shouldExtractDeviceLabelsAndFilterPipeObjects() throws Exception {
        Path glbPath = tempDir.resolve("devices.glb");
        String json = """
            {
              "asset":{"version":"2.0"},
              "nodes":[
                {"name":"1#设备"},
                {"name":"1#管道"},
                {"name":"Node_123"},
                {"name":"2#变压器"}
              ]
            }
            """;
        Files.write(glbPath, buildGlb(json));
        GlbSimulationDeviceModelSource source = new GlbSimulationDeviceModelSource(
            new ObjectMapper(),
            glbPath.toString()
        );

        Set<String> labels = source.loadDeviceLabelKeys();

        assertEquals(2, labels.size());
        assertTrue(labels.contains("1#设备"));
        assertTrue(labels.contains("2#变压器"));
    }

    private static byte[] buildGlb(String jsonText) {
        byte[] json = jsonText.getBytes(StandardCharsets.UTF_8);
        int paddedLength = ((json.length + 3) / 4) * 4;
        ByteBuffer buffer = ByteBuffer.allocate(12 + 8 + paddedLength).order(ByteOrder.LITTLE_ENDIAN);
        buffer.putInt(0x46546C67);
        buffer.putInt(2);
        buffer.putInt(12 + 8 + paddedLength);
        buffer.putInt(paddedLength);
        buffer.putInt(0x4E4F534A);
        buffer.put(json);
        while (buffer.position() % 4 != 0) {
            buffer.put((byte) 0x20);
        }
        return buffer.array();
    }
}

