package com.twinops.backend.watchlist.dto;

import jakarta.validation.constraints.NotBlank;

public record WatchlistToggleRequest(
    @NotBlank(message = "deviceCode is required")
    String deviceCode
) {
}
