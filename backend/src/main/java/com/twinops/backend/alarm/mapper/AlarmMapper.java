package com.twinops.backend.alarm.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.twinops.backend.alarm.entity.AlarmEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AlarmMapper extends BaseMapper<AlarmEntity> {
}
