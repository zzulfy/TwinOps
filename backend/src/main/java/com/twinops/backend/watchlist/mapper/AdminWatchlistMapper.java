package com.twinops.backend.watchlist.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.twinops.backend.watchlist.entity.AdminWatchlistEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AdminWatchlistMapper extends BaseMapper<AdminWatchlistEntity> {
}
