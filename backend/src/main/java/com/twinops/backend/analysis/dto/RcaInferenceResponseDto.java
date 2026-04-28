package com.twinops.backend.analysis.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record RcaInferenceResponseDto(
    String engine,
    String profile,
    String modelVersion,
    String windowStart,
    String windowEnd,
    List<AnalysisRootCauseDto> rootCauses,
    List<AnalysisCausalEdgeDto> causalEdges,
    JsonNode debug
) {
}
