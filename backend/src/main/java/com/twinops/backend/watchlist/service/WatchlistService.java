package com.twinops.backend.watchlist.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.twinops.backend.common.logging.LogFields;
import com.twinops.backend.watchlist.dto.WatchlistItemDto;
import com.twinops.backend.watchlist.entity.AdminWatchlistEntity;
import com.twinops.backend.watchlist.mapper.AdminWatchlistMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WatchlistService {

    private static final Logger log = LoggerFactory.getLogger(WatchlistService.class);
    private final AdminWatchlistMapper adminWatchlistMapper;

    public WatchlistService(AdminWatchlistMapper adminWatchlistMapper) {
        this.adminWatchlistMapper = adminWatchlistMapper;
    }

    public List<WatchlistItemDto> listByAdmin(String adminUsername) {
        log.info("{}={} {}={} {}={} {}={} username={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "watchlist",
            LogFields.EVENT, "watchlist.service.list",
            LogFields.RESULT, "started",
            adminUsername
        );
        QueryWrapper<AdminWatchlistEntity> wrapper = new QueryWrapper<>();
        wrapper.eq("admin_username", adminUsername).orderByDesc("created_at");
        return adminWatchlistMapper.selectList(wrapper).stream()
            .map(entity -> new WatchlistItemDto(entity.getDeviceCode()))
            .toList();
    }

    public List<WatchlistItemDto> pin(String adminUsername, String deviceCode) {
        if (deviceCode == null || deviceCode.isBlank()) {
            log.warn("{}={} {}={} {}={} {}={} {}={} username={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "watchlist",
                LogFields.EVENT, "watchlist.service.pin",
                LogFields.RESULT, "invalid",
                LogFields.ERROR_CODE, "WATCHLIST_DEVICE_CODE_BLANK",
                adminUsername
            );
        }
        QueryWrapper<AdminWatchlistEntity> exists = new QueryWrapper<>();
        exists.eq("admin_username", adminUsername).eq("device_code", deviceCode).last("LIMIT 1");
        if (adminWatchlistMapper.selectOne(exists) == null) {
            AdminWatchlistEntity entity = new AdminWatchlistEntity();
            entity.setAdminUsername(adminUsername);
            entity.setDeviceCode(deviceCode);
            adminWatchlistMapper.insert(entity);
        }
        return listByAdmin(adminUsername);
    }

    public List<WatchlistItemDto> unpin(String adminUsername, String deviceCode) {
        log.info("{}={} {}={} {}={} {}={} username={} deviceCode={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "watchlist",
            LogFields.EVENT, "watchlist.service.unpin",
            LogFields.RESULT, "started",
            adminUsername,
            deviceCode
        );
        QueryWrapper<AdminWatchlistEntity> wrapper = new QueryWrapper<>();
        wrapper.eq("admin_username", adminUsername).eq("device_code", deviceCode);
        int deleted = adminWatchlistMapper.delete(wrapper);
        if (deleted == 0) {
            log.warn("{}={} {}={} {}={} {}={} {}={} username={} deviceCode={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "watchlist",
                LogFields.EVENT, "watchlist.service.unpin",
                LogFields.RESULT, "noop",
                LogFields.ERROR_CODE, "WATCHLIST_NOT_FOUND",
                adminUsername,
                deviceCode
            );
        }
        return listByAdmin(adminUsername);
    }

    private String safeRequestId() {
        String requestId = MDC.get(LogFields.REQUEST_ID);
        return requestId == null || requestId.isBlank() ? "n/a" : requestId;
    }
}
