package com.twinops.backend.telemetry.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.twinops.backend.telemetry.entity.TelemetryEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TelemetryMapper extends BaseMapper<TelemetryEntity> {
}
