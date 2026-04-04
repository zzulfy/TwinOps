package com.twinops.backend.watchlist.controller;

import com.twinops.backend.auth.dto.AdminIdentityDto;
import com.twinops.backend.auth.config.AdminAuthInterceptor;
import com.twinops.backend.common.dto.ApiResponse;
import com.twinops.backend.watchlist.dto.WatchlistItemDto;
import com.twinops.backend.watchlist.dto.WatchlistToggleRequest;
import com.twinops.backend.watchlist.service.WatchlistService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    private final WatchlistService watchlistService;

    public WatchlistController(
        WatchlistService watchlistService
    ) {
        this.watchlistService = watchlistService;
    }

    @GetMapping
    public ApiResponse<List<WatchlistItemDto>> list(HttpServletRequest request) {
        AdminIdentityDto identity = (AdminIdentityDto) request.getAttribute(AdminAuthInterceptor.ADMIN_IDENTITY_ATTR);
        return ApiResponse.ok(watchlistService.listByAdmin(identity.username()));
    }

    @PostMapping
    public ApiResponse<List<WatchlistItemDto>> pin(
        @Valid @RequestBody WatchlistToggleRequest body,
        HttpServletRequest request
    ) {
        AdminIdentityDto identity = (AdminIdentityDto) request.getAttribute(AdminAuthInterceptor.ADMIN_IDENTITY_ATTR);
        return ApiResponse.ok(watchlistService.pin(identity.username(), body.deviceCode()));
    }

    @DeleteMapping("/{deviceCode}")
    public ApiResponse<List<WatchlistItemDto>> unpin(
        @PathVariable String deviceCode,
        HttpServletRequest request
    ) {
        AdminIdentityDto identity = (AdminIdentityDto) request.getAttribute(AdminAuthInterceptor.ADMIN_IDENTITY_ATTR);
        return ApiResponse.ok(watchlistService.unpin(identity.username(), deviceCode));
    }
}
