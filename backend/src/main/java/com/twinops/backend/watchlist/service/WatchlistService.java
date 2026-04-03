package com.twinops.backend.watchlist.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.twinops.backend.watchlist.dto.WatchlistItemDto;
import com.twinops.backend.watchlist.entity.AdminWatchlistEntity;
import com.twinops.backend.watchlist.mapper.AdminWatchlistMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WatchlistService {

    private final AdminWatchlistMapper adminWatchlistMapper;

    public WatchlistService(AdminWatchlistMapper adminWatchlistMapper) {
        this.adminWatchlistMapper = adminWatchlistMapper;
    }

    public List<WatchlistItemDto> listByAdmin(String adminUsername) {
        QueryWrapper<AdminWatchlistEntity> wrapper = new QueryWrapper<>();
        wrapper.eq("admin_username", adminUsername).orderByDesc("created_at");
        return adminWatchlistMapper.selectList(wrapper).stream()
            .map(entity -> new WatchlistItemDto(entity.getDeviceCode()))
            .toList();
    }

    public List<WatchlistItemDto> pin(String adminUsername, String deviceCode) {
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
        QueryWrapper<AdminWatchlistEntity> wrapper = new QueryWrapper<>();
        wrapper.eq("admin_username", adminUsername).eq("device_code", deviceCode);
        adminWatchlistMapper.delete(wrapper);
        return listByAdmin(adminUsername);
    }
}
