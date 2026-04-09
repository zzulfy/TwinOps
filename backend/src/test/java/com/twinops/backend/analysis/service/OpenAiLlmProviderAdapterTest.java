package com.twinops.backend.analysis.service;

import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.chat.response.ChatResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OpenAiLlmProviderAdapterTest {

    @Mock
    private ChatModel chatModel;

    @Test
    void shouldMapEndpointToLangChainBaseUrl() {
        assertEquals(
            "https://example.com/api/v3",
            OpenAiLlmProviderAdapter.toLangChainBaseUrl("https://example.com/api/v3/chat/completions")
        );
        assertEquals(
            "https://example.com/proxy/openai/v1",
            OpenAiLlmProviderAdapter.toLangChainBaseUrl("https://example.com/proxy/openai/v1/chat/completions")
        );
        assertEquals(
            "https://example.com/v1",
            OpenAiLlmProviderAdapter.toLangChainBaseUrl("https://example.com/v1")
        );
    }

    @Test
    void shouldInitializeLangChainModelFromConfigValues() {
        OpenAiLlmProviderAdapter adapter = new OpenAiLlmProviderAdapter(
            "https://example.com/proxy/v1",
            "/chat/completions",
            "test-key",
            "demo-model",
            0.2,
            512,
            true
        );

        assertNotNull(adapter);
    }

    @Test
    void shouldReturnNormalizedResultWhenModelReturnsValidJson() throws Exception {
        OpenAiLlmProviderAdapter adapter = new OpenAiLlmProviderAdapter(
            chatModel,
            "https://example.com/api/v3/chat/completions",
            "test-key",
            "demo-model",
            0.2,
            512,
            false
        );
        String payload = """
            {
              "prediction": "设备温升异常，可能出现过热风险",
              "confidence": 127.8,
              "riskLevel": "HIGH",
              "recommendedAction": "立即检查冷却系统"
            }
            """;
        when(chatModel.chat(any(List.class))).thenReturn(
            ChatResponse.builder().aiMessage(AiMessage.from(payload)).build()
        );

        LlmPredictionResult result = adapter.predict("DEV001", "cpu=90");

        assertEquals("设备温升异常，可能出现过热风险", result.prediction());
        assertEquals(new BigDecimal("100"), result.confidence());
        assertEquals("high", result.riskLevel());
        assertEquals("立即检查冷却系统", result.recommendedAction());
        ArgumentCaptor<List> captor = ArgumentCaptor.forClass(List.class);
        verify(chatModel).chat(captor.capture());
        List<?> messages = captor.getValue();
        assertEquals(2, messages.size());
        assertTrue(messages.get(0) instanceof SystemMessage);
        assertTrue(messages.get(1) instanceof UserMessage);
        assertTrue(((SystemMessage) messages.get(0)).text().contains("Return only JSON"));
        assertTrue(((UserMessage) messages.get(1)).singleText().contains("deviceCode: DEV001"));
    }

    @Test
    void shouldParseFencedJsonAndFillDefaultAction() throws Exception {
        OpenAiLlmProviderAdapter adapter = new OpenAiLlmProviderAdapter(
            chatModel,
            "https://example.com/api/v3/chat/completions",
            "test-key",
            "demo-model",
            0.2,
            512,
            false
        );
        String fencedPayload = """
            ```json
            {
              "prediction": "运行趋势平稳",
              "confidence": -3,
              "riskLevel": "unknown",
              "recommendedAction": ""
            }
            ```
            """;
        when(chatModel.chat(any(List.class))).thenReturn(
            ChatResponse.builder().aiMessage(AiMessage.from(fencedPayload)).build()
        );

        LlmPredictionResult result = adapter.predict("DEV002", "cpu=40");

        assertEquals("运行趋势平稳", result.prediction());
        assertEquals(new BigDecimal("0"), result.confidence());
        assertEquals("medium", result.riskLevel());
        assertEquals("建议持续观察关键指标并准备应急预案。", result.recommendedAction());
    }

    @Test
    void shouldFallbackWhenProviderFailsAndFallbackEnabled() throws Exception {
        OpenAiLlmProviderAdapter adapter = new OpenAiLlmProviderAdapter(
            chatModel,
            "https://example.com/api/v3/chat/completions",
            "test-key",
            "demo-model",
            0.2,
            512,
            true
        );
        when(chatModel.chat(any(List.class))).thenThrow(new RuntimeException("provider down"));

        LlmPredictionResult result = adapter.predict("DEV003", "critical overload");

        assertEquals("high", result.riskLevel());
        assertEquals(new BigDecimal("86.5"), result.confidence());
    }

    @Test
    void shouldThrowWhenProviderFailsAndFallbackDisabled() {
        OpenAiLlmProviderAdapter adapter = new OpenAiLlmProviderAdapter(
            chatModel,
            "https://example.com/api/v3/chat/completions",
            "test-key",
            "demo-model",
            0.2,
            512,
            false
        );
        when(chatModel.chat(any(List.class))).thenThrow(new RuntimeException("provider down"));

        RuntimeException exception = assertThrows(
            RuntimeException.class,
            () -> adapter.predict("DEV004", "cpu=91")
        );

        assertEquals("provider down", exception.getMessage());
    }

    @Test
    void shouldThrowWhenApiKeyMissingAndFallbackDisabled() {
        OpenAiLlmProviderAdapter adapter = new OpenAiLlmProviderAdapter(
            chatModel,
            "https://example.com/api/v3/chat/completions",
            "",
            "demo-model",
            0.2,
            512,
            false
        );

        IllegalStateException exception = assertThrows(
            IllegalStateException.class,
            () -> adapter.predict("DEV005", "cpu=50")
        );

        assertEquals("llm api key is missing", exception.getMessage());
    }
}
