package com.twinops.backend.common.dto;

import java.util.List;

public record ChartSeriesDto(List<String> labels, List<Double> values) {
}
