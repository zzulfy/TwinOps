package com.twinops.backend.watchlist.controller;

import com.twinops.backend.auth.dto.AdminIdentityDto;
import com.twinops.backend.auth.service.AdminAuthService;
import com.twinops.backend.auth.service.AuthTokenResolver;
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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    private final WatchlistService watchlistService;
    private final AuthTokenResolver tokenResolver;
    private final AdminAuthService adminAuthService;

    public WatchlistController(
        WatchlistService watchlistService,
        AuthTokenResolver tokenResolver,
        AdminAuthService adminAuthService
    ) {
        this.watchlistService = watchlistService;
        this.tokenResolver = tokenResolver;
        this.adminAuthService = adminAuthService;
    }

    @GetMapping
    public ApiResponse<List<WatchlistItemDto>> list(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @RequestHeader(value = "X-Admin-Token", required = false) String adminToken
    ) {
        AdminIdentityDto identity = adminAuthService.getIdentityByToken(tokenResolver.resolve(authorization, adminToken));
        return ApiResponse.ok(watchlistService.listByAdmin(identity.username()));
    }

    @PostMapping
    public ApiResponse<List<WatchlistItemDto>> pin(
        @Valid @RequestBody WatchlistToggleRequest body,
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @RequestHeader(value = "X-Admin-Token", required = false) String adminToken
    ) {
        AdminIdentityDto identity = adminAuthService.getIdentityByToken(tokenResolver.resolve(authorization, adminToken));
        return ApiResponse.ok(watchlistService.pin(identity.username(), body.deviceCode()));
    }

    @DeleteMapping("/{deviceCode}")
    public ApiResponse<List<WatchlistItemDto>> unpin(
        @PathVariable String deviceCode,
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @RequestHeader(value = "X-Admin-Token", required = false) String adminToken
    ) {
        AdminIdentityDto identity = adminAuthService.getIdentityByToken(tokenResolver.resolve(authorization, adminToken));
        return ApiResponse.ok(watchlistService.unpin(identity.username(), deviceCode));
    }
}
