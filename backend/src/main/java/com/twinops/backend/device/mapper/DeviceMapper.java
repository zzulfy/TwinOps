package com.twinops.backend.device.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.twinops.backend.device.entity.DeviceEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DeviceMapper extends BaseMapper<DeviceEntity> {
}
