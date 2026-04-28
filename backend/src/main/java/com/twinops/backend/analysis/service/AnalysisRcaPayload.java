package com.twinops.backend.analysis.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.twinops.backend.analysis.dto.AnalysisCausalEdgeDto;
import com.twinops.backend.analysis.dto.AnalysisRootCauseDto;
import com.twinops.backend.analysis.dto.RcaInferenceResponseDto;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

public record AnalysisRcaPayload(
    String engine,
    String rcaStatus,
    String modelVersion,
    LocalDateTime evidenceWindowStart,
    LocalDateTime evidenceWindowEnd,
    List<AnalysisRootCauseDto> rootCauses,
    List<AnalysisCausalEdgeDto> causalEdges,
    String rootCausesJson,
    String causalGraphJson
) {
    public static AnalysisRcaPayload fallback(LocalDateTime start, LocalDateTime end) {
        return new AnalysisRcaPayload(
            "llm_only",
            "fallback",
            null,
            start,
            end,
            List.of(),
            List.of(),
            "[]",
            "[]"
        );
    }

    public static AnalysisRcaPayload success(
        RcaInferenceResponseDto response,
        LocalDateTime start,
        LocalDateTime end,
        ObjectMapper objectMapper
    ) {
        List<AnalysisRootCauseDto> rootCauses =
            response.rootCauses() == null ? List.of() : response.rootCauses();
        List<AnalysisCausalEdgeDto> causalEdges =
            response.causalEdges() == null ? List.of() : response.causalEdges();
        return new AnalysisRcaPayload(
            "aerca_llm",
            "success",
            response.modelVersion(),
            start,
            end,
            rootCauses,
            causalEdges,
            toJson(objectMapper, rootCauses),
            toJson(objectMapper, causalEdges)
        );
    }

    public List<AnalysisRootCauseDto> safeRootCauses() {
        return rootCauses == null ? Collections.emptyList() : rootCauses;
    }

    public List<AnalysisCausalEdgeDto> safeCausalEdges() {
        return causalEdges == null ? Collections.emptyList() : causalEdges;
    }

    private static String toJson(ObjectMapper objectMapper, Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            return "[]";
        }
    }
}
